# Gin dai MAI! (กินได้ไหม) 📸🍲

แอปพลิเคชันสำหรับถ่ายภาพอาหารเพื่อตรวจสอบโภชนาการและสารก่อภูมิแพ้โดยใช้ AI (Google Gemini 1.5 Flash) เหมาะสำหรับผู้ที่ต้องการควบคุมน้ำหนัก รักษาผู้ป่วยโรคไม่ติดต่อเรื้อรัง (NCDs) และผู้ที่มีอาการแพ้อาหาร

## Tech Stack 🛠

* **Frontend:** React Native (Expo) + TypeScript + Zustand + AsyncStorage
* **Backend:** Node.js (TypeScript) + Fastify
* **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
* **ORM:** Prisma
* **AI:** Google Gemini API (`gemini-1.5-flash`)

## Project Structure 📁

* `/backend-api` - Node.js/Fastify backend API
* `/mobile-app` - React Native (Expo) mobile application
* `Requirement.txt` - Project Requirements and Specifications
* `Project Development Plan.md` - Development phases and tech stack details

## Setup Instructions 🚀

คุณจำเป็นต้องเปิด 2 Terminal แยกกัน ตัวนึงสำหรับรัน Backend และอีกตัวรัน Mobile App

### 1. เปิดระบบ Backend API

1. เปิด Terminal และเข้าไปที่โฟลเดอร์ `/backend-api` (`cd backend-api`)
2. คัดลอกไฟล์ `.env.example` เป็น `.env` และกรอก **Gemini API Key** กับ **Supabase Database URL**
3. ติดตั้งแพ็กเกจ: `npm install`
4. รันคำสั่งจำลองฐานข้อมูล: `npx prisma db push` (หรือ `npx prisma migrate dev`)
5. เริ่มการทำงานเซิร์ฟเวอร์: `npm run dev` (เซิร์ฟเวอร์จะรันที่ `http://localhost:3000`)

### 2. เปิดระบบ Mobile App (Expo)

ต้องแน่ใจว่าติดตั้งแอปพลิเคชัน **Expo Go** ลงบนโทรศัพท์มือถือของคุณเรียบร้อยแล้ว และโทรศัพท์เชื่อมต่อ WiFi เดียวกันกับคอมพิวเตอร์

1. เปิด Terminal ***ใหม่*** (แยกกับอันที่รัน Backend ไว้) และเข้าไปที่โฟลเดอร์ `/mobile-app` (`cd mobile-app`)
2. ติดตั้งแพ็กเกจ: `npm install`
3. รันคำสั่งเริ่มแอปพลิเคชัน: 
   ```bash
   npx expo start
   ```
   *(หมายเหตุ: ต้องมีคำว่า `npx` นำหน้าเสมอ ห้ามพิมพ์แค่ `expo start`)*
   *(หากเจอปัญหาแอปค้างหรือขึ้น Something went wrong ให้รันคำสั่งล้างแคชด้วย `npx expo start -c` แทน)*
4. จะมี QR Code ปรากฏในจอ Terminal
5. **สำหรับ iOS:** เปิดแอปกล้องใน iPhone แล้วสแกน QR Code (มันจะถามให้เปิดแอป Expo Go) <br/>
   **สำหรับ Android:** เปิดแอป Expo Go ขึ้นมาและเลือกเมนู "Scan QR Code"

## License

MIT
