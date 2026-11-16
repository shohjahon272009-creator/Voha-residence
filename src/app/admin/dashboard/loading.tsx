// Statistika yuklanayotganda — sahifa tuzilishidagi skeleton (amoCRM javobi bir necha soniya olishi mumkin)
export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Statistika yuklanmoqda">
      <div className="h-10 w-72 rounded-xl bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-gray-200" />)}
      </div>
      <div className="h-72 rounded-2xl bg-gray-200" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-64 rounded-2xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}
