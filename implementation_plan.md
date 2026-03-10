# 📋 แผนการพัฒนาและลงรายละเอียดในแต่ละส่วน (Implementation Plan)

อ้างอิงจากแผนการพัฒนาโปรเจค 10-12 สัปดาห์ และ Requirement ของระบบ **"Gin dai MAI! (กินได้ไหม!)"** เอกสารฉบับนี้จะลงลึกถึงรายละเอียดเชิงเทคนิคในแต่ละฝั่ง (Frontend, Backend, AI) เพื่อให้นักพัฒนาสามารถนำไปปฏิบัติ (Implementation) ได้ทันที

---

## 📱 1. Frontend Implementation (Mobile Application)
**เทคโนโลยี:** Flutter, BLoC/Riverpod, Hive/Isar, Dio

### 1.1 โครงสร้างโฟลเดอร์ (Project Structure - Clean Architecture)
แนะนำให้แบ่ง Folder Structure แบบ Feature-based
```
lib/
 ┣ core/              # ค่าคงที่, ธีมแอป, routing, error handling
 ┣ data/              # Model, Repository (API, Local DB)
 ┣ shared/            # Widget หรือ Component กลางที่ใช้ซ้ำ (Buttons, Loaders)
 ┗ features/          # แบ่งตามหน้าการทำงาน
   ┣ auth/            # หน้า Login/Register, Token Management
   ┣ scanner/         # หน้ากล้อง, โลจิกถ่ายรูปรอผล AI, โลจิกครอป/ย่อรูป
   ┣ history/         # หน้ารายการประวัติการสแกนเก่าๆ
   ┗ profile/         # หน้าโปร์ไฟล์ผู้ใช้, Settings
```

### 1.2 การพัฒนาระบบกล้อง (Camera & Image Processing)
*   **แพ็กเกจที่ต้องใช้:** `camera`, `image_picker`, `image_cropper`, `flutter_image_compress`
*   **ขั้นตอนการทำงาน:**
    1.  ขอสิทธิ์เข้าถึงกล้องและคลังรูปภาพ (`permission_handler`)
    2.  เปิด UIView เพื่อแสดง Preview จากกล้อง พร้อมปุ่มกดถ่ายและเปิดปิดแฟลช
    3.  เมื่อผู้ใช้กดถ่ายรูป (หรือเลือกรูปจากแกลเลอรี) ให้เด้งหน้า `image_cropper` เพื่อให้ผู้ใช้เลือกเฉพาะจุดที่ต้องการตรวจสอบ (NFR-1.2)
    4.  ก่อนส่งรูปภาพขึ้น Backend ให้เข้ากระบวนการบีบอัดภาพ (Compress) เพื่อลดขนาดไฟล์ให้ต่ำกว่า 5MB โดยยังคงความละเอียดไว้ในระดับที่ AI สามารถอ่านได้ (เช่น กว้าง/ยาว ไม่เกิน 1024px)
    5.  ส่งภาพที่ผ่านกระบวนการแล้วผ่าน Multipart Request (ใช้ `dio`) ไปยัง API ของระบบ

### 1.3 State Management & UI Binding
*   จัดการ State ขณะรอผลจาก Backend โดยให้ความรู้สึกมั่นใจแก่ผู้ใช้
    *   **Loading State:** แสดง Animation สแกน หรือข้อความกำลังประมวลผล (เช่น "ระบบกำลังตรวจสอบความสดของเนื้อหมู...")
    *   **Success State:** ได้คำตอบพร้อมกรอบ (Bounding Box) และแสดงผลตามระดับความปลอดภัย: **ปลอดภัย (เขียว)**, **น่าสงสัย (เหลือง)**, **อันตราย (แดง)** พร้อมข้อความอธิบายที่ได้จาก AI
    *   **Error State:** จัดการเมื่อเน็ตหลุด, เซิร์ฟเวอร์ล่ม หรือ AI ประมวลผลผิดพลาด

---

## ⚙️ 2. Backend Implementation (API & Database)
**เทคโนโลยี:** Node.js, Fastify, TypeScript, PostgreSQL (Prisma ORM เชื่อมกับ Supabase)

