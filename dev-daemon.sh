#!/bin/bash
# Daemon persistant pour le serveur Next.js Lousha.
# Ignore les signaux de fin de session et redémarre le serveur si besoin.
trap '' SIGHUP
trap '' SIGTERM
cd /home/z/my-project

while true; do
  # Vérifie si le serveur répond
  if ! curl -s -o /dev/null --max-time 2 http://localhost:3000 2>/dev/null; then
    # Tue les anciens processus next
    pkill -9 -f "next dev" 2>/dev/null
    sleep 1
    # Relance le serveur (sans pipe tee, redirection directe)
    ./node_modules/.bin/next dev -p 3000 </dev/null >>dev.log 2>&1 &
    disown $!
    # Attend le démarrage
    sleep 12
  fi
  sleep 5
done
