import https from 'https';
import fs from 'fs';
import express from 'express';

const app = express();

// Sert des fichiers statiques (ex : images)
app.use('/images', express.static('images'));

// Certificats
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/cdn.snapshotfa.st/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/cdn.snapshotfa.st/fullchain.pem'),
};

https.createServer(options, app).listen(443, () => {
  console.log('🚀 Serveur CDN en HTTPS sur le port 443');
});