### 2.1 Database Schema (Prisma)
สร้าง `schema.prisma` เพื่อเก็บข้อมูลที่จำเป็น:
```prisma
model User {
  id        String   @id @default(uuid())
  supabaseAuthId String  @unique // โยงกับ Authentication ของ Supabase
  email     String   @unique
  name      String?
  scans     ScanHistory[]
  createdAt DateTime @default(now())
}

model ScanHistory {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  imageUrl       String   // ลิงก์รูปที่เก็บใน Supabase Storage
  safetyLevel    String   // SAFE, SUSPICIOUS, DANGEROUS
  aiConfidence   Float    // เช่น 0.95
  aiResponseJson Json     // เก็บผลลัพธ์คำอธิบายเต็มรูปแบบ และพิกัด Bounding Box
  createdAt      DateTime @default(now())
}
```

### 2.2 โครงสร้าง API Endpoints
ออกแบบแบบ RESTful API รันบน Fastify:
*   **Auth Routes**
    *   (ส่วนใหญ่ จัดการผ่าน Supabase SDK ที่ฝั่ง Frontend ได้เลย แต่ถ้าต้องการเพิ่ม Custom Logic บน Backend ก็เรียก API `/api/v1/user/sync` เพื่อซิงค์ข้อมูลหลัง Login สำเร็จ)
*   **Scanner Routes (Main Logic)**
    *   `POST /api/v1/scans/analyze` -> รับ Multipart File -> เช็ค Quota ผู้ใช้ -> อัปโหลดรูปขึ้น Supabase Storage -> **เรียกใช้งาน AI Integration Service** -> บันทึก DB -> ส่ง Response ให้ Client
*   **History Routes**
    *   `GET /api/v1/scans` -> ดึงข้อมูลประวัติแบบ Pagination (หรืออาจจะยิงตรงเข้า Supabase จากแอปเลยถ้าอนุญาตให้ผ่าน Row Level Security)
    *   `GET /api/v1/scans/:id` -> ดูรายละเอียดรูปเก่าแผ่นใดแผ่นหนึ่ง
    *   `DELETE /api/v1/scans/:id` -> ลบประวัติ (ผู้ใช้ลบเองได้)

### 2.3 Middleware & Security
*   สร้าง Middleware ถอดรหัส Authentication Token
*   ติดตั้ง Rate Limiting (ป้องกันการส่งรูปรัวๆ)
*   Validate ขอบเขตไฟล์ (Type ต้องเป็น JPEG/PNG, ขนาดไม่เกินที่ตั้งไว้)

---

## 🤖 3. AI Service Integration (Generative AI)
**เทคโนโลยี:** Google Gemini API (หรือ OpenAI API)

