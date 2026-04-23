import Link from 'next/link';
import { LazyDemo } from './_LazyDemo';

const sections = [
  {
    id: 'what-is-suspense',
    number: 1,
    title: '¿Qué es Suspense?',
    icon: '⏳',
    color: 'blue',
    summary: 'Una frontera de React que muestra una UI de fallback mientras sus hijos están "esperando"',
    details: [
      '`<Suspense>` es un componente integrado de React que permite definir de forma declarativa un **estado de carga** para parte del árbol de componentes.',
      'Mientras un componente hijo está cargando (import lazy, datos async, imagen), Suspense muestra la prop `fallback` en su lugar.',
      'Una vez que el hijo termina de cargar, React intercambia el fallback por el contenido real — sin necesidad de `if (loading) return <Spinner />`.',
      'Los límites de Suspense pueden **anidarse**: los internos capturan primero los estados de carga; los externos actúan como fallback de todo lo demás.',
      'En el App Router de Next.js, `loading.tsx` envuelve automáticamente la página en un límite Suspense con tu skeleton como fallback.',
    ],
    code: `import { Suspense } from 'react';

// Sin Suspense — estado de carga manual (mucho boilerplate)
function FormaAntigua() {
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState(null);
  useEffect(() => { fetchData().then(d => { setData(d); setLoading(false); }); }, []);
  if (loading) return <Spinner />;
  return <DataView data={data} />;
}

// ─────────────────────────────────────────────────────────────

// Con Suspense — declarativo, sin boilerplate
function FormaNueva() {
  return (
    <Suspense fallback={<Spinner />}>
      {/* React muestra <Spinner /> hasta que <AsyncDataView /> termina de cargar */}
      <AsyncDataView />
    </Suspense>
  );
}

// Límites anidados — control granular
function Dashboard() {
  return (
    <Suspense fallback={<PageSkeleton />}>          {/* externo: toda la página */}
      <Header />
      <Suspense fallback={<ChartSkeleton />}>       {/* interno: solo el gráfico */}
        <RevenueChart />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>       {/* interno: solo la tabla */}
        <InspectionTable />
      </Suspense>
    </Suspense>
  );
}`,
    tip: 'Coloca los límites Suspense lo más cerca posible del componente que carga. Límites estrechos significan que más UI permanece interactiva mientras una parte carga.',
  },
  {
    id: 'what-is-lazy',
    number: 2,
    title: '¿Qué es React.lazy?',
    icon: '💤',
    color: 'violet',
    summary: 'Divide un componente en un chunk JS separado — cargado bajo demanda, no al inicio',
    details: [
      '`React.lazy()` recibe una función que retorna un `import()` dinámico — el componente solo se descarga cuando se renderiza por primera vez.',
      '**Divide el bundle**: el JavaScript del componente lazy vive en su propio chunk, reduciendo la carga inicial de la página.',
      '`React.lazy` **debe** usarse con un límite `<Suspense>` superior — Suspense provee el fallback durante la descarga.',
      'El módulo importado debe tener una **exportación por defecto** que sea un componente de React.',
      'En el App Router de Next.js, `next/dynamic` es la alternativa recomendada — soporta opciones SSR que `React.lazy` no tiene.',
    ],
    code: `import { lazy, Suspense } from 'react';

// React.lazy — import dinámico, dividido en chunk JS separado
const HeavyChart    = lazy(() => import('./HeavyChart'));
const RichTextEditor = lazy(() => import('./RichTextEditor'));
const MapWidget     = lazy(() => import('./MapWidget'));

// ⚠️  Reglas:
//   1. Debe ser una exportación por defecto en el módulo importado
//   2. Debe estar envuelto en <Suspense>
//   3. Llama a lazy() al nivel del módulo (no dentro de un componente)

// ✅ Uso correcto
function Dashboard() {
  return (
    <Suspense fallback={<div>Cargando gráfico…</div>}>
      <HeavyChart data={data} />
    </Suspense>
  );
}

// ❌ Incorrecto — lazy() dentro de un componente se recrea en cada render
function Mal() {
  const Chart = lazy(() => import('./Chart')); // nunca hagas esto
  return <Chart />;
}`,
    tip: 'Declara siempre lazy() al nivel del módulo (al inicio del archivo), nunca dentro del cuerpo de un componente. Recrearlo en cada render rompe el caché.',
  },
  {
    id: 'spinner-patterns',
    number: 3,
    title: 'Patrones de Loading Spinner',
    icon: '🌀',
    color: 'cyan',
    summary: 'Construyendo spinners accesibles y reutilizables como fallbacks de Suspense',
    details: [
      'La prop `fallback` de `<Suspense>` acepta **cualquier nodo de React** — un spinner, skeleton, shimmer o texto plano.',
      'CSS `animate-spin` (Tailwind) o una animación CSS en `border-top` crea un spinner simple sin dependencias.',
      'Siempre agrega `role="status"` y `aria-label` a los spinners para accesibilidad con lectores de pantalla.',
      'Para páginas con mucho contenido, los **skeleton loaders** (formas grises de marcador) son mejores que los spinners — reducen el tiempo de espera percibido.',
      'Puedes pasar una prop `label` personalizada al spinner fallback para describir qué está cargando (mejor UX).',
    ],
    code: `// Spinner CSS mínimo — sin librerías necesarias
function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <span
        className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"
        role="status"
        aria-label={label}
      />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

// Skeleton loader — mejor para carga con conciencia del layout
function InspectionTableSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded" />
      ))}
    </div>
  );
}

// Uso con Suspense
<Suspense fallback={<Spinner label="Cargando tabla de inspecciones…" />}>
  <InspectionTable />
</Suspense>

<Suspense fallback={<InspectionTableSkeleton />}>
  <InspectionTable />
</Suspense>`,
    tip: 'Los skeletons superan a los spinners en rendimiento percibido. Haz que la forma del skeleton coincida con el componente real para que el layout no se desplace al revelarse.',
  },
  {
    id: 'next-dynamic',
    number: 4,
    title: 'next/dynamic — El Enfoque de Next.js',
    icon: '▲',
    color: 'slate',
    summary: 'next/dynamic envuelve React.lazy con soporte SSR y acceso a exportaciones nombradas',
    details: [
      '`next/dynamic` es el wrapper de Next.js alrededor de `React.lazy` + `Suspense` que agrega control SSR.',
      'Pasa `{ ssr: false }` para omitir el renderizado en servidor — útil para componentes solo del navegador (`window`, `document`, mapas, gráficos).',
      'Envuelve automáticamente el import en un límite Suspense cuando pasas la opción `loading` — sin necesidad de un wrapper `<Suspense>` explícito.',
      'Con `{ ssr: false }`, el componente solo se renderiza después de la hidratación, evitando errores de "hydration mismatch".',
      'Usa `React.lazy` para proyectos React puro; prefiere `next/dynamic` dentro del App Router de Next.js para mayor flexibilidad.',
    ],
    code: `import dynamic from 'next/dynamic';

// 1. Básico — igual que React.lazy pero con conciencia de Next.js
const HeavyChart = dynamic(() => import('./HeavyChart'));

// 2. Con estado de carga integrado (reemplaza <Suspense fallback>)
const MapWidget = dynamic(() => import('./MapWidget'), {
  loading: () => <Spinner label="Cargando mapa…" />,
});

// 3. SSR desactivado — para componentes solo del navegador
const RichEditor = dynamic(() => import('./RichEditor'), {
  ssr: false,          // no se renderiza en servidor — evita errores de window/document
  loading: () => <div className="h-40 bg-gray-100 animate-pulse rounded" />,
});

// 4. Exportación nombrada (React.lazy solo soporta exportaciones por defecto)
const { BarChart } = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.BarChart })),
  { loading: () => <ChartSkeleton /> }
);

// ─────────────────────────────────────────────────────────────
// Cuándo usar cada uno:
//
//  React.lazy   → React puro, proyectos Vite/CRA, árboles RSC
//  next/dynamic → Proyectos Next.js, especialmente cuando necesitas ssr:false`,
    tip: 'Usa `ssr: false` para cualquier componente que lea `window`, `document` o `localStorage` — esto previene el error de hydration mismatch.',
  },
  {
    id: 'suspense-server',
    number: 5,
    title: 'Suspense + Server Components (Streaming)',
    icon: '🌊',
    color: 'indigo',
    summary: 'En Next.js, Suspense habilita el streaming — los fetches lentos del servidor no bloquean la página',
    details: [
      'En App Router, envolver un Server Component async en `<Suspense>` habilita el **streaming** — Next.js envía HTML progresivamente.',
      'Las partes rápidas de la página se renderizan inmediatamente; los Server Components async lentos se transmiten a medida que terminan.',
      'Esto es diferente de `React.lazy` (code splitting en el cliente) — aquí Suspense gestiona la **carga de datos en el servidor**.',
      '`loading.tsx` es un atajo para envolver todo el segmento de página en `<Suspense fallback={<TuLoading />}>`.',
      'Los límites `<Suspense>` granulares dentro de una página te dan control fino de streaming por componente.',
    ],
    code: `// app/dashboard/page.tsx  ← Server Component (async)
import { Suspense } from 'react';

export default function DashboardPage() {
  // Sin await aquí — dejamos que Suspense haga streaming de cada sección de forma independiente
  return (
    <main>
      <StaticHeader />                          {/* se renderiza inmediatamente */}

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />                          {/* Server Component async */}
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />                        {/* consulta más lenta a la BD */}
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <InspectionTable />                     {/* consulta aún más lenta */}
      </Suspense>
    </main>
  );
}

// Cada componente async hace fetch de forma independiente:
async function StatsCards() {
  const stats = await db.getStats();         // rápido: ~50ms
  return <Cards data={stats} />;
}

async function RevenueChart() {
  const revenue = await db.getRevenue();    // medio: ~300ms
  return <Chart data={revenue} />;
}

async function InspectionTable() {
  const rows = await db.getAll();           // lento: ~800ms
  return <Table rows={rows} />;
}

// Resultado: el usuario ve contenido progresivamente en lugar de esperar 800ms por todo`,
    tip: 'Piensa en el Suspense de streaming como "eliminación del waterfall" — cada componente hace fetch en paralelo y se renderiza en cuanto está listo.',
  },
  {
    id: 'error-boundaries',
    number: 6,
    title: 'Error Boundaries con Suspense',
    icon: '🛡️',
    color: 'red',
    summary: 'Envuelve Suspense en un ErrorBoundary para manejar fallos de carga con elegancia',
    details: [
      'Si un componente lazy **falla al cargar** (error de red, chunk faltante), el error se propaga a través de Suspense hasta el Error Boundary más cercano.',
      'React no provee un componente `<ErrorBoundary>` integrado — escribe un componente de clase o usa la librería `react-error-boundary`.',
      '`react-error-boundary` provee `<ErrorBoundary>` con una prop `fallbackRender` para una API funcional y limpia.',
      'La prop `resetKeys` de `react-error-boundary` re-monta el boundary cuando un valor cambia (p.ej., un contador de reintentos).',
      'En Next.js, `error.tsx` actúa como un Error Boundary automático para un segmento de ruta — captura errores del servidor y del cliente.',
    ],
    code: `import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const HeavyWidget = lazy(() => import('./HeavyWidget'));

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-700 font-semibold mb-2">Error al cargar el componente</p>
      <p className="text-red-500 text-sm mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Reintentar
      </button>
    </div>
  );
}

function SafeWidget() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<Spinner />}>
        <HeavyWidget />
      </Suspense>
    </ErrorBoundary>
  );
}

// En Next.js — app/dashboard/error.tsx maneja errores automáticamente
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>¡Algo salió mal!</h2>
      <button onClick={reset}>Reintentar</button>
    </div>
  );
}`,
    tip: 'Siempre combina Suspense con un Error Boundary en producción. Un chunk JS faltante (después de un deploy) es un fallo real muy común.',
  },
  {
    id: 'when-to-use',
    number: 7,
    title: 'Cuándo Usar Cada Herramienta',
    icon: '🗺️',
    color: 'teal',
    summary: 'Una guía práctica para elegir entre React.lazy, next/dynamic y el streaming de Suspense',
    details: [
      '**React.lazy**: Úsalo en apps React puro (Vite/CRA) o cuando quieres control explícito de `<Suspense>` en Client Components de Next.js.',
      '**next/dynamic**: Úsalo en Next.js cuando necesites `ssr: false`, una opción de loading integrada o exportaciones nombradas de un módulo.',
      '**Streaming con Suspense**: Úsalo en el App Router de Next.js alrededor de Server Components async para entregar datos lentos progresivamente.',
      '**Suspense + loading.tsx**: Úsalo para estados de carga a nivel de página — toda la ruta muestra un skeleton mientras sus datos cargan.',
      '**No hagas lazy-load de todo**: Solo divide componentes grandes (>30 KB) que no se necesitan en el render inicial. El exceso de división agrega round-trips de red.',
    ],
    code: `// Guía de decisión:

// 1. ¿Componente cliente grande, no necesario de inmediato?
//    → React.lazy (React puro) o next/dynamic (Next.js)
const HeavyEditor = lazy(() => import('./RichTextEditor'));       // ~200KB

// 2. ¿El componente usa window / document / librería solo del navegador?
//    → next/dynamic con ssr: false
const Leaflet = dynamic(() => import('./MapWidget'), { ssr: false });

// 3. ¿Fetch lento en el servidor con App Router?
//    → Server Component async + <Suspense> para streaming
<Suspense fallback={<Skeleton />}>
  <SlowDbComponent />  {/* Server Component */}
</Suspense>

// 4. ¿Toda la página carga lentamente?
//    → loading.tsx (límite Suspense automático para la ruta)
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}

// ─────────────────────────────────────────────────────────────
// Regla general para dividir el bundle:
//
// Vale la pena dividir (lazy):  librerías de gráficos, editores enriquecidos,
//                               mapas, modales, drawers, paneles de admin
// No vale la pena dividir:      componentes pequeños < 5KB, UI core, botones`,
    tip: 'Analiza tu bundle con `next build` + `@next/bundle-analyzer` antes de agregar lazy loading. Solo divide lo que realmente sea grande.',
  },
];

