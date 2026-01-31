# Warung Ibu Pintar 🏪

Aplikasi kasir pintar berbasis web dengan **AI Voice Assistant** yang bisa diajak ngobrol layaknya asisten pribadi.

> *"Mau cari apa? Biar Ibu yang carikan."*

---

## 🔥 Fitur Unggulan

### 1. 🎤 "Ibu Pintar" Voice Assistant
Tak perlu ketik manual, cukup tekan tombol mikrofon dan bicara:
- **Pencarian Cerdas:** "Cariin kopi Indocafe"
- **Belanja Otomatis:** "Masukin 2 bungkus gula ke keranjang"
- **Interaksi Natural:** "Halo Ibu", "Terima kasih"
- **Auto Fallback:** Jika AI sibuk/error, sistem otomatis beralih ke mode manual tanpa henti.

### 2. ⚙️ Admin Settings Center
Konfigurasi otak AI langsung dari dashboard:
- **API Key Management:** Ganti Gemini API Key tanpa coding.
- **Model Switching:** Pilih otak yang pas (`Gemini 2.0 Flash` untuk kecepatan atau `1.5 Flash` untuk efisiensi).

### 3. 📦 Manajemen Stok & Kasir
- Dashboard admin responsif.
- Manajemen produk (CRUD).
- Sistem kasir realtime.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:** Next.js 16 (App Router), Tailwind CSS v4, Shadcn UI.
- **Backend:** Next.js Server Actions & API Routes.
- **Database:** PostgreSQL (via Prisma ORM).
- **AI Core:** Google Gemini AI (Generative Language API).
- **Voice:** Web Speech API (Browser Native).

---

## 🚀 Cara Menjalankan

1. **Clone Repository**
   ```bash
   git clone https://github.com/username/warung-ibu-pintar.git
   cd warung-ibu-pintar
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   Buat file `.env` dan isi database URL Anda:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/warung_ibu_pintar"
   # Optional (bisa diatur di dashboard nanti)
   GEMINI_API_KEY="AIzaSy..."
   ```

4. **Siapkan Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Jalankan Aplikasi**
   ```bash
   npm run dev
   ```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 👨‍💻 Credits

Created with ❤️ and ☕ by **Nafi Ilham**.

© 2026 Warung Ibu Pintar Project.
