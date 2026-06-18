#!/bin/bash
trap '' SIGHUP SIGTERM
cd /home/z/my-project
while true; do
  if ! pgrep -f "next dev" > /dev/null 2>&1; then
    bunx next dev -p 3000 > dev.log 2>&1 &
    NEXT_PID=$!
    disown $NEXT_PID
    sleep 5
  fi
  sleep 3
done
