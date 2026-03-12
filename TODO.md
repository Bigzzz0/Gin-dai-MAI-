# สิ่งที่ ainda ไม่ได้ทำ / ต้องปรับปรุง

## ✅ ทำเสร็จแล้ว

### Frontend (Mobile App)
- [x] หน้า Camera (ถ่ายภาพ, เปิด/ปิดแฟลช, สลับกล้อง)
- [x] หน้า Preview (แสดงรูปก่อนวิเคราะห์, เพิ่มหมายเหตุ)
- [x] หน้า Crop (ตัดส่วนภาพ)
- [x] หน้า Result (แสดงผลวิเคราะห์, bounding boxes, คำแนะนำ)
- [x] หน้า History (ดูประวัติ, ลบรายการ)
- [x] หน้า Anomaly Detail (ดูรายละเอียดความผิดปกติ)
- [x] หน้า Settings (การตั้งค่าต่างๆ)
- [x] หน้า Disclaimer (ข้อความปฏิเสธความรับผิดชอบ)
- [x] หน้า Auth (Login/Register)
- [x] ระบบแชร์ผลลัพธ์
- [x] ระบบ Feedback (รายงานผลวิเคราะห์ผิดพลาด)
- [x] ระบบ GeoLocation (บันทึกตำแหน่งที่สแกน)
- [x] Image Compression (ย่อขนาดภาพก่อนส่ง)
- [x] UI/UX ภาษาไทย

### Backend API
- [x] Authentication (Supabase Auth)
- [x] Scan endpoints (analyze image)
- [x] History endpoints (get, delete)
- [x] Feedback endpoints
- [x] Image upload (Supabase Storage)
- [x] AI Integration (Gemini 1.5 Flash)
- [x] Database schema (Prisma)

---

## ❌ สิ่งที่ยังไม่ได้ทำ / ต้องปรับปรุง

### 1. **Authentication System** ⚠️
- [ ] **หน้า Login/Register ที่สมบูรณ์** - มีไฟล์ auth.tsx แต่ยังไม่ตรวจสอบว่าทำงานเต็มรูปแบบหรือไม่
- [ ] **Email/Password Authentication** - ยังไม่มีการ implement จริง
- [ ] **Reset Password** - ไม่มีระบบกู้คืนรหัสผ่าน
- [ ] **Biometric Authentication** (Face ID/Touch ID) - ตาม NFR-4.3
- [ ] **Role-based Access Control** (User/Admin) - ตาม Domain Classes

### 2. **UserProfile Management** ❌
- [ ] **หน้าโปรไฟล์ผู้ใช้** - แก้ไขชื่อ, อีเมล, รูปโปรไฟล์
- [ ] **Preferences/Settings** - การตั้งค่าภาษา, การแจ้งเตือน
- [ ] **Avatar Upload** - อัปโหลดรูปโปรไฟล์

### 3. **Image Preprocessing** ⚠️
- [ ] **Crop Functionality** - มีหน้า crop.tsx แต่ต้องตรวจสอบว่าทำงานและส่งค่า coordinates ได้ถูกต้อง
- [ ] **Image Rotation** - ไม่มีระบบหมุนภาพ
- [ ] **Manual Focus Control** - ตาม FR-1.2
- [ ] **Flash Toggle** - มีใน camera.tsx แล้ว แต่ต้องทดสอบ

### 4. **Internet Connectivity Check** ❌
- [ ] **ตรวจสอบการเชื่อมต่อก่อนส่งภาพ** - ตาม Use Case Exception Flow E-1
- [ ] **Offline Mode** - ไม่มีระบบ cache สำหรับใช้งานแบบ offline
- [ ] **Network Error Handling** - ยังไม่มี UI แจ้งเตือนเมื่อไม่มีอินเทอร์เน็ต

### 5. **AI Analysis Enhancement** ⚠️
- [ ] **Food Category Classification** - ตาม FR-2.2 (จำแนก เนื้อสัตว์/อาหารทะเล/ผักผลไม้)
- [ ] **Multi-stage Analysis** - ตามขั้นตอนการวิเคราะห์ (ตรวจสอบคุณภาพภาพก่อน แล้วค่อยวิเคราะห์)
- [ ] **Prompt Versioning** - ตาม Domain Class SystemPrompt
- [ ] **Error Handling สำหรับภาพไม่ชัดเจน** - ตาม Exception Flow E-2

### 6. **Scan History & Management** ⚠️
- [ ] **isSaved Flag** - ตาม ScanHistory domain class (บันทึกถาวร vs ชั่วคราว)
- [ ] **Filter/Sort History** - เรียงตามวันที่, ระดับความเสี่ยง
- [ ] **Search History** - ค้นหาจากประวัติ
- [ ] **Export History** - ส่งออกข้อมูลเป็น PDF/CSV

### 7. **Feedback System** ⚠️
- [ ] **Rating System** (1-5 ดาว) - ตาม UserFeedback domain class
- [ ] **Feedback List/Management** - ดูประวัติการส่ง feedback
- [ ] **Admin Dashboard** - ดู feedback ทั้งหมด (สำหรับ Admin)

