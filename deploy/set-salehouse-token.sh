#!/bin/bash
# Sale House tokenini serverga xavfsiz kiritish (Airnet VPS, /var/www/voha).
# Token ekranda ko'rinmaydi, chatga/faylga/gitga tushmaydi — faqat .env.local'ga (chmod 600) yoziladi.
# Ishga tushirish (kompyuterdan):  ssh -t -i C:/Users/user/.ssh/voha_airnet ubuntu@46.8.114.120 /var/www/voha/set-salehouse-token.sh
set -e
cd /var/www/voha
read -r -s -p "Sale House token (ekranda ko'rinmaydi, qo'yib Enter bosing): " T
echo
T="$(printf %s "$T" | tr -d '[:space:]')"
if [ ${#T} -lt 20 ]; then
  echo "Token juda qisqa yoki bo'sh — qayta urinib ko'ring."
  exit 1
fi
sed -i '/^SALEHOUSE_/d' .env.local
{
  echo "SALEHOUSE_API_URL=https://voha-residence.backend-salehouse.uz"
  echo "SALEHOUSE_API_TOKEN=$T"
  echo "SALEHOUSE_COMPANY_ID=1,2,3"
} >> .env.local
chmod 600 .env.local
unset T
pm2 reload voha >/dev/null
echo "TAYYOR - token saqlandi"
