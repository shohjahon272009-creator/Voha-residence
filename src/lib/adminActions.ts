 
/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
 
'use server';

import db from './db';
import { revalidatePath } from 'next/cache';
import { saveUpload } from './storage';

// Bir nechta galereya rasmini saqlaydi va URL ro'yxatini qaytaradi (ixtiyoriy)
async function saveGalleryFiles(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) {
    if (!f || !f.name || f.size === 0) continue;
    try {
      const buffer = Buffer.from(await f.arrayBuffer());
      const safeName = f.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}-g${urls.length}-${safeName}`;
      urls.push(await saveUpload(buffer, fileName));
    } catch (error) {
      console.error('Error saving gallery image:', error);
    }
  }
  return urls;
}

// Loyihaga yangi xonadon qo'shish (admin qo'lda kiritadi)
export async function addApartment(formData: FormData) {
  const project_id = parseInt(formData.get('project_id') as string);
  if (!project_id) return;
  const floor = parseInt(formData.get('floor') as string) || 1;
  const number = (formData.get('number') as string || `${floor}01`).trim();
  const rooms = parseInt(formData.get('rooms') as string) || 1;
  const area = parseFloat(formData.get('area') as string) || 0;
  const price_cash = parseFloat(formData.get('price_cash') as string) || 0;
  const status = (formData.get('status') as string) || "Bo'sh";

  // Chizma (plan) rasmi — ixtiyoriy
  let planUrl = '';
  const planFile = formData.get('plan_image') as File | null;
  if (planFile && planFile.name && planFile.size > 0) {
    try {
      const buffer = Buffer.from(await planFile.arrayBuffer());
      const safeName = planFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}-plan-${safeName}`;
      planUrl = await saveUpload(buffer, fileName);
    } catch (error) {
      console.error('Error saving plan image:', error);
    }
  }

  await db.prepare(`INSERT INTO apartments (project_id, floor, number, rooms, area, price_cash, price_installment, status, plan_image, image, orientation, note)
    VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, '', '', '')`).run(project_id, floor, number, rooms, area, price_cash, status, planUrl);

  revalidatePath('/admin/apartments');
  revalidatePath('/admin/dashboard');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}

// Ko'p xonadonni bir vaqtda qo'shish. Har qator: qavat, raqam, xona, maydon, narx
// (vergul, nuqta-vergul yoki Excel'dan nusxa — TAB bilan ajratiladi).
export async function addApartmentsBulk(projectId: number, text: string): Promise<{ added: number }> {
  if (!projectId || !text) return { added: 0 };
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let added = 0;
  for (const line of lines) {
    const p = line.split(/\t|,|;/).map((x) => x.trim());
    const floor = parseInt(p[0]) || 1;
    const number = (p[1] || `${floor}01`).trim();
    const rooms = parseInt(p[2]) || 1;
    const area = parseFloat(p[3]) || 0;
    const price = parseFloat((p[4] || '').replace(/\s/g, '')) || 0;
    await db.prepare(
      `INSERT INTO apartments (project_id, floor, number, rooms, area, price_cash, price_installment, status, plan_image, image, orientation, note)
       VALUES (?, ?, ?, ?, ?, ?, NULL, ?, '', '', '', '')`
    ).run(projectId, floor, number, rooms, area, price, "Bo'sh");
    added++;
  }
  revalidatePath('/admin/apartments');
  revalidatePath('/admin/dashboard');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
  return { added };
}

// Bitta sozlamani (masalan xonadonlar bo'limi ko'rinishi) tez yoqish/o'chirish uchun
export async function setSiteSetting(key: string, value: string) {
  // Faqat ko'rinish (show_*) sozlamalariga ruxsat
  if (!key.startsWith('show_')) return;
  await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);
  revalidatePath('/admin/apartments');
  revalidatePath('/admin/settings');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}

