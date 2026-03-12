<!-- markdownlint-disable MD033 MD041 -->
<div align="center">
  <img src="https://avatars.githubusercontent.com/u/12504344?s=200&v=4" width="80" alt="Expo" style="border-radius: 20%;" />
  <h1>📸🍲 Gin dai MAI! (กินได้ไหม)</h1>
  <p><strong>ระบบสแกนตรวจสอบความปลอดภัยและสิ่งแปลกปลอมในวัตถุดิบอาหารด้วย AI</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Frontend-React_Native_%28Expo%29-61DAFB?style=for-the-badge&logo=react" alt="React Native" />
    <img src="https://img.shields.io/badge/Backend-Node.js_%7C_Fastify-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
    <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/AI-Google_Gemini_1.5-8E75B2?style=for-the-badge&logo=google" alt="Google Gemini API" />
  </p>
</div>

---

## 📖 เกี่ยวกับโปรเจกต์ (About The Project)

**Gin dai MAI!** เป็นแอปพลิเคชันบนสมาร์ทโฟนที่ถูกออกแบบมาเพื่อช่วยผู้บริโภคในการคัดกรอง เฝ้าระวัง และประเมินความปลอดภัยของวัตถุดิบอาหาร (ผัก ผลไม้ อาหารทะเล และเนื้อสัตว์) ด้วยการถ่ายภาพผ่านสมาร์ทโฟนแบบเรียลไทม์

โดยเบื้องหลังใช้ขุมพลังจาก **Generative AI (Google Gemini 1.5 Flash)** เข้ามาช่วยวิเคราะห์และมองหาความผิดปกติทางกายภาพที่ผู้ใหญ่อาจมองข้ามหรือดูไม่ออกด้วยตาเปล่า เช่น:

* **พยาธิเม็ดสาคู** หรือฝีหนองที่ซ่อนอยู่ในเนื้อหมู/เนื้อวัว
* **สัตว์มีพิษร้ายแรง** อย่างหมึกบลูริงที่มักปะปนมากับหมึกสายตามท้องตลาด
* **เชื้อราหรือรอยเน่าเสีย** บริเวณพื้นผิวของผักผลไม้ต่างๆ

โปรเจกต์นี้จัดทำขึ้นเพื่อมุ่งเน้นความปลอดภัยสูงสุดของผู้บริโภคก่อนนำวัตถุดิบไปปรุงอาหาร ป้องกันการนำสิ่งที่มีพิษหรือพยาธิเข้าสู่ร่างกาย

### ✨ ฟีเจอร์หลัก (Key Features)

* 📸 **AI Food Inspection:** สแกนภาพวัตถุดิบอาหารผ่านกล้องหรืออัปโหลดจากคลังภาพเพื่อส่งให้ AI ประมวลผลอย่างรวดเร็ว (ความหน่วงต่ำกว่า 5 วินาที)
* 🚨 **Risk Assessment:** ประเมินความเสี่ยงและจัดแสดงคำเตือนผลการวิเคราะห์ 3 ระดับ เพื่อความเข้าใจอันง่ายดาย:
  * 🟢 **ปลอดภัย (Safe):** สามารถนำไปปรุงอาหารได้ตามปกติ
  * 🟡 **น่าสงสัย (Suspicious):** พบสิ่งผิดปกติเล็กน้อย ควรพิจารณาหรือตัดส่วนนั้นทิ้ง
  * 🔴 **อันตราย (Dangerous):** พบพยาธิ หรือสัตว์มีพิษ ห้ามรับประทานเด็ดขาด!
* 💡 **Smart Recommendations:** ไม่เพียงแค่บอกว่าอันตราย แต่ AI จะให้คำแนะนำเชิงลึกที่เป็นประโยชน์ ว่าควรจัดการกับวัตถุดิบนั้นต่ออย่างไร (เช่น ตัดทิ้ง, ปรุงสุกสุก 100%, หรือห้ามรับประทานและควรทิ้งทั้งหมด)
* 🗂️ **Scan History Tracker:** ปูมบันทึกประวัติการสแกน สามารถกลับมาดูความผิดปกติย้อนหลังได้พร้อมภาพถ่าย วันที่ และผลลัพธ์
* 🧭 **User Feedback:** มีปุ่มกดรายงานความผิดพลาดของ AI (Feedback) เพื่อให้ผู้พัฒนานำไปปรับปรุง Prompt ให้ดียิ่งขึ้น
* 🔐 **Secure Architecture:** ปกป้องข้อมูลผู้ใช้งานและซ่อน API Key อย่างแน่นหนาไว้ฝั่ง Backend โดยให้ตัวแอปทำงานผ่าน API Gateway

