# Voha Residence — Ishlab chiqarishga (Production) joylash qo'llanmasi

Bu sayt **Next.js 16 + libSQL** asosida. Ma'lumot bazasi ikki xil ishlaydi:

- **Turso (bulut)** — TURSO_DATABASE_URL + TURSO_AUTH_TOKEN o'rnatilsa, `@libsql/client`
  HTTP orqali ulanadi (sof JavaScript, native modul YO'Q). **Vercel serverlessда to'liq
  ishlaydi** va admin o'zgarishlari doimiy saqlanadi. Pastdagi "Vercel + Turso"ga qarang.
- **Lokal fayl** — env yo'q bo'lsa, `qurilish.db` (ishlab chiqish yoki VPS).

> ⚠️ Vercel'да **TURSO env'lari SHART**. Ularsiz Vercel lokal fayl rejimiga tushadi
> (native drayver) va serverlessда ishlamaydi. Avval Turso'ni sozlang, keyin deploy.

---

## 🚀 Vercel + Turso (admin o'zgarishlari saqlanadi)

### 1. Turso hisobi + CLI
1. https://turso.tech → bepul ro'yxat (GitHub bilan).
2. CLI (Windows Git Bash / WSL): `curl -sSfL https://get.tur.so/install.sh | bash`, keyin `turso auth login`.

### 2. Baza yaratish + mavjud ma'lumotni ko'chirish
```bash
turso db create voha-residence --from-file ./qurilish.db
```
> Baza allaqachon bo'lsa, ma'lumotni import qilish uchun ishlab chiqaruvchiga murojaat qiling.

### 3. Ulanish kalitlari (token TO'LIQ — read-write bo'lsin!)
```bash
turso db show voha-residence --url        # TURSO_DATABASE_URL
turso db tokens create voha-residence     # TURSO_AUTH_TOKEN (--read-only QO'YMANG)
```

### 4. Vercel → Settings → Environment Variables (Production)
| Nomi | Qiymati |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://...turso.io` |
| `TURSO_AUTH_TOKEN` | to'liq token |
| `AUTH_SECRET` | tasodifiy 64-belgili hex |

### 5. Redeploy → tekshirish
Vercel → Deployments → Redeploy. Admin paneldan o'zgartiring — saqlanib qoladi.

---

## 1-variant: VPS (Ubuntu 22.04) — tavsiya etiladi

### 0. Serverga SSH orqali ulanish
Server olгач (Oracle yoki UZ hosting), sizga **Public IP** va **SSH kalit/parol** beriladi.
```bash
# Oracle (kalit fayl bilan):
ssh -i /yo'l/private-key.key ubuntu@SERVER_IP
# Parol bilan (UZ hosting):
ssh root@SERVER_IP
```
> Windows'da SSH: PowerShell yoki PuTTY orqali. Oracle kalit faylига ruxsat: `chmod 400 private-key.key` (Linux/Mac).

### 1. Serverni tayyorlash
```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

# pm2 (jarayonni doimiy ishlatish uchun)
sudo npm install -g pm2
```

### 2. Loyihani yuklash
```bash
# loyiha fayllarini serverga ko'chiring (git yoki scp orqali), masalan:
cd /var/www
# git clone <repo>   yoki   scp bilan yuklang
cd qurilish
npm install
```

### 3. Muhit o'zgaruvchilari — `.env.local`
```bash
# Sessiya imzosi uchun KUCHLI maxfiy kalit yarating:
node -e "console.log('AUTH_SECRET='+require('crypto').randomBytes(32).toString('hex'))" >> .env.local
echo "NODE_ENV=production" >> .env.local
```
> `AUTH_SECRET` — admin sessiya cookie'sini imzolaydi. Uni hech kimga bermang. O'zgartirsangiz, hamma admin tizimdan chiqadi.

### 4. Build va ishga tushirish
```bash
npm run build
pm2 start ecosystem.config.js   # loyihada tayyor konfiguratsiya bor
pm2 save
pm2 startup     # server qayta yuklanganda avtomatik ishga tushadi
```
Sayt `http://SERVER_IP:3000` da ishlaydi.
> `ecosystem.config.js` ichidagi `cwd` yo'li serverdagi papka bilan bir xil bo'lsin.

### 4b. ⚠️ Portlarni ochish (Oracle uchun MUHIM)
Oracle serverida 80/443 portlar odatda **yopiq** bo'ladi — ikki joyda ochish kerak:
1. **Oracle panel** → Instance → *Virtual Cloud Network* → *Security List* → *Ingress Rules* → qo'shing:
   `0.0.0.0/0` → TCP → **80** va **443** portlar
2. **Serverning ichki devori** (Ubuntu):
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```
> UZ hostinglarда odatda portlar ochiq — bu qadam faqat Oracle uchun.

### 5. Domen DNS'ini serverga yo'naltirish
Domen panelида (ahost.uz / boshqa) **A yozuvi** qo'shing:
| Turi | Nomi | Qiymati |
|---|---|---|
| A | `@` | SERVER_IP |
| A | `www` | SERVER_IP |
> DNS tarqalishi 5 daqiqа–2 soat vaqt oladi. `ping voharesidence.uz` bilan tekshiring.

### 6. Nginx (reverse proxy) + domen
Loyihada tayyor `deploy/nginx.conf` bor — undan foydalaning:
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/voha
sudo nano /etc/nginx/sites-available/voha     # SIZNING-DOMEN.uz -> o'z domeningiz
sudo ln -s /etc/nginx/sites-available/voha /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 7. HTTPS (bepul SSL) — oxirgi qadam
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d voharesidence.uz -d www.voharesidence.uz
```
Certbot avtomatik HTTPS (443) sozlaydi va sertifikatni yangilab turadi. Tayyor — sayt `https://voharesidence.uz` da jonli! 🎉

---

## 2-variant: Railway / Render (osonroq)
1. Loyihani GitHub'ga yuklang.
2. Yangi loyiha yarating, repozitoriyni ulang.
3. **Persistent Volume** qo'shing va uni loyiha papkasiga (`/app`) yoki kamida `qurilish.db` va `public/uploads`ni saqlaydigan yo'lга ulang — aks holda har deployда ma'lumot yo'qoladi.
4. Muhit o'zgaruvchisi: `AUTH_SECRET` = (tasodifiy 64 belgili hex).
5. Build buyrug'i: `npm run build` · Start: `npm run start`.

---

## Yangilanish (kod o'zgarganda)
```bash
cd /var/www/qurilish
git pull            # yoki yangi fayllarni yuklang
npm install
npm run build
pm2 restart voha
```

## Zaxira nusxa (backup) — MUHIM
Butun ma'lumot shu ikki joyda:
```bash
# kuniga bir marta cron orqali saqlang:
cp /var/www/qurilish/qurilish.db   /backup/qurilish-$(date +%F).db
tar -czf /backup/uploads-$(date +%F).tar.gz /var/www/qurilish/public/uploads
```

## Birinchi kirish
- Admin: `https://SIZNING-DOMEN/admin/login`
- Email: `admin@qurilish.uz` · Parol: `admin123`
- **Birinchi ishda Sozlamalar → "Parolni o'zgartirish" orqali parolni almashtiring.**

## ⚠️ Eng muhim: ma'lumotni ko'chirishni unutmang
Bazada endi **sizning haqiqiy loyihalaringiz** bor (23 ta loyiha, bloklar, rasmlar, yangiliklar).
Serverga o'tkazganda quyidagilar ALBATTA ko'chirilsin:
- `qurilish.db` — barcha loyiha/matn/sozlama
- `public/uploads/` — barcha bino rasmlari

Bularsiz sayt bo'sh ochiladi. `node_modules` va `.next` ni ko'chirmang — serverda qayta quriladi.
Faqat noldan boshlamoqchi bo'lsangizgina yangi bo'sh `qurilish.db` ishlating (sxema avtomatik yaratiladi).
