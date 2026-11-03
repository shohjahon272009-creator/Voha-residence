#!/bin/bash
# amoCRM kalitini serverga xavfsiz kiritish (Airnet VPS, /var/www/voha-shared/.env.local).
# Token ekranda ko'rinmaydi, chatga/faylga/gitga tushmaydi — faqat .env.local'ga (chmod 600) yoziladi.
# Ishga tushirish (kompyuterdan):  ssh -t -i C:/Users/user/.ssh/voha_airnet ubuntu@46.8.114.120 /var/www/voha-current/deploy/set-amocrm-token.sh
set -e
cd /var/www/voha-shared
read -r -p "amoCRM manzili (masalan: voha.amocrm.ru): " D
D="$(printf %s "$D" | tr -d '[:space:]' | sed -E 's#^https?://##; s#/.*$##')"
if ! printf %s "$D" | grep -Eq '^[a-z0-9-]+\.(amocrm\.(ru|com)|kommo\.com)$'; then
  echo "Manzil noto'g'ri — masalan: voha.amocrm.ru"
  exit 1
fi
read -r -s -p "Uzoq muddatli token (ekranda ko'rinmaydi, qo'yib Enter bosing): " T
echo
T="$(printf %s "$T" | tr -d '[:space:]')"
if [ ${#T} -lt 20 ]; then
  echo "Token juda qisqa yoki bo'sh — qayta urinib ko'ring."
  exit 1
fi
# Tekshiruv: token shu akkauntga mos kelmasa, eski sozlamani buzmaymiz
CODE="$(curl -s -o /dev/null -w '%{http_code}' -m 15 -H "Authorization: Bearer $T" "https://$D/api/v4/account")"
if [ "$CODE" != "200" ]; then
  echo "amoCRM tokenni qabul qilmadi (javob: $CODE) — hech narsa o'zgarmadi."
  exit 1
fi
sed -i '/^AMOCRM_BASE_URL=/d; /^AMOCRM_TOKEN=/d' .env.local
{
  echo "AMOCRM_BASE_URL=https://$D"
  echo "AMOCRM_TOKEN=$T"
} >> .env.local
chmod 600 .env.local
unset T
pm2 reload voha --update-env >/dev/null
echo "TAYYOR - amoCRM ulandi"
