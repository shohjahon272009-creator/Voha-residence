Multi-language (UZ/RU/EN) real-estate website + admin panel for a construction company, built with Next.js 16, React 19 and SQLite (`better-sqlite3`).

## Admin panel & authentication

- The admin area lives under `/admin/*` and is protected by `src/middleware.ts`. Unauthenticated visitors are redirected to `/admin/login`.
- Sessions are HMAC-signed, `httpOnly` cookies (see `src/lib/session.ts`). Passwords are stored salted+hashed with scrypt (`src/lib/password.ts`).
- **Default credentials** (seeded on first run): `admin@qurilish.uz` / `admin123`. Change the password after the first login.
- Set `AUTH_SECRET` in `.env.local` to a long random string — it signs the session cookies. A throwaway value is generated for local dev; production **must** set its own:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

## Deployment notes

This app uses `better-sqlite3`, a native module that requires a **persistent Node.js server with a writable filesystem** (e.g. a VPS, Docker, Render, Railway). It does **not** run on serverless/edge platforms like Vercel Functions, where the filesystem is read-only/ephemeral. The database file (`qurilish.db`) and uploaded images (`public/uploads/`) must live on persistent storage.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
