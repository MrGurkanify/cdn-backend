#!/bin/bash

echo "🚀 Déploiement de snapshot-cdn en cours..."

cd /root/cdn-backend || exit

echo "📥 Récupération depuis GitHub..."
git pull origin main

echo "♻️ Redémarrage de PM2..."
pm2 restart cdn-backend

echo "✅ Déploiement terminé !"
