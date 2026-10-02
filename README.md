# EXAMGUARD — Fakultet Imtihon Jadvalidagi To‘qnashuvlarni Aniqlash va Optimallashtirish Tizimi

**EXAMGUARD** — Universitet va fakultet darajasida imtihon jadvallarini avtomatlashtirilgan tarzda shakllantirish, Excel orqali yuklash, qat'iy matematik to‘qnashuvlarni (Double-booking, sig‘im yetishmasligi, vaqt nomutanosibligi) deterministik algoritmlar orqali aniqlash hamda sun'iy intellekt (Gemini 3.8 Flash) yordamida tahlil qilish tizimi.

---

## 1. Asosiy Imkoniyatlar va Funksiyalar

1. **Deterministik To‘qnashuvlarni Aniqlash (Conflict Detection Engine):**
   - **Guruh to‘qnashuvi:** Bir guruhda ayni bir vaqt oralig‘ida 2 ta imtihon bo‘lishini aniqlash (🔴 KRITIK).
   - **O‘qituvchi to‘qnashuvi:** Professor-o‘qituvchi bir vaqtda ikkita auditoriyada imtihonda bo‘lishini cheklash (🔴 KRITIK).
   - **Xona to‘qnashuvi:** Bitta auditoriyaga ayni bir vaqtda ikkita guruh kiritilishini oldini olish (🔴 KRITIK).
   - **Xona sig‘imi nazorati:** Guruh talabalari soni xona o‘rinlaridan ortiq bo‘lganda ogohlantirish (🟠 YUQORI).
   - **Vaqt validatsiyasi:** Boshlanish va tugash vaqtlari tartibi (09:00 dan 11:00 gacha) hamda universitet ish rejimini tekshirish.
   - **Takroriy imtihonlar va Zich jadval:** Guruhga bir kunda 2+ imtihon qo‘yilganda talabalar yuklamasini kamaytirish (🟡 OGOHLANTIRISH).

2. **Jadval Texnik Sifati Indikatori (0 — 100 Ball):**
   - Har bir to‘qnashuv darajasiga qarab ball chegiriladi (Kritik: -25, Yuqori: -10, Ogohlantirish: -3).
   - Auditoriyalardan foydalanish darajasi (Room utilization), o‘qituvchilar va guruhlar yuklama balansi integrallashgan.

3. **To‘qnashuvlarni Tuzatish Variantlari (Intelligent Slots Finder):**
   - Har bir muammo uchun avtomatik ravishda boshqa bo‘sh vaqt va mos sig‘imli xonalar taklif etiladi.
   - Administrator bir klik bilan **"Shu variantni qo‘llash"** orqali muammoni zudlik bilan hal qilishi mumkin.

4. **Avtomatik Optimallashtirish (Constraint-Based Scheduling):**
   - Qat'iy qoidalar (Hard constraints) va yumshoq pedagogik qoidalar (Soft constraints) asosida jadvaldagi barcha to‘qnashuvlarni avtomatik bartaraf etadi.
   - Har bir ko‘chirish bo‘yicha batafsil jurnal (Changelog) taqdim etadi.

5. **Excel (.xlsx, .xls, .csv) Bilan Ishlash (SheetJS):**
   - Rasmiy shablonni yuklab olish imkoniyati.
   - Faylni yuklagandan so‘ng satrma-satr tekshirish va xatoliklar (satr raqami, maydon, sabab, tavsiya) hisoboti.
   - Faqat to‘g‘ri satrlarni tanlab import qilish.

6. **Eksport va Rasmiy Hujjatlar:**
   - Fakultet umumiy va guruhlar bo‘yicha Excel jadvali.
   - Universitet dekani va o‘quv bo‘limi imzosi uchun rasmiy **A4 formatidagi PDF hujjat** (jsPDF).
   - To‘qnashuvlar tahlili hisoboti (.xlsx).
   - **Telegram Kanallari** uchun rasmiy xabar generatori.

7. **ExamGuard AI Maslahatchisi:**
   - Google Gemini 3.8 Flash modeli asosida o‘zbek tilida tabiiy muloqot.
   - Faqat haqiqiy universitet ma'lumotlariga asoslangan aniq tahlil.

8. **Ko‘p Rollilik Tizimi (RBAC):**
   - **ADMIN:** To‘liq boshqaruv, optimallashtirish, e‘lon qilish.
   - **O‘QITUVCHI:** O‘ziga biriktirilgan imtihonlar jadvali.
   - **TALABA:** O‘z guruhining rasmiy e‘lon qilingan jadvali.

---

## 2. Texnologiyalar Steki

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion, Lucide Icons.
- **Backend:** Node.js, Express, tsx.
- **Fayllar bilan ishlash:** SheetJS (`xlsx`), `jspdf`, `canvas-confetti`.
- **Sun'iy intellekt:** Google Gen AI SDK (`@google/genai`) — `gemini-3.8-flash`.

---

## 3. O‘rnatish va Ishga Tushirish

### 1-qadam: Bog‘liqliklarni o‘rnatish
```bash
npm install
```

### 2-qadam: Muhit o‘zgaruvchilarini sozlash (.env)
Loyihaning ildiz papkasida `.env` faylini yarating:
```env
# Gemini AI kaliti (ixtiyoriy, berilmasa avtomatik lokal deterministik rejim ishlaydi)
GEMINI_API_KEY="SIZNING_GEMINI_API_KALITINGIZ"

# Server porti
PORT=3000
```

### 3-qadam: Dasturni ishga tushirish
Dasturni ishlab chiquvchi rejimida ishga tushirish uchun:
```bash
npm run dev
```
Dastur brauzerda `http://localhost:3000` manzilida ochiladi.

---

## 4. Demo Ma'lumotlardan Foydalanish

Tizimda sinov uchun 12 ta akademik guruh, 16 ta fan, 16 ta professor-o‘qituvchi, 14 ta xona va 36 ta imtihon kiritilgan.

Tizimda ataylab 4 ta real to‘qnashuv joylashtirilgan:
1. **614-24 guruhida** 2026-06-15 09:00 da 2 ta imtihon (Dasturlash va Matematika).
2. **dots. Aziz Karimov** 2026-06-16 09:00 da 2 ta guruhda (615-24 va 511-23).
3. **301-auditoriyaga** 2026-06-17 11:30 da 2 ta guruh biriktirilgan.
4. **402-22 guruhida** 42 ta talaba bo‘lib, 25 kishilik laboratoriyaga joylashtirilgan.

Istalgan vaqtda **"Sozlamalar & Demo"** bo‘limidan **"Demo ma‘lumotlarini yuklash"** tugmasi orqali dastlabki holatni tiklashingiz mumkin.
