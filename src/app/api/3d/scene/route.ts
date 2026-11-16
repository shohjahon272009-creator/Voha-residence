import { getSceneData } from '@/lib/scene';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/*
  3D tur sahnasi: model manzili, pinlar, har pin uchun loyiha (nom, holat, qavatlar, rasm) va
  xonadonlar (qavat, raqam, xona, m², holat). Narx yo'q — rahbar qarori (src/lib/scene.ts).
*/
export async function GET() {
  const data = await getSceneData();
  return Response.json(data, {
    headers: {
      // Qisqa kesh: admin pin yoki xonadon holatini o'zgartirsa ~1 daqiqada ko'rinadi
      'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
