# Voha Residence — DESIGN.md

Yo'nalish: premium architectural landing. Editorial design (yirik sarlavha, katta fotosurat, assimetrik 12 ustunli grid), ko'p whitespace, kam bezak. Brend: to'q yashil `#014242` va bronza `#D18E5B` (rasmiy brandbook).

Tokens manbasi: `src/app/globals.css` (`--v-*`) va `tailwind.config.js`. Eski sinflar (`bg-primary`, `text-accent`) ishlashda davom etadi; yangi kod faqat tokenlardan foydalanadi.

## Rang rollari

Ranglar rasmiy brandbook'dan (Kvadrat Agency, 02.06.2024, 11–12-betlar) olingan va o'zgartirilmagan.
Asosiy: bronza `#D18E5B`, qora `#1C1B17`. Qo'shimcha: `#014242`, `#828C4C`, `#8B9E85`, `#DAB791`, `#FFE0B2`, `#9F825D`.

| Rol | Token / Tailwind | Qiymat | Qayerda | Kontrast (o'lchangan) |
|---|---|---|---|---|
| Sahifa foni | `--v-canvas` / `bg-canvas` | #F4EFE4 (saytning avvalgi foni) | yorug' bo'limlar | — |
| Panel | `--v-surface` / `bg-surface` | #FFFFFF | forma, detal paneli | — |
| To'q bo'lim | `--v-inverse` / `bg-inverse` | #014242 (brend) | hero, to'lov, footer | — |
| Asosiy matn | `--v-text` / `text-ink` | #1C1B17 (brend) | sarlavha, matn | canvasda 15.03:1 |
| Ikkinchi matn | `text-ink-muted` | brend qorasi 72% | izoh, manba | canvasda 6.40:1, oqda 6.79:1 |
| To'q fondagi matn | `text-ink-inverse`, `-muted` | oq, oq 78% | hero, to'lov | #014242 ustida 11.29:1 va 7.48:1 |
| CTA foni | `--v-accent` / `bg-cta` | #D18E5B (brend) | asosiy tugma, fokus konturi | — |
| CTA matni | `text-cta-ink` | #1C1B17 (brend) | tugma ustidagi matn | bronzada 6.34:1 |
| Yorug' fondagi urg'u matni | `text-accent-text` | #014242 (brend) | kicker, faol havola | canvasda 9.85:1 |
| Chegara | `border-line`, `border-line-strong` | #E2DACB, #C9BFAE | bo'luvchi chiziqlar | — |
| Bo'sh / Bron / Sotilgan / Xato | `text-st-*` + `bg-st-*-bg` | #1F7A4D / #8A5A00 / #5B6470 / #B42318 | faqat status belgilari | oqda 5.32:1 va yuqori |

Qoidalar:
- Bronza `#D18E5B` yorug' fonda matn sifatida ishlatilmaydi (oqda 2.72:1), `#9F825D` ham (3.60:1). Yorug' fondagi urg'u matni brend yashili bilan beriladi.
- Oq matn bronza tugmada ishlatilmaydi (2.72:1). Tugma matni brend qorasi.
- Status ranglari brandbook'da yo'q: ular faqat "bo'sh / bron / sotilgan" belgilarida ishlatiladi va har doim matn hamda belgi bilan birga keladi (● Bo'sh, ◐ Bron, ✕ Sotilgan).

## Typography scale

Shrift: sarlavha Montserrat, matn Inter. Fluid o'lchamlar, nisbat ~1.25.

| Sinf | O'lcham | Ishlatilishi |
|---|---|---|
| `text-display` | 40–88 px | hero sarlavhasi (sahifada bitta) |
| `text-h1` | 32–56 px | bo'lim sarlavhasi |
| `text-h2` | 26–40 px | kichik bo'lim, raqamli fakt |
| `text-h3` | 22 px | panel sarlavhasi |
| `text-body-lg` / `text-body` | 18 / 16 px | matn |
| `text-small` | 14 px | izoh |
| `text-caption` | 12 px, bosh harf, 0.14em | kicker, yorliq |

## Spacing, radius, shadow, motion

- **Spacing:** 4 px asos (`--v-space-1…9`: 4, 8, 12, 16, 24, 32, 48, 64, 96). Bo'lim oralig'i `--v-section-y` (64–128 px), yon chekka `--v-gutter` (16–48 px). Kontent kengligi `max-w-page` (1360 px).
- **Radius:** `rounded-v-sm` 6, `v-md` 10, `v-lg` 16, `v-xl` 24 px. Tugmalar pill.
- **Shadow:** `shadow-v-sm`, `v-md`, `v-lg`. Soya faqat ko'tarilgan elementda (tugma, sheet), har kartada emas.
- **Motion:** `duration-v-fast` 150, `v-base` 250, `v-slow` 400 ms; `ease-v`. `prefers-reduced-motion` da hamma davomiylik 0.

## Komponent qoidalari

- **Navbar / Sticky navigation:** bitta asosiy CTA ("Xonadon tanlash"). `[id]` elementlarda `scroll-margin-top`, shuning uchun sticky navbar anchor sarlavhasini to'smaydi.
- **Hero section:** bitta rasm, bitta CTA, telefon matnli havola. Slayder, parallax va hisoblagich yo'q.
- **Glassmorphism:** faqat bitta joyda, hero'dagi "Hozir sotuvda" panelida. Fon `#014242` 60% + blur, shuning uchun matn kontrasti rasmga bog'liq emas.
- **Kartalar:** faktlar va to'lov ustunlar hamda ingichka chiziqlar bilan beriladi. Karta faqat bosiladigan obyekt uchun (blok, xonadon).
- **Gradient/blur:** faqat hero rasmi ustidagi o'qilish qatlami.
- **Fokus:** `:focus-visible` 2 px bronza (`#D18E5B`) kontur, hamma joyda.
- **Touch:** muhim tugmalar kamida 44×44 px, asosiy CTA 52 px.
- **Dialog:** fokus ichkariga o'tadi, Tab ichida aylanadi, Esc yopadi, yopilganda fokus ochgan tugmaga qaytadi.

## Mazmun qoidalari

- Narx saytda ko'rsatilmaydi: "Narxi — menejerdan".
- Tasdiqlanmagan mijoz soni, mukofot, sharh yozilmaydi. Raqamlar bazadan yoki admin sozlamasidan olinadi.
- Konsept 3D va interyer tasviri "konsept" deb belgilanadi, texnik reja deb atalmaydi.
