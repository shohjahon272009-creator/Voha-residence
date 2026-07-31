 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
'use client';
import React from 'react';
import { motion } from 'framer-motion';

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
  const variants = {
    hidden: { 
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
      scale: direction === 'none' ? 0.95 : 1
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      scale: 1,
      transition: { duration: 0.6, delay, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
       
      variants={variants as any}
      className={className}
    >
      {children}
    </motion.div>
  );
}