export async function addProject(formData: FormData) {
  const name_uz = formData.get('name_uz') as string;
  const name_ru = formData.get('name_ru') as string;
  const name_en = formData.get('name_en') as string;
  const description_uz = formData.get('description_uz') as string;
  const description_ru = formData.get('description_ru') as string;
  const description_en = formData.get('description_en') as string;
  const city = formData.get('city') as string;
  const district = formData.get('district') as string;
  const status = formData.get('status') as string;
  const total_floors = parseInt(formData.get('total_floors') as string) || 0;
  const apts_per_floor = parseInt(formData.get('apts_per_floor') as string) || 4;
  const min_price = Math.round((parseFloat(formData.get('min_price') as string) || 0) * 1000000);
  const days_left = parseInt(formData.get('days_left') as string) || 0;
  const virtual_tour_url = (formData.get('virtual_tour_url') as string || '').trim();
  const is_sold_out = formData.get('is_sold_out') === 'true';
  const discount_label = (formData.get('discount_label') as string || '').trim() || null;
  const gift_label = (formData.get('gift_label') as string || '').trim() || null;
  const categories = JSON.stringify(formData.getAll('categories'));
  const delivery_year = parseInt(formData.get('delivery_year') as string) || null;

  const imageFile = formData.get('main_image') as File | null;
  let imageUrl = '/voha-actual-bg.png';

  if (imageFile && imageFile.name && imageFile.size > 0) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}-${safeName}`;
      imageUrl = await saveUpload(buffer, fileName);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  }

  // 360° panorama image upload takes precedence over an external tour URL
  let finalTourUrl: string | null = virtual_tour_url || null;
  const tourImageFile = formData.get('virtual_tour_image') as File | null;
  if (tourImageFile && tourImageFile.name && tourImageFile.size > 0) {
    try {
      const buffer = Buffer.from(await tourImageFile.arrayBuffer());
      const safeName = tourImageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}-360-${safeName}`;
      finalTourUrl = await saveUpload(buffer, fileName);
    } catch (error) {
      console.error('Error saving 360 image:', error);
    }
  }

  // Qo'shimcha rasmlar (gallery) — ixtiyoriy, bir nechta fayl
  const galleryUrls = await saveGalleryFiles(formData.getAll('gallery_images') as File[]);

  const stmt = db.prepare(`
    INSERT INTO projects (
      name_uz, name_ru, name_en,
      description_uz, description_ru, description_en,
      city, district, address,
      status, total_floors, apts_per_floor, min_price, main_image, gallery, days_left, virtual_tour_url,
      discount_label, gift_label, categories, delivery_year, is_sold_out
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = await stmt.run(
    name_uz, name_ru, name_en,
    description_uz, description_ru, description_en,
    city, district, '',
    status, total_floors, apts_per_floor, min_price, imageUrl, JSON.stringify(galleryUrls), days_left, finalTourUrl,
    discount_label, gift_label, categories, delivery_year, is_sold_out ? 1 : 0
  );

  // Xonadonlar avtomatik yaratilMAYDI — admin har xonadonni o'zi (real maydon,
  // xona, chizma bilan) "Xonadon qo'shish" orqali kiritadi.
  void result;

  revalidatePath('/admin/projects');
  revalidatePath('/admin/sold-out');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}
export async function deleteProject(id: number) {
  // First delete all bookings related to apartments in this project
  const apartments = await db.prepare('SELECT id FROM apartments WHERE project_id = ?').all(id) as { id: number }[];
  for (const apt of apartments) {
    await db.prepare('DELETE FROM bookings WHERE apartment_id = ?').run(apt.id);
  }
  // Delete all apartments in this project
  await db.prepare('DELETE FROM apartments WHERE project_id = ?').run(id);

  // Finally delete the project
  await db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  
  revalidatePath('/admin/projects');
  revalidatePath('/admin/sold-out');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}

export async function updateProject(id: number, formData: FormData) {
  const name_uz = formData.get('name_uz') as string;
  const name_ru = formData.get('name_ru') as string;
  const name_en = formData.get('name_en') as string;
  const description_uz = formData.get('description_uz') as string;
  const description_ru = formData.get('description_ru') as string;
  const description_en = formData.get('description_en') as string;
  const city = formData.get('city') as string;
  const district = formData.get('district') as string;
  const status = formData.get('status') as string;
  const total_floors = parseInt(formData.get('total_floors') as string) || 0;
  const apts_per_floor = parseInt(formData.get('apts_per_floor') as string) || 4;
  const min_price = Math.round((parseFloat(formData.get('min_price') as string) || 0) * 1000000);
  const days_left = parseInt(formData.get('days_left') as string) || 0;
  const virtual_tour_url = (formData.get('virtual_tour_url') as string || '').trim();
  const discount_label = (formData.get('discount_label') as string || '').trim() || null;
  const gift_label = (formData.get('gift_label') as string || '').trim() || null;
  const categories = JSON.stringify(formData.getAll('categories'));
  const delivery_year = parseInt(formData.get('delivery_year') as string) || null;
  const is_sold_out = formData.get('is_sold_out') === 'true' ? 1 : 0;

  const imageFile = formData.get('main_image') as File | null;
  let imageUrl = null;

  if (imageFile && imageFile.name && imageFile.size > 0) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}-${safeName}`;
      imageUrl = await saveUpload(buffer, fileName);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  }

  // 360° panorama image upload takes precedence over an external tour URL
  let finalTourUrl: string | null = virtual_tour_url || null;
  const tourImageFile = formData.get('virtual_tour_image') as File | null;
  if (tourImageFile && tourImageFile.name && tourImageFile.size > 0) {
    try {
      const buffer = Buffer.from(await tourImageFile.arrayBuffer());
      const safeName = tourImageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}-360-${safeName}`;
      finalTourUrl = await saveUpload(buffer, fileName);
    } catch (error) {
      console.error('Error saving 360 image:', error);
    }
  }

  if (imageUrl) {
    const stmt = db.prepare(`
      UPDATE projects SET
        name_uz = ?, name_ru = ?, name_en = ?,
        description_uz = ?, description_ru = ?, description_en = ?,
        city = ?, district = ?, status = ?, total_floors = ?, apts_per_floor = ?, min_price = ?, main_image = ?, days_left = ?, virtual_tour_url = ?,
        discount_label = ?, gift_label = ?, categories = ?, delivery_year = ?, is_sold_out = ?
      WHERE id = ?
    `);
    await stmt.run(
      name_uz, name_ru, name_en,
      description_uz, description_ru, description_en,
      city, district, status, total_floors, apts_per_floor, min_price, imageUrl, days_left, finalTourUrl,
      discount_label, gift_label, categories, delivery_year, is_sold_out, id
    );
  } else {
    const stmt = db.prepare(`
      UPDATE projects SET
        name_uz = ?, name_ru = ?, name_en = ?,
        description_uz = ?, description_ru = ?, description_en = ?,
        city = ?, district = ?, status = ?, total_floors = ?, apts_per_floor = ?, min_price = ?, days_left = ?, virtual_tour_url = ?,
        discount_label = ?, gift_label = ?, categories = ?, delivery_year = ?, is_sold_out = ?
      WHERE id = ?
    `);
    await stmt.run(
      name_uz, name_ru, name_en,
      description_uz, description_ru, description_en,
      city, district, status, total_floors, apts_per_floor, min_price, days_left, finalTourUrl,
      discount_label, gift_label, categories, delivery_year, is_sold_out, id
    );
  }

  // Yangi galereya rasmlari yuklangan bo'lsa — mavjudlariga qo'shamiz (ixtiyoriy)
  const newGallery = await saveGalleryFiles(formData.getAll('gallery_images') as File[]);
  if (newGallery.length > 0) {
    const row = await db.prepare('SELECT gallery FROM projects WHERE id = ?').get(id) as { gallery: string } | undefined;
    let existing: string[] = [];
    try { existing = row?.gallery ? JSON.parse(row.gallery) : []; } catch { existing = []; }
    await db.prepare('UPDATE projects SET gallery = ? WHERE id = ?').run(JSON.stringify([...existing, ...newGallery]), id);
  }

  revalidatePath('/admin/projects');
  revalidatePath('/admin/sold-out');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}
export async function saveSettings(formData: FormData) {
  const company_name = formData.get('company_name') as string;
  const meta_title_uz = formData.get('meta_title_uz') as string;
  const meta_description = formData.get('meta_description') as string;
  const bot_token = formData.get('bot_token') as string;
  const admin_chat_id = formData.get('admin_chat_id') as string;

  const updateSetting = async (key: string, value: string) => {
    await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?').run(key, value, value);
  };

  if (company_name) await updateSetting('company_name', company_name);
  if (meta_title_uz) await updateSetting('meta_title_uz', meta_title_uz);
  if (meta_description) await updateSetting('meta_description', meta_description);
  if (bot_token) await updateSetting('bot_token', bot_token);
  if (admin_chat_id) await updateSetting('admin_chat_id', admin_chat_id);

  const primary_color = formData.get('primary_color') as string;
  const accent_color = formData.get('accent_color') as string;
  if (primary_color) await updateSetting('primary_color', primary_color);
  if (accent_color) await updateSetting('accent_color', accent_color);

  const hero_title = formData.get('hero_title') as string;
  const hero_desc = formData.get('hero_desc') as string;
  const about_title = formData.get('about_title') as string;
  const about_desc = formData.get('about_desc') as string;
  const about_stat1_value = formData.get('about_stat1_value') as string;
  const about_stat1_label = formData.get('about_stat1_label') as string;
  const about_stat2_value = formData.get('about_stat2_value') as string;
  const about_stat2_label = formData.get('about_stat2_label') as string;

  if (hero_title) await updateSetting('hero_title', hero_title);
  if (hero_desc) await updateSetting('hero_desc', hero_desc);

  // Aloqa ma'lumotlari — admin boshqaradi (telefon, manzil, ish vaqti)
  const contact_phone = formData.get('contact_phone') as string;
  const contact_address = formData.get('contact_address') as string;
  const contact_hours = formData.get('contact_hours') as string;
  if (contact_phone) await updateSetting('contact_phone', contact_phone);
  if (contact_address) await updateSetting('contact_address', contact_address);
  if (contact_hours) await updateSetting('contact_hours', contact_hours);

  // Hero (bosh ekran) statistikasi — 4 ta (raqam + nomi)
  for (let i = 1; i <= 4; i++) {
    const v = formData.get(`hero_stat${i}_value`);
    const l = formData.get(`hero_stat${i}_label`);
    if (v !== null) await updateSetting(`hero_stat${i}_value`, String(v));
    if (l !== null) await updateSetting(`hero_stat${i}_label`, String(l));
  }

  // About (Biz haqimizda) afzalliklari — 4 ta (sarlavha + tavsif)
  for (let i = 1; i <= 4; i++) {
    const tt = formData.get(`about_adv${i}_title`);
    const dd = formData.get(`about_adv${i}_desc`);
    if (tt !== null) await updateSetting(`about_adv${i}_title`, String(tt));
    if (dd !== null) await updateSetting(`about_adv${i}_desc`, String(dd));
  }

  // Sotuv ofisi xarita koordinatasi
  const office_lat = formData.get('office_lat') as string;
  const office_lng = formData.get('office_lng') as string;
  if (office_lat) await updateSetting('office_lat', office_lat);
  if (office_lng) await updateSetting('office_lng', office_lng);

  // To'lov shartlari (foizlar) — admin belgilaydi, mijoz shu bo'yicha to'lovni ko'radi
  for (const key of ['calc_down', 'calc_months', 'calc_rate', 'calc_m_down', 'calc_m_months']) {
    const v = formData.get(key);
    if (v !== null && String(v).trim() !== '') await updateSetting(key, String(v).trim());
  }
  if (about_title) await updateSetting('about_title', about_title);
  if (about_desc) await updateSetting('about_desc', about_desc);
  if (about_stat1_value) await updateSetting('about_stat1_value', about_stat1_value);
  if (about_stat1_label) await updateSetting('about_stat1_label', about_stat1_label);
  if (about_stat2_value) await updateSetting('about_stat2_value', about_stat2_value);
  if (about_stat2_label) await updateSetting('about_stat2_label', about_stat2_label);

  const show_projects = formData.get('show_projects') as string;
  const show_search = formData.get('show_search') as string;
  const show_mortgage = formData.get('show_mortgage') as string;
  const show_about = formData.get('show_about') as string;
  const show_news = formData.get('show_news') as string;
  const show_contact = formData.get('show_contact') as string;
  const show_offices = formData.get('show_offices') as string;

  await updateSetting('show_projects', show_projects ? 'true' : 'false');
  await updateSetting('show_search', show_search ? 'true' : 'false');
  await updateSetting('show_mortgage', show_mortgage ? 'true' : 'false');
  await updateSetting('show_about', show_about ? 'true' : 'false');
  await updateSetting('show_news', show_news ? 'true' : 'false');
  await updateSetting('show_contact', show_contact ? 'true' : 'false');
  await updateSetting('show_offices', show_offices ? 'true' : 'false');

  const logoFile = formData.get('company_logo') as File | null;
  if (logoFile && logoFile.name && logoFile.size > 0) {
    try {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const safeName = logoFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `logo-${Date.now()}-${safeName}`;
      await updateSetting('company_logo', await saveUpload(buffer, fileName));
    } catch (error) {
      console.error('Error saving logo:', error);
    }
  }

  revalidatePath('/admin');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}
export async function updateApartment(id: number, formData: FormData) {
  const rooms = parseInt(formData.get('rooms') as string) || 1;
  const area = parseFloat(formData.get('area') as string) || 0;
  const price_cash = parseFloat(formData.get('price_cash') as string) || 0;
  const floor = parseInt(formData.get('floor') as string) || 1;
  const number = (formData.get('number') as string || '').trim();
  // Xonadon holati endi formada yo'q — kelmasa, bazadagi mavjud qiymat saqlanadi.
  const status = formData.get('status') as string | null;

  const imageFile = formData.get('plan_image') as File | null;
  let planUrl = null;

  if (imageFile && imageFile.name && imageFile.size > 0) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}-plan-${safeName}`;
      planUrl = await saveUpload(buffer, fileName);
    } catch (error) {
      console.error('Error saving plan image:', error);
    }
  }

  const regularImageFile = formData.get('image') as File | null;
  let regularImageUrl = null;

  if (regularImageFile && regularImageFile.name && regularImageFile.size > 0) {
    try {
      const buffer = Buffer.from(await regularImageFile.arrayBuffer());
      const safeName = regularImageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}-apt-${safeName}`;
      regularImageUrl = await saveUpload(buffer, fileName);
    } catch (error) {
      console.error('Error saving regular image:', error);
    }
  }

  const updateFields: string[] = ['rooms = ?', 'area = ?', 'price_cash = ?', 'floor = ?'];

  const updateValues: any[] = [rooms, area, price_cash, floor];

  if (number) {
    updateFields.push('number = ?');
    updateValues.push(number);
  }

  if (status) {
    updateFields.push('status = ?');
    updateValues.push(status);
  }

  if (planUrl) {
    updateFields.push('plan_image = ?');
    updateValues.push(planUrl);
  }
  
  if (regularImageUrl) {
    updateFields.push('image = ?');
    updateValues.push(regularImageUrl);
  }

  updateValues.push(id);

  db.prepare(`UPDATE apartments SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

  const client_name = formData.get('client_name') as string;
  const client_phone = formData.get('client_phone') as string;

  if (client_name && client_phone && (status === 'Band' || status === 'Bronlangan')) {
    db.prepare(`
      INSERT INTO bookings (apartment_id, client_name, client_phone, status, note)
      VALUES (?, ?, ?, 'Tasdiqlangan', ?)
    `).run(id, client_name, client_phone, "Admin tomonidan tahrirlash darchasi orqali qo'shildi");
  }

  revalidatePath('/admin/apartments');
  revalidatePath('/admin/bookings');
  revalidatePath('/admin/customers');
  revalidatePath('/admin');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}