### 8. **Notification System** ❌
- [ ] **Push Notifications** - แจ้งเตือนเมื่อมีผลวิเคราะห์
- [ ] **In-app Notifications** - การแจ้งเตือนในแอป
- [ ] **Notification Settings** - เปิด/ปิดการแจ้งเตือน (มี UI ใน Settings แต่ยังไม่มีระบบจริง)

### 9. **Disclaimer Display** ⚠️
- [ ] **แสดง Disclaimer ทุกครั้งที่สแกน** - ตาม NFR-2.3
- [ ] **First-time Acceptance** - ยอมรับข้อความเมื่อเปิดแอปครั้งแรก
- [ ] **Checkbox "Don't show again"** - ตัวเลือกไม่ต้องแสดงอีก

### 10. **Admin Features** ❌
- [ ] **Admin Dashboard** - ดูสถิติการใช้งาน
- [ ] **User Management** - จัดการผู้ใช้
- [ ] **Feedback Review** - ตรวจสอบ feedback เพื่อปรับปรุง AI
- [ ] **Analytics/Reports** - รายงานการใช้งาน

### 11. **Security Enhancements** ❌
- [ ] **Certificate Pinning** - ตาม NFR-6.1.1
- [ ] **Request Signing** - ตาม NFR-6.1.2
- [ ] **Rate Limiting** - จำกัดจำนวน request ต่อผู้ใช้
- [ ] **Input Validation** - ตรวจสอบ input ทุกครั้ง

### 12. **Performance Optimization** ⚠️
- [ ] **Response Time Monitoring** - ตาม NFR-1.1 (5-10 วินาที)
- [ ] **Image Processing Speed** - ตาม NFR-1.2 (ไม่เกิน 2 วินาที)
- [ ] **Concurrency Testing** - ตาม NFR-1.3 (50-100 คน/วินาที)
- [ ] **Caching System** (Redis) - ตาม Tech Stack

### 13. **Deployment & Monitoring** ❌
- [ ] **Docker Deployment** - มี docker-compose.yml แต่ต้องทดสอบ Production
- [ ] **CI/CD Pipeline** - Automated testing และ deployment
- [ ] **Health Check Endpoint** - ตาม Section 9.1
- [ ] **Monitoring Dashboard** - ตาม Section 9
- [ ] **Alert System** - แจ้งเตือนเมื่อระบบมีปัญหา
- [ ] **Log Aggregation** - รวบรวม log จากทุก service

### 14. **Database Schema Updates** ⚠️
- [ ] **UserProfile Table** - ยังไม่มีใน schema.prisma
- [ ] **FoodCategory Table** - ยังไม่มี
- [ ] **SystemPrompt Table** - ยังไม่มี
- [ ] **RiskAssessment Table** - ยังไม่มี
- [ ] **Recommendation Table** - ยังไม่มี
- [ ] **InspectionSession Table** - ยังไม่มี (ใช้ ScanHistory แทน)

### 15. **UI/UX Improvements** ⚠️
- [ ] **Loading Skeletons** - มีบางส่วน แต่ยังไม่ครบทุกหน้า
- [ ] **Empty States** - มีบางส่วน
- [ ] **Error Boundaries** - จัดการ error ทั้งแอป
- [ ] **Accessibility** - รองรับผู้พิการ (VoiceOver, TalkBack)
- [ ] **Dark Mode** - ตาม color scheme hook

### 16. **Testing** ❌
- [ ] **Unit Tests** - ไม่มีการทดสอบหน่วยงาน
- [ ] **Integration Tests** - ไม่มีการทดสอบรวม
- [ ] **E2E Tests** - ไม่มีการทดสอบทั้งระบบ
- [ ] **Load Testing** - ทดสอบภาระงาน

### 17. **Documentation** ❌
- [ ] **API Documentation** - Swagger/OpenAPI
- [ ] **User Manual** - คู่มือผู้ใช้
- [ ] **Developer Guide** - คู่มือนักพัฒนา
- [ ] **Deployment Guide** - คู่มือการติดตั้ง

---

## 📊 สรุปความคืบหน้า

### ทำเสร็จแล้ว: ~60-70%
- ✅ Core Features (สแกน, วิเคราะห์, แสดงผล)
- ✅ Basic UI/UX
- ✅ Backend API พื้นฐาน
- ✅ Database Integration

### ต้องทำเพิ่ม: ~30-40%
- ⚠️ Authentication System
- ⚠️ User Management
- ⚠️ Security Enhancements
- ❌ Admin Features
- ❌ Monitoring & Deployment
- ❌ Testing

---

## 🎯 Priority High (ควรทำก่อน)

1. **Authentication System** - ให้ผู้ใช้ login ได้จริง
2. **Internet Connectivity Check** - แจ้งเตือนเมื่อไม่มีเน็ต
3. **Disclaimer Display** - แสดงทุกครั้งที่สแกน
4. **Error Handling** - จัดการ error แบบสมบูรณ์
5. **Testing** - เขียน test พื้นฐาน

## 🎯 Priority Medium

6. **UserProfile Management**
7. **Notification System**
8. **Security Enhancements**
9. **Performance Optimization**
10. **History Filter/Sort**

## 🎯 Priority Low

11. **Admin Dashboard**
12. **Analytics/Reports**
13. **CI/CD Pipeline**
14. **Documentation**
15. **Accessibility**
