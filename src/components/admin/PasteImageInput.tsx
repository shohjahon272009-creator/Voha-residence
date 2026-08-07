'use client';

import React, { useRef, useState } from 'react';
import { ClipboardPaste, ImageIcon } from 'lucide-react';

/*
  Rasm yuklash + Ctrl+V (copy-paste) qo'llab-quvvatlash.
  MUHIM: rasm YUKLASHDAN OLDIN brauzerning o'zida kichraytiriladi (canvas orqali,
  max 1400px, WebP). Shunda serverga ~50 KB boradi — saqlash tez va ishonchli
  bo'ladi (sekin internetda ham qotmaydi), baza ham shishmaydi.
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
  const [working, setWorking] = useState(false);

  // Faylni file input'ga o'rnatish (forma yuborilganda saqlanadi)
  const setInputFile = (file: File) => {
    const dt = new DataTransfer();
    dt.items.add(file);
    if (inputRef.current) inputRef.current.files = dt.files;
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  };

  // Rasmni canvas orqali kichraytirib WebP qiladi; xato bo'lsa aslini ishlatadi
  const applyFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setInputFile(file); return; }
    setWorking(true);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const max = 1400;
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > max || h > max) {
          const s = Math.min(max / w, max / h);
          w = Math.round(w * s); h = Math.round(h * s);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { URL.revokeObjectURL(url); setInputFile(file); setWorking(false); return; }
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const base = file.name.replace(/\.[^.]+$/, '');
              setInputFile(new File([blob], `${base}.webp`, { type: 'image/webp' }));
            } else {
              setInputFile(file);
            }
            setWorking(false);
          },
          'image/webp',
          0.82,
        );
      } catch {
        URL.revokeObjectURL(url);
        setInputFile(file);
        setWorking(false);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); setInputFile(file); setWorking(false); };
    img.src = url;
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
    if (f) applyFile(f);
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
          {working ? (
            <span className="text-accent font-bold">Rasm kichraytirilmoqda...</span>
          ) : fileName ? (
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
