/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';
import { motion } from 'framer-motion';
import { MapPin, Gift, Tag, ArrowRight } from 'lucide-react';
import ProjectStatusBadge from './ProjectStatusBadge';

interface ProjectCardProps {
  project: Project;
  lang: Locale;
  soldOut?: boolean; // computed server-side; raw counts/prices never reach the client
}

export default function ProjectCard({ project, lang, soldOut = false }: ProjectCardProps) {
  const projectName = (project as any)[`name_${lang}`] || project.name_uz;

  const t = ({
    uz: { complex: 'Turar joy majmuasi', price: 'shartnomaviy' },
    ru: { complex: 'Жилой комплекс', price: 'договорная' },
    en: { complex: 'Residential complex', price: 'on request' },
  } as const)[lang] || { complex: 'Turar joy majmuasi', price: 'shartnomaviy' };

  const href = `/${lang}/projects/${project.id}`;

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
      <Link
        href={href}
        className="group block bg-white rounded-[28px] p-3 ring-1 ring-black/5 shadow-[0_8px_30px_rgba(20,20,40,0.06)] hover:ring-accent/40 hover:shadow-[0_28px_60px_rgba(1,66,66,0.18)] transition-all duration-500"
      >
        {/* Inset "floating" photo with rounded corners */}
        <div className="relative aspect-[16/11] rounded-[22px] overflow-hidden">
          <img
            src={project.main_image || '/voha-actual-bg.png'}
            alt={projectName}
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
          />
          {/* Depth scrim — deepens on hover for a premium, dimensional look */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
          <div className="absolute top-4 left-4 z-10">
            <ProjectStatusBadge status={project.status} daysLeft={project.days_left} soldOut={soldOut} lang={lang} />
          </div>

          {/* Sovg'a belgisi (admin'dan) — o'ng yuqori */}
          {project.gift_label && (
            <div className="absolute top-4 right-4 z-10">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-primary bg-white/95 backdrop-blur-md shadow-lg">
                <Gift className="w-3.5 h-3.5 text-accent" /> {project.gift_label}
              </span>
            </div>
          )}

          {/* 360° — chap past */}
          {project.virtual_tour_url && (
            <div className="absolute bottom-4 left-4 z-10">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-black/45 backdrop-blur-md border border-white/20 shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12a9 3 0 1018 0 9 3 0 10-18 0M12 9v6m-3-3h6" /></svg>
                360°
              </span>
            </div>
          )}

          {/* Chegirma belgisi (admin'dan) — o'ng past */}
          {project.discount_label && (
            <div className="absolute bottom-4 right-4 z-10">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black text-white bg-accent shadow-lg">
                <Tag className="w-3.5 h-3.5" /> {project.discount_label}
              </span>
            </div>
          )}
        </div>

        {/* Caption: label · name · district · price */}
        <div className="px-3 pt-5 pb-3">
          <p className="flex items-center gap-1.5 text-[13px] text-gray-400 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {t.complex}
          </p>
          <h3 className="text-[26px] leading-tight font-bold text-primary tracking-tight group-hover:text-accent transition-colors mb-3">
            {projectName}
          </h3>
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
            {(project.district || project.city) && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500 truncate">
                <MapPin size={15} className="text-accent shrink-0" />
                {[project.district, project.city].filter(Boolean).join(', ')}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm font-bold text-gray-400 shrink-0 group-hover:text-accent transition-colors">
              {t.price} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
