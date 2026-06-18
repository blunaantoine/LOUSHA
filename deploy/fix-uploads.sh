#!/bin/bash
# Corrige les permissions du dossier uploads + ajoute UPLOAD_DIR au .env.production
set -e
cd /var/www/lousha

echo "📁 Création du dossier uploads..."
mkdir -p public/uploads

echo "🔒 Correction des permissions..."
sudo chown -R www-data:www-data public/uploads
sudo chmod -R 755 public/uploads
sudo chmod 644 public/uploads/* 2>/dev/null || true

echo "⚙️  Ajout de UPLOAD_DIR dans .env.production..."
if ! grep -q "UPLOAD_DIR" .env.production 2>/dev/null; then
    echo "UPLOAD_DIR=/var/www/lousha/public/uploads" >> .env.production
    echo "✓ UPLOAD_DIR ajouté"
else
    echo "✓ UPLOAD_DIR déjà présent"
fi

echo "🔄 Redémarrage du service..."
sudo systemctl restart lousha
sleep 3

if curl -s -o /dev/null -w "" http://127.0.0.1:3004 2>/dev/null; then
    echo "✅ Serveur actif"
else
    echo "⚠️  Vérifiez: sudo journalctl -u lousha -f"
fi

echo ""
echo "✅ Permissions corrigées — l'upload d'images devrait maintenant marcher"
