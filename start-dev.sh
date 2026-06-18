#!/bin/bash
# Démarre le serveur Next.js de manière persistante.
# Ignore SIGHUP pour survivre à la fermeture de la session bash.
trap '' SIGHUP
cd /home/z/my-project
exec bunx next dev -p 3000 > dev.log 2>&1
