/*
  Saytdan kelgan arizani amoCRM'ga yuboradi: kontakt (telefon bo'yicha mavjudi topiladi,
  bo'lmasa yaratiladi), lid va izoh.

  Sozlamalar faqat serverdagi .env.local'da (deploy/set-amocrm-token.sh kiritadi):
  AMOCRM_BASE_URL, AMOCRM_TOKEN (uzoq muddatli token), ixtiyoriy AMOCRM_PIPELINE_ID va
  AMOCRM_STATUS_ID (berilmasa lid asosiy voronkaning birinchi bosqichiga tushadi).
  Sozlanmagan bo'lsa hech narsa qilmaydi — ariza baribir bazaga va Telegram'ga tushadi.
*/

export type AmoLead = { title: string; name: string; phone: string; note: string };

const TIMEOUT_MS = 10_000;

type Field = { field_code?: string; values?: { value?: unknown }[] };
type Contact = { id: number; custom_fields_values?: Field[] | null };

const digits = (s: unknown) => String(s ?? '').replace(/\D/g, '');

function client() {
  const base = (process.env.AMOCRM_BASE_URL || '').replace(/\/+$/, '');
  const token = process.env.AMOCRM_TOKEN || '';
  if (!base || !token) return null;

  return async function call(method: 'GET' | 'POST', path: string, body?: unknown): Promise<unknown> {
    for (let attempt = 1; ; attempt++) {
      const res = await fetch(base + path, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if ((res.status === 429 || res.status >= 500) && attempt < 2) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      if (!res.ok) throw new Error(`amoCRM ${method} ${path}: ${res.status} ${(await res.text().catch(() => '')).slice(0, 300)}`);
      return res.status === 204 ? null : res.json();
    }
  };
}

// amoCRM qidiruvi matn bo'yicha — natijadan telefoni haqiqatan mos kelganini tanlaymiz
async function findContactId(call: NonNullable<ReturnType<typeof client>>, phone: string): Promise<number | null> {
  const body = (await call('GET', `/api/v4/contacts?query=${digits(phone)}`)) as { _embedded?: { contacts?: Contact[] } } | null;
  const tail = digits(phone).slice(-9);
  const match = body?._embedded?.contacts?.find((c) =>
    c.custom_fields_values?.some((f) => f.field_code === 'PHONE' && f.values?.some((v) => digits(v.value).slice(-9) === tail)),
  );
  return match?.id ?? null;
}

/** Lidni yuboradi. Qaytaradi: false — lid amoCRM'ga tushmadi (chaqiruvchi ogohlantiradi). */
export async function sendLeadToAmo(lead: AmoLead): Promise<boolean> {
  const call = client();
  if (!call) return true;

  try {
    const pipeline = Number(process.env.AMOCRM_PIPELINE_ID) || undefined;
    const status = Number(process.env.AMOCRM_STATUS_ID) || undefined;
    const fields = { name: lead.title, pipeline_id: pipeline, status_id: status };
    const tags = [{ name: 'Sayt' }];

    const contactId = await findContactId(call, lead.phone);
    let leadId: number | undefined;
    if (contactId) {
      const r = (await call('POST', '/api/v4/leads', [{ ...fields, _embedded: { tags, contacts: [{ id: contactId }] } }])) as { _embedded?: { leads?: { id: number }[] } };
      leadId = r._embedded?.leads?.[0]?.id;
    } else {
      const contact = { name: lead.name, custom_fields_values: [{ field_code: 'PHONE', values: [{ value: lead.phone, enum_code: 'MOB' }] }] };
      const r = (await call('POST', '/api/v4/leads/complex', [{ ...fields, _embedded: { tags, contacts: [contact] } }])) as { id: number }[];
      leadId = r[0]?.id;
    }

    // Lid tushdi — izoh tushmasa ham qayta yubormaymiz (dublikat bo'lmasin)
    if (leadId && lead.note) {
      await call('POST', '/api/v4/leads/notes', [{ entity_id: leadId, note_type: 'common', params: { text: lead.note } }])
        .catch((e) => console.error('amoCRM note error:', (e as Error).message));
    }
    return Boolean(leadId);
  } catch (e) {
    console.error('amoCRM error:', (e as Error).message);
    return false;
  }
}
