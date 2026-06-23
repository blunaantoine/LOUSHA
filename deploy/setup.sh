#!/bin/bash
# Lousha Accessories — déploiement
# À exécuter sur le serveur : bash /var/www/lousha/deploy/setup.sh

set -e

echo "=== Installation de Bun ==="
if ! command -v bun &>/dev/null; then
  curl -fsSL https://bun.sh/install | bash
fi

BUN=$(which bun || echo "$HOME/.bun/bin/bun")

echo "=== Service systemd ==="
cp /var/www/lousha/deploy/lousha.service /etc/systemd/system/lousha.service
sed -i "s|/root/.bun/bin/bun|$BUN|g" /etc/systemd/system/lousha.service
systemctl daemon-reload
systemctl enable lousha

echo "=== Build ==="
cd /var/www/lousha
$BUN install
$BUN run build

echo "=== Démarrage ==="
systemctl restart lousha

echo ""
echo "✅ Déploiement terminé. Site dispo sur le port 3004."
curl -s http://localhost:3004/api/promo || echo "⚠️ Vérifie le service : systemctl status lousha"
