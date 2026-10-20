'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, Zap, Check, Phone, Sparkles, Trophy } from 'lucide-react';
import { findHomes, type QuestAnswers, type QuestMatch } from '@/lib/matchActions';
import { submitPriceRequest, submitContact } from '@/lib/contactActions';
import { CATEGORIES } from '@/lib/categories';
import { useHydrated } from '@/lib/useHydrated';

/*
  "Uyingizni toping" — o'yin: 5 savol -> bazadagi haqiqiy bo'sh xonadonlardan eng mos 3 tasi.
  Challenge: 30 soniyada tugatsa "Tez qaror" nishoni. Oxirida — ko'rishga yozilish (ariza Telegram'ga).
*/

type L = 'uz' | 'ru' | 'en';
const EASE = [0.22, 1, 0.36, 1] as const;
const CHALLENGE_SEC = 30;
// Vaqt faqat tugma bosilganda o'qiladi (render paytida emas)
const nowMs = () => Date.now();

const TX = {
  uz: {
    kicker: "O'yin · 30 soniya", title: 'Uyingizni 30 soniyada toping', sub: "5 ta savolga javob bering — bazadagi bo'sh xonadonlardan aynan sizga mosini topamiz.",
    start: 'Boshlash', step: 'Savol', of: '/', points: 'ball', next: 'Davom etish', searching: 'Sizga mos uylar qidirilmoqda…',
    q: [
      { t: 'Kim bilan yashaysiz?', o: [['solo', '🧑', 'Yolg‘iz'], ['couple', '👫', 'Juftlik'], ['family', '👨‍👩‍👧', 'Kichik oila'], ['big', '👨‍👩‍👧‍👦', 'Katta oila']] },
      { t: 'Oyiga qancha to‘lay olasiz?', o: [['b4', '💵', '4 mln gacha'], ['b6', '💰', '4–6 mln'], ['b9', '💎', '6–9 mln'], ['cash', '🏦', 'Naqd / to‘liq']] },
      { t: 'Qaysi qavat yoqadi?', o: [['low', '🌳', '1–3 qavat'], ['mid', '🏙️', '4–7 qavat'], ['high', '🌇', '8+ qavat'], ['any', '✨', 'Farqi yo‘q']] },
      { t: 'Atrofda nima bo‘lishi muhim?', multi: true },
      { t: 'Qachon ko‘chmoqchisiz?', o: [['now', '🔑', 'Imkon qadar tez'], ['year', '📅', '1 yil ichida'], ['later', '🕰️', 'Shoshilmayman']] },
    ],
    pick: 'Bir nechtasini tanlang', resultTitle: 'Sizga eng mos uylar', match: 'mos', fast: 'Tez qaror! Siz {s} soniyada topdingiz',
    floorW: 'qavat', roomsW: 'xona', perMonth: 'oyiga', sum: "so'm", priceAsk: 'Narxi — so‘rov bo‘yicha',
    reasons: { rooms: 'Oilangizga mos xonalar', budget: 'Byudjetingizga to‘g‘ri', floor: 'Siz xohlagan qavat', ready: 'Tayyor uy' } as Record<string, string>,
    book: 'Shu uyni ko‘rishga yozilish', name: 'Ismingiz', phone: '+998 __ ___ __ __', send: 'Yozilish', sent: 'Qabul qilindi! Menejerimiz tez orada qo‘ng‘iroq qiladi.',
    replay: 'Qayta o‘ynash', none: 'Hozir aniq mos bo‘sh xonadon topilmadi — menejerimiz siz uchun shaxsan tanlab beradi.', noneCta: 'Menga tanlab bering',
    err: 'Xatolik yuz berdi', planAlt: 'Xonadon rejasi',
  },
  ru: {
    kicker: 'Игра · 30 секунд', title: 'Найдите свой дом за 30 секунд', sub: 'Ответьте на 5 вопросов — подберём именно вашу квартиру из свободных.',
    start: 'Начать', step: 'Вопрос', of: '/', points: 'очков', next: 'Далее', searching: 'Подбираем подходящие квартиры…',
    q: [
      { t: 'С кем вы живёте?', o: [['solo', '🧑', 'Один'], ['couple', '👫', 'Пара'], ['family', '👨‍👩‍👧', 'Небольшая семья'], ['big', '👨‍👩‍👧‍👦', 'Большая семья']] },
      { t: 'Сколько готовы платить в месяц?', o: [['b4', '💵', 'До 4 млн'], ['b6', '💰', '4–6 млн'], ['b9', '💎', '6–9 млн'], ['cash', '🏦', 'Наличными / сразу']] },
      { t: 'Какой этаж нравится?', o: [['low', '🌳', '1–3 этаж'], ['mid', '🏙️', '4–7 этаж'], ['high', '🌇', '8+ этаж'], ['any', '✨', 'Неважно']] },
      { t: 'Что важно рядом?', multi: true },
      { t: 'Когда хотите переехать?', o: [['now', '🔑', 'Как можно скорее'], ['year', '📅', 'В течение года'], ['later', '🕰️', 'Не спешу']] },
    ],
    pick: 'Выберите несколько', resultTitle: 'Самые подходящие для вас', match: 'совпадение', fast: 'Быстрое решение! Вы нашли за {s} сек',
    floorW: 'этаж', roomsW: 'комн.', perMonth: 'в месяц', sum: 'сум', priceAsk: 'Цена — по запросу',
    reasons: { rooms: 'Комнаты под вашу семью', budget: 'Подходит по бюджету', floor: 'Желаемый этаж', ready: 'Готовый дом' } as Record<string, string>,
    book: 'Записаться на просмотр', name: 'Ваше имя', phone: '+998 __ ___ __ __', send: 'Записаться', sent: 'Принято! Наш менеджер скоро позвонит.',
    replay: 'Сыграть снова', none: 'Сейчас точного совпадения нет — менеджер подберёт квартиру лично для вас.', noneCta: 'Подберите мне',
    err: 'Произошла ошибка', planAlt: 'Планировка',
  },
  en: {
    kicker: 'Game · 30 seconds', title: 'Find your home in 30 seconds', sub: 'Answer 5 questions — we will match you with the right available apartment.',
    start: 'Start', step: 'Question', of: '/', points: 'pts', next: 'Continue', searching: 'Finding homes that fit you…',
    q: [
      { t: 'Who do you live with?', o: [['solo', '🧑', 'Alone'], ['couple', '👫', 'Couple'], ['family', '👨‍👩‍👧', 'Small family'], ['big', '👨‍👩‍👧‍👦', 'Big family']] },
      { t: 'Monthly budget?', o: [['b4', '💵', 'Up to 4M'], ['b6', '💰', '4–6M'], ['b9', '💎', '6–9M'], ['cash', '🏦', 'Cash / full']] },
      { t: 'Preferred floor?', o: [['low', '🌳', 'Floors 1–3'], ['mid', '🏙️', 'Floors 4–7'], ['high', '🌇', 'Floor 8+'], ['any', '✨', 'Any']] },
      { t: 'What matters nearby?', multi: true },
      { t: 'When do you want to move?', o: [['now', '🔑', 'As soon as possible'], ['year', '📅', 'Within a year'], ['later', '🕰️', 'No rush']] },
    ],
    pick: 'Pick a few', resultTitle: 'Your best matches', match: 'match', fast: 'Quick decision! Found in {s} sec',
    floorW: 'floor', roomsW: 'rooms', perMonth: '/month', sum: 'UZS', priceAsk: 'Price on request',
    reasons: { rooms: 'Rooms fit your family', budget: 'Fits your budget', floor: 'Your preferred floor', ready: 'Ready home' } as Record<string, string>,
    book: 'Book a viewing', name: 'Your name', phone: '+998 __ ___ __ __', send: 'Book', sent: 'Got it! Our manager will call you shortly.',
    replay: 'Play again', none: 'No exact match right now — our manager will hand-pick one for you.', noneCta: 'Pick one for me',
    err: 'Something went wrong', planAlt: 'Floor plan',
  },
};

