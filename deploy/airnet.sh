#!/bin/bash
# Airnet VPS'ga yangilanishni chiqarish — UZILISHSIZ (atomik relizlar).
#   bash deploy/airnet.sh
# Oxirgi COMMIT yuboriladi (commit qilinmagan o'zgarishlar ketmaydi).
#
# Tuzilma (serverda):
#   /var/www/voha-releases/<vaqt>-<sha>/  — har bir versiya alohida (toza nusxa: repoda o'chirilgan
#                                           fayl serverda qolib, build'ga kirib ketmaydi)
#   /var/www/voha-current -> oxirgi reliz  — PM2 va nginx shu yerdan ishlaydi
#   /var/www/voha-shared/.env.local        — maxfiy sozlamalar (Turso, AUTH_SECRET, Sale House)
#   /var/www/voha-shared/uploads/          — admin yuklagan rasmlar + repo rasmlari (relizlar orasida saqlanadi)
# Yangi reliz to'liq yig'ilib bo'lgach symlink bir lahzada almashtiriladi va `pm2 reload` qilinadi —
# ishlab turgan sayt build paytida buzilmaydi. Oxirgi 3 ta reliz saqlanadi (orqaga qaytish uchun).
set -euo pipefail

HOST="ubuntu@46.8.114.120"
KEY="$HOME/.ssh/voha_airnet"
SSH="ssh -i $KEY -o BatchMode=yes $HOST"

cd "$(dirname "$0")/.."
SHA="$(git rev-parse --short HEAD)"
ID="$(date +%Y%m%d-%H%M%S)-$SHA"
R="/var/www/voha-releases/$ID"

echo "→ Yangi reliz: $ID"
git archive --format=tar HEAD | $SSH "mkdir -p '$R' && tar -xf - -C '$R'"

echo "→ Paketlar va build (ishlab turgan saytga tegilmaydi)"
$SSH "set -e
  cd '$R'
  ln -sfn /var/www/voha-shared/.env.local .env.local
  npm ci --no-audit --no-fund >/tmp/npmci.log 2>&1 || { tail -20 /tmp/npmci.log; exit 1; }
  NODE_OPTIONS=--max-old-space-size=2560 npx next build >/tmp/build.log 2>&1 || { tail -30 /tmp/build.log; exit 1; }
  # Build'dan KEYIN: repo rasmlari umumiy papkaga (yangi/yangilanganlari), reliz esa shu papkaga ulanadi
  # (Turbopack build vaqtida loyihadan tashqariga qaragan symlink'ni qabul qilmaydi)
  mkdir -p /var/www/voha-shared/uploads
  cp -ru public/uploads/. /var/www/voha-shared/uploads/
  rm -rf public/uploads && ln -s /var/www/voha-shared/uploads public/uploads
  # Atomik almashtirish
  ln -sfn '$R' /var/www/voha-current.new && mv -Tf /var/www/voha-current.new /var/www/voha-current
  pm2 reload voha >/dev/null && pm2 save >/dev/null
  # Eski relizlar: oxirgi 3 tasi qoladi
  ls -1dt /var/www/voha-releases/* | tail -n +4 | xargs -r rm -rf"

echo "→ Tekshiruv"
for i in $(seq 1 20); do
  code=$($SSH "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/uz")
  [ "$code" = "200" ] && { echo "✓ Sayt ishlayapti ($ID)"; exit 0; }
  sleep 2
done
echo "✗ Sayt javob bermadi — orqaga qaytish: serverda oldingi relizga symlink + pm2 reload voha"; exit 1