---

## 🏗 โครงสร้างโปรเจกต์ (Project Structure & Architecture)

โปรเจกต์นี้ใช้สถาปัตยกรรมแบบ **Client-Server Architecture** ผสมผสานหลักการ **Clean Architecture** โดยแบ่งออกเป็น 2 ส่วนหลัก เพื่อให้ง่ายต่อการดูแลรักษา (Maintainability) และช่วยรักษาความลับของ API Key (Security) ไม่ให้ถูกดึงออกจากแอปมือถือ:

```tree
📦 Gin dai mai
 ┣ 📂 backend-api   # Backend Server 
 ┃ ┣ 📂 prisma      # ไฟล์ Schema Database ของ Prisma ORM
 ┃ ┣ 📂 src         # โค้ดหลัก (Controller, Service จัดการติดต่อ AI), FastAPI
 ┃ ┗ 📜 .env        # ที่อยู่ของ Gemini API Key และ Supabase Database URL
 ┃
 ┣ 📂 mobile-app    # Mobile Frontend หน้าบ้านพัฒนาด้วย Expo (React Native)
 ┃ ┣ 📂 app         # ไฟล์ระบบ Routing ของแอปพลิเคชัน (Expo Router)
 ┃ ┣ 📂 components  # ส่วน UI ย่อยๆ เช่น ปุ่มกด, หน้าต่าง Alert, การ์ดแสดงประวัติ
 ┃ ┣ 📂 hooks       # ฟังก์ชันการจัดการภาพ (Camera) และจัดการ State (Zustand)
 ┃ ┗ 📜 .env        # ลิงก์ API ชี้เป้าไปที่ฝั่ง Backend
 ┃
 ┣ 📜 README.md     # คู่มือการติดตั้งและข้อมูลโครงข่ายโปรเจกต์
 ┣ 📜 Requirement.txt               # ไฟล์สรุป Requirement เชิงลึก กฎและข้อบังคับระบบทั้งหมด
 ┗ 📜 Project Development Plan.md   # ไฟล์จำแนกแผนการพัฒนาแบ่งตามระยะเวลาและ Stack
```

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

### 📱 Frontend (แอปมือถือ)

* **Framework:** React Native + Expo (ช่วยให้รองรับได้ทั้ง iOS และ Android อย่างรวดเร็ว)

* **Language:** TypeScript (ลดข้อผิดพลาด ลดบั๊กด้วยระบบ Typing)
* **State Management:** Zustand (จัดการตัวแปรส่วนกลาง น้ำหนักเบากว่า Redux)
* **Storage:** AsyncStorage (บันทึกข้อมูลแบบ Offline ภายในตัวเครื่อง)

### 💻 Backend (เซิร์ฟเวอร์หลังบ้าน)

* **Runtime:** Node.js (เวอร์ชัน 20 LTS ขึ้นไป เน้นประมวลผล I/O ความเร็วสูง)

* **Framework:** Fastify (ตอบสนองไวที่สุด ทำงานเป็น API Gateway จัดทิศทางข้อมูล)
* **ORM:** Prisma (ติดต่อฐานข้อมูลด้วยความมีระเบียบ จัดการ Schema ได้อย่างเป็นระบบ)

### ☁️ Database & Authentication

* **Database:** Supabase (PostgreSQL ทรงพลัง)

* **Storage:** Supabase Storage (อัปโหลดและเก็บเป็นถังข้อมูลภาพขนาดใหญ่)
* **Auth:** Supabase Auth (รองรับ Email/Password อย่างปลอดภัย มี JWT ในตัว)

### 🤖 Artificial Intelligence (ปัญญาประดิษฐ์)

