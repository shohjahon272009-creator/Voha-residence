# Voha Residence — UX review va reja

Holat: 1-bosqich (audit, reja, wireframe). 2026-11-15.
Dalil: `docs/ux/before/*.jpg` — jonli saytdan (voharesidence.uz) 1440, 768 va 390 px kenglikda olingan skrinshotlar.
Referens (https://ux-ui-atlas-komiljon.komildjonxyz.chatgpt.site/) faqat atamalar lug'ati sifatida ishlatildi: Navbar, Sidebar, Hero section, Bento grid, Minimalism, Editorial design, Glassmorphism, Hover lift, Image zoom on hover, Scroll reveal, Parallax, Marquee, Microinteraction, Sticky navigation. Uning sahifasi ko'chirilmadi.

## Egasi qabul qilgan biznes qoidalar (2026-11-15)

| Savol | Qaror |
|---|---|
| Xonadon narxi saytda | Yashirin qoladi. Detalda "Narxi — menejerdan" va murojaat tugmasi |
| Dashboard, Kanban, mijoz kartasi | amoCRM'da qoladi. Saytda ikkinchi CRM qurilmaydi |
| 3D tanlash | Sintetik "konsept" bloklar va qavatlar, haqiqiy statuslar bilan. "Konsept ko'rinish" deb belgilanadi |
| Deploy | Avtomatik emas. Egasi ko'rib, rozi bo'lgach |

## 1. Ikki auditoriya

### Xaridor (login yo'q)
- **Maqsad:** o'ziga mos bo'sh xonadonni topish, to'lovni tushunish, menejerga raqam qoldirish.
- **Kontekst:** asosan telefondan (Instagram/Telegram reklamasidan keladi), o'zbek tilida, sekin mobil internet.
- **Asosiy CTA:** **Xonadon tanlash**. Bitta. Qolgan hamma harakatlar (qo'ng'iroq, ariza) shu yo'lning oxirida yoki ikkinchi darajali.

### Savdo menejeri (login bor)
- **Maqsad:** saytdan kelgan lidni tez olish, mijozga qo'ng'iroq qilish, voronkada yuritish.
- **Ish joyi:** amoCRM (voronka "Воронка", bosqichlar: Неразобранное → KIRUVCHI/CHIQUVCHI QO'NG'IROQ → … → Bron qildi → Uy xarid qildi).
- **Sayt admin paneli:** xonadon va loyiha kontenti, Sale House sinxroni, sayt statistikasi. Lidlarni boshqarish emas.
- **Asosiy CTA (admin):** "Sale House'dan yangilash" va "Xonadonni tahrirlash".

## 2. User journey

### Xaridor
```
Reklama (IG/TG) ─► Hero: "Xonadon tanlash"
   ─► Majmua (bloklar xaritasi / 3D konsept)        ← progressive disclosure
      ─► Bino (bo'sh xonadonlar soni, qavatlar)
         ─► Qavat (xonadonlar sxemasi: bo'sh / bron / sotilgan + matn)
            ─► Xonadon detali (xona, m², status, planirovka, interyer, "Narxi — menejerdan")
               ─► Murojaat (ism ixtiyoriy, telefon) ─► Muvaffaqiyat: "Menejer 15 daqiqada…" yoki xato + ma'lumot saqlanadi
Har qadamda: "orqaga", "boshidan" va 3D ishlamasa ro'yxat.
```

### Menejer
```
Sayt formasi ─► bookings (sayt bazasi) + Telegram xabari + amoCRM lid ("Sayt" tegi, izohda xonadon)
   ─► amoCRM: Неразобранное → qo'ng'iroq → … (sotuvni tasdiqlash amoCRM qoidasida)
   ─► Sale House: xonadon statusi ─► saytga sinxron (Admin → Sale House)
```

## 3. Information architecture (taklif)

```
Bosh sahifa  (/uz)
 ├─ Hero: majmua nomi, bitta CTA "Xonadon tanlash"
 ├─ Xonadon tanlash (3D konsept / ro'yxat)  ← asosiy blok, landingning yuragi
 ├─ Majmua haqida: joylashuv, afzalliklar (faqat tasdiqlangan faktlar)
 ├─ To'lov shartlari (standart oylik to'lov, "qolgan summa — menejerdan")
 ├─ Qurilish jarayoni (video + bosqichlar)
 ├─ Loyihalar (jarayonda / topshirilgan)
 └─ Aloqa (telefon, manzil, forma)
Xonadonlar   (/uz/apartments)  — to'liq tanlash, filtr, deep-link
Loyihalar    (/uz/projects, /uz/projects/[id])
Biz haqimizda, Yangiliklar, Aloqa
Xodimlar uchun: "Kirish" — footer'dagi alohida havola (/admin/login), navbar'da emas
```

## 4. Eng muhim 5 muammo (ekran va sabab bilan)

1. **Hero'da uchta raqobatchi CTA va tasdiqlanmagan raqamlar.** (`before/home-1440.jpg`, `home-390.jpg`)
   - Navbar'da "Qo'ng'iroq buyurtma qilish" (to'q sariq, eng yorqin), hero'da "Xonadon tanlash" va "Uyingizni toping", o'ng pastda yashil qo'ng'iroq tugmasi. Ko'z birinchi navbar tugmasiga tushadi, asosiy yo'l (xonadon tanlash) ikkinchi darajaga tushib qoladi.
   - Hero statistikasida "2500+ mijoz", "A'LO sifat". Shu sahifaning pastida esa "200+ oila tanlovi" yozilgan. Raqamlar bir-biriga zid va manbasi yo'q, bu ishonchni buzadi.
