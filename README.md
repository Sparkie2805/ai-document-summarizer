# 📄 DocuBrief AI - AI Document & Article Summarizer

เว็บแอปพลิเคชันมินิโปรเจกต์สำหรับสรุปเนื้อหาจากไฟล์ PDF หรือบทความขนาดยาว ให้เหลือประเด็นสำคัญเป็นข้อๆ อ่านง่าย รวดเร็ว และประหยัดเวลา พัฒนาด้วย Node.js, Express และ Google Gemini API

---

## ✨ ฟีเจอร์หลัก (Key Features)

1. **รองรับ 2 โหมดการป้อนข้อมูล:**
   - 📁 **อัปโหลดไฟล์ (PDF / TXT):** สกัดข้อความจากไฟล์ PDF และสรุปผลให้อัตโนมัติ
   - ✍️ **วางข้อความโดยตรง (Direct Text):** พร้อมปุ่ม "ลองใช้ข้อความตัวอย่าง" สำหรับทดสอบทันที
2. **ปรับแต่งสไตล์การสรุปได้ 4 รูปแบบ:**
   - 📌 **Bullet Points:** สรุปกระชับ 4-6 ข้อ เน้นประเด็นสำคัญ
   - 🚀 **Action Items:** สรุปประเด็นหลัก พร้อมเช็กลิสต์สิ่งที่ต้องนำไปทำต่อ
   - 📖 **Detailed:** สรุปเจาะลึก แยกหมวดหมู่อย่างเป็นระเบียบ
   - ❓ **Q&A:** สรุปในรูปแบบถาม-ตอบข้อสงสัยสำคัญ
3. **สถิติการย่นย่อ:** แสดงจำนวนคำต้นฉบับ vs จำนวนคำหลังสรุป และคำนวณ % การย่นย่อ
4. **Export สะดวก:**
   - คัดลอกลง Clipboard เพียง 1 คลิก
   - ดาวน์โหลดผลลัพธ์เป็นไฟล์ Markdown (`.md`)
5. **Demo Mode ในตัว:** สามารถทดสอบหน้าตาและฟังก์ชันได้ทันทีแม้ยังไม่มี API Key

---

## 🛠️ โครงสร้างโปรเจกต์

```text
ai-document-summarizer/
├── public/
│   ├── index.html        # หน้าตาเว็บแอป (Tailwind CSS + Marked.js)
│   └── app.js            # โค้ดฝั่ง Frontend (Event listeners, Fetch API)
├── server.js             # เซิร์ฟเวอร์ Express, จัดการ Upload และต่อกับ Gemini API
├── package.json          # รายการ Dependencies (express, multer, pdf-parse, etc.)
├── .env.example          # ตัวอย่างไฟล์ Environment Variables
└── README.md             # เอกสารแนะนำการใช้งาน
```

---

## 🚀 วิธีเริ่มต้นใช้งาน (Quick Start)

### 1. เข้าสู่โฟลเดอร์โปรเจกต์
```powershell
cd C:\Users\User\.gemini\antigravity\scratch\ai-document-summarizer
```

### 2. รันเซิร์ฟเวอร์
```powershell
npm start
```

### 3. เปิดเว็บเบราว์เซอร์
เปิดเบราว์เซอร์แล้วไปที่:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 การตั้งค่า Gemini API Key (ฟรี)

1. เข้าไปสร้าง API Key ได้ฟรีที่ [Google AI Studio](https://aistudio.google.com/app/apikey)
2. นำคีย์มากรอกได้ 2 วิธี:
   - **ผ่านหน้าเว็บ:** คลิกปุ่ม **"API Key"** ที่มุมขวาบนของหน้าเว็บ แล้ววางคีย์ลงไป (ระบบจะจำไว้ในเบราว์เซอร์)
   - **ผ่านไฟล์ .env:** ก๊อบปี้ไฟล์ `.env.example` เป็น `.env` แล้วใส่ `GEMINI_API_KEY=AIzaSy...`
