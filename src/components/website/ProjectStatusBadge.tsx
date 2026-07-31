import React from 'react';
import { Locale, getDictionary } from '@/lib/dictionaries';
import { Building2, Clock, CheckCircle2 } from 'lucide-react';

// A refined status badge shown on the corner of a project's image (customer-facing).
// Glassy, bordered pills — each status a distinct, premium color.
export default function ProjectStatusBadge({
  status,
  daysLeft = 0,
  soldOut = false,
  lang,
  className = '',
}: {
  status: string;
  daysLeft?: number;
  soldOut?: boolean;
  lang: Locale;
  className?: string;
}) {
  const s = getDictionary(lang).projects.status;

  let label: string;
  let color: string;   // background + border
  let iconColor = 'text-white';
  let Icon = Building2;
  let pulse = false;

  if (soldOut) {
    label = s.soldOut;
    color = 'bg-[#0c2e2b]/80 border-white/15 text-white';
    iconColor = 'text-accent';
    Icon = CheckCircle2;
  } else if (status === 'Topshirilgan') {
    label = s.completed;
    color = 'bg-emerald-500/90 border-emerald-200/40 text-white';
    Icon = CheckCircle2;
  } else if (status === 'Tez kunda') {
    label = s.soon;
    color = 'bg-sky-500/90 border-sky-200/40 text-white';
    Icon = Clock;
  } else if (status === 'Sanoqli kunlar qoldi') {
    label = daysLeft > 0 ? `${daysLeft} ${s.daysLeft}` : s.fewDaysLeft;
    color = 'bg-red-500/90 border-red-200/40 text-white';
    Icon = Clock;
    pulse = true;
  } else {
    // 'Jarayonda'
    label = s.ongoing;
    color = 'bg-amber-500/90 border-amber-200/40 text-white';
    Icon = Building2;
  }

  return (
    <span
      className={`inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border backdrop-blur-md shadow-[0_6px_20px_rgba(0,0,0,0.25)] ${color} ${className}`}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      <Icon size={15} className={`shrink-0 ${iconColor}`} strokeWidth={2.4} />
      {label}
    </span>
  );
}