2. **Bosh sahifa juda uzun va bo'sh joylar ko'p.** (`before/home-390-full.jpg`: 27 649 px ≈ 33 telefon ekrani; `home-1440-full.jpg` ≈ 19 400 px)
   - 17 ta bo'lim bor. To'lov ikki marta (kalkulyator va "Bank foizisiz"), ariza beshta joyda.
   - Scroll reveal animatsiyasi ochilmaguncha katta bo'sh maydonlar ko'rinadi. Hisoblagichlar "0+ / 0 / 0K" bo'lib turadi (animatsiya yoki skript ishlamasa, xaridor shuni ko'radi).
3. **Xonadon tanlash: ishonchsiz ma'lumot va telefonda filtr ekranni egallaydi.** (`before/apartments-390-full.jpg`, `home-1440-full.jpg`)
   - Jonli bazada 80 ta xonadon bir loyiha ichida raqami va qavati bilan takrorlangan (masalan, loyiha 24: №82, 7-qavat — 2 ta). Kartochkalarda "№7, №7, №13, №13" ko'rinadi.
   - Loyiha 32 (Sale House'dan kelgan blok) — 67 xonadon, birortasida planirovka yo'q, kartochkada bo'sh rasm o'rni turadi.
   - 390 px'da filtr paneli butun birinchi ekranni egallaydi, natija ko'rinmaydi. Majmua → bino → qavat → xonadon zanjiri yo'q, hammasi bitta tekis ro'yxat.
4. **To'lov bloki tanlovsiz holatda bo'sh katta karta.** (`before/home-1440-full.jpg`, "To'lov shartlari")
   - Xonadon tanlanmagan bo'lsa, to'q yashil katta panelda faqat "To'lovni ko'rish uchun yuqoridan xonadonni tanlang" yozuvi turadi. Darhol pastida yana "Bank foizisiz, o'z uyingizga" bo'limi keladi: bir xil mavzu ikki marta.
5. **To'qilgan ijtimoiy isbot va mazmun xatolari.**
   - "Mijozlar fikri" bo'limidagi sharhlar haqiqiy mijozdan olinmagan (`VohaStory.tsx`, Testimonials).
   - Tarix chizig'ida "2013" ikki marta. "Topshirilgan" loyihalar sotuvdagilar bilan aralash turibdi.
   - Brief bo'yicha tasdiqlanmagan sharh, mijoz soni va mukofot ko'rsatilmasligi kerak.

### Menejer tomonida
- **Arizalar amoCRM'ga to'liq tushmagan:** 5–6-noyabrdagi xonadon arizalari yuborilmagan edi. Tuzatildi.
- **amoCRM API yopiq:** 15-noyabrdan API yozuvi 402 (to'lov) qaytaryapti. Bu akkaunt egasi hal qiladigan masala.
- **Admin panelda ikkinchi CRM:** "Arizalar", "Murojaatlar", "Mijozlar", "Sotuvlar", "Dashboard" sahifalari amoCRM bilan ustma-ust tushadi. Qaror bo'yicha Kanban qurilmaydi. Admin dashboard faqat sayt statistikasi bo'ladi va bu nom bilan belgilanadi.

## 5. Wireframe'lar

### Bosh sahifa — desktop (1440)
```
┌───────────────────────────────────────────────────────────────────────┐
│ VOHA   Xonadonlar  Loyihalar  To'lov  Aloqa        +998…   UZ RU EN  │ sticky, 64px, shaffof→qattiq
├───────────────────────────────────────────────────────────────────────┤
│ [ RASM: blok, to'liq kenglik, 88vh ]                                   │
│  Urganch · Shovot kanali bo'yida              ┌─────────────────────┐ │
│  Voha Residence —                            │ Hozir sotuvda        │ │ glass panel (yagona)
│  kanal bo'yidagi uylar                       │ 1-blok · 34 bo'sh    │ │ jonli ma'lumot
│  [ Xonadon tanlash → ]   Qo'ng'iroq: +998…   │ 10-blok · 47 bo'sh   │ │
│                                              │ A blok · 45 bo'sh    │ │
└───────────────────────────────────────────────┴─────────────────────┘─┘
│ XONADON TANLASH (editorial sarlavha, 12-ustunli grid)                  │
│ ┌──────────── 3D konsept / sxema (8 ust.) ─────┐ ┌─ Panel (4 ust.) ──┐ │
│ │ bloklar → bino → qavat                        │ │ Breadcrumb        │ │
│ │ [◀ oldingi] [reset] [keyingi ▶]               │ │ filtr: xona, m²   │ │
│ │ "Konsept ko'rinish — texnik reja emas"        │ │ ro'yxat / detal   │ │
│ └───────────────────────────────────────────────┘ └───────────────────┘ │
│ Majmua haqida: 3 ta fakt (ustunlar, karta emas)                        │
│ To'lov: oylik to'lov jadvali 1/2/3/4 xona + "qolgan summa — menejerdan" │
│ Qurilish jarayoni (video + 5 bosqich)  │  Loyihalar (jarayonda | topsh.) │
│ Aloqa: forma + xarita                                                  │
│ Footer: … · Xodimlar uchun kirish                                      │
```

### Bosh sahifa — mobil (390)
```
┌──────────────────────┐
│ VOHA            ☰    │ 56px sticky
│ [rasm 70vh]          │
│ Voha Residence —     │
│ kanal bo'yidagi uylar│
│ [Xonadon tanlash →]  │ 52px balandlik, to'liq kenglik
│ 1-blok 34 · 10-blok… │ chiplar, gorizontal
├──────────────────────┤
│ Bino tanlang (sxema) │
│ [1] [10] [11] [A]    │ segment
│ Qavat: ◀ 5 ▶         │
│ ▢▢▣▢ legend+matn     │
│ Filtr ▾ (yopiq)      │ bottom sheet ochiladi
│ Natija ro'yxati      │
└──────────────────────┘
Xonadon detali → bottom sheet (90vh): "×" yopish, Esc, orqaga tugma
```

### Xonadon detali
```
┌─────────────────────────────────────┐
│ ← Qavatga qaytish     1-blok · 5-q. │
│ №21   ● Bo'sh                       │ rang + matn + belgi
│ 2 xona · 87.3 m² · 5-qavat          │
│ Narxi: menejerdan bilib oling       │
│ [Planirovka] [Interyer (konsept)]   │ tablar; rasm yo'q bo'lsa — "Planirovka tez orada"
│ Oylik to'lov: 5 mln so'm (standart) │
│ [ Murojaat qoldirish ]  [ Qo'ng'iroq ]│
└─────────────────────────────────────┘
```

## 6. Sahifa holatlari rejasi

| Ekran | Yuklanmoqda | Bo'sh | Xato | Muvaffaqiyat | Boshqa |
|---|---|---|---|---|---|
| Xonadon tanlash | skeleton sxema + "Yuklanmoqda" | "Bu filtrda bo'sh xonadon yo'q" + filtrni tozalash | "Ma'lumot olinmadi" + qayta urinish | — | WebGL yo'q / sust qurilma → ro'yxat va rasm |
| Qavat sxemasi | skeleton | "Bu qavatda bo'sh xonadon qolmadi" + qo'shni qavat | — | — | sotilgan: kulrang + "Sotilgan" + ✕ |
| Xonadon detali | rasm skeleton | planirovka yo'q → "Tez orada", ariza baribir | — | — | sotilgan → "O'xshash bo'shlarini ko'rsatish" |
| Murojaat formasi | tugma "Yuborilmoqda…", disabled (ikki bosish → 1 ariza) | — | xato matni + kiritilgan ma'lumot saqlanadi | "Qabul qilindi, menejer qo'ng'iroq qiladi" | limit: "Ko'p urinish — qo'ng'iroq qiling" |
| Admin statistika | skeleton | "Bu davrda ariza yo'q" | "Ma'lumot olinmadi" | — | "Demo" belgisi faqat demo bazada |

## 7. Implementatsiya rejasi (navbat)

1. **Design tokens** (`DESIGN.md`, `src/app/globals.css`, Tailwind): surface, text, accent, border, status, spacing, radius, shadow va motion.
2. **Landing:**
   - Navbar'da bitta CTA.
   - Hero kontekstli bo'ladi (jonli bo'sh xonadonlar soni) va tasdiqlanmagan raqamlar olib tashlanadi.
   - Bo'limlar 17 tadan ~8 taga qisqaradi, takroriy to'lov va ariza bloklari birlashtiriladi.
   - "Kirish" havolasi footer'da turadi.
3. **Xonadon tanlash:** majmua → bino → qavat → xonadon zanjiri.
   - 3D konsept (three.js) faqat kerak bo'lganda yuklanadi.
   - Fallback: sxema va ro'yxat.
   - Mobil detal bottom sheet ko'rinishida chiqadi.
4. **Forma:** ikki marta bosishdan himoya, xatoda ma'lumot saqlanadi, dialog yopilganda fokus qaytadi.
5. **Admin:** sayt statistikasi (davr filtri, arizalar dinamikasi, xonadon statuslari), bitta manba — sayt bazasi. Kanban amoCRM'da qoladi.
6. **Tekshiruv:** typecheck, lint, build, 390/768/1440 skrinshotlar, kontrast, keyboard, FPS va yuklanish o'lchovi.

### Ma'lumot muammolari (egasining roziligi kerak, kod emas)
- 80 ta takroriy xonadon (bir loyiha, bir raqam, bir qavat). Tozalash prod bazaga yozuv bo'lgani uchun avval ro'yxatni ko'rsatib, rozilik olinadi.
- Loyiha 32'da (67 xonadon) planirovka yo'q.
- Hero statistikasi admin sozlamalaridan keladi: egasi tasdiqlagan raqamlarni kiritishi kerak.

---

# 2-bosqich: bajarilgan ish (2026-11-16)

Holat: kod lokal, `3d-tur` branchida commit qilinmagan. Saytga chiqarilmagan. Sinov faqat test nusxada (`C:\Users\user\voha-test`, lokal sqlite), jonli bazaga yozilmagan.

## O'zgargan fayllar

| Fayl | Nima |
|---|---|
| `src/app/globals.css`, `tailwind.config.js` | Design tokens (`--v-*`), fokus konturi, anchor uchun `scroll-margin-top` |
| `src/app/[lang]/page.tsx` | Bosh sahifa 17 bo'limdan 7 taga: hero, xonadon tanlash, majmua, to'lov, qurilish jarayoni, loyihalar, aloqa |
| `src/components/website/Hero.tsx` | Qayta yozildi: bitta rasm, bitta CTA, bazadan "Hozir sotuvda" paneli |
| `src/components/website/ComplexFacts.tsx`, `PaymentPlan.tsx` | Yangi: faktlar va standart oylik to'lov jadvali (sozlamalardan) |
| `src/components/website/picker/*` | Yangi: majmua → blok → qavat → xonadon, konsept 3D, ro'yxat fallback, filtr, detal, to'lov |
| `src/components/website/ApartmentAndPayment.tsx` | Tanlovchi va murojaat oynasini bog'laydi |
| `src/components/website/BookingModal.tsx`, `ContactSection.tsx` | Fokus boshqaruvi, ikki marta bosishdan himoya, kontrast |
| `src/lib/contactActions.ts` | Serverda takroriy ariza himoyasi (2 daqiqa), xonadon arizalari amoCRM'ga |
| `src/components/common/Navbar.tsx`, `WebsiteLayout.tsx` | Bitta CTA, footer'da "Xodimlar uchun kirish", tasdiqlanmagan matn olib tashlandi |
| `src/app/admin/dashboard/*`, `src/lib/siteStats.ts`, `src/lib/amocrm.ts` | "Sayt statistikasi": davr filtri, arizalar dinamikasi, xonadon statuslari, amoCRM voronkasi (faqat o'qish) |
| `src/app/[lang]/template.tsx` | O'chirildi: har sahifada kontentni yopib turadigan parda |

Bosh sahifadan olib tashlangan (fayllari qoldi, boshqa sahifalarda ishlatiladi): kirish ekrani, chiqishdagi popup, marquee, tarix chizig'i, to'qilgan sharhlar, "0+ / 0K" hisoblagichlar, uy tanlash o'yini.

## Qarorlar

- **Bitta asosiy CTA:** "Xonadon tanlash" (navbar, hero, to'lov bo'limi bir joyga olib boradi). Telefon ikkinchi darajali matnli havola.
- **Narx yo'q:** detalda "Narxi — menejerdan bilib oling", boshlang'ich to'lov foizi va standart oylik to'lov ko'rinadi.
- **"0% foiz / bank foizisiz" da'vosi yangi bo'limlarga ko'chirilmadi:** 10–11-bloklar ipoteka bloklari, egasi tasdiqlashi kerak.
- **Takroriy xonadonlar:** jonli bazadagi 80 ta takror to'liq bir xil nusxa (holat, xona, maydon). Tanlovchi ularni bir marta ko'rsatadi; farq qilsa band holat ustun.
- **3D:** faqat ≥768 px, 4 dan ko'p yadro, WebGL bor va reduced motion yo'q bo'lsa avtomatik. Aks holda ro'yxat. "3D / Ro'yxat" tugmasi doim bor.
- **Kanban va mijoz kartasi qurilmadi:** amoCRM'da qoladi (egasining qarori). `tel:` havolasi oddiy qo'ng'iroq havolasi, VoIP emas.
- **Ranglar:** brandbook'dan o'zgarishsiz (DESIGN.md).

## Sinov natijalari (avtomatik brauzer, test nusxa)

| Tekshiruv | Natija |
|---|---|
| Typecheck (`tsc --noEmit`) | 0 xato |
| ESLint (`src`) | 0 xato, 1 eski ogohlantirish (`<img>`) |
| Ma'lumot testi (`picker/data.test.ts`) | o'tdi |
| Xaridor oqimi 1440 px: blok → qavat → xonadon → to'lov → ariza | ishladi, konsol xatosi yo'q |
| Ikki marta bosish (3 ta ketma-ket yuborish) | bitta ariza, "muvaffaqiyat" holati |
| Xato holati (noto'g'ri telefon) | xato matni chiqdi, ism va izoh saqlandi |
| Sotilgan xonadon | murojaat tugmasi yo'q, "O'xshash bo'sh xonadonlar" bor |
| WebGL yo'q | ro'yxat rejimi, "Bu qurilmada 3D ishlamaydi" izohi, 4 blok ro'yxatda |
| Reduced motion / 4 yadro | ro'yxat rejimi, silliq scroll (Lenis) o'chiq |
| Klaviatura | strelkalar kataklar orasida yuradi, Enter detalni ochadi, fokus konturi 2 px |
| Mobil 390 px | gorizontal scroll yo'q; filtr sheet'da; detal sheet 760/844 px; 44 px dan kichik tugma yo'q |
| Mobil: sheet ichidan ariza | forma sheet ustida emas, o'rnida ochiladi; yopilgach detal qaytadi |
| Deep link | `#xonadon=<blok>-<qavat>-<xonadon>` yoziladi, "Boshidan" tozalaydi |
| 3D bo'sh turganda | 2 soniyada 0 ta chizish chaqiruvi (render faqat kerak bo'lganda) |
| 3D kamera o'tishi | 39–67 kadr/s (headless Chrome, dasturiy render; haqiqiy qurilmada o'lchanmagan) |
| three.js yuklanishi | sahifa ochilishida so'ralmaydi, tanlovchi yaqinlashganda va brauzer bo'shaganda yuklanadi |
| Sahifa balandligi | 1440 px: ~19 400 → 9 537 px; 390 px: 27 649 → 11 504 px |

