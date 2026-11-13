# Lousha Accessoires — Site e-commerce

Site officiel de **Lousha Accessoires**, marque Made in Togo de sacs, chapeaux, paniers et objets de décoration en raphia 100 % naturel, faits main par des artisans togolais.

🌐 https://lousha-accessoire.com

---

## Réalisation

| | |
|---|---|
| **Client** | Lousha Accessoires |
| **Conception & développement** | **Visible Studio** |
| **Version** | 1.0.0 |

© Visible Studio — Tous droits réservés sur le code source, cédés au client selon les termes convenus.

---

## Fonctionnalités

**Boutique**
- Catalogue de produits par catégories (sacs, chapeaux, décoration, artisanat) avec variantes (couleurs, tailles)
- Fiche produit, aperçu rapide, recherche
- Panier et commande via WhatsApp
- Prix en FCFA (XOF) et en euros
- Site bilingue français / anglais
- Pages : Accueil, Boutique, Notre histoire, La matière, FAQ, Contact
- Bannière promotionnelle, carrousel d'accueil, newsletter
- Widget WhatsApp et assistant de discussion

**Espace client**
- Création de compte, connexion (mot de passe ou Google), mot de passe oublié / réinitialisation
- Historique des commandes, modification du profil
- Notifications

**Administration**
- Tableau de bord et statistiques
- Gestion des produits, variantes, catégories et stocks
- Gestion des commandes, clients et utilisateurs
- Gestion du contenu du site (textes, images, carrousel, promotions)
- Messagerie (réponse aux messages de contact) et newsletter
- Génération assistée des descriptions produits à partir de la photo

**Mode maintenance**
- Bouton dans le tableau de bord (administrateurs uniquement) qui ferme le site aux visiteurs : ils voient une page « maintenance en cours » et ne peuvent plus commander, s'inscrire ni envoyer de message
- Les comptes administrateur et gestionnaire continuent d'utiliser le site normalement
- Activation et désactivation protégées par un code à 4 chiffres, créé à la première utilisation (5 essais par tranche de 15 minutes)
- Bouton réservé aux comptes listés dans `MAINTENANCE_ADMIN_EMAILS` (fichier `.env`, adresses séparées par des virgules) ; sans ce réglage, tous les administrateurs le voient

**Référencement (SEO)**
- Pages indexables, sitemap, robots.txt, données structurées, manifeste PWA

---

## Technologies

- [Next.js](https://nextjs.org) 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4 · shadcn/ui · Framer Motion
- Prisma (SQLite)
- NextAuth (authentification)
- Zustand · TanStack Query
- Bun (exécution et gestion des paquets)

---

## Installation

Prérequis : [Bun](https://bun.sh) 1.x (ou Node.js 20+).

```bash
bun install
```

Créer un fichier `.env` à la racine :

```env
DATABASE_URL="file:./db/lousha.db"
NEXTAUTH_URL="https://lousha-accessoire.com"
NEXTAUTH_SECRET="une-chaine-secrete-longue-et-aleatoire"

# E-mails (Resend)
RESEND_API_KEY=""
EMAIL_FROM="Lousha <contact@lousha-accessoire.com>"

# Dossier des images envoyées depuis l'administration (optionnel)
UPLOAD_DIR=""

# Connexion avec Google (optionnel) — identifiants OAuth créés dans Google Cloud.
# URI de redirection à autoriser : https://lousha-accessoire.com/api/auth/callback/google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Génération assistée des descriptions produits (au moins une clé, optionnel)
MISTRAL_API_KEY=""
GEMINI_API_KEY=""
GROQ_API_KEY=""
```

Initialiser la base de données et créer le compte administrateur :

```bash
bun run db:push
ADMIN_PASSWORD="un-mot-de-passe-long-et-unique" bun run scripts/seed.ts
```

Le mot de passe administrateur est lu dans `ADMIN_PASSWORD` (12 caractères minimum). S'il est absent, un mot de passe aléatoire est généré et affiché une seule fois. `scripts/create-admin.ts` permet de recréer ou réinitialiser le compte administrateur de la même façon.

> ⚠️ `scripts/seed.ts` efface toutes les données. Sur une base déjà remplie, il ne fait rien sauf avec l'option `--force`.

## Développement

```bash
bun run dev
```

Le site est accessible sur http://localhost:3000.

## Production

```bash
bun run build
bun run start
```

Le serveur de production écoute sur le port 3004. Les fichiers du dossier `deploy/` permettent l'installation sur un serveur VPS (service systemd `lousha.service`, configuration Nginx `nginx-lousha.conf`, scripts `setup.sh` et `deploy.sh`).

### Code de maintenance oublié

Cette commande, lancée sur le serveur, rouvre le site et efface le code. Un nouveau code sera demandé à la prochaine activation :

```bash
bun -e 'import {PrismaClient} from "@prisma/client"; const p=new PrismaClient(); await p.siteSetting.deleteMany({where:{key:{in:["maintenanceEnabled","maintenancePinHash"]}}}); console.log("Site rouvert, code efface"); await p.$disconnect()'
```

---

## Structure du projet

```
prisma/            Schéma de la base de données
public/            Images, polices, icônes
scripts/           Scripts d'administration (seed, compte admin, build)
deploy/            Fichiers de déploiement serveur
src/app/           Pages et routes API (Next.js)
src/components/    Composants de l'interface
src/hooks/         Hooks React
src/lib/           Services, authentification, traductions, base de données
```

---

Conçu et développé par **Visible Studio**.
