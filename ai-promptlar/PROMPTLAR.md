# Voha Residence — AI rasm va video promptlari

Sayt uchun tiniq, professional rasm va videolarni AI generatorlarda yaratish uchun promptlar.
Generatorlar: **Kling, Google Veo, Runway** (video), **Midjourney, Nano Banana, Flux** (rasm).

## Asosiy qoida

**Har doim reference rasmni yuklang** (image-to-image / "start frame"). Shunda AI binoni o'zgartirmaydi:
qavatlar soni, derazalar va ranglar o'z holicha qoladi, faqat sifati, yorug'ligi va kayfiyati yaxshilanadi.
Natijada bino o'zgarib qolsa (qavat ko'payib ketsa, deraza shakli boshqacha bo'lsa) — **saytga qo'ymaymiz**,
chunki bu xaridorni aldash bo'ladi.

Promptni **inglizcha** yuboring — generatorlar inglizchani yaxshi tushunadi. O'zbekcha tarjima faqat tushunish uchun.

| # | Nima | Reference fayl (`reference/` papkasida) | Format |
|---|------|------------------------------------------|--------|
| 1 | Hero video — dron | `1-hero-dron.jpg` (hozirgi hero videodagi 3 ta bino) | Video, 16:9 |
| 2 | Bino tashqi ko'rinishi | `2-tashqi.jpg` yoki `2-tashqi-variant.jpg` | Rasm, 16:9 |
| 3 | Kechki ko'rinish | `3-kechki.jpg` | Rasm, 16:9 |
| 4 | Xonadon ichi (interyer) | — (reference yo'q, faqat matn) | Rasm, 16:9 |
| 5 | Oila hovlida | `5-hovli.jpg` (bolalar maydonchasi bor hovli) | Rasm, 16:9 yoki 4:5 |
| 6 | Qurilishdan tayyor binogacha | Oxirgi kadr: `6-end-tayyor.jpg`. **Boshlang'ich kadr — qurilish maydonining haqiqiy surati kerak (bizda yo'q)** | Video, 16:9 |

---

## 1. Hero video — dron ko'rinishi

**Reference:** `reference/1-hero-dron.jpg` · **Generator:** Kling / Veo / Runway · 16:9, 4K, 5–10 soniya

```
Cinematic 4K aerial drone shot slowly orbiting a modern residential complex, exactly matching the reference image architecture, beige stone facade with large glass sections, golden hour sunlight, warm soft shadows, clear blue sky with a few soft clouds, landscaped courtyard with green trees and walkways, smooth stabilized gimbal movement, shallow atmospheric haze, ultra sharp details, photorealistic, architectural photography style, shot on DJI Inspire 3, 24fps, no text, no watermark
```

> **Tarjima:** Turar-joy majmuasi atrofida sekin aylanuvchi kinematografik dron kadri. Arxitektura aynan reference'dagidek: bej tosh fasad, katta oynali qismlar. Oltin soat (quyosh botishi oldidan) yorug'i, yumshoq iliq soyalar, bir-ikki bulutli toza moviy osmon, yashil daraxtli obodonlashtirilgan hovli. Silliq, barqaror kamera harakati, ozgina havo tumanligi, juda tiniq detallar, fotorealistik. Yozuv va suv belgisi yo'q.

## 2. Bino tashqi ko'rinishi — asosiy rasm

**Reference:** `reference/2-tashqi.jpg` (yoki `2-tashqi-variant.jpg`) · 16:9

```
Professional architectural photograph of the residential building from the reference image, keep architecture, colors and proportions exactly the same, eye-level view, golden hour light, crisp sharp facade details, clean glass reflections, manicured lawn and young trees in front, clean sidewalk, clear sky, photorealistic, 8K, high dynamic range, shot on Canon EOS R5 with 24mm tilt-shift lens, perfectly straight vertical lines, no people, no text, no watermark
```

> **Tarjima:** Reference'dagi binoning professional arxitektura surati. Arxitektura, ranglar va nisbatlar aynan o'zgarmasin. Ko'z balandligidan ko'rinish, oltin soat yorug'i, fasad detallari tiniq, oynalarda toza aks. Oldida qirqilgan maysa va yosh daraxtlar, toza yo'lak, ochiq osmon. Vertikal chiziqlar mutlaqo tik. Odam, yozuv va suv belgisi yo'q.

## 3. Kechki ko'rinish — "daxshat" effekt

**Reference:** `reference/3-kechki.jpg` · 16:9

```
Same building from the reference image at blue hour dusk, warm interior lights glowing in windows, facade architectural lighting, deep blue sky, reflections on wet pavement, luxurious calm atmosphere, photorealistic architectural photography, ultra sharp, 8K, straight verticals, no text, no watermark
```

