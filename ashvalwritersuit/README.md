# ✍️ Ashval Writer's Suite - คู่มือนักเขียน AI อัจฉริยะ (ฉบับภาษาไทย)

Ashval Writer's Suite คือ Web Application ส่วนตัวสำหรับนักเขียน ที่ต้องการใช้ AI ช่วยในงานเขียนอย่างจริงจังและครบวงจร ถูกออกแบบมาเพื่อช่วยให้คุณจัดการโน้ต, งาน, ข้อมูลโลก (Lore), โครงเรื่อง และสร้างสรรค์เนื้อหาด้วยพลังของ AI (ปัจจุบันเชื่อมต่อกับ Google Gemini ผ่าน Backend ที่คุณต้องตั้งค่าเอง หรือสามารถปรับโค้ดส่วน `geminiService.ts` ให้เรียก API โดยตรงหากต้องการใช้งานแบบ Frontend-only โดยสมบูรณ์) แอปพลิเคชันนี้เน้นความเรียบง่าย, เป็นมิตรกับผู้ใช้, และความสามารถในการปรับแต่งสูง

## ✨ คุณสมบัติหลัก

*   **การจัดการข้อมูลรอบด้าน:**
    *   **โน้ต (Notes):** สร้าง, แก้ไข, จัดหมวดหมู่, ค้นหาโน้ต พร้อม Markdown Editor และ Live Preview, รองรับการใส่ภาพปก, ไอคอน Emoji, ระบบเวอร์ชัน, และการเชื่อมโยงระหว่างโน้ต (`[[ชื่อโน้ต]]`)
    *   **งาน (Tasks):** จัดการรายการสิ่งที่ต้องทำ, กำหนดความสำคัญ, วันที่ครบกำหนด, และแบ่งงานย่อย (AI ช่วยแนะนำงานย่อยได้) สามารถนำเข้าไฟล์ Markdown เป็นงานใหม่ได้
    *   **คลังข้อมูลโลก (World Anvil/Lore):** สร้างและจัดระเบียบข้อมูลตัวละคร, สถานที่, ไอเทม, ระบบพลัง (ArcanaSystem), และองค์ประกอบอื่นๆ ของโลกในนิยายคุณ
    *   **โครงเรื่อง (Plot Outline):** วางโครงเรื่องแบบลำดับชั้น (Nested) จัดการจุดสำคัญในเรื่องราวของคุณ
    *   **แม่แบบ (Templates):** สร้างและใช้แม่แบบโน้ตส่วนตัวเพื่อความรวดเร็วในการเริ่มงานเขียน
    *   **การนำเข้าไฟล์:** นำเข้าไฟล์ `.txt`, `.md`, `.pdf`, `.docx` เป็นโน้ตใหม่ และนำเข้า `.md` สำหรับงานและ AI Prompt
    *   **การส่งออกโน้ต:** ส่งออกโน้ตเป็นไฟล์ HTML โดยใช้เทมเพลตสวยงาม หรือ PDF (ผ่าน `html2pdf.js`)
*   **AI ผู้ช่วยนักเขียน (AI Writer):**
    *   ขับเคลื่อนด้วย **Google Gemini API** (เชื่อมต่อผ่าน Backend หรือ Frontend โดยตรงตามการตั้งค่า)
    *   หลากหลายโหมดการทำงาน: วิเคราะห์ฉาก/ตัวละคร, สร้างโครงเรื่อง, ตรวจสอบความต่อเนื่อง, สร้างฉากใหม่, ปรับแก้, สรุป/ขยายความ และโหมดกำหนดเอง
    *   AI เข้าใจบริบทจากโปรเจกต์ปัจจุบัน, ข้อมูลที่เลือก, และคำสั่งที่ผู้ใช้ป้อน
    *   สามารถสร้าง YAML metadata block จากการวิเคราะห์ AI
    *   บันทึกผลลัพธ์ AI เป็นโน้ตใหม่, คัดลอก, หรือแทรกลงในโน้ตที่กำลังแก้ไข
*   **การจัดการโปรเจกต์ (Project Management):**
    *   สร้างหลายโปรเจกต์เพื่อแยกงานเขียนแต่ละเรื่อง
    *   หน้าแดชบอร์ดสรุปภาพรวมโปรเจกต์ แสดงสถิติเบื้องต้น และมี Quick Actions
    *   แก้ไขรายละเอียด, เก็บถาวร, หรือลบโปรเจกต์
