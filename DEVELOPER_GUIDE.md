# Panduan Pengembang (Developer Guide)

Dokumen ini berisi panduan lengkap untuk mengakses, mengembangkan, dan men-deploy aplikasi "Warung Ibu Pintar".

## 1. Akses Server (SSH)

Kita menggunakan **SSH Key** khusus untuk mengakses VPS, bukan password.

*   **Lokasi Key**: `deploy-keys/id_ed25519` (ada di dalam folder project ini).
*   **IP Server**: `202.155.95.238`
*   **User**: `root`

**Perintah Masuk SSH:**
```bash
ssh -i deploy-keys/id_ed25519 root@202.155.95.238
```

> **Catatan**: Jika error "Permissions 0644 for ... are too open", jalankan `chmod 600 deploy-keys/id_ed25519` (di Linux/Mac) atau atur permission file menjadi read-only untuk owner saja (di Windows).

---

## 2. Workflow Git (Branching)

Kita menggunakan dua branch utama:
*   `development`: Tempat coding sehari-hari, nambah fitur, fix bug eksperimental.
*   `main`: Branch stabil yang SIAP untuk di-deploy ke production.

**Cara Edit Code:**
1.  Pastikan ada di branch development:
    ```bash
    git checkout development
    ```
2.  Lakukan perubahan code, edit file, dll.
3.  Simpan perubahan:
    ```bash
    git add .
    git commit -m "fitur: menambahkan xyz"
    git push origin development
    ```

---

## 3. Cara Deploy ke Production

Deployment dilakukan dengan me-merge code ke `main` dan menjalankan script di VPS.

**Langkah-langkah:**

1.  **Merge ke Main**:
    Setelah fitur di `development` aman, pindahkan ke `main`:
    ```bash
    git checkout main
    git merge development
    git push origin main
    ```

2.  **Balik ke Development** (Supaya tidak lupa):
    ```bash
    git checkout development
    ```

3.  **Sync & Deploy di VPS**:
    Jalankan perintah ini dari terminal lokal (folder project) untuk memerintahkan VPS mengambil update terbaru:
    ```bash
    ssh -i deploy-keys/id_ed25519 -o StrictHostKeyChecking=no root@202.155.95.238 "bash /root/deploy_app.sh"
    ```
    *Script ini akan otomatis: Pull git terbaru, install dependencies, generate prisma client, build ulang Next.js, dan restart PM2.*

---

## 4. Konfigurasi Environment (.env)

File `.env` berisi variabel rahasia. Jangan di-commit sembarangan jika repo bersifat publik.

*   `.env`: Konfigurasi default (bisa dicommit jika tidak ada password rahasia).
*   `.env.local`: Konfigurasi LOKAL komputer kamu (tidak akan dicommit ke git). Gunakan ini untuk setting database lokal saat development.

**Contoh isi `.env` / `.env.local`:**
```env
# URL Database (Format: postgresql://user:pass@host:port/dbname)
DATABASE_URL="postgresql://postgres:password@localhost:5432/warung_db"

# Google Gemini API Key
GEMINI_API_KEY="AIzaSy..."

# Base URL (Untuk API call internal)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## 5. Gemini API Key

Fitur AI (Rekomendasi & Voice Command) membutuhkan API Key dari Google Gemini.

1.  Buka [Google AI Studio](https://aistudio.google.com/).
2.  Login dengan akun Google.
3.  Klik "Get API Key" -> "Create API Key".
4.  Copy key tersebut ke file `.env` kamu sebagai `GEMINI_API_KEY`.

---

## 6. Database (PostgreSQL)

Aplikasi ini menggunakan database PostgreSQL dengan ORM **Prisma**.

**A. URL Database**
*   **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME`
*   **Contoh Lokal**: `postgresql://postgres:root@localhost:5432/warung`
*   **Contoh VPS**: Sesuai settingan database di VPS.

**B. Setup Database Baru**
Jika kamu baru clone repo ini dan belum punya database di komputer:

1.  Pastikan PostgreSQL sudah terinstall dan berjalan.
2.  Buat database kosong (misal: `warung`).
3.  Update `DATABASE_URL` di `.env`.
4.  Jalankan perintah migrasi untuk membuat tabel:
    ```bash
    npx prisma db push
    ```
    *(Ini akan membuat tabel Product, Category, dll sesuai schema.prisma)*

5.  Generate Client (Supaya codingan kenal database):
    ```bash
    npx prisma generate
    ```

**C. Mengisi Data Awal (Seeding)**
Jika butuh data dummy untuk test:
```bash
npx prisma db seed
```
*(Pastikan script seed sudah dikonfigurasi di package.json jika ada)*