// Bitta xonadonni butunlay o'chirish (unga bog'liq bronlar ham o'chadi)
export async function deleteApartment(id: number) {
  await db.prepare('DELETE FROM bookings WHERE apartment_id = ?').run(id);
  await db.prepare('DELETE FROM apartments WHERE id = ?').run(id);
  revalidatePath('/admin/apartments');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/sold-out');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}

export async function addNews(formData: FormData) {
  const title_uz = formData.get('title_uz') as string;
  const title_ru = formData.get('title_ru') as string;
  const title_en = formData.get('title_en') as string;
  const content_uz = formData.get('content_uz') as string;
  const content_ru = formData.get('content_ru') as string;
  const content_en = formData.get('content_en') as string;
  const category = formData.get('category') as string || 'General';

  const imageFile = formData.get('image') as File | null;
  let imageUrl = null;

  if (imageFile && imageFile.name && imageFile.size > 0) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}-news-${safeName}`;
      imageUrl = await saveUpload(buffer, fileName);
    } catch (error) {
      console.error('Error saving news image:', error);
    }
  }

  db.prepare(`
    INSERT INTO news (
      title_uz, title_ru, title_en,
      content_uz, content_ru, content_en,
      category, image, visible
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    title_uz, title_ru || title_uz, title_en || title_uz,
    content_uz, content_ru || content_uz, content_en || content_uz,
    category, imageUrl
  );

  revalidatePath('/admin/news');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}

