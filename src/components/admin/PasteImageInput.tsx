'use client';

import React, { useRef, useState } from 'react';
import { ClipboardPaste, ImageIcon } from 'lucide-react';

/*
  Rasm yuklash + Ctrl+V (copy-paste) qo'llab-quvvatlash.
  - "Choose File" bilan ham, buferdan Ctrl+V bilan ham rasm qo'yish mumkin.
  - Qo'yilgan rasm bevosita file input'ga o'rnatiladi (DataTransfer orqali),
    shuning uchun forma yuborilganda odatdagidek saqlanadi.
*/
export default function PasteImageInput({
  name,
  label,
  existing,
}: {
  name: string;
  label: string;
  existing?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const applyFile = (file: File) => {
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type.startsWith('image/')) {
        const blob = it.getAsFile();
        if (blob) {
          e.preventDefault();
          const ext = (it.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
          applyFile(new File([blob], `pasted-${Date.now()}.${ext}`, { type: it.type }));
          return;
        }
      }
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      setPreview(URL.createObjectURL(f));
    }
  };

  const shown = preview || existing;

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
      {shown && (
        <div className="mb-2">
          <img src={shown} alt="" className="h-16 object-contain rounded border border-gray-100" />
        </div>
      )}
      <div
        tabIndex={0}
        onPaste={onPaste}
        className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-2.5 outline-none focus:border-primary focus:bg-white transition-colors cursor-text"
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/*"
          onChange={onChange}
          className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
        />
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1.5">
          {fileName ? (
            <>
              <ImageIcon size={12} className="text-accent" /> {fileName}
            </>
          ) : (
            <>
              <ClipboardPaste size={12} /> Bu yerni bosib, <b className="text-primary/70">Ctrl+V</b> bilan ham qo&apos;yish mumkin
            </>
          )}
        </div>
      </div>
    </div>
  );
}
