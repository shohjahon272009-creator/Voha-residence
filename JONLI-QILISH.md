# 🌐 VOHA RESIDENCE — SAYTNI JONLI QILISH (TO'LIQ QO'LLANMA)

Bu bitta faylда — **noldан to jonli saytгача** hamma narsa.
Texnik bilim shart emas, buyruqlarni **nusxalab-joylashtirasiz**, bo'ldi.

---

## 📋 UMUMIY: nima bo'ladi?
1. Server olasiz (internetда doim ishlaydigan kompyuter)
2. Saytни serverга yuklaysiz
3. **Bitta buyruq** bilan hammasi o'rnatiladi (`setup.sh`)
4. Domen ulaysiz → `https://voharesidence.uz`
5. Tayyor — dunyoда hamma ko'radi

> ⚠️ **MUHIM:** Bu sayt SQLite baza va rasm fayllar bilan ishlaydi, shuning uchun
> **oddiy Vercel/Netlify EMAS**, balki **haqiqiy server (VPS)** kerak.

---

## 🅰️ BOSQICH 1 — Server olish

### Variant 1: Oracle Cloud (TEKIN, umrbod)
1. https://www.oracle.com/cloud/free/ → **Start for free**
2. Ro'yxatdan o'ting (Individual, region: Germany Frankfurt)
3. Karta so'raydi — **pul yechilmaydi** (faqat shaxs tasdig'i)
   - ⚠️ **Xalqaro Visa/Mastercard** kerak (Uzcard/Humo emas). Bank ilovasida **xalqaro to'lovни yoqing**, kartada 1-2$ bo'lsin
4. **Compute → Instances → Create Instance:**
   - Image: **Ubuntu 22.04**
   - Shape: **VM.Standard.A1.Flex** (2 CPU, 12GB — tekin)
   - **SSH kalitни yuklab oling** (`.key` fayl) — YO'QOTMANG!
5. **Public IP** ni yozib oling (masalan `130.61.20.15`)

### Variant 2: O'zbek hosting (som bilan, karta muammosi yo'q)
- **ahost.uz** / **ps.uz** → **VPS** (Ubuntu 22.04) oling → ~30 000–100 000 so'm/oy
- Uzcard/Humo bilan to'lanadi. Ular **IP + root parol** beradi.

---

## 🅱️ BOSQICH 2 — Serverga ulanish (SSH)

Windows'da **PowerShell** oching:
```powershell
# Oracle (kalit fayl bilan):
ssh -i C:\yol\private-key.key ubuntu@SERVER_IP

# O'zbek hosting (parol bilan):
ssh root@SERVER_IP
```
> Birinchi ulanишда "yes" deб tasdiqlaysiz. Parol so'ralса — hosting bergan parolни kiriting.

---

## 📤 BOSQICH 3 — Saytni serverга yuklash

Kompyuteringizdаги **`qurilish` papkasини** serverга ko'chiring.

**Eng oson yo'l — WinSCP dasturi** (bepul, grafik):
1. WinSCP'ни o'rnating → serverга ulaning (IP + SSH kalit/parol)
2. `qurilish` papkasini serverда `/var/www/qurilish` ga sudrab tashlang

**⚠️ ALBATTA shu 2 tasi ko'chsin (ichида sizning ma'lumotingiz bor):**
- `qurilish.db` — barcha loyiha, xonadon, matn, sozlama
- `public/uploads/` — barcha bino rasmlari

**Ko'chirMANG** (serverда qayta yaratiladi, faqat joy egallaydi):
- `node_modules/` va `.next/`

---

## ✨ BOSQICH 4 — BITTA BUYRUQ (hammasini o'rnatadi)

Serverда (SSH oynasида), loyiha papkasига kiring va **bitta buyruq**:
```bash
cd /var/www/qurilish

# Domensiz (avval sinash uchun):
sudo bash setup.sh

# YOKI domen bilan (to'liq, HTTPS bilan):
sudo bash setup.sh voharesidence.uz
```

