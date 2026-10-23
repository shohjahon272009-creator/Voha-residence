# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Voha Residence (voharesidence.uz) — the website of a construction company in Urganch/Xorazm. A three-language (uz/ru/en) public site plus an admin panel, built with Next.js 16 (App Router), React 19, Tailwind 3, framer-motion and Lenis. The owner writes in Uzbek: UI text, code comments and commit messages are in Uzbek, so keep that style.

## Commands

```bash
npm run dev          # dev server on :3000
npm run lint         # eslint (flat config, eslint-config-next)
npx tsc --noEmit -p . # type check
npm run build        # production build
```

- There are no tests. Verification means lint, `tsc` and `next build`, then checking in the browser.
- Do not run `next dev` and `next build` at the same time: `.next` gets corrupted. Stop the dev server, run `rm -rf .next`, then build.
- **A push to `main` deploys automatically to Vercel** (voharesidence.uz, until the domain is moved). Only push after the build passes.
- **Airnet VPS** (`46.8.114.120`, `ubuntu`, SSH key `~/.ssh/voha_airnet`): `/var/www/voha`, PM2 process `voha` (`voha.config.js`, 127.0.0.1:3000), nginx at `/etc/nginx/sites-available/voha`.
  - Ship updates with `bash deploy/airnet.sh`: it sends the last commit, then builds and does `pm2 reload`.
  - The server `.env.local` (Turso and its own `AUTH_SECRET`) and admin-uploaded images (`public/uploads`) are kept across deploys.
  - Uploads added after the build are served by nginx's `/uploads/` location (Next doesn't serve them).
  - `salehouse-bot.service` (the Sale House Telegram bot) also runs on this server. Don't touch it.

## ⚠️ Local environment = production database

`.env.local` contains `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`, so `npm run dev` on localhost:3000 **is connected to the live Turso database**.
- Only read-only viewing is allowed there.
- Never test forms, bookings, the admin panel or any write operation there.
- To test writes, use a copy of the project **without `.env.local`**. Then `src/lib/db.ts` switches to the local `qurilish.db`, through better-sqlite3.
- Such a copy exists at `C:\Users\user\voha-test`. It has its own `qurilish.db` (prices filled in on some apartments), and `public` and `node_modules` are junctions into this repo.
  - To update it, copy `src/` across.
  - Start it with `npm --prefix C:\Users\user\voha-test run dev -- --webpack -p 3001`.
  - Do not use `npx --prefix`: it doesn't change the cwd, so it would read this repo's `qurilish.db`.
- Do not keep test copies in the temp folder: their root files get deleted.
- If Turbopack rejects a node_modules junction, use `next dev --webpack`.

## Architecture

**Database: `src/lib/db.ts`.** It has two modes behind one async API: `db.prepare(sql).get/all/run(...)`, each returning a Promise.
- With the Turso env vars set, it uses `@libsql/client/web` over HTTP; this is what runs on Vercel.
- Without them, it uses a better-sqlite3 file, `qurilish.db`.
- The schema is created in `initSchema`: `CREATE TABLE IF NOT EXISTS`, plus missing columns added via `ALTER TABLE ... ADD COLUMN`. There are no migration files.
- Multilingual content is stored in `*_uz/_ru/_en` columns, e.g. `name_uz`, `title_ru`.
- The `settings` table (key/value) holds all admin-editable configuration:
  - contacts: `contact_*`;
  - hero stats: `hero_stat*`;
  - section visibility: `show_*`;
  - Telegram notifications: `bot_token`, `admin_chat_id`;
  - payment parameters;
  - the login brute-force counter: `_login_fail:<email>`.

