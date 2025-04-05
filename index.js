import https from 'https';
import fs from 'fs';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Dossier images
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Multer pour l'upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Express - ping route
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Route POST /upload
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu.' });
  }

  const fileUrl = `https://cdn.snapshotfa.st/images/${req.file.filename}`;
  console.log(`🖼️ Image uploadée : ${fileUrl}`);
  res.status(200).json({ success: true, fileUrl });
});

// Sert les images statiques
app.use('/images', express.static(imagesDir));

// Certificats SSL Let’s Encrypt
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/cdn.snapshotfa.st/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/cdn.snapshotfa.st/fullchain.pem'),
};

// Lancement serveur HTTPS
https.createServer(options, app).listen(443, () => {
  console.log('🚀 Serveur CDN disponible sur https://cdn.snapshotfa.st');
});


