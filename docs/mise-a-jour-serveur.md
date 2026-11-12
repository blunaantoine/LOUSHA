# Procédure de mise à jour du site Lousha sur le serveur

Cette procédure met à jour le site Lousha sur un serveur de production qui
héberge aussi d'autres applications. Elle ne doit toucher qu'à Lousha.

Application concernée : site Lousha (Next.js, base SQLite, service systemd
`lousha`, normalement dans `/var/www/lousha`, port 3004).

## Périmètre strict

- Ne modifier, déplacer ou supprimer des fichiers QUE dans le dossier de Lousha
  et dans un dossier de sauvegarde créé pour elle.
- Ne redémarrer QUE le service `lousha`. Aucun autre service, et pas Nginx.
- Ne pas toucher à la configuration Nginx, aux certificats, au pare-feu, aux
  autres services systemd, aux autres dossiers de `/var/www`, ni aux autres
  bases de données.
- Ne rien installer, mettre à jour ou supprimer au niveau du système (pas de
  `apt`, pas de mise à jour de bun ou de node, pas d'installation globale).
  `bun install` se lance uniquement dans le dossier de Lousha.
- Ne lancer aucun script du dossier `deploy/` : ils modifient Nginx, systemd et
  les permissions.
- Si une étape semble demander de sortir de ce périmètre : s'arrêter et demander
  au responsable du serveur.

## Interdictions absolues

`deploy/fix-db.sh`, `deploy/deploy.sh`, `deploy/setup.sh`, `scripts/seed.ts`,
`prisma db push --force-reset`, `prisma migrate reset` : ces commandes effacent
les clients, les commandes et les produits ou modifient le serveur.
Ne supprimer aucune base de données ni aucune photo.

## Étape 0 — Repérage (sans rien modifier)

Confirmer où se trouve l'application Lousha (dossier, service systemd, port) et
lister les autres applications présentes sur le serveur.
**S'arrêter ici et attendre la confirmation du responsable avant de continuer.**

## Étape 1 — État de Lousha (sans rien modifier)

- `git status` et branche en cours ;
- variables présentes dans `.env` et `.env.production` (les noms seulement, pas
  les valeurs) ;
- emplacement du fichier de base de données (`DATABASE_URL`) ;
- emplacement des photos envoyées depuis l'administration (`public/uploads`,
  `.next/standalone/public/uploads`, ou le dossier `UPLOAD_DIR`), avec le nombre
  de photos à chaque endroit.

## Étape 2 — Sauvegarde

Dans un dossier séparé du site (par exemple `~/sauvegarde-lousha-DATE`) :
le fichier de base de données et toutes les photos trouvées.

## Étape 3 — Photos

Copier les photos de `.next/standalone/public/uploads` vers `public/uploads`
sans rien écraser. Le dossier `.next` est effacé à chaque compilation ; la
nouvelle version enregistre les photos dans `public/uploads`.

## Étape 4 — Code

S'il y a des modifications locales non commitées : les montrer au responsable et
attendre. Sinon, basculer sur la branche à déployer (indiquée par le
responsable).

## Étape 5 — Compilation (dans le dossier de Lousha)

`bun install`, puis `bun run build`. La compilation exécute `prisma db push`,
qui ajoute une table `RateLimit`. Si Prisma annonce une perte de données :
s'arrêter et ne rien forcer.

## Étape 6 — Redémarrage et vérification

Redémarrer uniquement le service `lousha`. Vérifier que :

- le site répond sur son port ;
- `/api/products` renvoie les produits ;
- une photo existante s'affiche ;
- `journalctl -u lousha` ne montre pas d'erreur ;
- les autres applications du serveur répondent toujours comme avant.

## Étape 7 — Comptes

Ne changer aucun mot de passe. Lister seulement les comptes ADMIN et MANAGER de
la base Lousha (email et rôle).

## Compte rendu

À la fin, résumer : ce qui a été sauvegardé et où, le nombre de photos avant et
après, le résultat de chaque vérification, et confirmer que rien n'a été modifié
en dehors de Lousha.
