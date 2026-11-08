import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for in-memory file uploads (max 15MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('รองรับเฉพาะไฟล์ .pdf และ .txt เท่านั้น'));
    }
  }
});

/**
 * Call Gemini API to generate summary
 */
async function callGemini(text, style, language, apiKey) {
  const effectiveKey = apiKey || process.env.GEMINI_API_KEY;

  // If no API key is set, return a demo summary
  if (!effectiveKey || effectiveKey === 'demo') {
    return generateDemoSummary(text, style, language);
  }

  const prompt = `
คุณเป็นผู้เชี่ยวชาญด้านการวิเคราะห์และสรุปเนื้อหาเอกสาร
ภารกิจ: สรุปเนื้อหาต่อไปนี้ให้อ่านง่าย ชัดเจน และตรงประเด็น โดยใช้ภาษา: ${language || 'ไทย'}

รูปแบบที่ต้องการ:
${getStyleInstruction(style)}

ข้อความต้นฉบับ:
"""
${text.slice(0, 30000)}
"""

ให้ผลลัพธ์ในรูปแบบ Markdown สวยงาม มีหัวข้อและสัญลักษณ์ bullet points ที่อ่านสบายตา
`;

  // Candidate models to try across API versions
  const candidateConfigs = [
    { version: 'v1beta', model: 'gemini-3.8-flash' },
    { version: 'v1beta', model: 'gemini-2.5-flash' },
    { version: 'v1beta', model: 'gemini-2.0-flash' },
    { version: 'v1beta', model: 'gemini-1.5-flash' }
  ];

  let lastError = null;

  for (const config of candidateConfigs) {
    try {
      const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${effectiveKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `API error ${response.status}`);
      }

      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (summary) return summary;
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini] ${config.version}/${config.model} failed:`, err.message);
    }
  }

  // If candidate models all failed, dynamically query ListModels to find authorized models
  console.log('[Gemini] Attempting dynamic model discovery via ListModels...');
  try {
    const discovered = await discoverAvailableModel(effectiveKey);
    if (discovered) {
      console.log(`[Gemini] Discovered working model: ${discovered.version}/${discovered.model}`);
      const url = `https://generativelanguage.googleapis.com/${discovered.version}/models/${discovered.model}:generateContent?key=${effectiveKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('[Gemini] Discovered model returned error:', data);
        throw new Error(data.error?.message || `API error ${response.status}`);
      }

      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (summary) return summary;
    }
  } catch (discoErr) {
    lastError = discoErr;
    console.warn('[Gemini] Dynamic discovery failed:', discoErr.message);
  }

  throw new Error(`ไม่สามารถเชื่อมต่อ Gemini API ได้: ${lastError?.message || 'โมเดลไม่พร้อมใช้งาน'}\n(คำแนะนำ: โปรดตรวจสอบว่า API Key ได้เปิดใช้งานจาก Google AI Studio และมีสิทธิ์เรียกใช้งานโมเดล Gemini)`);
}

