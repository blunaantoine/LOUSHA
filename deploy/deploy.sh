#!/bin/bash
# ============================================================
# Script de déploiement — Lousha Accessories
# À exécuter sur votre serveur (Ubuntu/Debian)
# Usage : bash deploy/deploy.sh
# ============================================================
set -e

DOMAIN="loushatg.duckdns.org"
APP_DIR="/var/www/lousha"
PORT=3004
REPO="https://github.com/blunaantoine/LOUSHA.git"

echo "🚀 Déploiement de Lousha Accessories sur $DOMAIN (port $PORT)"
echo ""

# --- 1. Prérequis ---
echo "📦 Installation des prérequis..."
sudo apt-get update -qq
sudo apt-get install -y -qq nodejs npm nginx certbot python3-certbot-nginx git

# Node 20+ via NodeSource si version < 18
NODE_MAJOR=$(node -v 2>/dev/null | cut -d. -f1 | tr -d v || echo "0")
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "📦 Installation de Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
fi

echo "✓ Prérequis installés"

# --- 2. Clonage du dépôt ---
echo "📥 Clonage du code..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    git pull origin main
else
    git clone $REPO $APP_DIR
    cd $APP_DIR
fi
echo "✓ Code récupéré"

# --- 3. Fichier .env.production ---
if [ ! -f "$APP_DIR/.env.production" ]; then
    echo "⚙️  Création du .env.production..."
    SECRET=$(openssl rand -base64 32)
    mkdir -p $APP_DIR/db
    cat > $APP_DIR/.env.production << EOF
DATABASE_URL=file:$APP_DIR/db/lousha.db
NEXTAUTH_SECRET=$SECRET
NEXTAUTH_URL=https://$DOMAIN
PORT=$PORT
EOF
    echo "✓ .env.production créé (secret généré)"
else
    echo "✓ .env.production existant conservé"
fi

# --- 4. Installation dépendances + build ---
echo "🔨 Installation des dépendances..."
npm install
echo "🔨 Génération du client Prisma..."
npx prisma generate
echo "🔨 Build de production..."
npm run build
echo "✓ Build terminé"

# --- 5. Base de données ---
echo "🗄️  Initialisation de la base de données..."
npx prisma db push
# Seed (comptes admin/manager + produits + slides)
node -e "
const { execSync } = require('child_process');
try { execSync('npx bun run scripts/seed.ts', { stdio: 'inherit' }); } catch(e) {
    execSync('npx tsx scripts/seed.ts', { stdio: 'inherit' });
}
" 2>/dev/null || echo "⚠️  Seed ignoré (exécutez-le manuellement si besoin)"
echo "✓ Base de données prête"

# --- 6. Permissions ---
sudo chown -R www-data:www-data $APP_DIR
echo "✓ Permissions configurées"

# --- 7. Service systemd ---
echo "⚙️  Installation du service systemd..."
sudo cp deploy/lousha.service /etc/systemd/system/lousha.service
sudo systemctl daemon-reload
sudo systemctl enable lousha
sudo systemctl restart lousha
echo "✓ Service démarré (port $PORT)"

# --- 8. Nginx ---
echo "🌐 Configuration Nginx..."
sudo cp deploy/nginx-lousha.conf /etc/nginx/sites-available/lousha
sudo ln -sf /etc/nginx/sites-available/lousha /etc/nginx/sites-enabled/lousha
sudo nginx -t
sudo systemctl reload nginx
echo "✓ Nginx configuré"

# --- 9. SSL HTTPS ---
echo "🔒 Activation du HTTPS..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email || echo "⚠️  Échec SSL — lancez manuellement : sudo certbot --nginx -d $DOMAIN"
echo "✓ HTTPS activé"

# --- Vérification ---
echo ""
echo "============================================"
echo "✅ DÉPLOIEMENT TERMINÉ"
echo "============================================"
echo "🌐 Site : https://$DOMAIN"
echo "👤 Admin : admin@lousha-accessories.com / lousha-admin"
echo "👥 Manager : manager@lousha-accessories.com / lousha-manager"
echo ""
echo "Commandes utiles :"
echo "  Logs serveur : sudo journalctl -u lousha -f"
echo "  Redémarrer  : sudo systemctl restart lousha"
echo "  Statut      : sudo systemctl status lousha"
echo "============================================"
