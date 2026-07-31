 
 
 
 
 
'use server';

import db from '@/lib/db';

export async function submitContact(formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const message = formData.get('message') as string;

  if (!name || !phone) return { success: false, error: "Ism va telefon raqam kiritilishi shart" };

  try {
    // Insert into bookings table as a general lead (apartment_id = NULL)
    db.prepare(`
      INSERT INTO bookings (client_name, client_phone, note, status)
      VALUES (?, ?, ?, 'Yangi')
    `).run(name, phone, message);

    // Send Telegram Notification if configured
    const tokenRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('bot_token') as { value: string } | undefined;
    const chatIdRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_chat_id') as { value: string } | undefined;

    if (tokenRow?.value && chatIdRow?.value) {
      const text = `🔔 *Yangi xabar (Saytdan)*\n\n👤 *Ism:* ${name}\n📞 *Telefon:* ${phone}\n💬 *Xabar:* ${message || "Yo'q"}`;
      
      await fetch(`https://api.telegram.org/bot${tokenRow.value}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatIdRow.value,
          text: text,
          parse_mode: 'Markdown'
        })
      }).catch(e => console.error("Telegram error:", e));
    }

    return { success: true };
  } catch (error) {
    console.error("Submit error:", error);
    return { success: false, error: "Xatolik yuz berdi" };
  }
}

export async function submitBooking(formData: FormData) {
  const apartmentId = formData.get('apartmentId') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const paymentType = formData.get('paymentType') as string;
  const message = formData.get('message') as string;

  if (!apartmentId || !name || !phone) return { success: false, error: "Barcha maydonlar to'ldirilishi shart" };

  try {
    // Insert into bookings table
    db.prepare(`
      INSERT INTO bookings (apartment_id, client_name, client_phone, payment_type, note, status)
      VALUES (?, ?, ?, ?, ?, 'Yangi')
    `).run(parseInt(apartmentId), name, phone, paymentType, message || null);

    // Update apartment status to Bronlangan
    db.prepare(`
      UPDATE apartments SET status = 'Bronlangan' WHERE id = ?
    `).run(parseInt(apartmentId));

    // Get apartment details for the notification
    const aptDetails = db.prepare(`
      SELECT a.number, p.name_uz as project_name 
      FROM apartments a 
      JOIN projects p ON a.project_id = p.id 
      WHERE a.id = ?
    `).get(parseInt(apartmentId)) as { number: string, project_name: string } | undefined;

    // Send Telegram Notification if configured
    const tokenRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('bot_token') as { value: string } | undefined;
    const chatIdRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_chat_id') as { value: string } | undefined;

    if (tokenRow?.value && chatIdRow?.value) {
      const aptInfo = aptDetails ? `${aptDetails.project_name}, №${aptDetails.number} xonadon` : `ID: ${apartmentId}`;
      const text = `🎉 *Yangi Bron!*\n\n👤 *Ism:* ${name}\n📞 *Telefon:* ${phone}\n🏢 *Xonadon:* ${aptInfo}\n💳 *To'lov turi:* ${paymentType}`;
      
      await fetch(`https://api.telegram.org/bot${tokenRow.value}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatIdRow.value,
          text: text,
          parse_mode: 'Markdown'
        })
      }).catch(e => console.error("Telegram error:", e));
    }

    return { success: true };
  } catch (error) {
    console.error("Booking error:", error);
    return { success: false, error: "Bron qilishda xatolik yuz berdi" };
  }
}

export async function submitPriceRequest(formData: FormData) {
  const apartmentId = formData.get('apartmentId') as string;
  const name = formData.get('name') as string || 'Mijoz';
  const phone = formData.get('phone') as string;
  const message = formData.get('message') as string;

  if (!apartmentId || !phone) return { success: false, error: "Telefon raqamini kiritish shart" };

  try {
    // Insert into bookings table as a Price Inquiry
    db.prepare(`
      INSERT INTO bookings (apartment_id, client_name, client_phone, payment_type, note, status)
      VALUES (?, ?, ?, 'Narxini bilish', ?, 'Yangi')
    `).run(parseInt(apartmentId), name, phone, message || null);

    // Get apartment details for the notification
    const aptDetails = db.prepare(`
      SELECT a.number, p.name_uz as project_name 
      FROM apartments a 
      JOIN projects p ON a.project_id = p.id 
      WHERE a.id = ?
    `).get(parseInt(apartmentId)) as { number: string, project_name: string } | undefined;

    // Send Telegram Notification if configured
    const tokenRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('bot_token') as { value: string } | undefined;
    const chatIdRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_chat_id') as { value: string } | undefined;

    if (tokenRow?.value && chatIdRow?.value) {
      const aptInfo = aptDetails ? `${aptDetails.project_name}, №${aptDetails.number} xonadon` : `ID: ${apartmentId}`;
      const text = `💰 *Yangi so'rov (Narxini bilish)*\n\n👤 *Ism:* ${name}\n📞 *Telefon:* ${phone}\n🏢 *Xonadon:* ${aptInfo}`;
      
      await fetch(`https://api.telegram.org/bot${tokenRow.value}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatIdRow.value,
          text: text,
          parse_mode: 'Markdown'
        })
      }).catch(e => console.error("Telegram error:", e));
    }

    return { success: true };
  } catch (error) {
    console.error("Price request error:", error);
    return { success: false, error: "Xatolik yuz berdi" };
  }
}
