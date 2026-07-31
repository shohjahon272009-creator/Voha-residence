#!/usr/bin/env bash
# ============================================================
#  Voha Residence — BITTA BUYRUQDA SERVERGA JOYLASH
# ============================================================
#  Ishlatish (Ubuntu serverda, loyiha papkasi ichida):
#
#     sudo bash setup.sh                     # domensiz, http://SERVER_IP:3000
#     sudo bash setup.sh voharesidence.uz    # domen + HTTPS bilan
#
#  Skript avtomatik qiladi:
#   Node.js 20 + nginx + pm2 o'rnatish → npm install → AUTH_SECRET
#   → build → pm2 (doimiy ishlash) → nginx (domen) → HTTPS (certbot)
# ============================================================
set -e

DOMAIN="$1"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="voha"

echo ""
echo "🏗️  Voha Residence — joylash boshlandi"
echo "    Papka: $APP_DIR"
[ -n "$DOMAIN" ] && echo "    Domen: $DOMAIN" || echo "    Domen: yo'q (faqat IP:3000)"
echo ""

# --- root tekshiruvi ---
if [ "$(id -u)" -ne 0 ]; then
  echo "❌ Iltimos 'sudo' bilan ishga tushiring:  sudo bash setup.sh $DOMAIN"
  exit 1
fi

# --- 1. Dasturlar ---
echo "📦 [1/6] Node.js, nginx, pm2 o'rnatilmoqda..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs build-essential
fi
apt-get install -y nginx >/dev/null 2>&1 || true
command -v pm2 >/dev/null 2>&1 || npm install -g pm2

# --- 2. Kutubxonalar ---
echo "📚 [2/6] Loyiha kutubxonalari (npm install)..."
cd "$APP_DIR"
npm install

# --- 3. Maxfiy kalit ---
echo "🔑 [3/6] AUTH_SECRET tekshirilmoqda..."
if ! grep -q "AUTH_SECRET=" .env.local 2>/dev/null; then
  echo "AUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env.local
  echo "NODE_ENV=production" >> .env.local
  echo "    ✓ Yangi maxfiy kalit yaratildi"
else
  echo "    ✓ Kalit allaqachon bor"
fi

# --- 4. Build ---
echo "🔨 [4/6] Sayt qurilmoqda (npm run build)..."
npm run build

# --- 5. pm2 (doimiy ishlash) ---
echo "🚀 [5/6] Server ishga tushirilmoqda (pm2)..."
pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
pm2 start npm --name "$APP_NAME" -- start
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# --- 6. Domen + HTTPS ---
if [ -n "$DOMAIN" ]; then
  echo "🌐 [6/6] Nginx + HTTPS ($DOMAIN)..."

  # Oracle/Ubuntu ichki devor: 80/443 ochish
  iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT 2>/dev/null || true
  iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
  command -v netfilter-persistent >/dev/null 2>&1 && netfilter-persistent save >/dev/null 2>&1 || true

  # Nginx konfiguratsiyasi
  cat > /etc/nginx/sites-available/$APP_NAME <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    client_max_body_size 25M;
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX
  ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx

  # HTTPS (bepul, avtomatik)
  apt-get install -y certbot python3-certbot-nginx >/dev/null 2>&1
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect || \
    echo "    ⚠️ Certbot xato berdi — DNS hali tarqalmagan bo'lishi mumkin. Keyin qayta ishga tushiring: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"

  echo ""
  echo "✅ TAYYOR! Sayt jonli:  https://$DOMAIN"
  echo "   Admin:  https://$DOMAIN/admin/login  (admin@qurilish.uz / admin123)"
else
  IP=$(curl -s ifconfig.me || echo "SERVER_IP")
  echo ""
  echo "✅ TAYYOR! Sayt ishlayapti:  http://$IP:3000"
  echo "   Domen ulash uchun:  sudo bash setup.sh SIZNING-DOMEN.uz"
fi

echo ""
echo "⚠️  Eslatma: birinchi ishda admin parolini (admin123) o'zgartiring."
echo "🔄 Kod yangilanganda:  npm run build && pm2 restart $APP_NAME"
echo ""