*   **เครื่องมือเสริมประสิทธิภาพ:**
    *   **Pomodoro Timer:** ช่วยในการโฟกัสและจัดการเวลา
    *   **พจนานุกรม (Dictionary):** AI เรียนรู้คำศัพท์ที่คุณใช้ หรือคุณสามารถเพิ่มคำศัพท์เองได้
    *   **ธีม (Themes):** เลือกธีมสว่าง/มืดได้หลายแบบเพื่อความสบายตา
    *   **Ashval AI Mascot:** มาสคอต AI ลอยได้พร้อมแสดงคำแนะนำ และมี Panel สำหรับสนทนา (ฟังก์ชันสนทนายังไม่เชื่อมต่อ AI)
    *   **เครื่องมือเสริม (Utilities Page):** รวมช่องค้นหา (ตัวอย่าง), แท็บสลับส่วน (ตัวอย่าง), และ API Connector สำหรับทดสอบการเชื่อมต่อ API ภายนอก
*   **ความเป็นส่วนตัวและความปลอดภัย:**
    *   ข้อมูลทั้งหมดบันทึกใน Local Storage ของเบราว์เซอร์คุณเท่านั้น (หากไม่ได้เชื่อมต่อกับ Backend ของคุณเอง)
    *   ผู้ใช้สามารถป้อน Custom Gemini API Key ของตนเองได้ ซึ่งจะถูกเก็บไว้ใน Local Storage เช่นกัน

## 📁 โครงสร้างไฟล์ของแอปพลิเคชัน (Frontend)

```
ashval-writer-suite/
├── AiSubtaskSuggestionModal.tsx # Modal แนะนำงานย่อยโดย AI
├── AiWriter.tsx              # UI และ Logic ส่วน AI Writer
├── AppSettingsPage.tsx       # หน้าตั้งค่าแอป, จัดการโปรเจกต์, และ Roadmap
├── AshvalMascot.tsx          # UI มาสคอต AI
├── BottomNavBar.tsx          # UI แถบนำทางด้านล่างสำหรับมือถือ
├── CategoryFilterControl.tsx # UI สำหรับกรองตามหมวดหมู่
├── ContentAnalytics.tsx      # (ใหม่) UI กราฟวิเคราะห์เนื้อหา (จำเป็นต้องมี API จริง)
├── DictionaryManager.tsx     # UI จัดการพจนานุกรม
├── EmojiPicker.tsx           # UI เลือก Emoji
├── ExportPage.tsx            # UI สำหรับส่งออกโน้ต
├── GraphView.tsx             # UI แสดงความเชื่อมโยงของโน้ต (เบื้องต้น)
├── Header.tsx                # UI ส่วนหัวของแอป
├── NoteItem.tsx              # UI แสดงโน้ตแต่ละรายการ
├── NoteModal.tsx             # Modal เพิ่ม/แก้ไขโน้ต
├── NoteTaskApp.tsx           # **ไฟล์หลักของแอปพลิเคชัน React**
├── PlotOutlineManager.tsx    # UI จัดการโครงเรื่อง
├── PlotOutlineModal.tsx      # Modal เพิ่ม/แก้ไขจุดในโครงเรื่อง
├── PlotOutlineNodeItem.tsx   # UI แสดงจุดโครงเรื่องแต่ละรายการ
├── PomodoroTimer.tsx         # UI Pomodoro Timer
├── ProjectDashboard.tsx      # UI แดชบอร์ดโปรเจกต์
├── ProjectSelector.tsx       # UI เลือก/สร้างโปรเจกต์
├── Sidebar.tsx               # UI แถบเมนูด้านข้าง
├── TaskItem.tsx              # UI แสดงงานแต่ละรายการ
├── TaskList.tsx              # UI แสดงรายการงานทั้งหมด
├── TaskModal.tsx             # Modal เพิ่ม/แก้ไขงาน
├── ThemeSelector.tsx         # UI เลือกธีม
├── UserTemplateManager.tsx   # UI จัดการแม่แบบของผู้ใช้
├── UtilitiesPage.tsx         # UI เครื่องมือเสริมและ API Connector
├── ViewNoteModal.tsx         # Modal แสดงรายละเอียดโน้ต
├── WorldAnvilManager.tsx     # UI จัดการคลังข้อมูลโลก (Lore)
├── build.js                  # สคริปต์สำหรับ Build โปรเจกต์ด้วย esbuild
├── constants.ts              # ค่าคงที่ต่างๆ ที่ใช้ในแอป
├── index.html                # ไฟล์ HTML หลัก
├── index.tsx                 # จุดเริ่มต้นการ Render แอป React
├── metadata.json             # ข้อมูล Meta ของแอป
├── package.json              # กำหนด Dependencies และสคริปต์
├── README.md                 # ไฟล์นี้ (ฉบับภาษาไทย)
└── types.ts                  # นิยาม TypeScript Interfaces และ Types
└── frontend/
    └── src/
        └── services/
            ├── geminiService.ts    # จัดการการเรียก Gemini API (ฝั่ง Frontend)
            └── appDataService.ts   # (ปัจจุบัน) จำลองการบันทึก/โหลดข้อมูล
└── backend/                    # (ถ้ามี) โค้ดส่วน Backend สำหรับจัดการ API Key และเรียก Gemini
    ├── server.js
    └── routes/
        └── aiRoutes.js
└── functions/                  # (ถ้าใช้ Firebase Functions) โค้ดสำหรับ Cloud Functions
    └── src/
        └── index.ts
```

