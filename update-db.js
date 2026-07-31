/* eslint-disable @typescript-eslint/no-require-imports */
const Database = require('better-sqlite3');
const db = new Database('qurilish.db');

const vohaSettings = {
  primary_color: '#014242',
  accent_color: '#D18E5B',
  company_name: 'Voha Residence',
  hero_title_uz: 'VOHA RESIDENCE - ORZUYINGIZDAGI MAKON',
  hero_title_ru: 'VOHA RESIDENCE - МЕСТО ВАШЕЙ МЕЧТЫ',
  hero_title_en: 'VOHA RESIDENCE - THE PLACE OF YOUR DREAMS',
  hero_desc_uz: 'Urganch shahri markazida joylashgan zamonaviy va muhtasham turar joy majmuasi',
  hero_desc_ru: 'Современный и великолепный жилой комплекс в центре Ургенча',
  hero_desc_en: 'A modern and magnificent residential complex in the center of Urgench',
  about_title_uz: 'VOHA RESIDENCE HAQIDA',
  about_title_ru: 'О VOHA RESIDENCE',
  about_title_en: 'ABOUT VOHA RESIDENCE',
  about_desc_uz: 'Voha Residence - bu shunchaki yashash joyi emas, bu siz va oilangiz uchun mukammal hayot tarzi.',
  about_desc_ru: 'Voha Residence - это не просто место для жизни, это идеальный образ жизни для вас и вашей семьи.',
  about_desc_en: 'Voha Residence is not just a place to live, it is the perfect lifestyle for you and your family.',
};

for (const [key, value] of Object.entries(vohaSettings)) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

console.log('DB Updated');
