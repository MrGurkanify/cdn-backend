/**
 * 📁 File : index.js
 * 🛤️  Path  : ~/developpement /cdn-backend/index.js
 * 📅 Created at : 2025-04-08
 * 👤 Author  : William Balikel
 * ✍️  Description : Description rapide du fichier
 */




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
app.post('/upload', upload.single('image'), async (req, res) => {
  const userId = req.body.userId; // attend que l'app mobile envoie userId
  if (!userId) {
    return res.status(400).json({ error: 'userId manquant' });
  }

  const userDir = path.join(imagesDir, 'snapshot', userId);

  // Crée le dossier s'il n'existe pas
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const uniqueName = Date.now() + '-' + req.file.originalname;
  const destinationPath = path.join(userDir, uniqueName);

  fs.renameSync(req.file.path, destinationPath); // déplace le fichier temporaire

  const fileUrl = `https://cdn.snapshotfa.st/images/snapshot/${userId}/${uniqueName}`;
  console.log(`🖼️ Image sauvegardée : ${fileUrl}`);
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


