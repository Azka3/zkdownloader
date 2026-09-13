const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Folder ini yang menyimpan hasil video yang sudah digabung (video+audio)
app.use('/downloads', express.static(DOWNLOAD_DIR));

// Fungsi untuk membersihkan judul video jadi nama file yang aman
function sanitizeFilename(title) {
  const cleaned = title
    .replace(/[\/\\?%*:|"<>#&+@!'`;=]/g, '') // buang karakter yang gak boleh ada di nama file / bermasalah di URL
    .replace(/\s+/g, '_') // spasi jadi underscore
    .trim();

  // Ambil bagian depan judul aja (gak usah semua kalimat), biar nama file gak kepanjangan
  const shortTitle = cleaned.slice(0, 30).replace(/_+$/, ''); // potong 30 char, buang underscore nyangkut di akhir

  return shortTitle || 'video';
}

// Endpoint 1: ambil info video (judul, thumbnail) tanpa download
app.post('/api/info', (req, res) => {
  const { url } = req.body;

  if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
    return res.status(400).json({ error: 'Link Facebook tidak valid' });
  }

  const command = `yt-dlp -j --no-warnings "${url}"`;

  exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error('yt-dlp error:', stderr);
      return res.status(500).json({
        error: 'Gagal mengambil info video. Pastikan link valid dan videonya bersifat publik.',
      });
    }

    try {
      const info = JSON.parse(stdout);

      // Ambil daftar resolusi (height) yang beneran tersedia dari video ini
      const heights = (info.formats || [])
        .filter((f) => f.vcodec && f.vcodec !== 'none' && f.height)
        .map((f) => f.height);

      // Buang duplikat & urutkan dari kecil ke besar
      const availableResolutions = [...new Set(heights)].sort((a, b) => a - b);

      res.json({
        title: info.title || 'Video Facebook',
        thumbnail: info.thumbnail || null,
        resolutions: availableResolutions.length > 0 ? availableResolutions : [720],
      });
    } catch (parseErr) {
      console.error('Parse error:', parseErr);
      res.status(500).json({ error: 'Gagal memproses data video' });
    }
  });
});

// Endpoint 2: download & gabung video+audio sesuai resolusi yang dipilih
app.post('/api/download', (req, res) => {
  const { url, resolution } = req.body;

  if (!url || (!url.includes('facebook.com') && !url.includes('fb.watch'))) {
    return res.status(400).json({ error: 'Link Facebook tidak valid' });
  }

  const height = Number(resolution) || 720;

  // Nama file: zkdeveloper_ + random string (tidak pakai judul video sama sekali)
  const randomId = crypto.randomBytes(5).toString('hex');
  const outputTemplate = path.join(DOWNLOAD_DIR, `zkdeveloper_${randomId}.%(ext)s`);

  const formatSelector = `bv*[height<=${height}]+ba/b[height<=${height}]/best`;
  const command = `yt-dlp -f "${formatSelector}" --merge-output-format mp4 --no-warnings -o "${outputTemplate}" --print after_move:filepath "${url}"`;

  exec(command, { maxBuffer: 1024 * 1024 * 20 }, (error, stdout, stderr) => {
    if (error) {
      console.error('yt-dlp error:', stderr);
      return res.status(500).json({
        error: 'Gagal mengunduh video. Pastikan link valid dan videonya bersifat publik.',
      });
    }

    const filepath = stdout.trim().split('\n').pop();
    const filename = path.basename(filepath);

    res.json({
      downloadUrl: `/downloads/${filename}`,
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