**Routing and auth.**
- `src/proxy.ts` (Next 16's replacement for middleware; README.md still says `middleware.ts`, which is outdated) does three things:
  - rewrites `/` → `/uz`;
  - redirects `/admin/*` to `/admin/login` if there is no session;
  - sets the `x-lang` header for the language, so the root layout can set `<html lang>`.
- Public pages live in `src/app/[lang]/...` (`force-dynamic`, `dynamicParams = false`). Because of the rewrite, `src/app/page.tsx` is effectively never served.
- Sessions use HMAC-signed cookies (`lib/session.ts`, `AUTH_SECRET`). The token is `userId.version.expires.sig`.
  - `proxy.ts` checks only the signature.
  - `requireAdmin()`/`getAdminId()` and `app/admin/layout.tsx` compare `users.session_version` with the database. On logout or password change the version is incremented, which revokes every old session.
  - Without a session, the admin layout renders only the login page and sends no admin data.
- The first admin is seeded from `INITIAL_ADMIN_PASSWORD` (in production it is not created without that env var).
- The login limit is 5 per IP+email and 50 per email (15 minutes).

**Server actions: `src/lib/*Actions.ts`, `'use server'`.**
- Every admin action must call `requireAdmin()` (`lib/requireAdmin.ts`).
- Public forms (`contactActions`, `paymentActions`, `matchActions`) have rate limits and send a Telegram notification.
- Payment rules live in the pure function `lib/paymentCalc.ts`:
  - mortgage blocks;
  - fixed down payment;
  - a monthly minimum and maximum term.
- The "Uyingizni toping" game (`matchActions.findHomes`) **does not send the price to the client**, only the monthly payment.

**Images.**
- Uploads: `lib/storage.ts`.
  - Compressed with sharp to max 2048px, webp q82.
  - Order: Vercel Blob → local `public/uploads` → fallback: a base64 data URL in the DB.
  - Blob is currently private/not working, so new uploads land as **base64 in the DB**.
- Apartment plans and photos are therefore never embedded in the page. They are served via `/api/apt-image/{id}?t=plan|photo`.
  - Whether a picture exists comes from the `apartments.has_plan`/`has_photo` flag columns. Don't use `LENGTH(plan_image)`: it reads the whole blob.
  - `adminActions` keeps these flags up to date; any new code that writes images must update them too.
- Project and news images go the same way: public pages use `getPublicProjects()`/`getPublicProjectBySlug()` and `publicNewsMedia()`, which turn data URLs into `/api/media?...` addresses.
  - Admin pages must use the raw `getProjects()`, because the value goes back into the form and gets saved again.
  - `lib/media.ts` `serveStoredImage` serves only raster MIME types (SVG is rejected).
- The `public/uploads/*.jpg` files are referenced by name from the DB. When improving a file, keep its name and the references keep working. These files were AI-upscaled to 2560px (Real-ESRGAN).

**i18n.**
- Shared text: `lib/dictionaries.ts`.
- Most components keep their own `const T: Record<string, {...}> = { uz, ru, en }` object; follow the same pattern for new sections.

**Website shell: `components/website/WebsiteLayout.tsx`.** It mounts:
- `SmoothScroll` (Lenis);
- `CinemaEnhancer`;
- `IntroScreen`;
- `ExitIntent`;
- `Navbar`;
- `FooterCTA` and `FooterBigType`.

**`CinemaEnhancer` (global reveal animation).**
- It puts `data-cine="pending" → "in" → "done"` on `main h2`, `main img` and `main .grid > *`. The CSS is in `globals.css`.
- Interactive or self-animating sections must carry the **`data-cine-skip`** attribute, otherwise elements may stay hidden.

**Hero and cinema assets: `public/cinema/`.**
- `hero.mp4`: 1920×1080, rebuilt from the original source.
- `hero-mobile.mp4`: vertical crop.
- Posters, scroll frames (`frames/NNN.webp`) and build-stage frames.
- The video loads deferred; first page weight is about 1 MB. Keep it that way.

## Performance and visual rules

These were found while fixing scroll freezing; don't bring them back:
- `backdrop-blur`, large `blur-*` filters and animated `clip-path` cause repaints and freeze the page on scroll. Use `transform`/`opacity` animation only, and the `.soft-blob` mask class for soft glows.
- Cap canvas DPR at 2 and debounce MutationObservers.
- Forms: `method="post"`, and the submit button is disabled until `useHydrated()`, so that before JS loads the browser does not send a GET with personal data in the URL.
- On narrow screens, grid children need `min-w-0`/`grid-cols-1`. Otherwise long text (`truncate`) pushes the page sideways.
- Brand colours: primary teal `#014242`, accent bronze `#D18E5B`, from the official brandbook. The logo is vector paths in `components/common/VohaLogo.tsx` (`VOHA_PATH`, `RESIDENCE_PATH`).
- Image quality: the owner wants a very crisp, "real" look. Do not use anything cartoonish (emoji-heavy UI, painterly AI renders). Do not use the `nfull-*` renders (the owner rejected them).

## Other files

- `DEPLOY.md`: Vercel + Turso and VPS (PM2 `ecosystem.config.js`, `deploy/nginx.conf`) deployment guide.
- `ai-promptlar/PROMPTLAR.md`: prompts and reference images for producing new photos and videos in AI generators.
- The PDF/PNG/HTML/xlsx files at the repo root (posters, price lists, demos) are sales materials, not part of the site.
