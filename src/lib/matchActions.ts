'use server';

import { clientIp } from './clientIp';
import db from './db';
import { computePayment } from './paymentCalc';

/*
  "Uyingizni toping" o'yini — javoblar bo'yicha eng mos BO'SH xonadonlarni topadi.
  Hisob serverda: narx (price_cash) mijozga yuborilmaydi. Oylik to'lov 10 ming so'mgacha yaxlitlanadi
  va muddat (oy) qaytarilmaydi — aks holda oylik × muddat orqali narxni aniq hisoblab olish mumkin edi.
  100 balllik baho: xonalar 35, byudjet 30, qavat 15, qulayliklar (loyiha kategoriyalari) 15, muddat 5.
*/

export type QuestAnswers = {
  household: 'solo' | 'couple' | 'family' | 'big';
  budget: 'b4' | 'b6' | 'b9' | 'cash';
  floor: 'low' | 'mid' | 'high' | 'any';
  priorities: string[]; // categories.ts kalitlari: school, kindergarten, park, water, ...
  when: 'now' | 'year' | 'later';
};

export type QuestMatch = {
  id: number;
  projectId: number;
  project: string;
  floor: number;
  number: string;
  rooms: number;
  area: number;
  hasPlan: boolean;
  monthly: number | null;
  score: number;
  reasons: string[]; // reason kalitlari — klient tarjima qiladi
};

const ROOMS: Record<QuestAnswers['household'], number[]> = { solo: [1], couple: [1, 2], family: [2, 3], big: [3, 4, 5] };
// Tugmadagi yozuv bilan bir xil: "4 mln gacha", "4–6 mln", "6–9 mln"
const BUDGET: Record<QuestAnswers['budget'], number> = { b4: 4_000_000, b6: 6_000_000, b9: 9_000_000, cash: Infinity };
const FLOOR: Record<QuestAnswers['floor'], [number, number]> = { low: [1, 3], mid: [4, 7], high: [8, 99], any: [1, 99] };
const READY = ['Topshirilgan', 'Sanoqli kunlar qoldi'];

// Bo'sh xonadonlar ro'yxati — 20 soniya keshda (har o'yinda bazani qayta o'qimaslik uchun; ariza
// yuborilganda xonadon holati baribir qayta tekshiriladi — contactActions).
// plan_image — base64 (katta) ustun: uni o'qimaymiz, has_plan bayrog'idan foydalanamiz.
type Snapshot = { at: number; rows: Record<string, unknown>[]; settings: Record<string, string> };
let snapshot: Snapshot | null = null;
const TTL_MS = 20_000;

async function loadSnapshot(): Promise<Snapshot> {
  if (snapshot && Date.now() - snapshot.at < TTL_MS) return snapshot;
  const rows = (await db.prepare(`
    SELECT a.id, a.project_id, a.floor, a.number, a.rooms, a.area, a.price_cash,
           a.has_plan,
           p.name_uz, p.status AS pstatus, p.categories
    FROM apartments a JOIN projects p ON p.id = a.project_id
    WHERE a.status = ? AND COALESCE(p.is_sold_out, 0) = 0
  `).all("Bo'sh")) as Record<string, unknown>[];
  const settingsRows = (await db.prepare('SELECT key, value FROM settings').all()) as { key: string; value: string }[];
  snapshot = { at: Date.now(), rows, settings: Object.fromEntries(settingsRows.map((r) => [r.key, r.value])) };
  return snapshot;
}

// Oddiy himoya: bir IP'dan daqiqasiga ko'pi bilan 20 ta qidiruv (server nusxasi xotirasida)
const hits = new Map<string, number[]>();
async function allowed(): Promise<boolean> {
  const ip = (await clientIp()) || 'local';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 20) return false;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

const parseList = (v: unknown): string[] => {
  if (!v || typeof v !== 'string') return [];
  try { const r = JSON.parse(v); return Array.isArray(r) ? r.map(String) : []; } catch { return []; }
};

export async function findHomes(a: QuestAnswers): Promise<QuestMatch[]> {
  // Kirish ma'lumotini tekshiramiz (server action — istalgan qiymat kelishi mumkin)
  if (!a || !ROOMS[a.household] || !(a.budget in BUDGET) || !FLOOR[a.floor]) return [];
  const priorities = Array.isArray(a.priorities) ? a.priorities.slice(0, 8).map(String) : [];

  if (!(await allowed())) return [];
  const { rows, settings: s } = await loadSnapshot();

  const wantRooms = ROOMS[a.household];
  const maxMonthly = BUDGET[a.budget];
  const [fMin, fMax] = FLOOR[a.floor];

  const scored = rows.map((r) => {
    const rooms = Number(r.rooms) || 0;
    const floor = Number(r.floor) || 0;
    const pay = computePayment({ price_cash: Number(r.price_cash) || 0, floor, rooms, name_uz: String(r.name_uz) }, s);
    const cats = parseList(r.categories);
    const reasons: string[] = [];
    let score = 0;

    // Xonalar (35)
    if (wantRooms.includes(rooms)) { score += 35; reasons.push('rooms'); }
    else if (wantRooms.some((w) => Math.abs(w - rooms) === 1)) score += 18;

    // Byudjet (30) — narx kiritilmagan bo'lsa neytral
    if (a.budget === 'cash') score += 22;
    else if (pay) {
      if (pay.monthly <= maxMonthly) { score += 30; reasons.push('budget'); }
      else if (pay.monthly <= maxMonthly * 1.25) score += 14;
    } else score += 12;

    // Qavat (15)
    if (floor >= fMin && floor <= fMax) { score += 15; if (a.floor !== 'any') reasons.push('floor'); }
    else if (Math.min(Math.abs(floor - fMin), Math.abs(floor - fMax)) <= 1) score += 7;

    // Qulayliklar (15) — loyiha kategoriyalari bilan kesishish
    const hit = priorities.filter((k) => cats.includes(k));
    score += priorities.length ? Math.round(15 * (hit.length / priorities.length)) : 10;
    hit.forEach((k) => reasons.push(`cat:${k}`));

    // Muddat (5)
    const ready = READY.includes(String(r.pstatus));
    if (a.when === 'now') { if (ready) { score += 5; reasons.push('ready'); } }
    else score += 4;

    return {
      id: Number(r.id),
      projectId: Number(r.project_id),
      project: String(r.name_uz),
      floor,
      number: String(r.number ?? ''),
      rooms,
      area: Number(r.area) || 0,
      hasPlan: Boolean(Number(r.has_plan)),
      monthly: pay && pay.monthly > 0 ? Math.round(pay.monthly / 10_000) * 10_000 : null,
      score: Math.min(99, score),
      reasons,
    } satisfies QuestMatch;
  });

  // Har loyihadan ko'pi bilan 2 ta — tanlov xilma-xil bo'lsin
  scored.sort((x, y) => y.score - x.score || (x.monthly ?? 9e15) - (y.monthly ?? 9e15));
  const perProject = new Map<number, number>();
  const out: QuestMatch[] = [];
  for (const m of scored) {
    const n = perProject.get(m.projectId) || 0;
    if (n >= 2) continue;
    perProject.set(m.projectId, n + 1);
    out.push(m);
    if (out.length === 3) break;
  }
  return out;
}