## 📄 คำอธิบายไฟล์สำคัญ (Frontend)

*   **`index.html`**: หน้าเว็บหลัก โหลด CSS, JavaScript Libraries จาก CDN (เช่น Tailwind, Font Awesome, React, Chart.js) และสคริปต์หลักของแอป
*   **`index.tsx`**: จุดเริ่มต้นของ React Application ทำหน้าที่ Render คอมโพเนนต์หลัก `NoteTaskApp`
*   **`NoteTaskApp.tsx`**: **หัวใจของแอปพลิเคชัน** จัดการ State ส่วนใหญ่ (โน้ต, งาน, โปรเจกต์, ธีม, การตั้งค่า, การทำงานของ AI ฯลฯ) และประกอบ UI ทั้งหมดเข้าด้วยกัน
*   **`types.ts`**: กำหนดโครงสร้างข้อมูล (Interfaces และ Types)
*   **`constants.ts`**: เก็บค่าคงที่ต่างๆ
*   **`frontend/src/services/geminiService.ts`**: โค้ดส่วน Frontend ที่เรียกใช้ API ของ Backend (หรือเรียก Gemini API โดยตรงหากปรับแก้) เพื่อใช้งาน AI
*   **`build.js`**: สคริปต์ Node.js ที่ใช้ `esbuild` เพื่อแปลงโค้ด TypeScript/JSX เป็น JavaScript และเตรียมไฟล์สำหรับ Deploy
*   **`ContentAnalytics.tsx`**: (ใหม่) คอมโพเนนต์สำหรับแสดงกราฟวิเคราะห์เนื้อหา ซึ่งต้องใช้ API จริงในการดึงข้อมูล

## 🚀 ขั้นตอนการรันแอปพลิเคชัน (สำหรับนักพัฒนา)

แอปพลิเคชันนี้ถูกออกแบบมาให้ทำงานเป็น Frontend-Only ได้โดยข้อมูลจะเก็บใน Local Storage และสามารถใช้ Gemini API ผ่านการตั้งค่า API Key ใน Environment Variable ตอน Build หรือผ่านการตั้งค่า Custom API Key ในแอป (ซึ่งจะถูกเก็บใน Local Storage)

**หรือ** หากคุณมี Backend Server (ตัวอย่างเช่น Express server ในโฟลเดอร์ `backend/` หรือ Firebase Functions ใน `functions/`) ที่จัดการการเรียก Gemini API คุณสามารถกำหนด `REACT_APP_BACKEND_API_URL` ใน `build.js` ให้ชี้ไปยัง Backend ของคุณได้

**สิ่งที่คุณต้องเตรียม:**

