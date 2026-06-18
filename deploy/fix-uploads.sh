#!/bin/bash
# Corrige les permissions d'upload + configure Nginx pour servir /uploads/
set -e
cd /var/www/lousha

echo "📁 Création des dossiers uploads..."
mkdir -p public/uploads
mkdir -p .next/standalone/public/uploads 2>/dev/null || true

echo "🔒 Permissions..."
sudo chown -R www-data:www-data public/uploads .next/standalone/public 2>/dev/null || true
sudo chmod -R 777 public/uploads .next/standalone/public/uploads 2>/dev/null || true

echo "⚙️  UPLOAD_DIR dans .env.production..."
if ! grep -q "UPLOAD_DIR" .env.production 2>/dev/null; then
    echo "UPLOAD_DIR=/var/www/lousha/public/uploads" >> .env.production
    echo "✓ Ajouté"
else
    sed -i 's|UPLOAD_DIR=.*|UPLOAD_DIR=/var/www/lousha/public/uploads|' .env.production
    echo "✓ Mis à jour"
fi

echo "🌐 Nginx — ajout du bloc /uploads/..."
if ! grep -q "location /uploads/" /etc/nginx/sites-enabled/lousha 2>/dev/null; then
    # Ajoute le bloc uploads avant le location /
    sudo sed -i '/location \/ {/i\    location /uploads/ {\n        alias /var/www/lousha/public/uploads/;\n        expires 30d;\n        add_header Cache-Control "public, immutable";\n        access_log off;\n    }\n' /etc/nginx/sites-enabled/lousha
    sudo nginx -t && sudo systemctl reload nginx
    echo "✓ Nginx mis à jour"
else
    echo "✓ Nginx déjà configuré"
fi

echo "🔄 Redémarrage..."
sudo systemctl restart lousha
sleep 3

curl -s -o /dev/null -w "Serveur: HTTP %{http_code}\n" http://127.0.0.1:3004

echo ""
echo "✅ Upload corrigé — les images seront servies par Nginx depuis /var/www/lousha/public/uploads/"
