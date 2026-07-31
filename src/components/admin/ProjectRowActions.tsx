 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Trash2 } from 'lucide-react';
import { deleteProject } from '@/lib/adminActions';
import EditProjectModal from './EditProjectModal';

 
export default function ProjectRowActions({ project }: { project: any }) {
  const handleDelete = async () => {
    if (window.confirm("Rostdan ham bu loyihani o'chirmoqchimisiz? Undagi barcha xonadonlar ham o'chib ketadi!")) {
      await deleteProject(project.id);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/uz/projects/${project.id}`} target="_blank" className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Ko'rish">
        <Eye size={16} />
      </Link>
      <EditProjectModal project={project} />
      <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-all" title="O'chirish">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
