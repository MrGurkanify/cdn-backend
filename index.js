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

// Dossier images racine
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Multer pour gérer l'upload
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

// Simple route ping
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 📤 Upload avatar utilisateur
app.post('/upload/avatar', upload.single('image'), async (req, res) => {
  const userId = req.body.userId;
  if (!req.file || !userId) {
    return res.status(400).json({ error: 'Fichier ou userId manquant' });
  }

  const destFolder = path.join(imagesDir, 'snapshot', userId, 'avatar');
  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  const uniqueName = `${Date.now()}-${req.file.originalname}`;
  const destinationPath = path.join(destFolder, uniqueName);

  fs.renameSync(req.file.path, destinationPath);

  const fileUrl = `https://cdn.snapshotfa.st/images/snapshot/${userId}/avatar/${uniqueName}`;
  res.status(200).json({ success: true, fileUrl });
});

// 📤 Upload images fournisseur
app.post('/upload/supplier', upload.single('image'), async (req, res) => {
  const userId = req.body.userId;
  const supplierId = req.body.supplierId;
  if (!req.file || !userId || !supplierId) {
    return res.status(400).json({ error: 'Fichier, userId ou supplierId manquant' });
  }

  const destFolder = path.join(imagesDir, 'snapshot', userId, supplierId);
  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  const uniqueName = `${Date.now()}-${req.file.originalname}`;
  const destinationPath = path.join(destFolder, uniqueName);
  fs.renameSync(req.file.path, destinationPath);

  const fileUrl = `https://cdn.snapshotfa.st/images/snapshot/${userId}/${supplierId}/${uniqueName}`;
  res.status(200).json({ success: true, fileUrl });
});

// 📤 Upload images produit
app.post('/upload/product', upload.single('image'), async (req, res) => {
  const userId = req.body.userId;
  const supplierId = req.body.supplierId;
  if (!req.file || !userId || !supplierId) {
    return res.status(400).json({ error: 'Fichier, userId ou supplierId manquant' });
  }

  const destFolder = path.join(imagesDir, 'snapshot', userId, supplierId, 'products');
  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  const uniqueName = `${Date.now()}-${req.file.originalname}`;
  const destinationPath = path.join(destFolder, uniqueName);
  fs.renameSync(req.file.path, destinationPath);

  const fileUrl = `https://cdn.snapshotfa.st/images/snapshot/${userId}/${supplierId}/products/${uniqueName}`;
  res.status(200).json({ success: true, fileUrl });
});

// suppresion du supplier et de son dossier
app.post('/delete/supplier', express.json(), async (req, res) => {
  const { userId, supplierId } = req.body;

  if (!userId || !supplierId) {
    return res.status(400).json({ error: 'userId ou supplierId manquant' });
  }

  const targetDir = path.join(imagesDir, 'snapshot', userId, supplierId);

  try {
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
      console.log('🧹 Dossier images supplier supprimé :', targetDir);
    }
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('❌ Erreur suppression supplier CDN :', e);
    return res.status(500).json({ error: 'Erreur suppression supplier CDN' });
  }
});



// Sert les fichiers statiques
app.use('/images', express.static(imagesDir));

// Certificats SSL Let's Encrypt
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/cdn.snapshotfa.st/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/cdn.snapshotfa.st/fullchain.pem'),
};

// Lancement HTTPS
https.createServer(options, app).listen(443, () => {
  console.log('🚀 Serveur CDN actif sur https://cdn.snapshotfa.st');
});