Skript **o'zi hammasini qiladi**:
- ✅ Node.js, nginx, pm2 o'rnatadi
- ✅ Kutubxonalarni yuklaydi (`npm install`)
- ✅ Maxfiy kalit (AUTH_SECRET) yaratadi
- ✅ Saytni quradi (`build`)
- ✅ Doimiy ishga tushiradi (pm2 — server o'chsa ham qayta yonadi)
- ✅ Domen + bepul HTTPS sozlaydi (domen bergan bo'lsangiz)

5-10 daqiqа kutasiz → oxirida **"✅ TAYYOR!"** chiqadi.

---

## 🌍 BOSQICH 5 — Domen ulash

### 5.1. Portlarni ochish (faqat Oracle uchun)
Oracle panel → Instance → **Virtual Cloud Network → Security List → Ingress Rules** → qo'shing:
`0.0.0.0/0` → TCP → **80** va **443** portlar
(Ubuntu ichki devorini `setup.sh` o'zi ochadi.)

### 5.2. Domen DNS
Domen panelida (ahost.uz va h.k.) **A yozuv** qo'shing:
| Turi | Nomi | Qiymati |
|---|---|---|
| A | `@` | SERVER_IP |
| A | `www` | SERVER_IP |
> 5 daqiqа–2 soat kutiladi. `ping voharesidence.uz` bilan tekshiring.

### 5.3. HTTPS
DNS tayyor bo'lgач, agar HTTPS o'rnatilmagan bo'lsa:
```bash
sudo certbot --nginx -d voharesidence.uz -d www.voharesidence.uz
```
🎉 **Sayt jonli: `https://voharesidence.uz`**

---

## 🔒 BOSQICH 6 — Deploydan keyin (MUHIM)

1. **Admin parolини o'zgartiring:**
   `https://voharesidence.uz/admin/login` (`admin@qurilish.uz` / `admin123`)
   → Sozlamalar → "Parolni o'zgartirish"

2. **Zaxira nusxa** (ma'lumotни yo'qotmaslik uchun) — vaqti-vaqti bilan:
```bash
cd /var/www/qurilish
tar -czf ~/voha-backup-$(date +%F).tar.gz qurilish.db public/uploads
```

---

## 🔄 KEYINCHALIK — kod yangilanса
```bash
cd /var/www/qurilish
# yangi fayllarni yuklang (WinSCP), keyin:
npm install
npm run build
pm2 restart voha
```

---

## 🖥️ ADMIN PANEL — kundalik ishlatish (mustaqil)

**Manzil:** `https://voharesidence.uz/admin/login`

| Nima qilish | Qayerda |
|---|---|
| **Yangi loyiha** qo'shish | Loyihalar → "Yangi loyiha qo'shish" (nom, rasm, qavat, tavsif) |
| Loyihани **tahrirlash** | Loyihalar → ✏️ tugma |
| Loyihани **o'chirish** | Loyihalar → 🗑 tugma |
| **Xonadon** qo'shish | Xonadonlar → har loyiha yonida "Xonadon qo'shish" |
| Xonadon **holati/chizma** | Xonadonlar → xonadon ustiga bosing |
| **Bo'limlarni yoqish/o'chirish** | Xonadonlar sahifasi yuqorisi (switch) yoki Sozlamalar |
| **Yangilik** qo'shish | Yangiliklar bo'limi |
| **Sayt matni/rang/aloqa** | Sozlamalar |

> Nom yozganда UZ tilида yozsangiz — RU va EN **avtomatik tarjima** bo'ladi.

---

## ❓ MUAMMOLAR

| Muammo | Yechim |
|---|---|
| Sayt ochilmayapti | `pm2 status` (voha online bo'lsin), `pm2 logs voha` |
| Domen ochilmayapti | DNS hali tarqalmagan — 1-2 soat kuting. Portlar ochiqmi? |
| HTTPS xato | `sudo certbot --nginx -d domen -d www.domen` qayta ishga tushiring |
| Rasm/loyiha yo'q | `qurilish.db` va `public/uploads` ko'chdimi tekshiring |
| Server qayta yondi | pm2 avtomatik ishga tushadi (`pm2 startup` qilingan bo'lsa) |

---

## 📞 QISQACHA — 3 ta asosiy buyruq
```bash
# 1. Ulanish
ssh root@SERVER_IP

# 2. Joylash (bir marta)
cd /var/www/qurilish && sudo bash setup.sh voharesidence.uz

# 3. Yangilash (keyinchalik)
cd /var/www/qurilish && npm run build && pm2 restart voha
```

**Hammasi shu! Server olгач, IP + SSH ma'lumotни bersangiz — men o'zim ham ulanib joylashtira olaman.** 🚀
