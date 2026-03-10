# แผนการพัฒนาโปรเจค (Project Development Plan)

**ชื่อโครงงาน:** Gin dai MAI! (กินได้ไหม!) : ระบบสแกนตรวจสอบความปลอดภัยและสิ่งแปลกปลอมในวัตถุดิบอาหารด้วย Generative AI
**ระยะเวลาดำเนินการโดยประมาณ:** 10 - 12 สัปดาห์

**Tech Stack ที่เลือกใช้:**

* **Frontend:** React Native (Expo) + TypeScript + AsyncStorage (Local DB)
* **Frontend:** React Native (Expo) + TypeScript + AsyncStorage (Local DB)
* **Backend:** Node.js (TypeScript) + Fastify
* **Database & Auth:** Supabase (PostgreSQL + Auth - ฟรี Tier มีเพียงพอสำหรับเริ่มต้น)
* **Cloud Hosting:** Render หรือ Fly.io (ฟรี Tier สำหรับ Backend API)
* **Image Storage:** Supabase Storage (ฟรี 1GB)
* **AI Service:** Google Gemini API (1.5 Flash - มีโควต้าใช้ฟรีรายวัน)

## Phase 1: การเตรียมการและออกแบบ (Initiation & Design) - [สัปดาห์ที่ 1-2]

**เป้าหมาย:** สรุปโครงสร้างระบบ ออกแบบ UI/UX และทดสอบความแม่นยำของ AI เบื้องต้น

* **System Architecture & Tech Stack Setup:**
  * ติดตั้งและตั้งค่า Environment ตาม Tech Stack ที่ใช้บัญชีฟรี (Node.js, Expo, React Native, Supabase)
  * ตั้งค่า Repository (GitHub/GitLab) แบ่งเป็นฝั่ง `mobile-app` และ `backend-api`
  * ตั้งค่า CI/CD Pipeline เบื้องต้น (GitHub Actions หรือ GitLab CI - มี Runner ฟรี)
* **UI/UX Design:**
  * ออกแบบ Wireframe และ Mockup บน Figma (เน้นการใช้งานง่ายแบบ 3 ขั้นตอน: เปิดแอป -> ถ่ายรูป -> ดูผล สีแจ้งเตือน เขียว/เหลือง/แดง)
  * ออกแบบหน้า History, Feedback และ Profile
* **AI & Prompt Engineering (Critical Path):**
  * สมัครและตั้งค่า API ของ AI Service (แนะนำ Gemini Pro Vision เนื่องจากรองรับภาษาไทยดีและราคาเข้าถึงง่าย)
  * **ทดสอบ Prompt Engineering** กับรูปภาพหมวดหมู่ต่างๆ (เนื้อสัตว์, อาหารทะเล, ผักผลไม้) และปรับแต่ง Prompt ให้แม่นยำเพื่อลดอาการ Hallucination
* **Database Design:**
  * ออกแบบ Entity-Relationship (ER) Diagram สำหรับ PostgreSQL หรือ Collection schema สำหรับ MongoDB

## Phase 2: พัฒนาระบบหลังบ้านและ AI Integration (Backend Development) - [สัปดาห์ที่ 3-5]

**เป้าหมาย:** สร้างเซิร์ฟเวอร์ฐานข้อมูล, ระบบสมาชิก, อินทิเกรต AI และสร้าง API ให้ฝั่งแอปพลิเคชันใช้งาน

* **Database & Core Service:**
  * สร้างโปรเจกต์บน Supabase เพื่อเป็น Database (PostgreSQL) และตั้งค่า Storage
  * ประยุกต์ใช้ Supabase Auth สำหรับระบบ Authentication (Login/Register, Row Level Security)
* **API Development:**
  * สร้าง Image Service (รับภาพจาก Client, ย่อขนาด, ตรวจสอบความปลอดภัยไฟล์)
  * **พัฒนาระบบ AI Connector:** เขียนโค้ดเรียกใช้งาน Generative AI API ส่งรูปภาพพร้อมรับผลลัพธ์ JSON กลับมาประมวลผล (คำนวณ Confidence Score, จัดระดับความเสี่ยง)
  * สร้าง History Service (บันทึก/ลบ/ดึงข้อมูลประวัติ) และ Feedback Service
* **Security & Optimization:**
  * ทำ Rate Limiting, CORS, เวิร์กโฟลว์ซ่อน API Key ไม่ให้หลุดไปที่ฝั่ง Client
  * ทำ Unit Test สำหรับ Backend Logic

## Phase 3: พัฒนาแอปพลิเคชันมือถือ (Mobile Application Development) - [สัปดาห์ที่ 6-8]

**เป้าหมาย:** พัฒนาแอปพลิเคชันให้สามารถถ่ายรูป ครอปรูป และรับผลจาก Backend ได้

