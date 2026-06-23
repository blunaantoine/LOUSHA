#!/bin/bash
set -e

echo "=== Installation de Bun ==="
export PATH="$HOME/.bun/bin:$PATH"
if ! command -v bun &>/dev/null; then
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi
echo "Bun: $(which bun)"

echo "=== Service systemd ==="
cp deploy/lousha.service /etc/systemd/system/lousha.service
systemctl daemon-reload
systemctl enable lousha

echo "=== Build ==="
cd /var/www/lousha
bun install
bun run build

echo "=== Démarrage ==="
systemctl restart lousha
sleep 3

echo ""
if curl -sf http://localhost:3004/api/promo > /dev/null 2>&1; then
  echo "✅ Site OK — API promo répond."
  curl -s http://localhost:3004/api/promo
else
  echo "⚠️ Service démarré mais ne répond pas. Logs:"
  journalctl -u lousha --no-pager -n 5
fi
