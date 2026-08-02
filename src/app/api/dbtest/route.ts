/* VAQTINCHALIK diagnostika — muammo topilgach o'chiriladi */
export const dynamic = 'force-dynamic';

export async function GET() {
  const info: Record<string, unknown> = {
    hasUrl: Boolean(process.env.TURSO_DATABASE_URL),
    urlPrefix: (process.env.TURSO_DATABASE_URL || '').slice(0, 24),
    hasToken: Boolean(process.env.TURSO_AUTH_TOKEN),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    node: process.version,
    vercel: Boolean(process.env.VERCEL),
  };
  try {
    const { createClient } = await import('@libsql/client/web');
    const url = (process.env.TURSO_DATABASE_URL || '').replace(/^libsql:\/\//, 'https://');
    const c = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    const r = await c.execute('SELECT count(*) as n FROM projects');
    info.dbOk = true;
    info.projects = Number((r.rows[0] as Record<string, unknown>).n);
  } catch (e) {
    info.dbOk = false;
    info.error = String((e as Error)?.message || e);
    info.stack = String((e as Error)?.stack || '').slice(0, 600);
  }
  return Response.json(info);
}