* **Project Setup & UI Implementation:**
  * ขึ้นโครงโปรเจค Expo (React Native), กำหนด State Management (Zustand หรือ Context API)
  * สร้างหน้า UI และ Component ต่างๆ ตาม Figma
* **Camera & Image Processing (FR-1):**
  * พัฒนาระบบถ่ายภาพ, เปิด/ปิดแฟลช, เลือกรูปจาก Gallery
  * สร้างฟังก์ชัน Crop และย่อขนาดภาพ (Image Compression) ก่อนส่ง (NFR-1.2)
* **API Integration (FR-2 & FR-3):**
  * เชื่อมต่อแอปเข้ากับ Backend API (ส่งรูปเข้าระบบ -> รับ JSON -> แสดงผล สีเขียว/เหลือง/แดง พร้อมกรอบ Bounding Box)
  * เพิ่มระบบ Loading State และ Error Handling (กรณีเน็ตหลุด หรือภาพเบลอ)
* **History & Other Features (FR-4):**
  * สร้างหน้ารวมประวัติการสแกน (เชื่อมต่อ Local Storage / Remote Database)
  * ทำระบบ Feedback และหน้าโปรไฟล์ผู้ใช้

## Phase 4: ทดสอบระบบแบบรวมศูนย์ (System Integration & QA) - [สัปดาห์ที่ 9-10]

**เป้าหมาย:** ทดสอบการทำงานร่วมกันทั้งหมด และปรับปรุงประสิทธิภาพตาม NFR

* **System Integration Testing (SIT):**
  * ทดสอบ End-to-End: ถ่ายภาพ -> ประมวลผล Backend -> AI ส่งผลกลับ -> แสดงบนหน้าจอ
* **Performance & Load Testing:**
  * ทดสอบ Response Time ให้ได้ตามเป้าหมาย (ไม่เกิน 5-10 วินาที)
  * ทดสอบ Concurrency (ส่งคำขอพร้อมกัน 50-100 คนต่อวินาที)
* **User Acceptance Testing (UAT):**
  * ให้กลุ่มเป้าหมายจำลองใช้งาน (แม่บ้าน, ผู้ทำอาหาร) เพื่อประเมินความง่ายในการใช้งาน (Ease of Use)
  * ทดสอบการแสดงผลบน Android 10+ และ iOS 15+
* **AI Tuning & Bug Fixing:**
  * ปรับปรุง Prompt ตาม Feedback จากกลุ่มทดสอบ หากพบสาเหตุที่ AI ระบุการประเมินผิดพลาด

## Phase 5: การส่งมอบและเปิดใช้งานจริง (Deployment & Launch) - [สัปดาห์ที่ 11-12]

**เป้าหมาย:** นำระบบขึ้น Production อย่างสมบูรณ์และเตรียมพร้อมสำหรับผู้ใช้งาน

* **Backend & Cloud Setup:**
  * deploy Node.js Backend บนบริการที่มี Free Tier (เช่น Render หรือ Fly.io)
  * เชื่อมต่อ Custom Domain (ถ้ามี) (บริการโฮสต์ส่วนใหญ่มี HTTPS มาให้)
* **Monitoring & Analytics:**
  * ติดตั้งตัวจับสถานะเซิร์ฟเวอร์ (Health Checks), Log monitoring และ Error Analytics (เช่น Sentry)
* **App Store Publish:**
  * Build ไฟล์ Production (`.apk`, `.aab`, `.ipa`)
  * เตรียมข้อมูลสำหรับจัดส่งลง Google Play Store และ Apple App Store

---

### 💡 คำแนะนำเพิ่มเติมสำหรับการดำเนินโครงงานนี้

1. **Focusที่ Prompt Engineering ก่อน (ทำ Proof of Concept):** ส่วนที่เสี่ยงที่สุดของโปรเจคนี้คือ "ความแม่นยำของ AI" แนะนำให้ทีมใช้เวลาในช่วงสัปดาห์แรกๆ ในการนำรูปพยาธิหรือเชื้อราในอาหารจริงๆ ไปป้อนเข้า Gemini / GPT-4o เพื่อดูว่า AI ตอบกลับมาได้โครงสร้าง JSON สม่ำเสมอและแม่นยำแค่ไหน ก่อนที่จะเริ่มเขียนโค้ดเต็มรูปแบบ
2. **การลดค่าใช้จ่ายบริการ AI:** ในช่วงแรกควรมีการกำหนด Rate Limit ให้ผู้ใช้แต่ละคน (เช่น สแกนได้ 10 ครั้ง/วัน) เพื่อป้องกันค่าใช้จ่าย API บานปลาย
3. **การเก็บ Cache ภาพบกพร่อง:** หากผู้ใช้หลายคนดึงภาพมาจากเน็ตหรือภาพซ้ำกัน สามารถลดต้นทุนเรียก AI ได้ด้วยการสร้าง Cache ของภาพที่มี Hash ตรงกันไว้ที่ฐานข้อมูล
