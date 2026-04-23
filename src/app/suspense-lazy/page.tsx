import Link from 'next/link';
import { LazyDemo } from './_LazyDemo';

const sections = [
  {
    id: 'what-is-suspense',
    number: 1,
    title: 'What is Suspense?',
    icon: '⏳',
    color: 'blue',
    summary: 'A React boundary that shows a fallback UI while its children are "waiting"',
    details: [
      '`<Suspense>` is a React built-in that lets you declaratively define a **loading state** for part of your component tree.',
      'While a child component is loading (lazy import, async data, image), Suspense shows the `fallback` prop instead.',
      'Once the child finishes loading, React swaps the fallback for the real content — no `if (loading) return <Spinner />` needed.',
      'Suspense boundaries can be **nested**: inner boundaries catch loading states first; outer ones act as fallbacks for everything else.',
      'In Next.js App Router, `loading.tsx` automatically wraps the page in a Suspense boundary with your skeleton as the fallback.',
    ],
    code: `import { Suspense } from 'react';

// Without Suspense — manual loading state (boilerplate)
function OldWay() {
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState(null);
  useEffect(() => { fetchData().then(d => { setData(d); setLoading(false); }); }, []);
  if (loading) return <Spinner />;
  return <DataView data={data} />;
}

// ─────────────────────────────────────────────────────────────

// With Suspense — declarative, no boilerplate
function NewWay() {
  return (
    <Suspense fallback={<Spinner />}>
      {/* React shows <Spinner /> until <AsyncDataView /> finishes loading */}
      <AsyncDataView />
    </Suspense>
  );
}

// Nested boundaries — granular control
function Dashboard() {
  return (
    <Suspense fallback={<PageSkeleton />}>          {/* outer: whole page */}
      <Header />
      <Suspense fallback={<ChartSkeleton />}>       {/* inner: just the chart */}
        <RevenueChart />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>       {/* inner: just the table */}
        <InspectionTable />
      </Suspense>
    </Suspense>
  );
}`,
    tip: 'Place Suspense boundaries as close to the loading component as possible. Narrow boundaries mean more of your UI stays interactive while one part loads.',
  },
  {
    id: 'what-is-lazy',
    number: 2,
    title: 'What is React.lazy?',
    icon: '💤',
    color: 'violet',
    summary: 'Code-split a component into a separate JS chunk — loaded on demand, not upfront',
    details: [
      '`React.lazy()` takes a function that returns a dynamic `import()` — the component is only downloaded when first rendered.',
      'It **code-splits** your bundle: the lazy component\'s JavaScript lives in its own chunk, reducing initial page load.',
      '`React.lazy` **must** be used with a `<Suspense>` boundary above it — Suspense provides the fallback during the download.',
      'The imported module must have a **default export** that is a React component.',
      'In Next.js App Router, `next/dynamic` is the recommended alternative — it supports SSR options that `React.lazy` doesn\'t.',
    ],
    code: `import { lazy, Suspense } from 'react';

// React.lazy — dynamic import, split into separate JS chunk
const HeavyChart    = lazy(() => import('./HeavyChart'));
const RichTextEditor = lazy(() => import('./RichTextEditor'));
const MapWidget     = lazy(() => import('./MapWidget'));

// ⚠️  Rules:
//   1. Must be a default export in the imported module
//   2. Must be wrapped in <Suspense>
//   3. Call lazy() at the module level (not inside a component)

// ✅ Correct usage
function Dashboard() {
  return (
    <Suspense fallback={<div>Loading chart…</div>}>
      <HeavyChart data={data} />
    </Suspense>
  );
}

// ❌ Wrong — lazy() inside a component re-creates on every render
function Bad() {
  const Chart = lazy(() => import('./Chart')); // never do this
  return <Chart />;
}`,
    tip: 'Always declare lazy() at the module level (top of the file), never inside a component body. Recreating it on every render breaks the caching.',
  },
  {
    id: 'spinner-patterns',
    number: 3,
    title: 'Loading Spinner Patterns',
    icon: '🌀',
    color: 'cyan',
    summary: 'Building accessible, reusable spinners as Suspense fallbacks',
    details: [
      'The `fallback` prop of `<Suspense>` accepts **any React node** — a spinner, skeleton, shimmer, or plain text.',
      'CSS `animate-spin` (Tailwind) or a CSS animation on a `border-top` creates a simple, dependency-free spinner.',
      'Always add `role="status"` and `aria-label` to spinners for screen-reader accessibility.',
      'For content-heavy pages, **skeleton loaders** (gray placeholder shapes) are better than spinners — they reduce perceived wait time.',
      'You can pass a custom `label` prop to the fallback spinner to describe what is loading (better UX).',
    ],
    code: `// Minimal CSS spinner — no library needed
function Spinner({ label = 'Loading…' }) {
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

// Skeleton loader — better for layout-aware loading
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

// Usage with Suspense
<Suspense fallback={<Spinner label="Loading inspection table…" />}>
  <InspectionTable />
</Suspense>

<Suspense fallback={<InspectionTableSkeleton />}>
  <InspectionTable />
</Suspense>`,
    tip: 'Skeletons beat spinners for perceived performance. Match the skeleton shape to the real component so the layout doesn\'t shift on reveal.',
  },
  {
    id: 'next-dynamic',
    number: 4,
    title: 'next/dynamic — The Next.js Way',
    icon: '▲',
    color: 'slate',
    summary: 'next/dynamic wraps React.lazy with SSR support and named-export shorthand',
    details: [
      '`next/dynamic` is Next.js\'s wrapper around `React.lazy` + `Suspense` that adds SSR control.',
      'Pass `{ ssr: false }` to skip server-side rendering — useful for browser-only components (`window`, `document`, maps, charts).',
      'It automatically wraps the import in a Suspense boundary when you pass a `loading` option — no need for an explicit `<Suspense>` wrapper.',
      'With `{ ssr: false }`, the component will only render after hydration, preventing "hydration mismatch" errors.',
      'Use `React.lazy` for pure React projects; prefer `next/dynamic` inside Next.js App Router for the extra flexibility.',
    ],
    code: `import dynamic from 'next/dynamic';

// 1. Basic — same as React.lazy but Next.js aware
const HeavyChart = dynamic(() => import('./HeavyChart'));

// 2. With built-in loading state (replaces <Suspense fallback>)
const MapWidget = dynamic(() => import('./MapWidget'), {
  loading: () => <Spinner label="Loading map…" />,
});

// 3. SSR disabled — for browser-only components
const RichEditor = dynamic(() => import('./RichEditor'), {
  ssr: false,          // won't render on server — avoids window/document errors
  loading: () => <div className="h-40 bg-gray-100 animate-pulse rounded" />,
});

// 4. Named export (React.lazy only supports default exports)
const { BarChart } = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.BarChart })),
  { loading: () => <ChartSkeleton /> }
);

// ─────────────────────────────────────────────────────────────
// When to use each:
//
//  React.lazy   → Pure React, Vite/CRA projects, RSC trees
//  next/dynamic → Next.js projects, especially when you need ssr:false`,
    tip: 'Use `ssr: false` for any component that reads `window`, `document`, or `localStorage` — this prevents the server/client hydration mismatch error.',
  },
  {
    id: 'suspense-server',
    number: 5,
    title: 'Suspense + Server Components (Streaming)',
    icon: '🌊',
    color: 'indigo',
    summary: 'In Next.js, Suspense enables streaming — slow server fetches don\'t block the page',
    details: [
      'In App Router, wrapping an async Server Component in `<Suspense>` enables **streaming** — Next.js sends HTML progressively.',
      'Fast parts of the page render immediately; slow async Server Components stream in as they finish.',
      'This is different from `React.lazy` (client-side code splitting) — here Suspense manages **server-side data loading**.',
      '`loading.tsx` is shorthand for wrapping the entire page segment in `<Suspense fallback={<YourLoading />}>`.',
      'Granular `<Suspense>` boundaries inside a page give you fine-grained streaming control per component.',
    ],
    code: `// app/dashboard/page.tsx  ← Server Component (async)
import { Suspense } from 'react';

export default function DashboardPage() {
  // No await here — let Suspense stream each section independently
  return (
    <main>
      <StaticHeader />                          {/* renders immediately */}

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />                          {/* async Server Component */}
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />                        {/* slower DB query */}
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <InspectionTable />                     {/* even slower query */}
      </Suspense>
    </main>
  );
}

// Each async component fetches independently:
async function StatsCards() {
  const stats = await db.getStats();         // fast: ~50ms
  return <Cards data={stats} />;
}

async function RevenueChart() {
  const revenue = await db.getRevenue();    // medium: ~300ms
  return <Chart data={revenue} />;
}

async function InspectionTable() {
  const rows = await db.getAll();           // slow: ~800ms
  return <Table rows={rows} />;
}

// Result: user sees content progressively instead of waiting 800ms for everything`,
    tip: 'Think of streaming Suspense as "waterfall elimination" — each component fetches in parallel and renders as soon as it\'s ready.',
  },
  {
    id: 'error-boundaries',
    number: 6,
    title: 'Error Boundaries with Suspense',
    icon: '🛡️',
    color: 'red',
    summary: 'Wrap Suspense in an ErrorBoundary to handle load failures gracefully',
    details: [
      'If a lazy component **fails to load** (network error, chunk missing), the error bubbles up through Suspense to the nearest Error Boundary.',
      'React does not provide a built-in `<ErrorBoundary>` component — you write a class component or use the `react-error-boundary` library.',
      '`react-error-boundary` provides `<ErrorBoundary>` with a `fallbackRender` prop for a clean, functional API.',
      'The `resetKeys` prop of `react-error-boundary` re-mounts the boundary when a value changes (e.g., a retry counter).',
      'In Next.js, `error.tsx` acts as an automatic Error Boundary for a route segment — it catches both server and client errors.',
    ],
    code: `import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const HeavyWidget = lazy(() => import('./HeavyWidget'));

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-red-700 font-semibold mb-2">Failed to load component</p>
      <p className="text-red-500 text-sm mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Retry
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

// In Next.js — app/dashboard/error.tsx handles errors automatically
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}`,
    tip: 'Always pair Suspense with an Error Boundary in production. A missing JS chunk (after a deploy) is a common real-world failure mode.',
  },
  {
    id: 'when-to-use',
    number: 7,
    title: 'When to Use Each Tool',
    icon: '🗺️',
    color: 'teal',
    summary: 'A practical guide to choosing between React.lazy, next/dynamic, and Suspense streaming',
    details: [
      '**React.lazy**: Use in pure React (Vite/CRA) apps, or when you want explicit `<Suspense>` control in Next.js Client Components.',
      '**next/dynamic**: Use in Next.js when you need `ssr: false`, a built-in loading option, or named exports from a module.',
      '**Suspense streaming**: Use in Next.js App Router around async Server Components to progressively deliver slow data.',
      '**Suspense + loading.tsx**: Use for page-level loading states — the whole route shows a skeleton while its data loads.',
      '**Don\'t lazy-load everything**: Only split large components (>30 KB) that aren\'t needed on initial render. Over-splitting adds network round-trips.',
    ],
    code: `// Decision guide:

// 1. Large client component, not needed immediately?
//    → React.lazy (pure React) or next/dynamic (Next.js)
const HeavyEditor = lazy(() => import('./RichTextEditor'));       // ~200KB

// 2. Component uses window / document / browser-only lib?
//    → next/dynamic with ssr: false
const Leaflet = dynamic(() => import('./MapWidget'), { ssr: false });

// 3. Slow server-side data fetch in App Router?
//    → async Server Component + <Suspense> for streaming
<Suspense fallback={<Skeleton />}>
  <SlowDbComponent />  {/* Server Component */}
</Suspense>

// 4. Entire page is slow to load?
//    → loading.tsx (auto Suspense boundary for the route)
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}

// ─────────────────────────────────────────────────────────────
// Rule of thumb for bundle splitting:
//
// Worth splitting (lazy):   chart libraries, rich editors, maps,
//                           modals, drawers, admin panels
// Not worth splitting:      small components < 5KB, core UI, buttons`,
    tip: 'Profile your bundle with `next build` + `@next/bundle-analyzer` before adding lazy loading. Only split what\'s actually large.',
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
            Declarative loading states, on-demand code splitting, and streaming UI — with
            a live spinner demo you can interact with.
          </p>

          {/* Quick legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2 bg-cyan-900/50 border border-cyan-700 rounded-full px-4 py-1.5">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-gray-400 border-t-white animate-spin" />
              <strong>Suspense</strong> — shows fallback while children load
            </span>
            <span className="flex items-center gap-2 bg-indigo-900/50 border border-indigo-700 rounded-full px-4 py-1.5">
              <span className="text-indigo-300">💤</span>
              <strong>React.lazy</strong> — loads a component chunk on demand
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="https://react.dev/reference/react/Suspense"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black font-semibold px-5 py-2 rounded-full text-sm hover:bg-gray-100 transition"
            >
              React Docs →
            </Link>
            <Link
              href="/"
              className="border border-gray-600 text-gray-300 font-semibold px-5 py-2 rounded-full text-sm hover:border-gray-400 transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Table of contents */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">
          Topics covered
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
            <h2 className="text-xl font-bold text-gray-900">Interactive Demo</h2>
            <span className="text-gray-500 text-sm">— try it yourself</span>
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
                  <span className="text-gray-400 text-xs font-mono">Example</span>
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
                  <span className="font-semibold">💡 Tip: </span>
                  {section.tip}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-200 bg-white py-12 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Keep learning</h3>
        <p className="text-gray-500 mb-6">
          Explore more React and Next.js patterns across this project.
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
            React Docs →
          </Link>
        </div>
      </div>
    </main>
  );
}
