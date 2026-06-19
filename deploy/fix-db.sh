#!/bin/bash
# ============================================================
# Correction de la base de données — Lousha Accessories
# Corrige le .env + initialise la DB de production + seed
# ============================================================
set -e

cd /var/www/lousha

echo "🔧 Correction du .env..."

# Corrige .env pour pointer vers la DB de production
cat > .env << 'EOF'
DATABASE_URL=file:/var/www/lousha/db/lousha.db
EOF

# S'assure que .env.production est correct
if [ ! -f ".env.production" ]; then
    SECRET=$(openssl rand -base64 32)
    cat > .env.production << EOF
DATABASE_URL=file:/var/www/lousha/db/lousha.db
NEXTAUTH_SECRET=$SECRET
NEXTAUTH_URL=https://loushatg.duckdns.org
PORT=3004
HOSTNAME=127.0.0.1
EOF
fi

# Ajoute RESEND_API_KEY si pas présent (pour mot de passe oublié)
if ! grep -q "RESEND_API_KEY" .env.production 2>/dev/null; then
    echo ""
    echo "🔑 Token Resend pour les emails (mot de passe oublié) ?"
    echo "   Collez votre token Resend (re_...) ou appuyez sur Entrée pour ignorer :"
    read -r RESEND_KEY
    if [ -n "$RESEND_KEY" ]; then
        echo "RESEND_API_KEY=$RESEND_KEY" >> .env.production
        echo "✓ Token Resend ajouté"
    else
        echo "⏭️  Resend ignoré (le mot de passe oublié ne marchera pas sans token)"
    fi
fi

# Email expéditeur
if ! grep -q "EMAIL_FROM" .env.production 2>/dev/null; then
    echo "EMAIL_FROM=Lousha Accessories <noreply@loushatg.duckdns.org>" >> .env.production
fi

echo "✓ .env corrigé vers /var/www/lousha/db/lousha.db"

echo ""
echo "🗄️  Création du dossier DB..."
mkdir -p db
sudo chown -R www-data:www-data db

echo ""
echo "🔄 Push du schéma Prisma vers la DB de production..."
npx prisma db push --force-reset

echo ""
echo "🌱 Seed (admin + manager + produits + slides)..."
npx tsx scripts/seed.ts 2>/dev/null || npx ts-node scripts/seed.ts 2>/dev/null || {
    echo "⚠️  tsx/ts-node non disponible, installation de tsx..."
    npm install -D tsx
    npx tsx scripts/seed.ts
}

echo ""
echo "🔒 Permissions..."
sudo chown -R www-data:www-data /var/www/lousha

echo ""
echo "🔄 Redémarrage du service..."
sudo systemctl restart lousha
sleep 3

if curl -s -o /dev/null -w "" http://127.0.0.1:3004 2>/dev/null; then
    echo "✅ Serveur actif sur le port 3004"
else
    echo "⚠️  Vérifiez: sudo journalctl -u lousha -f"
fi

echo ""
echo "============================================"
echo "✅ DB CORRIGÉE"
echo "👤 admin@lousha-accessories.com / lousha-admin"
echo "👥 manager@lousha-accessories.com / lousha-manager"
echo "============================================"
