# zkdownloader

Web sederhana untuk mengunduh video dari media sosial lewat link, lengkap dengan audio dan pilihan resolusi. Saat ini mendukung **Facebook**, dengan **YouTube**, **Instagram**, dan **TikTok** yang sedang dalam pengembangan.

## Fitur

- Tempel link video Facebook publik, langsung diproses
- Pilihan resolusi ditampilkan **dinamis** sesuai kualitas asli yang tersedia dari video (bukan daftar tetap)
- Video dan audio digabung otomatis di server (pakai `ffmpeg`), jadi hasil unduhan gak bisu
- Antarmuka mendukung Bahasa Indonesia dan English, tinggal toggle
- Tab platform lain (YouTube, Instagram, TikTok) sudah disiapkan di UI dengan status "Coming soon"

## Cara kerja

1. Frontend (`public/index.html`) mengirim link video ke endpoint `/api/info` untuk mengambil judul, thumbnail, dan daftar resolusi yang tersedia.
2. Saat resolusi dipilih, frontend memanggil `/api/download`.
3. Backend (`server.js`) menjalankan [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) untuk mengambil video dan audio sesuai resolusi, menggabungkannya dengan `ffmpeg`, lalu menyimpan hasilnya di folder `downloads/`.
4. Link file hasil gabungan dikirim balik ke frontend untuk diunduh oleh pengguna.

## Teknologi

- **Backend:** Node.js, Express
- **Ekstraksi & download video:** yt-dlp
- **Merge audio+video:** ffmpeg
- **Frontend:** HTML, CSS, dan JavaScript murni (tanpa framework)

## Persyaratan

Pastikan sudah terpasang di sistem kamu:

- [Node.js](https://nodejs.org/) (v18 ke atas disarankan)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [ffmpeg](https://ffmpeg.org/)

Untuk Fedora, bisa install lewat:

```bash
sudo dnf install nodejs npm yt-dlp -y
sudo dnf install ffmpeg --allowerasing -y
```

## Instalasi & menjalankan secara lokal

```bash
git clone https://github.com/Azka3/zkdownloader.git
cd zkdownloader
npm install
node server.js
```

Buka `http://localhost:3000` di browser.

## Struktur folder

```
zkdownloader/
├── server.js          # Backend Express + logic yt-dlp
├── public/
│   └── index.html     # Frontend
├── downloads/         # Hasil video yang sudah diunduh & digabung (diabaikan git)
└── package.json
```

## Roadmap

- [x] Facebook downloader
- [ ] YouTube downloader
- [ ] Instagram downloader
- [ ] TikTok downloader

## Catatan

Tool ini ditujukan untuk mengunduh video **publik** saja. Video privat atau yang berada di grup tertutup tidak bisa diproses. Gunakan secara bertanggung jawab dan hormati hak cipta konten yang diunduh.

## Lisensi

Bebas digunakan dan dimodifikasi untuk keperluan pribadi.
