#!/bin/bash
# Airnet VPS'ga yangilanishni chiqarish (46.8.114.120, /var/www/voha, PM2 "voha", nginx).
#   bash deploy/airnet.sh
# Oxirgi COMMIT yuboriladi (commit qilinmagan o'zgarishlar ketmaydi).
# Serverdagi .env.local va admin yuklagan rasmlar (public/uploads) saqlanib qoladi:
# tar faqat ustiga yozadi, hech narsani o'chirmaydi.
set -euo pipefail

HOST="ubuntu@46.8.114.120"
KEY="$HOME/.ssh/voha_airnet"
SSH="ssh -i $KEY -o BatchMode=yes $HOST"

cd "$(dirname "$0")/.."
echo "→ Kod yuklanmoqda ($(git rev-parse --short HEAD))"
git archive --format=tar HEAD | $SSH "cd /var/www/voha && tar -xf -"

echo "→ Paketlar va build"
$SSH "cd /var/www/voha && npm ci --no-audit --no-fund >/tmp/npmci.log 2>&1 || { tail -20 /tmp/npmci.log; exit 1; }
      NODE_OPTIONS=--max-old-space-size=2560 npx next build >/tmp/build.log 2>&1 || { tail -30 /tmp/build.log; exit 1; }
      pm2 reload voha >/dev/null && pm2 save >/dev/null"

echo "→ Tekshiruv"
for i in $(seq 1 20); do
  code=$($SSH "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/uz")
  [ "$code" = "200" ] && { echo "✓ Sayt ishlayapti"; exit 0; }
  sleep 2
done
echo "✗ Sayt javob bermadi — serverda: pm2 logs voha"; exit 1
