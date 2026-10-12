'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useVelocity, useSpring, useTransform, useMotionValue, useAnimationFrame, useInView } from 'framer-motion';

/*
  Bo'limlar orasidagi katta "kino" yozuv-tasma: doimiy suzadi,
  scroll tezligiga qarab tezlashadi va yo'nalishini o'zgartiradi.
*/

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

function Row({ words, baseVelocity, outline }: { words: string[]; baseVelocity: number; outline?: boolean }) {
  const baseX = useMotionValue(0);
  // Ekrandan tashqarida — hisoblamaymiz (doimiy rAF sahifani sekinlashtirardi)
  const rowRef = useRef<HTMLDivElement>(null);
  const visible = useInView(rowRef, { margin: '200px 0px' });
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (!visible) return;
    let move = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * f;
    baseX.set(baseX.get() + move);
  });

  const line = (
    <span className="flex shrink-0 items-center">
      {words.map((w, i) => (
        <span key={i} className="flex items-center">
          <span className={outline ? 'text-transparent [-webkit-text-stroke:1px_rgba(209,142,91,0.7)]' : 'text-white'}>{w}</span>
          <span className="mx-6 md:mx-10 text-accent text-[0.5em]">✦</span>
        </span>
      ))}
    </span>
  );

  return (
    <div ref={rowRef} className="overflow-hidden whitespace-nowrap flex">
      <motion.div className="flex font-bebas text-[18vw] md:text-[9vw] leading-[0.95] tracking-wide" style={{ x }}>
        {line}{line}
      </motion.div>
    </div>
  );
}

export default function VelocityMarquee({ words }: { words: string[] }) {
  return (
    <section aria-hidden="true" className="relative bg-primary py-10 md:py-16 overflow-hidden select-none">
      <Row words={words} baseVelocity={-3} />
      <Row words={[...words].reverse()} baseVelocity={3} outline />
    </section>
  );
}
