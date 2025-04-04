#!/bin/bash

echo "🚀 Déploiement de snapshot-cdn en cours..."

cd /root/cdn-backend || exit

echo "📥 Récupération depuis GitHub..."
git pull origin main

echo "♻️ Redémarrage de PM2..."
pm2 restart snapshot-cdn

echo "✅ Déploiement terminé !"
