#!/bin/bash
# ============================================================
# LOUSHA — Script de déploiement et réparation admin
# ============================================================
# À exécuter sur le VPS (213.156.133.226) en tant que root :
#   bash /var/www/lousha/scripts/deploy-and-fix.sh
# ============================================================

set -e

echo ""
echo "🔧 LOUSHA — Déploiement & Réparation Admin"
echo "============================================"
echo ""

# 1. Se placer dans le répertoire du projet
cd /var/www/lousha

# 2. Tirer les dernières modifications
echo "📥 Git pull..."
git pull origin main

# 3. Installer les dépendances (si nécessaire)
echo "📦 Installation des dépendances..."
bun install

# 4. Build
echo "🏗️  Build en cours..."
bun run build

# 5. Redémarrer le service
echo "🔄 Redémarrage du service..."
sudo systemctl restart lousha

echo ""
echo "✅ Déploiement terminé !"
echo ""

# 6. Lancer le script de diagnostic admin
echo "🔧 Lancement du diagnostic admin..."
echo "============================================"
echo ""
bun run scripts/reset-admin.ts

echo ""
echo "✨ Tout est terminé ! Vous pouvez maintenant :"
echo "   1. Vous connecter au compte admin avec le nouveau mot de passe"
echo "   2. Tester le mot de passe oublié (les liens de reset seront dans les logs serveur)"
echo "   3. Vérifier que l'icône compte fonctionne correctement"
echo ""
echo "Pour voir les logs du serveur :"
echo "   sudo journalctl -u lousha -f"
echo ""