### 3.1 การเชื่อมต่อและปรับแต่ง Prompt (Prompt Engineering)
ส่วนนี้มีความสำคัญสูงสุด (Critical Path) ในการรับประกันความเสถียรของระบบ
*   **เป้าหมาย:** สร้าง Prompt ที่ทำให้ Gemini ประมวลผลจากรูปภาพและตอบกลับมาเป็น Data Format เดียวเสมอ (เช่น JSON Structure) ไม่แตกแถวมีตัวหนังสือเลอะเทอะ
*   **โครงสร้างของ Prompt (ตัวอย่างเบื้องต้น):**
    ```text
    Role: You are an elite Food Safety and Culinary Expert alongside an advanced computer vision AI.
    Task: Analyze the provided food or ingredient image for signs of mold, parasites, discoloration, spoilage, or hazardous toxins (e.g., Blue-ringed octopus). Identify the main food type or ingredient shown.
    
    CRITICAL INSTRUCTIONS:
    1. All analysis and output must be translated and returned in THAI language (except JSON keys and ENUMs).
    2. ONLY output a 100% valid JSON payload. Do NOT include markdown code blocks (e.g., ```json) or any conversational text.
    
    JSON Output Schema:
    {
      "isFood": boolean, 
      "foodType": string, // Example: "เนื้อหมู" (Pork), "ปลาหมึก" (Squid)
      "safetyLevel": "SAFE" | "SUSPICIOUS" | "DANGEROUS",
      "confidence": float (0.0 - 1.0),
      "analysisDetail": string, // Provide a concise, highly-accurate explanation in THAI. State why the ingredient is safe or dangerous based on visual evidence.
      "boundingBoxes": [ // If nothing specific is detected, return an empty array []
        {"label": string (in THAI), "x_min": float, "y_min": float, "x_max": float, "y_max": float}
      ]
    }
    ```
*   **AI Service Workflow (ใน Backend):**
    1.  รับรูปภาพเป็น Base64 หรือ Image URL
    2.  ส่งรูปเข้าไปที่ฟังก์ชัน `generateContent` ของ Gemini API (ฉีด System Prompt ด้านบนเข้าไป)
    3.  เมื่อได้ Response -> ตัดตัวหนังสือส่วนเกิน (หากมี) นอกเหนือขอบเขต `{ ... }` เพื่อแปลงจาก String เป็น JSON Object (JSON.parse)
    4.  ประเมิน `safetyLevel` ส่งกลับไปให้ Database และ Client

---

## ☁️ 4. Cloud Infrastructure & DevOps Implementation
**เทคโนโลยี:** Render/Fly.io, Supabase (Auth, DB, Storage)

### 4.1 Deployment Pipeline (CI/CD)
*   **GitHub Actions / Render Auto-Deploy:**
    *   *บน Branch `main` (สำหรับ Backend):* ผูก Repository เข้ากับบัญชี Render เลือก Web Service -> ตั้งค่า Build Command (`npm run build`) และ Start Command (`npm start`) เพื่อ Deploy บนเซิร์ฟเวอร์ฟรี
    *   *บน Branch `main` (สำหรับ Mobile):* รันตรวจสอบโค้ด Dart -> Build `.apk` โยนส่งเป็น Artifact ให้ดาวน์โหลดไปเทสต์

### 4.2 การจัดการ Resource (Cost Management ใน Free Tier)
*   **Database & Storage:** Supabase Free Tier ให้ Database 500MB และ Storage 1GB จึงต้องระวังพื้นที่เต็ม
*   **Cron Job ลบไฟล์:** เขียนทริกเกอร์ลบรูปภาพที่เกิน 30 วันใน Supabase Storage แบบอัตโนมัติ เพื่อหมุนเวียนพื้นที่ 1GB ให้ไม่เต็ม 
*   **Hosting Sleep Mode:** โฮสต์ฟรีบน Render จะ "Sleep" หากไม่มีการเรียกใช้งานเกิน 15 นาที ลูกค้าที่เปิดแอปมาสแกนคนแรกอาจจะเจออาการหน่วงสัก 30 วินาทีถึง 1 นาทีในการรันเซิร์ฟเวอร์ขึ้นมาใหม่ (Cold Start) ให้เขียนแอปจัดการสถานะ Loading ค้างไว้นานๆ ตอนนี้ได้อย่างเหมาะสม

---

### ขั้นตอน (Checklist) การเริ่มงานรายสัปดาห์ (อิงจาก Phase 1-5 และ Free Tier):
1.  **สัปดาห์ 1:** พิสูจน์ Prompt กับ Gemini API บนเครื่อง Local (ส่งรูปของจริงเข้าไปสัก 20-30 รูป เพื่อดูว่า JSON ออกมานิ่งไหม) และสมัคบัญชี Supabase
2.  **สัปดาห์ 2:** ร่าง UI Mobile & ตั้ง Setup `node.js`
3.  **สัปดาห์ 3-4:** วาง Schema ใน Supabase, สร้าง Route ของ Backend จนเสร็จถึงขั้นยิง Postman เทสต์ได้
4.  **สัปดาห์ 5-6:** ขึ้นจอ App กล้อง, อัปโหลดขึ้น Supabase Storage, รอผลโหลดติ้วๆ เชื่อม API
5.  **สัปดาห์ 7-8:** สร้างหน้าประวัติ, วนลูปแก้บั๊กเมื่อเจอรูปแปลกๆ 
6.  **สัปดาห์ 9+:** นำ Backend ขึ้น Render & Test บน Environment จริง
