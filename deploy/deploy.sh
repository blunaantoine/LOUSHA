#!/bin/bash
# ============================================================
# Déploiement Lousha — adapté à votre serveur
# (Nginx déjà actif, ports 3000-3003 pris, on utilise 3004)
# ============================================================
set -e

DOMAIN="loushatg.duckdns.org"
APP_DIR="/var/www/lousha"
PORT=3004
REPO="https://github.com/blunaantoine/LOUSHA.git"

echo "🚀 Déploiement Lousha → $DOMAIN (port $PORT)"
echo ""

# --- 1. Prérequis ---
if ! command -v node &> /dev/null; then
    echo "📦 Installation Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
NODE_MAJOR=$(node -v | cut -d. -f1 | tr -d v)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "❌ Node.js >= 18 requis (actuel: $(node -v))"
    exit 1
fi
echo "✓ Node.js $(node -v)"

# --- 2. Clonage ---
echo "📥 Code..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR && git pull origin main
else
    git clone $REPO $APP_DIR && cd $APP_DIR
fi

# --- 3. .env.production ---
mkdir -p $APP_DIR/db
if [ ! -f "$APP_DIR/.env.production" ]; then
    SECRET=$(openssl rand -base64 32)
    cat > $APP_DIR/.env.production << EOF
DATABASE_URL=file:$APP_DIR/db/lousha.db
NEXTAUTH_SECRET=$SECRET
NEXTAUTH_URL=https://$DOMAIN
PORT=$PORT
HOSTNAME=127.0.0.1
EOF
    echo "✓ .env.production créé"
else
    echo "✓ .env.production conservé"
fi

# --- 4. Build ---
echo "🔨 Build..."
npm install
npx prisma generate
npm run build
echo "✓ Build OK"

# --- 5. DB + seed ---
echo "🗄️  Base de données..."
npx prisma db push
# Seed via node (tsx/ts-node selon dispo)
npx tsx scripts/seed.ts 2>/dev/null || npx ts-node scripts/seed.ts 2>/dev/null || echo "⚠️  Seed manuel: npx tsx scripts/seed.ts"
echo "✓ DB prête"

# --- 6. Permissions ---
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# --- 7. Service systemd ---
echo "⚙️  Service systemd..."
sudo cp deploy/lousha.service /etc/systemd/system/lousha.service
sudo systemctl daemon-reload
sudo systemctl enable lousha
sudo systemctl restart lousha
sleep 3
if curl -s -o /dev/null -w "" http://127.0.0.1:$PORT; then
    echo "✓ Serveur actif sur port $PORT"
else
    echo "⚠️  Vérifiez: sudo journalctl -u lousha -f"
fi

# --- 8. Nginx (AJOUT d'un server block, ne touche pas aux sites existants) ---
echo "🌐 Nginx..."
sudo cp deploy/nginx-lousha.conf /etc/nginx/sites-available/lousha
sudo ln -sf /etc/nginx/sites-available/lousha /etc/nginx/sites-enabled/lousha
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✓ Nginx rechargé"
else
    echo "❌ Erreur config Nginx — vérifiez /etc/nginx/sites-available/lousha"
    exit 1
fi

# --- 9. HTTPS ---
echo "🔒 HTTPS..."
read -p "DuckDNS pointe-t-il vers cette IP ($(curl -s ifconfig.me)) ? [o/N] " CONFIRM
if [[ "$CONFIRM" =~ ^[Oo] ]]; then
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN || \
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email
    echo "✓ HTTPS activé"
else
    echo "⏭️  SSL ignoré. Lancez plus tard: sudo certbot --nginx -d $DOMAIN"
fi

echo ""
echo "============================================"
echo "✅ TERMINÉ"
echo "🌐 https://$DOMAIN (ou http:// si SSL en attente)"
echo "👤 admin@lousha-accessories.com / lousha-admin"
echo "👥 manager@lousha-accessories.com / lousha-manager"
echo ""
echo "Logs: sudo journalctl -u lousha -f"
echo "Restart: sudo systemctl restart lousha"
echo "============================================"
