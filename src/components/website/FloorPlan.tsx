 
 
 
/* eslint-disable @next/next/no-img-element */
 
'use client';

import React, { useState } from 'react';
import { Apartment } from '@/lib/types';
import { Locale } from '@/lib/dictionaries';
import { Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function FloorPlan({ 
  apartments, 
  lang,
  onSelect
}: { 
  apartments: Apartment[], 
  lang: Locale,
  onSelect: (apt: Apartment) => void
}) {
  const [selectedApt, setSelectedApt] = useState<Apartment | null>(null);

  // Simplified logic to group apartments by floor
  const floors = Array.from(new Set(apartments.map(a => a.floor))).sort((a, b) => b - a);
  const [activeFloor, setActiveFloor] = useState(floors[0] || 1);

  const floorApartments = apartments.filter(a => a.floor === activeFloor);

  const t = {
    uz: {
      title: "Qavat rejasi",
      subtitle: "Kerakli qavatni tanlang va xonadon holatini ko'ring",
      floorMap: "Qavat Chizmasi",
      apartmentsTitle: "Xonadonlar:",
      rooms: "xona",
      area: "m²",
      aptMap: "xonadon chizmasi",
      aptTitle: "xonadon",
      roomsLabel: "Xonalar",
      areaLabel: "Maydon",
      floorLabel: "Qavat",
      statusLabel: "Holati",
      roomViews: "Xonalar ko'rinishi",
      livingRoom: "Mehmonxona",
      bedroom: "Yotoqxona",
      priceLabel: "Narxi",
      priceUnit: "",
      bookNow: "Narxini bilish",
      emptyState: "Batafsil ma'lumot va xonalar ko'rinishini ko'rish uchun chap tomondan xonadonni tanlang"
    },
    ru: {
      title: "План этажа",
      subtitle: "Выберите нужный этаж и посмотрите статус квартиры",
      floorMap: "План этажа",
      apartmentsTitle: "Квартиры:",
      rooms: "комн.",
      area: "м²",
      aptMap: "план квартиры",
      aptTitle: "квартира",
      roomsLabel: "Комнаты",
      areaLabel: "Площадь",
      floorLabel: "Этаж",
      statusLabel: "Статус",
      roomViews: "Виды комнат",
      livingRoom: "Гостиная",
      bedroom: "Спальня",
      priceLabel: "Цена",
      priceUnit: "",
      bookNow: "Узнать цену",
      emptyState: "Выберите квартиру слева, чтобы увидеть подробную информацию и виды комнат"
    },
    en: {
      title: "Floor Plan",
      subtitle: "Select the desired floor and see the apartment status",
      floorMap: "Floor Map",
      apartmentsTitle: "Apartments:",
      rooms: "rooms",
      area: "m²",
      aptMap: "apartment plan",
      aptTitle: "apartment",
      roomsLabel: "Rooms",
      areaLabel: "Area",
      floorLabel: "Floor",
      statusLabel: "Status",
      roomViews: "Room Views",
      livingRoom: "Living Room",
      bedroom: "Bedroom",
      priceLabel: "Price",
      priceUnit: "",
      bookNow: "Get Price",
      emptyState: "Select an apartment from the left to see more details and room views"
    }
  }[lang] || {
      title: "Qavat rejasi",
      subtitle: "Kerakli qavatni tanlang va xonadon holatini ko'ring",
      floorMap: "Qavat Chizmasi",
      apartmentsTitle: "Xonadonlar:",
      rooms: "xona",
      area: "m²",
      aptMap: "xonadon chizmasi",
      aptTitle: "xonadon",
      roomsLabel: "Xonalar",
      areaLabel: "Maydon",
      floorLabel: "Qavat",
      statusLabel: "Holati",
      roomViews: "Xonalar ko'rinishi",
      livingRoom: "Mehmonxona",
      bedroom: "Yotoqxona",
      priceLabel: "Narxi",
      priceUnit: "",
      bookNow: "Narxini bilish",
      emptyState: "Batafsil ma'lumot va xonalar ko'rinishini ko'rish uchun chap tomondan xonadonni tanlang"
  };

  const getStatus = (status: string) => {
    if (lang === 'uz') return status === 'Bronlangan' ? 'Bron qilindi' : status;
    if (lang === 'ru') {
      if (status === "Bo'sh") return "Свободно";
      if (status === "Band") return "Продано";
      if (status === "Bronlangan") return "Забронировано";
    }
    if (lang === 'en') {
      if (status === "Bo'sh") return "Available";
      if (status === "Band") return "Sold";
      if (status === "Bronlangan") return "Booked";
    }
    return status;
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
           <h3 className="text-2xl font-bold text-primary mb-2">{t.title}</h3>
           <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           {floors.map(f => (
             <button
               key={f}
               onClick={() => setActiveFloor(f)}
               className={cn(
                 "w-10 h-10 rounded-lg font-bold transition-all",
                 activeFloor === f ? "bg-primary text-white scale-110 shadow-lg" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
               )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 transition-all duration-500">
        {/* Left Column: Floor Plan & Apartment List */}
        <div className={cn("space-y-8 transition-all duration-500", selectedApt ? "lg:col-span-1" : "lg:col-span-2")}>
           {/* Interactive Floor Map (SVG Simulation) */}
           <div className={cn(
              "relative bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 overflow-hidden group transition-all duration-500",
              selectedApt ? "aspect-[4/5]" : "aspect-video"
           )}>
              <div className="absolute inset-0 z-0 opacity-10">
                 <img src="/voha-actual-bg.png" alt="Floor background" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10 text-center">
                 <h4 className={cn("font-black text-primary mb-2 opacity-30 group-hover:opacity-100 transition-opacity", selectedApt ? "text-xl" : "text-3xl")}>
                    {activeFloor}-{t.floorMap}
                 </h4>
              </div>
           </div>

           {/* Tagida xonalarni korsatish (Apartment list) */}
           <div>
              <h4 className="font-bold text-primary mb-4 text-lg">{t.apartmentsTitle}</h4>
              <div className={cn("grid gap-4", selectedApt ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4")}>
                 {floorApartments.map((apt) => (
                   <div
                     key={apt.id}
                     onClick={() => {
                       // Only reveal the apartment details here; the phone form
                       // opens when the customer presses the "Narxini bilish" button.
                       setSelectedApt(apt);
                     }}
                     className={cn(
                       "p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center text-center group",
                       selectedApt?.id === apt.id ? "border-accent bg-accent/10 shadow-lg" : 
                       apt.status === 'Bo\'sh' ? "bg-white border-success/20 hover:border-success shadow-sm" : 
                       apt.status === 'Band' ? "bg-gray-50 border-danger/20 cursor-not-allowed opacity-60" :
                       "bg-white border-warning/20 hover:border-warning shadow-sm"
                     )}
                   >
                      <div className="flex justify-between items-center w-full mb-2">
                         <span className="text-xl font-bold text-primary">{apt.number}</span>
                         <div className={cn(
                           "w-3 h-3 rounded-full",
                           apt.status === 'Bo\'sh' ? "bg-success" : 
                           apt.status === 'Band' ? "bg-danger" : "bg-warning"
                         )} />
                      </div>
                      <span className="text-xs uppercase font-bold text-gray-500">{apt.rooms} {t.rooms}<br/>{apt.area} {t.area}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Selected Apartment Side Panel */}
        <div className={cn("flex flex-col transition-all duration-500", selectedApt ? "lg:col-span-2" : "lg:col-span-1")}>
           {selectedApt ? (
             <div className="animate-fade-in bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
                {/* Apartment Plan */}
                <div className="aspect-[4/3] bg-[#f8fafc] rounded-2xl mb-6 relative overflow-hidden group border border-gray-200">
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <img src="/logo.png" alt="Plan" className="w-16 opacity-10 grayscale mb-2" />
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{selectedApt.number}-{t.aptMap}</span>
                   </div>
                </div>

                <h4 className="text-3xl font-black text-primary mb-6 tracking-tight">{selectedApt.number}-{t.aptTitle}</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-xs text-gray-400 uppercase font-bold mb-1">{t.roomsLabel}</div>
                      <div className="font-black text-primary text-xl">{selectedApt.rooms}</div>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-xs text-gray-400 uppercase font-bold mb-1">{t.areaLabel}</div>
                      <div className="font-black text-primary text-xl">{selectedApt.area} {t.area}</div>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-xs text-gray-400 uppercase font-bold mb-1">{t.floorLabel}</div>
                      <div className="font-black text-primary text-xl">{selectedApt.floor}</div>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-xs text-gray-400 uppercase font-bold mb-1">{t.statusLabel}</div>
                      <div className={cn(
                        "font-black text-xl",
                        selectedApt.status === 'Bo\'sh' ? "text-success" : 
                        selectedApt.status === 'Band' ? "text-danger" : "text-warning"
                      )}>{getStatus(selectedApt.status)}</div>
                   </div>
                </div>

                {/* Xonalar ko'rinishi (Room Views) */}
                <div className="mb-8">
                   <h5 className="font-bold text-primary mb-3 text-sm uppercase tracking-wider">{t.roomViews}</h5>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-square rounded-xl overflow-hidden relative group">
                         <img src="/voha-actual-bg.png" alt="Mehmonxona" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                            <span className="text-white text-xs font-bold">{t.livingRoom}</span>
                         </div>
                      </div>
                      <div className="aspect-square rounded-xl overflow-hidden relative group">
                         <img src="/voha-actual-bg.png" alt="Yotoqxona" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                            <span className="text-white text-xs font-bold">{t.bedroom}</span>
                         </div>
                      </div>
                   </div>
                </div>
                
                <div className="mb-8 p-4 bg-accent/5 rounded-xl border border-accent/20 text-center">
                   <div className="text-accent mb-2 font-bold uppercase tracking-widest">{t.priceLabel}</div>
                   <div className="text-sm font-medium text-gray-500">
                     Sotuv bo‘limi menejerlaridan maxsus taklif va aniq narxni olish uchun so‘rov qoldiring.
                   </div>
                </div>

                {selectedApt.status === 'Bo\'sh' ? (
                  <button 
                    onClick={() => onSelect(selectedApt)}
                    className="w-full py-4 bg-accent text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-[0_4px_15px_rgba(250,218,165,0.4)] tracking-wide"
                  >
                    {t.bookNow}
                  </button>
                ) : (
                  <div className="w-full py-4 bg-gray-50 text-gray-400 font-bold rounded-xl text-center border-2 border-dashed border-gray-200">
                     {getStatus(selectedApt.status)}
                  </div>
                )}
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center text-gray-300 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 p-10">
                <Info size={48} className="mb-4 opacity-20" />
                <p className="font-medium text-gray-400">{t.emptyState}</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
