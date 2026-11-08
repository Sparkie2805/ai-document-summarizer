// Elements
const tabPdf = document.getElementById('tabPdf');
const tabText = document.getElementById('tabText');
const pdfContent = document.getElementById('pdfContent');
const textContent = document.getElementById('textContent');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectedFileInfo = document.getElementById('selectedFileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFileBtn');
const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const sampleTextBtn = document.getElementById('sampleTextBtn');

const styleSelect = document.getElementById('styleSelect');
const languageSelect = document.getElementById('languageSelect');
const summarizeBtn = document.getElementById('summarizeBtn');
const btnText = document.getElementById('btnText');

const apiKeyToggleBtn = document.getElementById('apiKeyToggleBtn');
const apiKeyModal = document.getElementById('apiKeyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const apiKeyStatusText = document.getElementById('apiKeyStatusText');

const errorAlert = document.getElementById('errorAlert');
const errorMessage = document.getElementById('errorMessage');
const loadingBox = document.getElementById('loadingBox');
const resultCard = document.getElementById('resultCard');
const resultText = document.getElementById('resultText');
const sourceChip = document.getElementById('sourceChip');
const origWords = document.getElementById('origWords');
const sumWords = document.getElementById('sumWords');
const reductionBadge = document.getElementById('reductionBadge');
const copyBtn = document.getElementById('copyBtn');
const copyBtnText = document.getElementById('copyBtnText');
const downloadMdBtn = document.getElementById('downloadMdBtn');
const newSummaryBtn = document.getElementById('newSummaryBtn');

// State
let activeTab = 'pdf'; // 'pdf' | 'text'
let currentFile = null;
let currentSummaryRaw = '';

// Load saved API Key from localStorage
const savedApiKey = localStorage.getItem('gemini_api_key') || '';
if (savedApiKey) {
  apiKeyInput.value = savedApiKey;
  updateApiKeyBadge(true);
} else {
  updateApiKeyBadge(false);
}

// API Key UI Handling
apiKeyToggleBtn.addEventListener('click', () => {
  apiKeyModal.classList.toggle('hidden');
});

saveApiKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem('gemini_api_key', key);
    updateApiKeyBadge(true);
  } else {
    localStorage.removeItem('gemini_api_key');
    updateApiKeyBadge(false);
  }
  apiKeyModal.classList.add('hidden');
});

function updateApiKeyBadge(hasKey) {
  if (hasKey) {
    apiKeyStatusText.textContent = 'API Key (Active ✓)';
    apiKeyStatusText.classList.add('text-emerald-600', 'font-semibold');
  } else {
    apiKeyStatusText.textContent = 'API Key (Demo Mode)';
    apiKeyStatusText.classList.remove('text-emerald-600', 'font-semibold');
  }
}

// Tab Switching
tabPdf.addEventListener('click', () => {
  activeTab = 'pdf';
  tabPdf.classList.add('text-indigo-600', 'border-indigo-600', 'bg-white');
  tabPdf.classList.remove('text-slate-500', 'border-transparent');
  tabText.classList.remove('text-indigo-600', 'border-indigo-600', 'bg-white');
  tabText.classList.add('text-slate-500', 'border-transparent');

  pdfContent.classList.remove('hidden');
  textContent.classList.add('hidden');
  clearError();
});

tabText.addEventListener('click', () => {
  activeTab = 'text';
  tabText.classList.add('text-indigo-600', 'border-indigo-600', 'bg-white');
  tabText.classList.remove('text-slate-500', 'border-transparent');
  tabPdf.classList.remove('text-indigo-600', 'border-indigo-600', 'bg-white');
  tabPdf.classList.add('text-slate-500', 'border-transparent');

  textContent.classList.remove('hidden');
  pdfContent.classList.add('hidden');
  clearError();
});

// File Drag & Drop
dropZone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropZone.classList.add('border-indigo-500', 'bg-indigo-50/40');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/40');
  });
});