* **Engine:** Google Gemini 1.5 Flash (ราคาประหยัด เข้าถึงและวิเคราะห์ภาพ (Multimodal) รวดเร็ว มีความฉลาดด้านภาษาไทยดีเยี่ยม)

---

## 💻 สิ่งที่ต้องเตรียม (Prerequisites)

เพื่อการรันโปรเจกต์แบบ Local บนเครื่องของท่าน กรุณาเตรียมความพร้อมตามรายการเหล่านี้:

1. **Node.js** (แนะนำเวอร์ชัน `20.x` หรือสูงกว่า) - [ดาวน์โหลด](https://nodejs.org/)
2. **แอปพลิเคชัน Expo Go** ติดตั้งลงในสมาร์ทโฟน ([App Store](https://apps.apple.com/us/app/expo-go/id982107779) สำหรับ iOS หรือ [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) สำหรับ Android)
3. โทรศัพท์มือถือและคอมพิวเตอร์ของคุณต้อง **เชื่อมต่อ Wi-Fi หรือเครือข่ายชื่อเดียวกัน**
4. **API Keys 2 บริการ ได้แก่:**
   * **Google Gemini API Key** (รับได้ฟรีจาก [Google AI Studio](https://aistudio.google.com/))
   * **บัญชี Supabase** และ [สร้างโปรเจกต์ใหม่](https://supabase.com/dashboard/projects) เพื่อรับ Database URL, Anon Key, และ Service Role Key

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์ (Setup Instructions)

การรันโปรเจกต์นี้จำเป็นต้อง **เปิด Terminal จำนวน 2 หน้าต่างแยกกัน** ตัวหนึ่งเตรียมไว้รัน Backend Server และอีกตัวเปิดทิ้งไว้รันแอปพลิเคชัน (Mobile)

### 🟢 ส่วนที่ 1: การตั้งค่า Backend API (เซิร์ฟเวอร์หลังบ้าน)

ทำหน้าที่เป็นสมองกล เชื่อมต่อและส่งรูปไปให้ AI ประมวลผล รวมถึงเป็นตัวคุยกับฐานข้อมูล Supabase

1. เปิด Terminal และเข้าไปที่โฟลเดอร์ฝั่ง Backend

   ```bash
   cd backend-api
   ```

2. สร้างไฟล์ `.env` ที่ root folder ของ `backend-api` (ก๊อปปี้จาก `.env.example` ก็ได้) และกรอกข้อมูลเหล่านี้ให้ครบถ้วน:

   ```env
   # 1. รหัสผ่านฝั่ง Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key_here

   # 2. ตั้งค่าการเชื่อมต่อฐานข้อมูล Supabase PostgreSQL
   DATABASE_URL="postgresql://[db-user]:[password]@[host]:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://[db-user]:[password]@[host]:5432/postgres"

   # 3. ข้อมูล Project Supabase ของคุณ
   SUPABASE_URL=https://[your-project-ref].supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   
   # ⚠️ สำคัญมาก: ใส่ Service Role Key เพื่อ Bypass ระบบ Row-Level Safety ของการอัปโหลดไฟล์รูปลงใน Storage
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # 4. ตั้งค่า Network & Server
   PORT=3000
   NODE_ENV=development
   ```

3. ติดตั้งแพ็กเกจ (Dependencies):

   ```bash
   npm install
   ```

4. ซิงก์โครงสร้างตาราง (Schema) ของโปรเจกต์ ลงสู่ฐานข้อมูลของ Supabase ผ่าน Prisma:

   ```bash
   npx prisma db push
   # หรือ npx prisma migrate dev (สำหรับผู้ที่ต้องการทำ Versioning ของโหมดนักพัฒนา)
   ```

5. ออกคำสั่งเปิดเซิร์ฟเวอร์ Backend ให้พร้อมใช้งาน:

   ```bash
   npm run dev
   ```

   🎉 *(เมื่อขึ้นข้อความ `Server listening at http://0.0.0.0:3000` ถือว่าเริ่มการเปิดใช้งานเสร็จสมบูรณ์ และพร้อมรับ Request ตลอดเวลา)*

<br />

### 📱 ส่วนที่ 2: การตั้งค่า Mobile App (แอปพลิเคชันฝั่งหน้าบ้าน)

ส่วนนี้เป็นแอปพลิเคชันที่ไปแสดงบนหน้าจอโทรศัพท์ของคุณ

1. เปิด Terminal **แท็บใหม่** (อย่าเผลอปิดหน้าต่างที่รัน Backend ไว้) และสลับโฟลเดอร์ไปฝั่ง `mobile-app`

   ```bash
   cd mobile-app
   ```

2. สร้างไฟล์ `.env` ที่ root ของโปรเจกต์ mobile-app และกำหนดค่าตัวแปร:

   ```env
   # ก๊อปปี้มาจากส่วน Backend ได้เลย เพื่อให้ Login ทะลุเข้าฐานข้อมูลได้
   EXPO_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   
   # ⚠️ ดึง URL ไปที่ IP Address ของเครื่องคอมฯ หลักที่รัน Backend
   # (สามารถดูตัวเลข IPv4 ของเครื่องได้จากการพิมพ์ ipconfig ลงใน Windows Command Prompt หรือ ifconfig สำหรับ Mac)
   EXPO_PUBLIC_API_URL=http://[YOUR_PC_IP_ADDRESS]:3000/api/v1
   ```

3. อัปเดตและติดตั้งแพ็กเกจ *(ต้องเพิ่มคำสั่ง `--legacy-peer-deps` เนื่องจาก Expo SDK ล่าสุดอิงการทำงานของ React 19 ซึ่งทำให้เกิด Conflict ขัดแย้งกับบางแพ็กเกจหน้า UI เช่น Lucide icons)*:

   ```bash
   npm install --legacy-peer-deps
   ```

4. เริ่มขั้นตอนแพ็กแอปพลิเคชัน (Bundler) *(แนะนำพ่วง `-c` ล้างแคชขยะโปรเจกต์เพื่อการเปลี่ยนแปลงที่อัปเดต 100%)*:

   ```bash
   npx expo start -c
   ```

5. จะมี QR Code เด้งขึ้นมาบนจอ ให้คุณนำสมาร์ทโฟนที่ติดตั้ง Expo Go มาสแกน  
   *(iOS ใช้แอปกล้องวงกลมสแกนได้เลย / Android ต้องกดเข้าแอป Expo Go เพื่อสแกน)*

---

## 🐳 รันทุกอย่างด้วย Docker (Full Stack Docker)

รันทั้ง **Backend API** และ **Expo Dev Server** (Mobile) ด้วยคำสั่งเดียว ไม่ต้องติดตั้ง Node.js บนเครื่อง

### 🔧 สิ่งที่ต้องเตรียม

* **Docker Desktop** — [ดาวน์โหลด](https://www.docker.com/products/docker-desktop/)
* **Expo Go** ในมือถือ — [iOS](https://apps.apple.com/us/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
* มือถือและเครื่องคอมต้องอยู่ **Wi-Fi วงเดียวกัน**

```bash
# ตรวจสอบว่า Docker พร้อมใช้:
docker --version
docker compose version
```

---

### 📋 ขั้นตอนการรัน

#### ขั้นที่ 1 — ดู IP ของเครื่องคอม

```bash
# Windows
ipconfig
# ดูที่ "IPv4 Address" ใต้ Wireless LAN adapter Wi-Fi
# ตัวอย่าง: 192.168.1.42
```

---

#### ขั้นที่ 2 — ตั้งค่าไฟล์ Environment

**2a. root `.env`** (สำหรับ docker-compose):

เปิดไฟล์ `.env` ที่ root โปรเจกต์ แล้วใส่ IP จากขั้นที่ 1:

```env
HOST_IP=192.168.1.42
```

**2b. `backend-api/.env`** (สำหรับ Backend):

```bash
cd backend-api
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

เปิดกรอกค่าจริง:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL="postgresql://postgres.<ref>:<password>@...supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<ref>:<password>@...supabase.com:5432/postgres"
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
NODE_ENV=production
```

> ⚠️ ห้าม Commit ไฟล์ `.env` ขึ้น Git — มี Secret Key บรรจุอยู่

---

#### ขั้นที่ 3 — Build และ Start ทุกอย่างพร้อมกัน

```bash
# อยู่ที่ root folder (Gin dai mai)
docker compose up --build
```

Docker จะทำงานดังนี้อัตโนมัติ:

| Service | สิ่งที่เกิดขึ้น |
| :--- | :--- |
| **api** | คอมไพล์ TypeScript → Deploy DB Migration → เริ่ม Fastify Server |
| **mobile** | ติดตั้ง npm dependencies → เริ่ม Expo Metro Bundler |

รอจนเห็น QR Code โผล่ขึ้นใน Terminal:

```
› Metro waiting on exp://192.168.1.42:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

#### ขั้นที่ 4 — สแกน QR Code ด้วยมือถือ

* **iPhone:** เปิดแอปกล้องปกติ → ชี้ที่ QR Code → กด Banner ที่โผล่ขึ้น
* **Android:** เปิดแอป **Expo Go** → กด "Scan QR code" → ชี้ที่ QR Code

แอปจะโหลดขึ้นในมือถือโดยอัตโนมัติ 🎉

---

### 🕹 คำสั่ง Docker ที่ใช้บ่อย

| คำสั่ง | ความหมาย |
| :--- | :--- |
| `docker compose up --build` | Build ใหม่และเริ่มต้นทุก Service (แสดง Log) |
| `docker compose up -d --build` | เหมือนบนแต่รันใน Background |
| `docker compose down` | หยุดและลบ Container ทั้งหมด |
| `docker compose logs -f` | ดู Log แบบ Real-time |
| `docker compose logs -f mobile` | ดู Log เฉพาะ Expo (ดู QR Code) |
| `docker compose restart api` | รีสตาร์ทเฉพาะ Backend |
| `docker compose ps` | ดูสถานะ Service ทั้งหมด |

---

### 📁 โครงสร้างไฟล์ Docker

```tree
📦 Gin dai mai
 ┣ 📜 docker-compose.yml          # Orchestration รัน api + mobile ด้วยกัน
 ┣ 📜 .env                        # HOST_IP สำหรับ docker-compose
 ┃
 ┣ 📂 backend-api
 ┃  ┣ 📜 Dockerfile               # Build Backend (multi-stage)
 ┃  ┗ 📜 .env.example             # Template สำหรับ backend .env
 ┃
 ┗ 📂 mobile-app
    ┗ 📜 Dockerfile.dev           # รัน Expo Dev Server
```

---

## 🚨 แนวทางการแก้ปัญหาที่พบบ่อย (Troubleshooting & FAQs)

เผื่อไว้ในกรณีที่เกิดบั๊กตอน Setup นอกกรอบ นี่เป็นวิธีแก้ไขมาตรฐาน:

<details>
<summary><b>1. ถ่ายรูปหรืออัปโหลดรูปภาพแล้วติด Error <code>"new row violates row-level security policy for table objects"</code></b></summary>
<br>

**สาเหตุหลัก:** โดยปกติฝั่งหน้าบ้านตั้งค่าให้แอปพยายามส่งรูปไปเก็บใน Bucket ของ Supabase แต่มันจะมองเป็นการเชื่อมต่อทั่วไปที่ไม่ได้ส่งสิทธิ์ยืนยันตัวตนระดับสูงไป (Guest Access) จึงติดระบบป้องกัน RLS ทำให้การอัปโหลดถูกโยนทิ้ง และ AI ไม่สามารถตรวจรูปได้

**วิธีแก้ไขง่ายๆ ทันที:**  
ตรวจสอบหน้าต่าง Terminal ทยอยไล่ดูไฟล์ `.env` ฝั่ง `backend-api` ว่าคุณหลงเอาค่า Public / Anon key ผิดช่องไปใส่ในตัวแปรของ `SUPABASE_SERVICE_ROLE_KEY` หรือเปล่า?  
แนะนำให้เข้าไปที่เว็บไซต์ Supabase > แผงหน้าปัดโปรเจกต์ของคุณ > **Project Settings > API** จากนั้นเลื่อนหาบล็อคคำว่า `service_role` -> กดยกเลิกซ่อนและ Copy รหัสสายลับที่ยาวๆ และซ่อนอยู่สุดทางออกมาแปะในไฟล์ `.env` ฝั่ง Backend แทน แล้วทำการบันทึกและรันเซิร์ฟเวอร์ Backend รีสตาร์ทอีกครั้ง
</details>

<details>
<summary><b>2. <code>npm install</code> ที่หน้าจอโฟลเดอร์ <code>mobile-app</code> พังและตีแจ้งเตือนขึ้นตัวแดงยาวเหยียดเกี่ยวกับ dependency tree error หรือ ERESOLVE</b></summary>
<br>

**สาเหตุหลัก:** แพ็กเกจของ Expo SDK เวอร์ชั่นล่าสุดรันอยู่บนโครงกระดูกซอฟต์แวร์สุดโหดอย่าง React 19 แต่ส่วนประกอบหน้าตาตกแต่ง UI ส่วนใหญ่ในโลก Community (เช่น ห่อของ Navigation หรืองานไอคอน `lucide-react-native`) ยังคงตั้งเงื่อนไข Peer Dependency รอเชื่อมกับเพียงแค่ React 18 ทำให้การประกอบร่างผิดคิวและด่ารัวๆ

**วิธีแก้ไขง่ายๆ ทันที:** ให้เพิ่มไฟว้ข้ามขั้นด้วยการกรอกคำสั่งติดตั้งใหม่ว่า `npm install --legacy-peer-deps` เพื่อสั่ง npm บังคับสลับโอนโมดูลที่มีอยู่ทั้งหมด โดยไม่สนใจการตรวจสอบเงื่อนไขที่ขัดแย้งกัน
</details>

<details>
<summary><b>3. รอวิเคราะห์ภาพ แล้วหมุนๆ จนขึ้น Error "Network Request Failed" ไม่ยอมบอกผล</b></summary>
<br>

**สาเหตุหลัก:** แอปบนโทรศัพท์มือถือหาที่อยู่เซิร์ฟเวอร์ Backend (ช่องทาง Port รันเครื่อง) ที่อยู่บนคอมฯ ของคุณไม่เจอ หรือติดต่อทาง IP ไม่ได้

**วิธีแก้ไขง่ายๆ ทันที:**  

1. ตรวจสอบว่า IP Address จุดของ `EXPO_PUBLIC_API_URL` ในไฟล์ `.env` ของ `mobile-app` ตรงกับการตั้งค่า IP ปัจจุบันของคอมพิวเตอร์ของคุณหรือไม่ (อย่าหลอกให้ระบบเชื่อมไปที่ `localhost` เป็นอันขาด เพราะแอป Expo จะไปมุดหลอก IP เครื่องโทรศัพท์ตัวเอง)
2. โทรศัพท์และคอมพิวเตอร์ต้องเกาะเชื่อมต่ออยู่กับสัญญาณ Router Wi-Fi **ตัวเดียวกัน 100% เท่านั้น**
3. บางกรณี ระบบป้องกันไวรัสหรือ Firewall บนหน้าจอระดับลึกฝั่ง Windows อาศัยการบล็อกเซกเมนต์ของ Port 3000 ทำให้ตัวแอปพลิเคชันจากนอกเครือจักรวาลมือถือเข้ามาเชื่อมต่อไม่ได้ จึงแนะนำให้ลองปิดสวิตซ์การทำงานของ Windows Defender Firewall (บนโซนโหมด Public Network) ลงชั่วคราวก่อนเริ่มใช้งานระบบ

</details>

---

## 👨‍💻 สมาชิกคณะผู้จัดทำโครงงาน (Project Contributors)

| ชื่อ - นามสกุล | รหัสนักศึกษา |
| :--- | :--- |
| นายศิฆรินทร์ อุปจันทร์ | `673380292-5` |
| นายธนภูมิ จันทรา | `673380272-1` |
| นายแทนคุณ พันธ์นิกุล | `673390301-0` |
| นายรัฐภูมิ แฝงฤทธิ์หลง | `653380373-7` |
| นายธนพนธ์ ไตรรงค์พิทักษ์ | `663380385-7` |

---

<p align="center">
  ระบบซอฟต์แวร์ฉบับนี้จัดทำขึ้นโดยอิงมาตรฐานสิทธิบัตรเปิดแห่ง <b><a href="https://opensource.org/license/mit">MIT License</a></b><br/>
  © 2026 Gin dai MAI! Food Inspection Project. สงวนลิขสิทธิ์ทั้งหมด
</p>