export async function updateBookingStatus(formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const status = formData.get('status') as string;
  const actionType = formData.get('action_type') as string;
  if (!id || !status) return;

   
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id) as any;
  if (!booking) return;

  db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, id);

  if (status === 'Tasdiqlangan' && booking.apartment_id) {
    if (actionType === 'sell') {
      db.prepare("UPDATE apartments SET status = 'Band' WHERE id = ?").run(booking.apartment_id);
    } else {
      db.prepare("UPDATE apartments SET status = 'Bronlangan' WHERE id = ?").run(booking.apartment_id);
    }
  } else if (status === 'Bekor qilingan' && booking.apartment_id) {
    db.prepare("UPDATE apartments SET status = ? WHERE id = ?").run("Bo'sh", booking.apartment_id);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/bookings');
  revalidatePath('/admin/apartments');
}

export async function addSale(formData: FormData) {
  const apartment_id = parseInt(formData.get('apartment_id') as string);
  const client_name = formData.get('client_name') as string;
  const client_phone = formData.get('client_phone') as string;

  if (!apartment_id || !client_name || !client_phone) return;

  db.prepare("UPDATE apartments SET status = 'Band' WHERE id = ?").run(apartment_id);

  db.prepare(`
    INSERT INTO bookings (apartment_id, client_name, client_phone, status, note)
    VALUES (?, ?, ?, 'Tasdiqlangan', ?)
  `).run(apartment_id, client_name, client_phone, "Sotuvlar bo'limidan admin kiritdi");

  revalidatePath('/admin/sales');
  revalidatePath('/admin/apartments');
  revalidatePath('/admin/bookings');
  revalidatePath('/admin/customers');
  revalidatePath('/admin/dashboard');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}