const PRIORITY_KEYS = ['school', 'kindergarten', 'park', 'water', 'hospital', 'shopping', 'transport', 'mosque'];
const KEYS: (keyof QuestAnswers)[] = ['household', 'budget', 'floor', 'priorities', 'when'];

// Oddiy konfetti — kutubxonasiz, 1 marta
function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => i);
  const colors = ['#D18E5B', '#F2B98A', '#FFFFFF', '#7FD99A', '#8FC8FF'];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="absolute top-0 block w-2 h-3 rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length] }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: 520, rotate: 360 + i * 25, opacity: 0 }}
          transition={{ duration: 1.8 + (i % 5) * 0.25, delay: (i % 7) * 0.06, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function HomeQuest({ lang }: { lang: string }) {
  const t = TX[(lang as L)] || TX.uz;
  const hydrated = useHydrated();
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'search' | 'result'>('intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestAnswers>>({ priorities: [] });
  const [points, setPoints] = useState(0);
  const [matches, setMatches] = useState<QuestMatch[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const stepRef = useRef(0);

  const [bookId, setBookId] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const start = () => {
    startedAt.current = nowMs();
    stepRef.current = 0;
    setPhase('quiz'); setStep(0); setAnswers({ priorities: [] }); setPoints(0); setMatches([]); setSent(false); setBookId(null); setErr('');
  };

  const finish = async (final: Partial<QuestAnswers>) => {
    setElapsed(Math.round((nowMs() - startedAt.current) / 1000));
    setPhase('search');
    const [res] = await Promise.all([
      findHomes(final as QuestAnswers).catch(() => [] as QuestMatch[]),
      new Promise((r) => setTimeout(r, 1300)), // qidiruv animatsiyasi ko'rinsin
    ]);
    setMatches(res);
    setPhase('result');
  };

  const choose = (value: string) => {
    // Savol almashish animatsiyasida eski tugmalar ham bosilishi mumkin — ikki marta hisoblanmasin
    if (stepRef.current !== step) return;
    stepRef.current = step + 1;
    const key = KEYS[step];
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setPoints((p) => p + 20);
    if (step === KEYS.length - 1) finish(next);
    else setStep(step + 1);
  };

  const togglePriority = (k: string) => {
    setAnswers((a) => {
      const cur = a.priorities || [];
      return { ...a, priorities: cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k] };
    });
  };

  // Menejer uchun o'qiladigan xulosa (doim o'zbekcha — menejer o'zbek tilida o'qiydi)
  const summary = () => {
    const lbl = (qi: number, v?: string) => TX.uz.q[qi].o?.find((o) => o[0] === v)?.[2] || '—';
    const pr = (answers.priorities || []).map((k) => CATEGORIES.find((c) => c.key === k)?.label.uz || k).join(', ') || '—';
    return `Uy tanlash o'yini: ${lbl(0, answers.household)}, oylik byudjet ${lbl(1, answers.budget)}, qavat ${lbl(2, answers.floor)}, muhim: ${pr}, ko'chish: ${lbl(4, answers.when)}`;
  };

  const sendLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const fd = new FormData(e.currentTarget);
    const m = matches.find((x) => x.id === bookId);
    fd.set('message', `${summary()}${m ? ` | Tanlangan: ${m.project}, ${m.floor}-qavat, №${m.number}, mos ${m.score}%` : ''}`);
    try {
      if (m) { fd.set('apartmentId', String(m.id)); fd.set('kind', 'viewing'); }
      const res = m ? await submitPriceRequest(fd) : await submitContact(fd);
      if (res.success) setSent(true); else setErr(res.error || t.err);
    } catch { setErr(t.err); }
    setBusy(false);
  };

  const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');
  const fast = elapsed > 0 && elapsed <= CHALLENGE_SEC;
  const q = t.q[step];

  const leadForm = (
    <form onSubmit={sendLead} method="post" className="mt-4 grid sm:grid-cols-[1fr_1fr_auto] gap-2">
      <input name="name" required maxLength={100} placeholder={t.name} className="px-4 py-3 rounded-xl bg-white text-primary placeholder:text-gray-400 outline-none" />
      <input name="phone" required type="tel" inputMode="tel" maxLength={40} placeholder={t.phone} className="px-4 py-3 rounded-xl bg-white text-primary placeholder:text-gray-400 outline-none" />
      <button disabled={busy || !hydrated} className="px-6 py-3 rounded-xl bg-accent text-primary font-bold disabled:opacity-60 hover:bg-white transition-colors">{t.send}</button>
      {err && <p className="sm:col-span-3 text-sm text-red-300">{err}</p>}
    </form>
  );

  return (
    <section id="uy-tanlash" className="relative overflow-hidden bg-primary py-24 md:py-32 px-6 scroll-mt-20" data-cine-skip>
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] rounded-full bg-accent/10 soft-blob pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: EASE }} className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold uppercase tracking-[0.25em]">
                <Zap size={14} />{t.kicker}
              </div>
              <h2 className="mt-6 font-montserrat font-extrabold text-white text-[clamp(2.2rem,6vw,4.6rem)] leading-[1] tracking-[-0.03em]">{t.title}</h2>
              <p className="mt-5 text-white/70 text-lg max-w-xl mx-auto">{t.sub}</p>
              <button onClick={start} disabled={!hydrated} className="group mt-10 inline-flex items-center gap-3 px-10 py-5 rounded-full bg-accent text-primary font-extrabold text-lg shadow-[0_15px_50px_rgba(209,142,91,0.5)] hover:bg-white transition-colors disabled:opacity-60">
                {t.start}<ArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}

          {phase === 'quiz' && (
            <motion.div key={`q${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.45, ease: EASE }}>
              <div className="flex items-center justify-between text-white/70 text-sm font-bold mb-3">
                <span>{t.step} {step + 1}{t.of}{KEYS.length}</span>
                <span className="inline-flex items-center gap-1.5 text-accent"><Sparkles size={15} />{points} {t.points}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-10">
                <motion.div className="h-full bg-accent rounded-full" initial={false} animate={{ width: `${(step / KEYS.length) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
              </div>
              <h3 className="text-white font-extrabold text-3xl md:text-5xl tracking-tight text-center mb-10">{q.t}</h3>

              {'multi' in q && q.multi ? (
                <>
                  <p className="text-center text-white/60 -mt-6 mb-6">{t.pick}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PRIORITY_KEYS.map((k) => {
                      const c = CATEGORIES.find((x) => x.key === k)!;
                      const on = (answers.priorities || []).includes(k);
                      return (
                        <button key={k} type="button" onClick={() => togglePriority(k)}
                          className={`relative p-4 rounded-2xl border-2 text-left transition-all ${on ? 'bg-accent/20 border-accent' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                          <span className="text-3xl">{c.emoji}</span>
                          <span className="block mt-2 text-white font-bold text-sm">{c.label[(lang as L)] || c.label.uz}</span>
                          {on && <Check size={18} className="absolute top-3 right-3 text-accent" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-8 text-center">
                    <button onClick={() => { if (stepRef.current !== step) return; stepRef.current = step + 1; setPoints((p) => p + 20); setStep(step + 1); }} className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-primary font-bold hover:bg-white transition-colors">
                      {t.next}<ArrowRight size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className={`grid gap-3 ${q.o!.length === 3 ? 'md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                  {q.o!.map(([val, emoji, label]) => (
                    <motion.button key={val} type="button" onClick={() => choose(val)} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                      className="p-5 md:p-6 rounded-3xl bg-white/5 border-2 border-white/10 hover:border-accent hover:bg-accent/10 transition-colors text-center">
                      <span className="block text-4xl md:text-5xl">{emoji}</span>
                      <span className="block mt-3 text-white font-bold">{label}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {phase === 'search' && (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
              <div className="relative w-28 h-28 mx-auto">
                <span className="absolute inset-0 rounded-full border-4 border-accent/20" />
                <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-4xl">🏠</span>
              </div>
              <p className="mt-8 text-white text-xl font-bold">{t.searching}</p>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="relative">
              {matches.length > 0 && <Confetti />}
              <div className="text-center">
                {fast && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-primary text-sm font-extrabold mb-5">
                    <Trophy size={16} />{t.fast.replace('{s}', String(elapsed))}
                  </div>
                )}
                <h3 className="font-montserrat font-extrabold text-white text-3xl md:text-5xl tracking-tight">{t.resultTitle}</h3>
              </div>

              {matches.length === 0 ? (
                <div className="mt-10 rounded-3xl bg-white/5 border border-white/10 p-8 text-center">
                  <p className="text-white/80 text-lg">{t.none}</p>
                  {sent ? <p className="mt-5 text-accent font-bold">{t.sent}</p> : leadForm}
                </div>
              ) : (
                <div className="mt-10 grid md:grid-cols-3 gap-4">
                  {matches.map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i, duration: 0.6, ease: EASE }}
                      className={`relative rounded-3xl bg-white text-primary overflow-hidden flex flex-col ${i === 0 ? 'ring-4 ring-accent md:-translate-y-2' : ''}`}>
                      <div className="relative aspect-[4/3] bg-[#f4efe4]">
                        {m.hasPlan ? (
                          // eslint-disable-next-line @next/next/no-img-element -- reja /api/apt-image orqali (bazadagi data URL)
                          <img src={`/api/apt-image/${m.id}?t=plan`} alt={t.planAlt} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-contain p-3" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-6xl">🏢</div>
                        )}
                        <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-primary text-white text-sm font-extrabold">{m.score}% {t.match}</div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="font-extrabold text-xl">{m.project} · №{m.number}</div>
                        <div className="mt-1 text-gray-500 text-sm">{m.floor}-{t.floorW} · {m.rooms} {t.roomsW} · {m.area} m²</div>
                        <div className="mt-3 text-2xl font-black">
                          {m.monthly ? <>≈ {fmt(m.monthly)} <span className="text-sm font-bold text-gray-400">{t.sum} {t.perMonth}</span></> : <span className="text-base font-bold text-gray-500">{t.priceAsk}</span>}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {m.reasons.slice(0, 4).map((r) => {
                            const label = r.startsWith('cat:') ? (CATEGORIES.find((c) => c.key === r.slice(4))?.label[(lang as L)] || '') : t.reasons[r];
                            return label ? <span key={r} className="px-2.5 py-1 rounded-full bg-accent/15 text-[11px] font-bold text-primary">✓ {label}</span> : null;
                          })}
                        </div>
                        <button type="button" onClick={() => { setBookId(m.id); setSent(false); }}
                          className="mt-auto pt-5 w-full">
                          <span className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-primary text-white font-bold hover:bg-accent hover:text-primary transition-colors">
                            <Phone size={16} />{t.book}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {bookId !== null && matches.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-3xl bg-white/10 border border-white/15 p-6">
                  {sent ? <p className="text-accent font-bold text-center text-lg">{t.sent}</p> : (
                    <>
                      <p className="text-white font-bold">{t.book}: {matches.find((x) => x.id === bookId)?.project} · №{matches.find((x) => x.id === bookId)?.number}</p>
                      {leadForm}
                    </>
                  )}
                </motion.div>
              )}

              <div className="mt-8 text-center">
                <button onClick={start} className="inline-flex items-center gap-2 text-white/70 hover:text-white font-bold">
                  <RotateCcw size={16} />{t.replay}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
