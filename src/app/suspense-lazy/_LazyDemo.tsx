'use client';

import { Suspense, lazy, useState } from 'react';

// React.lazy con un retraso artificial de 2 segundos para que el spinner sea visible
const HeavyWidget = lazy(
  () =>
    new Promise<{ default: React.ComponentType }>((resolve) =>
      setTimeout(() => resolve(import('./_HeavyWidget')), 2000)
    )
);

function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <span
        className="inline-block h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"
        role="status"
        aria-label={label}
      />
      <p className="text-sm text-gray-500 font-mono">{label}</p>
    </div>
  );
}

export function LazyDemo() {
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(0);

  function reload() {
    setShow(false);
    setTimeout(() => {
      setKey((k) => k + 1);
      setShow(true);
    }, 50);
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden">
      {/* Demo header */}
      <div className="bg-gray-900 px-5 py-3 flex items-center justify-between">
        <span className="text-gray-400 text-xs font-mono">Demo en Vivo — React.lazy + Suspense</span>
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Haz clic en el botón para cargar con lazy <code className="bg-gray-100 px-1 rounded font-mono text-xs">HeavyWidget</code>.
          Tiene un <strong>retraso artificial de 2 segundos</strong> para que puedas observar el spinner en acción.
        </p>

        <div className="flex gap-3 flex-wrap">
          {!show ? (
            <button
              onClick={() => setShow(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition text-sm"
            >
              Cargar HeavyWidget
            </button>
          ) : (
            <button
              onClick={reload}
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2 rounded-lg transition text-sm"
            >
              Recargar (ver el spinner de nuevo)
            </button>
          )}
        </div>

        {show && (
          <Suspense fallback={<Spinner label="Descargando chunk de HeavyWidget…" />} key={key}>
            <HeavyWidget />
          </Suspense>
        )}
      </div>
    </div>
  );
}