1.  **Node.js และ npm:** ตรวจสอบว่าติดตั้ง Node.js (เวอร์ชัน 18 ขึ้นไปแนะนำ) และ npm เรียบร้อยแล้ว
2.  **API Key ของ Google Gemini:** (จำเป็นหากต้องการใช้ฟังก์ชัน AI) คุณต้องมี API Key จาก [Google AI Studio](https://aistudio.google.com/app/apikey)

**ขั้นตอนการ Build และรัน (แบบ Frontend-Only):**

1.  **Clone Repository (ถ้ามี):**
    ```bash
    git clone [your-repository-url]
    cd ashval-writer-suite
    ```

2.  **ติดตั้ง Dependencies:**
    เปิด Terminal หรือ Command Prompt ในโฟลเดอร์โปรเจกต์ แล้วรัน:
    ```bash
    npm install
    ```

3.  **ตั้งค่า API Key (ถ้าต้องการให้ AI ทำงานตอน Build):**
    *   **สำคัญ:** หากต้องการให้ AI Writer สามารถทำงานได้ทันทีหลังจากการ Build โดยไม่ต้องให้ผู้ใช้ใส่ Key เองในหน้า Settings คุณต้องตั้งค่า Environment Variable ชื่อ `API_KEY` ให้มีค่าเป็น Gemini API Key ของคุณ **ก่อน**ที่จะรันคำสั่ง Build (ดูวิธีการตั้งค่าใน `README.md` ฉบับภาษาอังกฤษ หรือตามระบบปฏิบัติการของคุณ)
    *   ไฟล์ `build.js` ปัจจุบัน **ไม่ได้** รวม `API_KEY` เข้าไปใน Frontend build โดยตรงแล้ว เพื่อความปลอดภัย `geminiService.ts` (ฝั่ง Frontend) จะเรียก API ผ่าน Backend (ที่ URL `/api`) ซึ่ง Backend จะต้องมี `API_KEY` ติดตั้งไว้ (เช่นใน `backend/.env` หรือ Firebase Functions environment variables)
    *   **สำหรับการทดสอบแบบ Frontend-Only โดยสมบูรณ์:** คุณสามารถปรับแก้ `frontend/src/services/geminiService.ts` ให้เรียกใช้ `@google/genai` โดยตรง และใช้ `userPreferences.customGeminiApiKey` ที่ผู้ใช้ป้อนในหน้า Settings

4.  **Build แอปพลิเคชัน:**
    รันคำสั่ง:
    ```bash
    npm run build:frontend
    ```
    คำสั่งนี้จะใช้ `esbuild` เพื่อสร้างไฟล์ที่จำเป็นทั้งหมดในโฟลเดอร์ `dist`

5.  **เปิดแอปพลิเคชันในเบราว์เซอร์:**
    *   เปิดไฟล์ `dist/index.html` โดยตรงในเว็บเบราว์เซอร์ของคุณ
    *   หรือ ใช้ Web Server ง่ายๆ เพื่อ Serve โฟลเดอร์ `dist` (เช่น `python -m http.server --directory dist 8000`)

## 💡 การใช้งานเบื้องต้น

1.  **แดชบอร์ด:** แสดงภาพรวมของโปรเจกต์และกิจกรรมล่าสุด
2.  **การจัดการโปรเจกต์:** สร้าง, เลือก, แก้ไข, เก็บถาวร, หรือลบโปรเจกต์ผ่านเมนู Project Selector (มุมบนกลาง) และหน้า "ตั้งค่า"
3.  **โน้ต/งาน/ข้อมูลโลก/โครงเรื่อง:** เข้าถึงผ่าน Sidebar เพื่อสร้างและจัดการข้อมูลแต่ละประเภท
4.  **AI Writer:** เลือกโหมด AI, ป้อนคำสั่ง, และรับผลลัพธ์เพื่อช่วยในงานเขียน
5.  **เครื่องมือ:** ใช้ Pomodoro, พจนานุกรม, API Connector, หรือดูสถิติเนื้อหา (Content Analytics - ต้องมี API จริง)
6.  **ตั้งค่า:** ปรับแต่งธีม, รูปแบบตัวอักษร, การตั้งค่า AI, การแจ้งเตือน, จัดการโปรเจกต์ และดูแผนการพัฒนา

ขอให้สนุกกับการใช้ Ashval Writer's Suite นะครับ! หากมีคำถามหรือข้อเสนอแนะเพิ่มเติม แจ้งได้เลยครับ