> **Tarjima:** Xuddi shu bino "moviy soat"da (quyosh botgandan keyin). Derazalarda iliq chiroqlar yonib turadi, fasadda arxitektura yoritgichlari, quyuq moviy osmon, ho'l asfaltda aks. Hashamatli, sokin kayfiyat, juda tiniq.

## 4. Xonadon ichi — interyer

**Reference:** yo'q (faqat matn bilan yaratiladi) · 16:9

```
Bright modern apartment interior, spacious living room with large window, light oak wooden floor, beige and white walls, minimalist furniture, soft natural daylight, warm cozy atmosphere, view of green courtyard through the window, professional real estate interior photography, ultra sharp, 8K, wide angle 16mm, straight verticals, no people, no text, no watermark
```

> **Tarjima:** Yorug', zamonaviy xonadon ichi: katta derazali keng mehmonxona, och eman parket, bej-oq devorlar, minimalist mebel, yumshoq kunduzgi yorug'lik, iliq va shinam muhit, derazadan yashil hovli ko'rinadi. Professional ko'chmas mulk surati, keng burchakli obyektiv.
>
> ⚠️ Bu **namuna interyer**. Saytda "Namuna dizayn" deb yozib qo'yish kerak — topshiriladigan xonadon holati boshqacha bo'lishi mumkin.

## 5. Hayot kadri — oila hovlida

**Reference:** `reference/5-hovli.jpg` · 16:9 (sayt) yoki 4:5 (Instagram)

```
Happy Uzbek family walking in a green landscaped courtyard of a modern residential complex, children playing near a playground, warm golden hour light, natural candid moment, residential building from the reference image softly blurred in the background, photorealistic lifestyle photography, shot on Sony A7IV 50mm f/1.8, ultra sharp subjects, 4K, no text, no watermark
```

> **Tarjima:** Zamonaviy turar-joy majmuasining yashil hovlisida sayr qilayotgan baxtli o'zbek oilasi, bolalar o'yin maydonchasida o'ynaydi. Oltin soat yorug'i, tabiiy (sahnalashtirilmagan) lahza, orqada reference'dagi bino yumshoq xiralashgan. Odamlar juda tiniq.

## 6. Qurilish jarayoni → tayyor bino (video)

**Boshlang'ich kadr (start frame):** qurilish maydonining **haqiqiy** surati — poydevor yoki karkas bosqichi. Bizda hozir yo'q: ofisdan yoki Telegram kanaldagi qurilish suratlaridan oling.
**Oxirgi kadr (end frame):** `reference/6-end-tayyor.jpg` · 16:9, 5–10 soniya

```
Smooth cinematic time-lapse transition of a residential building being constructed from foundation to completion, cranes and scaffolding gradually disappearing, facade appearing floor by floor, ending exactly on the finished building from the end frame, static camera, golden hour, photorealistic, 4K, no text
```

> **Tarjima:** Binoning poydevordan to tayyor holatigacha qurilishini ko'rsatuvchi silliq kinematografik "time-lapse". Kranlar va havozalar asta yo'qoladi, fasad qavatma-qavat paydo bo'ladi, oxirida aynan end frame'dagi tayyor bino. Kamera qimirlamaydi.
>
> Muhim: start frame va end frame **bir xil burchakdan** olingan bo'lishi kerak, aks holda o'tish g'alati chiqadi.

---

## Har bir promptga qo'shing — negative prompt

Generatorda "Negative prompt" maydoni bo'lsa, shuni yozing:

```
blurry, low quality, cartoon, illustration, 3D render look, plastic, oversaturated, distorted windows, warped lines, extra floors, deformed people, text, watermark, logo
```

> **Tarjima:** xira, past sifat, multfilm, rasm-illyustratsiya, 3D render ko'rinishi, plastmassadek, haddan tashqari rang, qiyshaygan derazalar, egilgan chiziqlar, ortiqcha qavatlar, buzilgan odamlar, yozuv, suv belgisi, logotip.

## Sozlamalar

- **O'lcham:** sayt uchun **16:9**, Instagram post uchun **4:5**, Reels/Stories uchun **9:16**.
- **Sifat:** eng yuqori qiymatni tanlang (4K / "High quality" / "Professional mode").
- **Midjourney:** prompt oxiriga `--ar 16:9 --style raw --v 7` qo'shing (`--style raw` — kamroq "AI ko'rinish", ko'proq foto).
- **Video:** 5–10 soniya, kamera **sekin** harakatlansin — tez harakat xiralik va buzilish beradi.
- Har promptdan **3–4 variant** yarating va eng real ko'ringanini tanlang.

## Tayyor bo'lgach

Fayllarni (eng yuqori sifatda, siqilmagan holda — Telegram'da "fayl sifatida" yuboring) menga bering.
Men tekshiraman (bino o'zgarmaganmi), saytga moslab tiniq qilib joylashtiraman.
