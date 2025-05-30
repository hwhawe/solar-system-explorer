# 🔭 Penjelajah Tata Surya Interaktif 🚀

Selamat datang di Penjelajah Tata Surya Interaktif! Aplikasi web ini memungkinkan Anda untuk menjelajahi planet-planet di tata surya kita dalam tampilan 3D yang dinamis, mendapatkan informasi detail tentang setiap planet, dan bahkan bertanya kepada AI tentang mereka.

https://solar-system-explorer-lyart.vercel.app/

## ✨ Fitur Utama

* **Model 3D Interaktif:** Jelajahi planet-planet utama tata surya dengan representasi 3D yang indah.
* **Navigasi Kamera Halus:** Geser antar planet dengan transisi kamera yang mulus.
* **Detail Planet Interaktif:** Klik pada setiap planet untuk membuka panel informasi yang menampilkan deskripsi dan fakta menarik.
* **Kontrol Kamera In-Detail:** Saat panel informasi terbuka, Anda dapat memutar dan memperbesar/memperkecil tampilan planet yang sedang difokuskan.
* **Visibilitas Planet yang Dapat Diubah:** Sembunyikan atau tampilkan planet lain di latar belakang saat Anda fokus pada satu planet.
* **Integrasi AI Cerdas (IBM Granite):** Ajukan pertanyaan apa pun tentang planet yang sedang Anda jelajahi kepada model AI IBM Granite dan dapatkan jawaban secara real-time.
* **Pengalaman UI/UX yang Menarik:** Font yang disesuaikan, efek blur latar belakang, dan animasi yang halus untuk pengalaman pengguna yang imersif.

## 🛠️ Teknologi yang Digunakan

* **Frontend:**
    * **React.js** (dengan Vite)
    * **React Three Fiber (`@react-three/fiber`)**: Untuk integrasi 3D yang deklaratif di React.
    * **Drei (`@react-three/drei`)**: Kumpulan helper dan abstraksi berguna untuk React Three Fiber (misalnya `Stars`, `OrbitControls`, `useGLTF`).
    * **HTML/CSS**
* **Backend (Serverless Function):**
    * **Node.js**
    * **`node-fetch`**: Untuk membuat permintaan HTTP ke API eksternal.
    * **`dotenv`**: Untuk mengelola variabel lingkungan.
* **API AI:**
    * **Replicate.com**: Platform untuk menghosting dan menjalankan model AI.
    * **IBM Granite Model (`ibm-granite/granite-3.3-8b-instruct`)**: Model AI yang digunakan untuk menjawab pertanyaan tentang planet.
* **MODEL 3D:**
    * **Nasa.gov**: Platform untuk download model 3D.
* **Deployment:**
    * **Vercel**: Untuk hosting frontend dan backend (Serverless Functions).
    * **GitHub**: Untuk version control dan integrasi CI/CD dengan Vercel.

## 🚀 Cara Menjalankan Secara Lokal

Ikuti langkah-langkah di bawah ini untuk mengatur dan menjalankan proyek di komputer lokal Anda.

**1. Kloning Repository:**

```bash
git clone [https://github.com/USERNAME_ANDA/solar-system-explorer.git](https://github.com/hwhawe/solar-system-explorer.git)
cd solar-system-explorer
```
**2. Instal Dependensi:**

Proyek ini adalah monorepo yang menggunakan npm workspaces. Anda perlu menginstal dependensi untuk proyek utama dan kedua sub-proyek (client dan api).
```bash
npm install
```
**3. Konfigurasi Variabel Lingkungan:**

Anda memerlukan API token dari Replicate.com untuk menjalankan fungsi AI.

Dapatkan API Token Anda dari akun Replicate.com Anda.
Buat file bernama .env di root proyek Anda (solar-system-explorer/.env).
Tambahkan baris berikut ke file .env, ganti placeholder dengan token asli Anda:
```bash
REPLICATE_API_TOKEN=r8_TOKEN_ANDA_DISINI
VITE_API_URL=http://localhost:3001/api
```
**4. Jalankan Backend (Serverless Function Lokal):**
   
Buka terminal baru dan navigasi ke folder api.
```bash
cd api
npm install
npm start
```
atau pake nodemon
```bash
npm install -g nodemon
nodemon index.js
```
**5. Jalankan Frontend (Aplikasi React Lokal):**

Buka terminal baru lainnya dan navigasi ke folder client.
```bash
cd client
npm install
npm run dev
```
Aplikasi akan terbuka di browser Anda (biasanya di http://localhost:5174/).
