'use client';

export default function HeavyWidget() {
  return (
    <div className="rounded-xl border border-green-300 bg-green-50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">✅</span>
        <div>
          <h3 className="font-bold text-green-900 text-lg">¡HeavyWidget cargado!</h3>
          <p className="text-green-700 text-sm">Este componente fue importado de forma diferida — su JS fue descargado bajo demanda.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        {['Carga diferida', 'Sin costo inicial', 'Con Suspense'].map((label) => (
          <div key={label} className="bg-green-100 rounded-lg px-3 py-2 text-green-800 font-medium">
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
