'use client';
import React from 'react';
import { motion, type Variants } from 'framer-motion';

/*
  Kino uslubidagi paydo bo'lish: blok pastdan "parda" ostidan ko'tariladi,
  xiralikdan aniqlikka o'tadi. Butun saytdagi bo'limlar shu orqali ochiladi.
*/
const EASE = [0.22, 1, 0.36, 1] as const;

export default function AnimatedReveal({
  children,
  delay = 0,
  direction = 'up',
  className = ''
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}) {
  const offset = 70;
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? offset : direction === 'down' ? -offset : 0,
      x: direction === 'left' ? offset : direction === 'right' ? -offset : 0,
      scale: direction === 'none' ? 0.94 : 0.985,
      filter: 'blur(10px)',
      clipPath: direction === 'up' ? 'inset(12% 0% 0% 0% round 24px)' : 'inset(0% 0% 0% 0% round 0px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      clipPath: 'inset(0% 0% 0% 0% round 0px)',
      transition: { duration: 1.1, delay, ease: EASE },
      // Animatsiyadan keyin filter/clip qolib ketmasin (sticky va fixed elementlarni buzmasin)
      transitionEnd: { filter: 'none', clipPath: 'none' },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
