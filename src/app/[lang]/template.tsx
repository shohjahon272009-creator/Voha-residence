'use client';

import React from 'react';
import { motion } from 'framer-motion';

/*
  Sahifalararo kino o'tishi: har navigatsiyada template qayta yaratiladi —
  teal parda yuqoriga sirg'alib, yangi sahifani ochadi.
*/
const EASE = [0.77, 0, 0.18, 1] as const;

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="page-curtain fixed inset-0 z-[9000] bg-primary pointer-events-none origin-top"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-accent/60" />
      </motion.div>
      {/* Kontent o'ralmaydi: transform/opacity wrapper fixed navbar va kirish ekranini buzardi */}
      {children}
    </>
  );
}
