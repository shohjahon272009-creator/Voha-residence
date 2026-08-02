/* VAQTINCHALIK diagnostika — muammo topilgach o'chiriladi */
export const dynamic = 'force-dynamic';

export async function GET() {
  const info: Record<string, unknown> = {
    hasUrl: Boolean(process.env.TURSO_DATABASE_URL),
    urlPrefix: (process.env.TURSO_DATABASE_URL || '').slice(0, 30),
    hasToken: Boolean(process.env.TURSO_AUTH_TOKEN),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    vercel: Boolean(process.env.VERCEL),
    vercelEnv: process.env.VERCEL_ENV || null,
  };
  try {
    const { createClient } = await import('@libsql/client/web');
    const url = (process.env.TURSO_DATABASE_URL || '').replace(/^libsql:\/\//, 'https://');
    if (!url) { info.dbOk = false; info.error = 'no url at runtime'; return Response.json(info); }
    const c = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    const r = await c.execute("SELECT name_uz FROM projects WHERE id = 31");
    info.dbOk = true;
    info.project31 = (r.rows[0] as Record<string, unknown>)?.name_uz;
  } catch (e) {
    info.dbOk = false;
    info.error = String((e as Error)?.message || e).slice(0, 200);
  }
  return Response.json(info);
}
