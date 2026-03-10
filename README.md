# Gin dai MAI! (กินได้ไหม) 📸🍲

แอปพลิเคชันสำหรับถ่ายภาพอาหารเพื่อตรวจสอบโภชนาการและสารก่อภูมิแพ้โดยใช้ AI (Google Gemini 2.5 Flash) เหมาะสำหรับผู้ที่ต้องการควบคุมน้ำหนัก รักษาผู้ป่วยโรคไม่ติดต่อเรื้อรัง (NCDs) และผู้ที่มีอาการแพ้อาหาร

## Tech Stack 🛠

* **Frontend:** React Native (Expo) + TypeScript + Zustand + AsyncStorage
* **Backend:** Node.js (TypeScript) + Fastify
* **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
* **ORM:** Prisma
* **AI:** Google Gemini API (`gemini-2.5-flash`)

## Project Structure 📁

* `/backend-api` - Node.js/Fastify backend API
* `/mobile-app` - React Native (Expo) mobile application (To be implemented)
* `Requirement.txt` - Project Requirements and Specifications
* `Project Development Plan.md` - Development phases and tech stack details

## Setup Instructions 🚀

### Backend API

1. Navigate to `/backend-api`
2. Copy `.env.example` to `.env` and fill in your Gemini API key and Supabase database URL.
3. Install dependencies: `npm install`
4. Run migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`

### Mobile App (Coming Soon)

- React Native project setup is pending.

## License

MIT
"# Gin-dai-MAI-" 