Production build (`next build --webpack`, test nusxa, lokal server, headless Chrome):

| Ko'rsatkich | 390 px | 1440 px |
|---|---|---|
| Build | o'tdi | o'tdi |
| Server javobi (TTFB, lokal) | 0.05–0.07 s | 0.05–0.07 s |
| LCP | 0.8 s (sarlavha) | 0.3 s (hero rasmi) |
| CLS (sahifa ochilishida) | 0 | 0 |
| HTML hajmi | 283 KB | 283 KB |

Bu raqamlar lokal serverda olingan: tarmoq kechikishi yo'q, shuning uchun jonli saytdagi tezlik kafolati emas.

## Qolgan cheklovlar

- Tezlik faqat lokal serverda o'lchangan; jonli server va haqiqiy telefonda o'lchanmagan.
- Test nusxada build Turbopack bilan ishlamadi (papka ulanishi sababli), webpack bilan o'tdi. Asosiy papkada Turbopack build qilinmagan.
- Ekran o'quvchi (screen reader) bilan qo'lda sinalmagan.
- 3D filtrni aks ettirmaydi (filtr ro'yxat va kataklarda ishlaydi). 3D'da faqat gorizontal burish bor.
- Hero sarlavhasi o'zbek tilida admin sozlamasidan olinadi; jonli saytda hozir "Yangi hayotni biz bilan boshlang!" turibdi.
- "Shovot kanali bo'yida" joylashuvi eski sayt matnidan olingan: hamma sotuvdagi bloklar uchun to'g'riligini egasi tasdiqlashi kerak.
- amoCRM API yozuvi 402 qaytaryapti (akkaunt to'lovi). 2 ta eski lid yuborilmagan.
- Boshqa sahifalar (Biz haqimizda, Loyihalar, Yangiliklar) yangi tokenlarga o'tkazilmagan.
- `/uz/3d` sahifasi boshqa sessiyada qilingan; bu sinovlarga kirmaydi.

## Qo'shimcha tekshiruv (brauzerda)

- Hero rasmi keng ekranda 1280 px'li WebP nusxani yuklaydi (`/uploads/_w/1280/…webp`), asl JPG emas.
- 3D majmua ko'rinishi: 4 blok kadrda, yorliqlari o'qiladi (`after/after-3d-complex-1440.jpg`).
- Admin "Sayt statistikasi": davr filtri 7/30/90 ishlaydi, raqamlar davrga mos o'zgaradi (30 kun — 13 ariza, 7 kun — 7 ariza). "Bo'sh xonadonlar" 121 — hero panelidagi son bilan bir xil. Test bazada "DEMO baza" belgisi chiqadi, amoCRM ulanmaganda blok buni yozadi. 390 px'da gorizontal scroll yo'q.

## Dizayn atamalari — shu loyihadagi misol bilan

| Atama | Ma'nosi | Loyihadagi misol |
|---|---|---|
| User journey | Foydalanuvchining maqsadga yetguncha bosib o'tadigan yo'li | Reklama → hero → blok → qavat → xonadon → ariza |
| Information architecture | Sahifa va bo'limlarning tuzilishi | Bosh sahifadagi 7 bo'lim va menyudagi 5 sahifa |
| CTA | Foydalanuvchidan kutilgan asosiy harakat tugmasi | "Xonadon tanlash" (navbar, hero, to'lov bo'limi) |
| Wireframe | Sahifaning bezaksiz chizma rejasi | Shu hujjatning 5-bo'limidagi sxemalar |
| Design tokens | Rang, o'lcham, soya kabi qiymatlarning nomlangan yagona manbasi | `globals.css` dagi `--v-accent: #D18E5B`, Tailwind'da `bg-cta` |
| Visual hierarchy | Ko'z birinchi nimani ko'rishi tartibi | Hero'da avval yirik sarlavha, keyin bronza tugma, so'ng panel |
| Editorial design | Jurnalga o'xshash yirik sarlavha va assimetrik joylashuv | "Majmua haqida": sarlavha chapda, matn o'ngda, pastida 3 ustun |
| Grid | Elementlar tekislanadigan ustunlar to'ri | Tanlovchi: 8 ustun ko'rinish + 4 ustun detal paneli |
| Whitespace | Elementlar orasidagi bo'sh joy | Bo'limlar oralig'i 64–128 px (`--v-section-y`) |
| Typography scale | Shrift o'lchamlarining izchil qatori | `text-display` → `text-h1` → `text-h2` → `text-body` |
| Glassmorphism | Yarim shaffof, orqasi xiralashgan panel | Faqat hero'dagi "Hozir sotuvda" paneli |
| Sticky navigation | Scroll qilganda ko'rinib turadigan menyu | Navbar; anchor sarlavhasini to'smasligi uchun `scroll-margin-top` |
| Progressive disclosure | Ma'lumotni bosqichma-bosqich ochish | Majmua → blok → qavat → xonadon, har qadamda faqat keraklisi |
| Breadcrumb | Hozir qayerda turganini ko'rsatuvchi yo'l | "Majmua › 1-blok › 3-qavat › №61" |
| Cutaway | Binoning ichini ko'rsatish uchun ustini "kesish" | Qavat tanlanganda yuqori qavatlar xiralashib, xonadon kataklari ochiladi |
| Fallback | Asosiy usul ishlamaganda zaxira ko'rinish | WebGL yo'q yoki telefon bo'lsa 3D o'rniga ro'yxat |
| Bottom sheet | Telefonda pastdan chiqadigan oyna | Xonadon detali va filtr 390 px'da |
| Empty / loading / error state | Ma'lumot yo'q, yuklanmoqda yoki xato holatlari | "Planirovka tez orada", "Hisoblanmoqda…", "amoCRM javob bermadi" |
| Microinteraction | Harakatga qisqa vizual javob | Tugma bosilganda biroz kichrayadi; 3D'da qavat ustiga kelganda yorishadi |
| Reduced motion | Harakatni kamaytirishni so'ragan foydalanuvchi rejimi | Bu rejimda 3D avtomatik yoqilmaydi, silliq scroll o'chadi |
| Touch target | Barmoq bilan bosiladigan maydon o'lchami | Hamma tugma kamida 44×44 px, asosiy CTA 52 px |
| Kontrast (WCAG) | Matn va fon yorqinligi nisbati | Tugma matni bronzada 6.34:1 (talab 4.5:1) |
| Focus state | Klaviatura bilan yurganda tanlangan element belgisi | 2 px bronza kontur |
| Deep link | Sahifaning aniq holatiga olib boradigan havola | `#xonadon=24-3-1214` — shu xonadon ochiq holda |
| LCP / CLS | Eng katta element chizilish vaqti / tartib siljishi | Lokal o'lchov: LCP 0.3–0.8 s, CLS 0 |
| Render on demand | 3D faqat o'zgarish bo'lganda chiziladi | Kamera tinch turganda 2 soniyada 0 ta chizish |
| Lazy loading | Kerak bo'lgandagina yuklash | three.js tanlovchi ekranga yaqinlashganda yuklanadi |