export async function deleteNews(id: number) {
  db.prepare('DELETE FROM news WHERE id = ?').run(id);
  revalidatePath('/admin/news');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}

export async function updateNews(id: number, formData: FormData) {
  const title_uz = formData.get('title_uz') as string;
  const title_ru = formData.get('title_ru') as string;
  const title_en = formData.get('title_en') as string;
  const content_uz = formData.get('content_uz') as string;
  const content_ru = formData.get('content_ru') as string;
  const content_en = formData.get('content_en') as string;
  const category = formData.get('category') as string;
  
  if (!title_uz || !content_uz) return;

  const imageFile = formData.get('image') as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.name && imageFile.size > 0) {
    try {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileName = `${Date.now()}-news-${safeName}`;
      imageUrl = await saveUpload(buffer, fileName);
    } catch (error) {
      console.error('Error saving news image:', error);
    }
  }

  if (imageUrl) {
    db.prepare(`
      UPDATE news SET
        title_uz = ?, title_ru = ?, title_en = ?,
        content_uz = ?, content_ru = ?, content_en = ?,
        category = ?, image = ?
      WHERE id = ?
    `).run(
      title_uz, title_ru || title_uz, title_en || title_uz,
      content_uz, content_ru || content_uz, content_en || content_uz,
      category, imageUrl, id
    );
  } else {
    db.prepare(`
      UPDATE news SET
        title_uz = ?, title_ru = ?, title_en = ?,
        content_uz = ?, content_ru = ?, content_en = ?,
        category = ?
      WHERE id = ?
    `).run(
      title_uz, title_ru || title_uz, title_en || title_uz,
      content_uz, content_ru || content_uz, content_en || content_uz,
      category, id
    );
  }

  revalidatePath('/admin/news');
  revalidatePath('/uz');
  revalidatePath('/ru');
  revalidatePath('/en');
}
