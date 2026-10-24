import db from './db';
import { buildReport, type SyncReport } from './salehouseSync';

/*
  Sale House hisoboti FONDA tayyorlanadi: Sale House limiti tufayli (so'rovlar orasida pauza)
  1–2 daqiqa davom etadi — sahifa so'rovi ichida qilinsa sahifa qotib, nginx vaqti tugardi.
  Holat va natija settings'da (_ bilan — ommaga chiqmaydi).
*/
type Job = { status: 'running' | 'done' | 'error'; startedAt: string; finishedAt?: string; error?: string };

const save = (key: string, value: string) =>
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);

export async function readJob(): Promise<{ job: Job | null; report: SyncReport | null; running: boolean }> {
  const rows = await db.prepare("SELECT key, value FROM settings WHERE key IN ('_salehouse_job', '_salehouse_report')").all() as { key: string; value: string }[];
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const parse = <T,>(v?: string): T | null => { try { return v ? JSON.parse(v) as T : null; } catch { return null; } };
  const job = parse<Job>(s._salehouse_job);
  // 10 daqiqadan uzoq "running" — jarayon qayta ishga tushgan (deploy) va vazifa uzilgan
  const running = job?.status === 'running' && Date.now() - new Date(job.startedAt).getTime() < 10 * 60_000;
  return { job, report: parse<SyncReport>(s._salehouse_report), running };
}

/** Fon vazifasini boshlaydi (allaqachon ishlayotgan bo'lsa — qaytadan boshlamaydi). */
export async function startReportJob(): Promise<void> {
  const { running } = await readJob();
  if (running) return;
  const startedAt = new Date().toISOString();
  await save('_salehouse_job', JSON.stringify({ status: 'running', startedAt }));
  // Kutilmaydi — server (PM2, doimiy jarayon) fonda tugatadi
  void buildReport()
    .then(async (report) => {
      await save('_salehouse_report', JSON.stringify(report));
      await save('_salehouse_job', JSON.stringify({ status: 'done', startedAt, finishedAt: new Date().toISOString() }));
    })
    .catch(async (e) => {
      await save('_salehouse_job', JSON.stringify({ status: 'error', startedAt, finishedAt: new Date().toISOString(), error: String((e as Error)?.message || e).slice(0, 300) }));
    });
}