async function discoverAvailableModel(apiKey) {
  for (const version of ['v1beta', 'v1']) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`);
      if (!res.ok) continue;
      const data = await res.json();
      const models = (data.models || []).filter(m =>
        m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
      );
      if (models.length > 0) {
        const preferred =
          models.find(m => m.name.includes('flash')) ||
          models.find(m => m.name.includes('gemini')) ||
          models[0];
        const cleanName = preferred.name.replace(/^models\//, '');
        return { version, model: cleanName };
      }
    } catch (e) {
      // ignore
    }
  }
  return null;
}

function getStyleInstruction(style) {
  switch (style) {
    case 'bullet':
      return '- สรุปเป็น Bullet points สั้นกระชับ 4-6 ข้อ เน้นประเด็นสำคัญที่สุด\n- มีประโยคสรุปภาพรวม (Overview) 1-2 บรรทัดด้านบน';
    case 'detailed':
      return '- สรุปแบบเจาะลึก แบ่งเป็นหมวดหมู่หรือประเด็นหลักพร้อมรายละเอียดสนับสนุน\n- มีบทวิเคราะห์สั้นๆ และข้อควรสังเกต';
    case 'action':
      return '- สรุปประเด็นหลักแบบกระชับ\n- ตามด้วยรายการ Action Items หรือสิ่งที่ต้องนำไปปฏิบัติต่อ (To-Do/Next Steps) เป็นข้อๆ ชัดเจน';
    case 'qa':
      return '- สรุปในรูปแบบถาม-ตอบ (Q&A) 4-6 คำถามที่พบบ่อยหรือเป็นหัวใจสำคัญของเอกสารนี้';
    default:
      return '- สรุปเป็น Bullet points 5 ข้อที่สำคัญที่สุด พร้อมสรุปใจความรวม 1 ย่อหน้า';
  }
}

function generateDemoSummary(text, style, language) {
  const wordCount = text.trim().split(/\s+/).length;
  const preview = text.trim().slice(0, 150).replace(/\n/g, ' ');

  return `> 💡 **หมายเหตุ (Demo Mode):** นี่คือผลลัพธ์ตัวอย่างจำลอง เนื่องจากยังไม่ได้ระบุ Gemini API Key (สามารถใส่ API Key ในแถบด้านบนเพื่อใช้งาน AI จริงได้ทันที)

---

### 📌 สรุปภาพรวม (Overview)
เอกสารนี้มีเนื้อหาเกี่ยวกับ **"${preview}..."** (ความยาวต้นฉบับประมาณ ${wordCount.toLocaleString()} คำ) โดยมีแก่นสาระสำคัญตามสไตล์ **${style || 'Bullet Points'}**:

### 🎯 ประเด็นสำคัญที่พบ
1. **หัวข้อหลักและเป้าหมาย:** เอกสารเน้นการสื่อสารใจความสำคัญ เพื่อให้ผู้อ่านเข้าใจโครงสร้างของเรื่องได้อย่างรวดเร็ว
2. **ข้อค้นพบสำคัญ:** ข้อมูลในเอกสารระบุถึงรายละเอียดขั้นตอนและข้อมูลสนับสนุนที่จำเป็นต่อการตัดสินใจ
3. **การประยุกต์ใช้:** สามารถนำข้อมูลนี้ไปปรับใช้เป็นแนวทางปฏิบัติหรืออ้างอิงในการทำงานจริง
4. **ข้อเสนอแนะเพิ่มเติม:** แนะนำให้ตรวจสอบรายละเอียดตัวเลขหรือข้อกำหนดเฉพาะเพิ่มเติมตามบริบท

${style === 'action' ? `\n### 🚀 สิ่งที่ควรทำต่อ (Action Items)\n- [ ] ทบทวนประเด็นหลักร่วมกับทีม\n- [ ] กำหนดเวลาและผู้รับผิดชอบสำหรับขั้นตอนถัดไป\n- [ ] ติดตามผลการดำเนินงานในสัปดาห์หน้า` : ''}

---
*✨ เคล็ดลับ: รับ Gemini API Key ฟรีได้ที่ [Google AI Studio](https://aistudio.google.com/app/apikey) แล้วนำมากรอกในช่อง API Key เพื่อเริ่มสรุปเนื้อหาจริงด้วยโมเดล Gemini!*`;
}

// API: Summarize Text or Uploaded File
app.post('/api/summarize', upload.single('file'), async (req, res) => {
  try {
    let textToSummarize = req.body.text || '';
    const style = req.body.style || 'bullet';
    const language = req.body.language || 'ไทย';
    const apiKey = req.body.apiKey ? req.body.apiKey.trim() : null;

    let sourceName = 'ข้อความที่วาง (Direct Text)';

    // If file is uploaded, extract text
    if (req.file) {
      sourceName = req.file.originalname;
      if (req.file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        textToSummarize = pdfData.text;
      } else {
        textToSummarize = req.file.buffer.toString('utf-8');
      }
    }

    if (!textToSummarize || textToSummarize.trim().length === 0) {
      const msg = req.file && req.file.mimetype === 'application/pdf'
        ? 'ไม่พบข้อความที่สามารถอ่านได้ในไฟล์ PDF (อาจเป็นไฟล์ภาพสแกนล้วน หรือมีรหัสผ่านป้องกัน แนะนำให้คัดลอกข้อความมาวางในแท็บ "วางข้อความ" แทน)'
        : 'ไม่พบเนื้อหาข้อความ กรุณาพิมพ์หรือวางข้อความที่ต้องการสรุป';
      return res.status(400).json({ error: msg });
    }

    const trimmedText = textToSummarize.trim();
    const originalCharCount = trimmedText.length;
    const originalWordCount = trimmedText.split(/\s+/).filter(Boolean).length;

    // Call Gemini to get summary
    const summary = await callGemini(trimmedText, style, language, apiKey);

    const summaryWordCount = summary.split(/\s+/).filter(Boolean).length;
    const reductionPercent = Math.max(0, Math.round((1 - (summaryWordCount / originalWordCount)) * 100));

    res.json({
      success: true,
      sourceName,
      originalStats: {
        characters: originalCharCount,
        words: originalWordCount
      },
      summaryStats: {
        words: summaryWordCount,
        reductionPercent: isNaN(reductionPercent) ? 0 : reductionPercent
      },
      summary
    });
  } catch (error) {
    console.error('Error in /api/summarize:', error);
    res.status(500).json({
      error: error.message || 'เกิดข้อผิดพลาดในการประมวลผล'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Document Summarizer server running at http://localhost:${PORT}`);
});