const colorMap: Record<string, { bg: string; border: string; badge: string; code: string; tip: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-600',   code: 'bg-blue-950',   tip: 'bg-blue-100 border-blue-300 text-blue-800' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-600', code: 'bg-violet-950', tip: 'bg-violet-100 border-violet-300 text-violet-800' },
  cyan:   { bg: 'bg-cyan-50',   border: 'border-cyan-200',   badge: 'bg-cyan-600',   code: 'bg-cyan-950',   tip: 'bg-cyan-100 border-cyan-300 text-cyan-800' },
  slate:  { bg: 'bg-slate-50',  border: 'border-slate-200',  badge: 'bg-slate-600',  code: 'bg-slate-950',  tip: 'bg-slate-100 border-slate-300 text-slate-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-600', code: 'bg-indigo-950', tip: 'bg-indigo-100 border-indigo-300 text-indigo-800' },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-600',    code: 'bg-red-950',    tip: 'bg-red-100 border-red-300 text-red-800' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   badge: 'bg-teal-600',   code: 'bg-teal-950',   tip: 'bg-teal-100 border-teal-300 text-teal-800' },
};

export default function SuspenseLazyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-cyan-400 text-sm font-mono mb-3 tracking-widest uppercase">
            React · Next.js App Router
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Suspense &amp;{' '}
            <span className="text-cyan-400">React.lazy</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Estados de carga declarativos, división de código bajo demanda y UI de streaming
            — con un demo en vivo de spinner con el que puedes interactuar.
          </p>

          {/* Quick legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2 bg-cyan-900/50 border border-cyan-700 rounded-full px-4 py-1.5">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-gray-400 border-t-white animate-spin" />
              <strong>Suspense</strong> — muestra el fallback mientras los hijos cargan
            </span>
            <span className="flex items-center gap-2 bg-indigo-900/50 border border-indigo-700 rounded-full px-4 py-1.5">
              <span className="text-indigo-300">💤</span>
              <strong>React.lazy</strong> — carga un chunk de componente bajo demanda
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="https://react.dev/reference/react/Suspense"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black font-semibold px-5 py-2 rounded-full text-sm hover:bg-gray-100 transition"
            >
              Documentación →
            </Link>
            <Link
              href="/"
              className="border border-gray-600 text-gray-300 font-semibold px-5 py-2 rounded-full text-sm hover:border-gray-400 transition"
            >
              ← Inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Table of contents */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">
          Temas cubiertos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {sections.map((s) => {
            const colors = colorMap[s.color];
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${colors.bg} ${colors.border} text-sm hover:shadow-sm transition group`}
              >
                <span className="text-base mt-0.5 shrink-0">{s.icon}</span>
                <span className="text-gray-700 group-hover:text-gray-900 font-medium leading-tight">
                  {s.title}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-4">
        {/* Interactive Demo */}
        <div id="live-demo" className="scroll-mt-6 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-cyan-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              LIVE
            </span>
            <h2 className="text-xl font-bold text-gray-900">Demo Interactivo</h2>
            <span className="text-gray-500 text-sm">— pruébalo tú mismo</span>
          </div>
          <LazyDemo />
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-12">
        {sections.map((section) => {
          const colors = colorMap[section.color];
          return (
            <article
              key={section.id}
              id={section.id}
              className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden scroll-mt-6`}
            >
              {/* Header */}
              <div className="p-6 pb-0">
                <div className="flex items-start gap-4">
                  <span
                    className={`${colors.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mt-1`}
                  >
                    {String(section.number).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span>{section.icon}</span>
                      {section.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">{section.summary}</p>
                  </div>
                </div>

                {/* Key points */}
                <ul className="mt-5 space-y-2">
                  {section.details.map((detail, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-gray-400 shrink-0 mt-0.5">▸</span>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code block */}
              <div className="mt-5 mx-6 rounded-xl overflow-hidden border border-gray-800">
                <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-mono">Ejemplo</span>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
                <pre className={`${colors.code} text-green-300 text-xs p-4 overflow-x-auto font-mono leading-relaxed`}>
                  <code>{section.code}</code>
                </pre>
              </div>

              {/* Tip */}
              <div className="mx-6 mt-4 mb-6">
                <div className={`rounded-lg border px-4 py-3 text-sm ${colors.tip}`}>
                  <span className="font-semibold">💡 Consejo: </span>
                  {section.tip}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-200 bg-white py-12 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Sigue aprendiendo</h3>
        <p className="text-gray-500 mb-6">
          Explora más patrones de React y Next.js en este proyecto.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/server-vs-client"
            className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Server vs Client →
          </Link>
          <Link
            href="/nextjs-concepts"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Next.js Concepts →
          </Link>
          <Link
            href="https://react.dev/reference/react/Suspense"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Documentación →
          </Link>
        </div>
      </div>
    </main>
  );
}