dropZone.addEventListener('drop', (e) => {
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
    showError('กรุณาเลือกไฟล์สกุล .pdf หรือ .txt เท่านั้น');
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    showError('ไฟล์มีขนาดเกิน 15MB กรุณาเลือกไฟล์ที่เล็กลง');
    return;
  }

  currentFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = `(${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
  selectedFileInfo.classList.remove('hidden');
  selectedFileInfo.classList.add('flex');
  dropZone.classList.add('hidden');
  clearError();
}

removeFileBtn.addEventListener('click', () => {
  currentFile = null;
  fileInput.value = '';
  selectedFileInfo.classList.add('hidden');
  selectedFileInfo.classList.remove('flex');
  dropZone.classList.remove('hidden');
});

// Text Area Character Count
textInput.addEventListener('input', () => {
  charCount.textContent = `${textInput.value.length.toLocaleString()} ตัวอักษร`;
});

// Sample text for instant trial
sampleTextBtn.addEventListener('click', () => {
  textInput.value = `เทคโนโลยีปัญญาประดิษฐ์ (Artificial Intelligence: AI) กำลังเข้ามามีบทบาทอย่างยิ่งในชีวิตประจำวันและการดำเนินธุรกิจในยุคปัจจุบัน โดยเฉพาะเทคโนโลยี Generative AI หรือ AI เชิงสร้างสรรค์ ที่สามารถสร้างเนื้อหาใหม่ ไม่ว่าจะเป็นข้อความ รูปภาพ เสียง หรือแม้กระทั่งโค้ดคอมพิวเตอร์

หนึ่งในการนำ AI มาประยุกต์ใช้งานที่แพร่หลายคือ "การสรุปใจความสำคัญของเอกสาร (Document Summarization)" เนื่องจากในแต่ละวัน ผู้คนต้องเผชิญกับข้อมูลปริมาณมหาศาล ทั้งรายงานวิจัย ข่าวสารทางธุรกิจ สัญญากฎหมาย และเอกสารทางวิชาการ การมีระบบ AI ที่ช่วยอ่าน ทำความเข้าใจ และสกัดสาระสำคัญออกมาเป็นข้อสรุปที่กระชับ ตรงประเด็น ช่วยให้ผู้บริหารและพนักงานประหยัดเวลาการทำงานลงได้อย่างมีนัยสำคัญ

ประโยชน์สำคัญ 3 ประการของการนำ AI มาช่วยสรุปเอกสาร ได้แก่:
1. การประหยัดเวลา (Time Efficiency): ช่วยลดเวลาจากการอ่านเอกสารหลายสิบหน้าให้เหลือเพียงไม่กี่นาที
2. การลดความผิดพลาดและตกหล่น (Accuracy & Coverage): โมเดลภาษาขนาดใหญ่ (LLM) ได้รับการฝึกฝนให้อ่านบริบททั้งหมด ทำให้สามารถจับประเด็นหลักและจุดสำคัญได้ครบถ้วน
3. การปรับแต่งตามบริบทผู้ใช้งาน (Customizability): ผู้ใช้สามารถเลือกว่าต้องการสรุปแบบย่อหน้า สรุปเป็น Bullet points หรือสรุปเฉพาะสิ่งที่ต้องนำไปปฏิบัติต่อ (Action items)

อย่างไรก็ดี การนำ AI มาใช้ยังคงต้องอาศัยวิจารณญาณของมนุษย์ (Human-in-the-loop) ในการตรวจสอบความถูกต้องของข้อมูล โดยเฉพาะเอกสารที่เกี่ยวข้องกับตัวเลข กฎหมาย หรือการแพทย์ เพื่อให้มั่นใจในความปลอดภัยและความถูกต้องสูงสุด`;
  charCount.textContent = `${textInput.value.length.toLocaleString()} ตัวอักษร`;
});

// Summarize Action
summarizeBtn.addEventListener('click', async () => {
  clearError();

  const style = styleSelect.value;
  const language = languageSelect.value;
  const apiKey = localStorage.getItem('gemini_api_key') || '';

  const formData = new FormData();
  formData.append('style', style);
  formData.append('language', language);
  if (apiKey) formData.append('apiKey', apiKey);

  if (activeTab === 'pdf') {
    if (!currentFile) {
      showError('กรุณาเลือกไฟล์ PDF หรือ TXT ก่อนกดสรุป');
      return;
    }
    formData.append('file', currentFile);
  } else {
    const text = textInput.value.trim();
    if (!text) {
      showError('กรุณากรอกหรือวางข้อความที่ต้องการสรุป');
      return;
    }
    formData.append('text', text);
  }

  // Set Loading UI
  setLoading(true);

  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'การประมวลผลล้มเหลว');
    }

    displayResult(data);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  if (isLoading) {
    loadingBox.classList.remove('hidden');
    resultCard.classList.add('hidden');
    summarizeBtn.disabled = true;
    summarizeBtn.classList.add('opacity-70', 'cursor-not-allowed');
    btnText.textContent = 'กำลังวิเคราะห์และสรุป...';
  } else {
    loadingBox.classList.add('hidden');
    summarizeBtn.disabled = false;
    summarizeBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    btnText.textContent = 'เริ่มสรุปเอกสาร (Summarize)';
  }
}

function displayResult(data) {
  currentSummaryRaw = data.summary;
  sourceChip.textContent = data.sourceName;
  origWords.textContent = (data.originalStats?.words || 0).toLocaleString();
  sumWords.textContent = (data.summaryStats?.words || 0).toLocaleString();
  reductionBadge.textContent = `ย่นย่อลง ${data.summaryStats?.reductionPercent || 0}%`;

  // Render markdown with Marked
  resultText.innerHTML = marked.parse(data.summary);

  resultCard.classList.remove('hidden');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Copy to Clipboard
copyBtn.addEventListener('click', async () => {
  if (!currentSummaryRaw) return;
  try {
    await navigator.clipboard.writeText(currentSummaryRaw);
    copyBtnText.textContent = 'คัดลอกแล้ว! ✓';
    setTimeout(() => {
      copyBtnText.textContent = 'คัดลอก';
    }, 2000);
  } catch (err) {
    alert('ไม่สามารถคัดลอกได้');
  }
});

// Download Markdown
downloadMdBtn.addEventListener('click', () => {
  if (!currentSummaryRaw) return;
  const blob = new Blob([currentSummaryRaw], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `summary-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

function showError(msg) {
  errorMessage.textContent = msg;
  errorAlert.classList.remove('hidden');
}

function clearError() {
  errorAlert.classList.add('hidden');
  errorMessage.textContent = '';
}

// Reset / New Summary Button
if (newSummaryBtn) {
  newSummaryBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (activeTab === 'text') {
      textInput.focus();
    }
  });
}

// Keyboard Shortcut: Ctrl+Enter or Cmd+Enter to summarize
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (!summarizeBtn.disabled) {
      summarizeBtn.click();
    }
  }
});
