import { clientIp } from './clientIp';

/*
  Oddiy xotiradagi so'rov limiti (server nusxasi bo'yicha) — ommaviy hisob-kitob action'lari
  (o'yin, kalkulyator) uchun: bir IP'dan daqiqasiga ko'pi bilan `max` ta so'rov.
  Bazaga yozmaydi; maqsad — barcha xonadonlarni skript bilan "tortib olish"ni sekinlatish.
*/
const buckets = new Map<string, number[]>();

export async function allowRequest(scope: string, max: number, windowMs = 60_000): Promise<boolean> {
  const key = `${scope}:${(await clientIp()) || 'local'}`;
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 10_000) buckets.clear();
  return true;
}
