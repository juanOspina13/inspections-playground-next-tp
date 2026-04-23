import Link from 'next/link';

const sections = [
  {
    id: 'what-are-rsc',
    number: 1,
    title: 'What are Server Components?',
    icon: '🖥️',
    color: 'blue',
    summary: 'Components that render exclusively on the server — the new default in App Router',
    details: [
      '**Server Components (RSC)** render on the server and send only HTML to the browser. No JavaScript is shipped for them.',
      'They are the **default** in the Next.js App Router. Any file without `"use client"` at the top is a Server Component.',
      'They can be `async` — you can `await` database calls, file reads, or fetch requests directly inside the component body.',
      'They have access to server-only resources: file system, environment variables, databases, and backend services.',
      'Since their code never reaches the browser, they can safely import secrets and server-side libraries.',
    ],
    code: `// app/dashboard/page.tsx  ← Server Component by default (no directive needed)
import { db } from '@/lib/database';   // safe — stays on server

export default async function DashboardPage() {
  // Direct database query — no useEffect, no loading state, no API route needed
  const inspections = await db.query('SELECT * FROM inspections LIMIT 10');
  const stats = await db.query('SELECT COUNT(*) FROM inspections');

  return (
    <main>
      <h1>Dashboard</h1>
      <StatsCard count={stats.count} />
      <InspectionTable rows={inspections} />
    </main>
  );
}

// ✅ Works in Server Components:
//   - async/await at the top level
//   - import secrets / DB clients
//   - access process.env (without NEXT_PUBLIC_ prefix)
//   - import large server-only libraries (they won't bloat the bundle)`,
    tip: 'Think of Server Components as the "backend" of your UI — they fetch and prepare data, then hand off to Client Components for interactivity.',
  },
  {
    id: 'what-are-client',
    number: 2,
    title: 'What are Client Components?',
    icon: '💻',
    color: 'violet',
    summary: 'Interactive components that run in the browser — opt-in with "use client"',
    details: [
      'Add `"use client"` at the **very top** of a file to mark it as a Client Component. This is an opt-in, not the default.',
      'Client Components are pre-rendered on the server (HTML), then **hydrated** in the browser — so they get interactivity.',
      'They have access to browser APIs: `window`, `document`, `localStorage`, `navigator`, event listeners.',
      'They support React hooks: `useState`, `useEffect`, `useRef`, `useContext`, custom hooks, and third-party hooks.',
      '`"use client"` creates a **boundary** — every module imported below that boundary is also treated as a Client Component.',
    ],
    code: `'use client';  // ← This directive marks the file AND all its imports as Client Components

import { useState } from 'react';

export function InspectionFilters({ onFilterChange }: { onFilterChange: (f: string) => void }) {
  const [status, setStatus] = useState('all');

  function handleChange(newStatus: string) {
    setStatus(newStatus);
    onFilterChange(newStatus);  // notify parent
  }

  return (
    <div>
      {['all', 'pending', 'passed', 'failed'].map((s) => (
        <button
          key={s}
          onClick={() => handleChange(s)}
          className={status === s ? 'active' : ''}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ✅ Works in Client Components:
//   - useState, useEffect, useRef, useContext
//   - onClick, onChange, onSubmit handlers
//   - Browser APIs (window, localStorage, navigator)
//   - Third-party hooks and context providers`,
    tip: '"use client" is a boundary declaration, not a runtime switch. It tells the React bundler where the server/client split happens.',
  },
  {
    id: 'key-differences',
    number: 3,
    title: 'Key Differences at a Glance',
    icon: '⚖️',
    color: 'slate',
    summary: 'Side-by-side comparison of capabilities, restrictions, and trade-offs',
    details: [
      '**Rendering environment**: Server Components run only on the server. Client Components run on both (SSR pre-render + browser hydration).',
      '**Bundle size**: Server Components contribute zero JavaScript to the client bundle. Client Components are included in the JS bundle.',
      '**Data access**: Server Components access backends directly. Client Components fetch via APIs or receive data as props.',
      '**Interactivity**: Server Components cannot use state, effects, or event handlers. Client Components can use all React hooks.',
      '**Async rendering**: Server Components can be `async` functions. Client Components cannot be `async` (use `useEffect` or SWR/React Query instead).',
    ],
    code: `// ─────────────────────────────────────────────────────────
//  CAPABILITY             SERVER COMPONENT   CLIENT COMPONENT
// ─────────────────────────────────────────────────────────
//  async/await            ✅ YES             ❌ NO
//  fetch / DB / FS        ✅ YES             ❌ NO (use API routes)
//  process.env secrets    ✅ YES             ❌ NO
//  useState / useReducer  ❌ NO              ✅ YES
//  useEffect / useRef     ❌ NO              ✅ YES
//  onClick / onChange     ❌ NO              ✅ YES
//  window / localStorage  ❌ NO              ✅ YES
//  Context Providers      ❌ NO              ✅ YES
//  Suspense (as parent)   ✅ YES             ✅ YES
//  JS bundle contribution ✅ ZERO            ⚠️  YES (included)
//  SEO / first-paint      ✅ FAST            ⚠️  SLOWER (hydration)
// ─────────────────────────────────────────────────────────`,
    tip: 'When in doubt, start with a Server Component. Add "use client" only when you actually need interactivity or browser APIs.',
  },
  {
    id: 'when-server',
    number: 4,
    title: 'When to Use Server Components',
    icon: '🖥️✅',
    color: 'green',
    summary: 'Use them for data fetching, static content, layouts, and anything non-interactive',
    details: [
      '**Data fetching**: Fetch from databases, APIs, or the file system directly — no API route needed, no client-side loading state.',
      '**Static or read-only UI**: Cards, tables, lists, and pages that display data without user interaction.',
      '**Layout shells**: Headers, sidebars, and navigation that are shared across pages and don\'t need user-specific state.',
      '**Large dependencies**: Libraries like `moment`, `lodash`, or markdown parsers stay on the server and never hit the client bundle.',
      '**SEO-critical content**: Server-rendered HTML is immediately available to crawlers and improves Core Web Vitals (LCP, FID).',
    ],
    code: `// ✅ Great Server Component use cases

// 1. Async data fetching — no boilerplate
export default async function InspectionsPage() {
  const data = await fetchInspections();  // runs on server
  return <InspectionTable rows={data} />;
}

// 2. Accessing secrets safely
async function getProtectedData() {
  const res = await fetch('https://api.internal.com/data', {
    headers: { Authorization: \`Bearer \${process.env.API_SECRET}\` },
    // process.env.API_SECRET is NEVER sent to the browser
  });
  return res.json();
}

// 3. Heavy libraries — zero bundle cost
import { marked } from 'marked';         // 100kb library
import { highlight } from 'highlight.js'; // 200kb library

export default async function DocsPage({ params }: { params: { slug: string } }) {
  const raw = await readFile(\`docs/\${params.slug}.md\`, 'utf-8');
  const html = marked(highlight(raw));    // runs only on server
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}`,
    tip: 'Server Components shine when your component is mostly "show this data" with no click handlers or local state.',
  },
  {
    id: 'when-client',
    number: 5,
    title: 'When to Use Client Components',
    icon: '💻✅',
    color: 'amber',
    summary: 'Use them for interactivity, browser APIs, and stateful UI',
    details: [
      '**User interaction**: Any component with onClick, onChange, onSubmit, drag-and-drop, or keyboard events.',
      '**Local state**: Components that manage their own state with `useState` or `useReducer`.',
      '**Side effects**: Components that need `useEffect` to sync with external systems, timers, or subscriptions.',
      '**Browser-only APIs**: Reading `window.innerWidth`, `localStorage`, `navigator.geolocation`, `IntersectionObserver`.',
      '**Context Providers**: Providers that wrap the tree must be Client Components because they maintain state (`createContext` + `useState`).',
    ],
    code: `'use client';

// ✅ Great Client Component use cases

// 1. Interactive filter component
import { useState } from 'react';
export function StatusFilter({ onChange }: { onChange: (s: string) => void }) {
  const [active, setActive] = useState('all');
  return (
    <select value={active} onChange={(e) => { setActive(e.target.value); onChange(e.target.value); }}>
      <option value="all">All</option>
      <option value="passed">Passed</option>
      <option value="failed">Failed</option>
    </select>
  );
}

// 2. Component using browser APIs
export function ScrollToTop() {
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      ↑ Top
    </button>
  );
}

// 3. Context Provider (must be client)
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}`,
    tip: 'Keep Client Components as small and leaf-like as possible. Push state down so only the interactive part opts in to the client.',
  },
  {
    id: 'composing',
    number: 6,
    title: 'Composing Them Together',
    icon: '🧩',
    color: 'cyan',
    summary: 'The golden pattern: Server Components own the tree, Client Components are leaves',
    details: [
      'Server Components **can render** Client Components by importing and using them like any JSX element.',
      'Client Components **cannot import** Server Components directly (they would be treated as Client Components).',
      'To use a Server Component inside a Client Component, pass it as **children** or a **prop** (it\'s already rendered server-side).',
      'This pattern — called the "donut pattern" — keeps most of your tree on the server with interactive islands on the client.',
      'Wrapping slow Server Components in `<Suspense>` allows streaming: fast parts render immediately while slow ones load.',
    ],
    code: `// ✅ CORRECT: Server Component renders a Client Component (normal import)
// app/dashboard/page.tsx  ← Server Component
import { InspectionFilters } from '@/components/InspectionFilters';  // Client Component
import { InspectionTable }   from '@/components/InspectionTable';    // Server Component

export default async function DashboardPage() {
  const data = await fetchInspections();
  return (
    <div>
      <InspectionFilters />          {/* Client — interactive */}
      <InspectionTable rows={data} /> {/* Server — data display */}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

// ✅ CORRECT: Pass Server Component as children to a Client Component
// app/layout.tsx  ← Server Component
import { Sidebar } from '@/components/Sidebar';  // Client Component

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar>
      {children}  {/* children is a Server Component — already rendered */}
    </Sidebar>
  );
}

// ─────────────────────────────────────────────────────────────

// ❌ WRONG: Importing a Server Component inside a Client Component
'use client';
// This import turns ServerOnlyComponent into a Client Component!
import { ServerOnlyComponent } from './ServerOnlyComponent';`,
    tip: 'Use children props to thread Server Components through Client Component wrappers. This keeps the server/client split clean.',
  },
  {
    id: 'data-down',
    number: 7,
    title: 'Passing Server Data to Client Components',
    icon: '📦',
    color: 'indigo',
    summary: 'Fetch on the server, serialize as props — keep secrets and heavy logic server-side',
    details: [
      'The cleanest pattern: fetch data in a Server Component, then pass it as **serializable props** to Client Components.',
      'Only plain, JSON-serializable values can cross the server/client boundary: strings, numbers, arrays, plain objects.',
      '**Cannot** pass: functions, class instances, Dates (use `.toISOString()`), Maps, Sets, or circular references as props.',
      'For complex interactions, consider splitting: Server Component fetches initial data, Client Component manages client-side state on top of it.',
      'Use `"server-only"` package in files that should never be imported by Client Components — it throws a build-time error if imported.',
    ],
    code: `// ✅ Server fetches → Client displays and interacts

// app/inspections/page.tsx  ← Server Component
import { InspectionDashboard } from '@/components/InspectionDashboard';

export default async function InspectionsPage() {
  // Runs on server: has DB access, secrets, heavy computation
  const inspections = await db.findMany({ where: { active: true } });
  const summary = computeStats(inspections); // CPU-heavy — stays on server

  // Pass only serializable data to the client
  return (
    <InspectionDashboard
      initialData={inspections}  // ✅ plain array of objects
      summary={summary}           // ✅ plain object with numbers
    />
  );
}

// components/InspectionDashboard.tsx  ← Client Component
'use client';
import { useState } from 'react';

export function InspectionDashboard({
  initialData,
  summary,
}: {
  initialData: Inspection[];
  summary: InspectionSummary;
}) {
  // Client manages filtering/sorting on top of server-fetched data
  const [filter, setFilter] = useState('all');
  const filtered = initialData.filter(
    (i) => filter === 'all' || i.status === filter
  );

  return (
    <div>
      <SummaryCards data={summary} />
      <FilterBar value={filter} onChange={setFilter} />
      <InspectionList items={filtered} />
    </div>
  );
}`,
    tip: 'Serialize Dates as ISO strings. Pass only the minimal data the Client Component needs — not the whole DB record.',
  },
  {
    id: 'boundaries',
    number: 8,
    title: 'Understanding the "use client" Boundary',
    icon: '🚧',
    color: 'orange',
    summary: 'The boundary propagates down — everything imported becomes a Client Component',
    details: [
      '`"use client"` propagates to **all imports** in that file. If `ComponentA.tsx` has `"use client"`, every module it imports becomes a Client Component.',
      'You do **not** need `"use client"` in every file — only in the root of each client subtree.',
      'A single top-level `"use client"` boundary covers an entire component tree of imports.',
      'Placing `"use client"` too high in the tree (e.g., in layout.tsx) accidentally converts the whole app to Client Components.',
      'The goal is to have the boundary as **deep and narrow** as possible to maximize server rendering.',
    ],
    code: `// ❌ BAD: "use client" too high — accidentally converts everything
// app/layout.tsx
'use client';  // ← Now ALL children and imports are Client Components!
export default function RootLayout({ children }) { ... }

// ─────────────────────────────────────────────────────────────

// ✅ GOOD: "use client" only where needed
// app/layout.tsx  ← Server Component (no directive)
import { Header }   from '@/components/Header';    // Server Component
import { Providers } from '@/components/Providers'; // Client Component (has "use client")

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Header />       {/* stays on server */}
        <Providers>      {/* client boundary starts here */}
          {children}
        </Providers>
      </body>
    </html>
  );
}

// ─────────────────────────────────────────────────────────────

// ✅ Narrow boundary: only the interactive button is a Client Component
// components/LikeButton.tsx
'use client';  // boundary is just this one small component
import { useState } from 'react';
export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>{liked ? '❤️' : '🤍'}</button>;
}`,
    tip: 'Audit your "use client" placement. Each one pulls a subtree into the client bundle. Narrow boundaries = smaller bundles.',
  },
  {
    id: 'anti-patterns',
    number: 9,
    title: 'Common Mistakes & Anti-Patterns',
    icon: '⚠️',
    color: 'red',
    summary: 'Pitfalls that reduce performance, break builds, or waste the RSC model',
    details: [
      '**Converting everything to Client Components**: Adding `"use client"` to avoid errors defeats the purpose of RSC. Diagnose the root cause instead.',
      '**Fetching in useEffect when a Server Component could do it**: Client-side fetching is slower (waterfall) and exposes data-fetching logic to the browser.',
      '**Passing non-serializable values as props**: Functions, class instances, and Dates (as objects) cannot cross the server/client boundary.',
      '**Importing server-only modules in Client Components**: Imports like `fs`, `crypto`, or DB clients in a Client Component file will crash at build time.',
      '**Huge Client Component trees**: Nesting many Client Components without any Server Components re-introduces the "classic React" bundle cost.',
    ],
    code: `// ❌ Anti-pattern 1: Fetching in useEffect when RSC can do it
'use client';
export function InspectionList() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/inspections').then(r => r.json()).then(setData);
    // Problems: loading state, waterfall, client bundle, no SSR
  }, []);
  return <Table data={data} />;
}

// ✅ Instead: fetch in a Server Component
export default async function InspectionsPage() {
  const data = await fetchInspections();  // fast, SSR, no bundle cost
  return <Table data={data} />;           // Table is a Server Component too
}

// ─────────────────────────────────────────────────────────────

// ❌ Anti-pattern 2: Passing a function as a prop (crashes at runtime)
// Server Component:
<ClientButton onClick={() => console.log('hi')} />
// Error: Functions cannot be passed directly to Client Components
// because they're not serializable. Use Server Actions instead:

// ✅ Server Action as prop:
async function handleClick() {
  'use server';
  // ... server-side logic
}
<ClientButton action={handleClick} />

// ─────────────────────────────────────────────────────────────

// ❌ Anti-pattern 3: Importing server-only modules in a client file
'use client';
import { readFileSync } from 'fs';  // 💥 Build error — fs is server-only`,
    tip: 'If you find yourself adding "use client" to fix an error, stop and ask: "Can this component be a Server Component instead?"',
  },
  {
    id: 'practical-checklist',
    number: 10,
    title: 'Decision Checklist',
    icon: '✅',
    color: 'teal',
    summary: 'A quick decision tree to pick the right component type every time',
    details: [
      '**Does it fetch data or access the backend?** → Server Component.',
      '**Does it use `useState`, `useReducer`, or custom hooks with state?** → Client Component.',
      '**Does it handle events (`onClick`, `onChange`, etc.)?** → Client Component.',
      '**Does it use `useEffect` or `useRef`?** → Client Component.',
      '**Does it use browser APIs (`window`, `localStorage`, etc.)?** → Client Component.',
      '**Is it a Context Provider?** → Client Component (wrap it narrow, pass `children` from Server Components through it).',
      '**Otherwise (static/display-only)?** → Server Component — enjoy the free performance.',
    ],
    code: `// Quick mental model — ask these questions in order:

function decideComponentType(component) {
  if (component.fetchesData || component.accessesDatabase)   return 'Server Component';
  if (component.usesState || component.usesReducer)          return 'Client Component';
  if (component.hasEventHandlers)                            return 'Client Component';
  if (component.usesEffectOrRef)                             return 'Client Component';
  if (component.usesBrowserAPIs)                             return 'Client Component';
  if (component.isContextProvider)                           return 'Client Component';

  // Display-only, no side effects → Server Component (default)
  return 'Server Component';
}

// ─────────────────────────────────────────────────────────────
// Real-world split example for an Inspections Dashboard:
//
// app/dashboard/page.tsx                ← Server (async, fetches data)
//   └─ <StatsCards data={...} />        ← Server (display only)
//   └─ <InspectionFilters />            ← Client (useState, onChange)
//   └─ <Suspense fallback={<Skeleton/>}>
//        └─ <InspectionTable />         ← Server (async, fetches with params)
//   └─ <ExportButton />                 ← Client (onClick, downloads CSV)
//
// Result: ~90% of the tree is server-rendered, only 2 leaf
// components ship JavaScript to the browser.`,
    tip: 'The ideal app has a server-rendered shell with small, focused Client Component islands at the edges for interactivity.',
  },
];

const colorMap: Record<string, { bg: string; border: string; badge: string; code: string; link: string; tip: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-600',   code: 'bg-blue-950',   link: 'text-blue-600 hover:text-blue-800',   tip: 'bg-blue-100 border-blue-300 text-blue-800' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-600', code: 'bg-violet-950', link: 'text-violet-600 hover:text-violet-800', tip: 'bg-violet-100 border-violet-300 text-violet-800' },
  slate:  { bg: 'bg-slate-50',  border: 'border-slate-200',  badge: 'bg-slate-600',  code: 'bg-slate-950',  link: 'text-slate-600 hover:text-slate-800',  tip: 'bg-slate-100 border-slate-300 text-slate-700' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-600',  code: 'bg-green-950',  link: 'text-green-600 hover:text-green-800',  tip: 'bg-green-100 border-green-300 text-green-800' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-500',  code: 'bg-amber-950',  link: 'text-amber-600 hover:text-amber-800',  tip: 'bg-amber-100 border-amber-300 text-amber-800' },
  cyan:   { bg: 'bg-cyan-50',   border: 'border-cyan-200',   badge: 'bg-cyan-600',   code: 'bg-cyan-950',   link: 'text-cyan-600 hover:text-cyan-800',   tip: 'bg-cyan-100 border-cyan-300 text-cyan-800' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-600', code: 'bg-indigo-950', link: 'text-indigo-600 hover:text-indigo-800', tip: 'bg-indigo-100 border-indigo-300 text-indigo-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500', code: 'bg-orange-950', link: 'text-orange-600 hover:text-orange-800', tip: 'bg-orange-100 border-orange-300 text-orange-800' },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-600',    code: 'bg-red-950',    link: 'text-red-600 hover:text-red-800',    tip: 'bg-red-100 border-red-300 text-red-800' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   badge: 'bg-teal-600',   code: 'bg-teal-950',   link: 'text-teal-600 hover:text-teal-800',   tip: 'bg-teal-100 border-teal-300 text-teal-800' },
};

export default function ServerVsClientPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-400 text-sm font-mono mb-3 tracking-widest uppercase">
            React · Next.js App Router
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Server Components{' '}
            <span className="text-blue-400">vs</span>{' '}
            Client Components
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            When to use each, how they work, how to compose them, and the patterns
            that keep your app fast and your bundle small.
          </p>

          {/* Quick legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2 bg-blue-900/50 border border-blue-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              <strong>Server Component</strong> — renders on server, zero JS bundle
            </span>
            <span className="flex items-center gap-2 bg-violet-900/50 border border-violet-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
              <strong>Client Component</strong> — hydrated in browser, interactive
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="https://nextjs.org/docs/app/building-your-application/rendering/server-components"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black font-semibold px-5 py-2 rounded-full text-sm hover:bg-gray-100 transition"
            >
              Next.js Docs →
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
                <span className="text-base mt-0.5 shrink-0">{s.icon.split('✅')[0].split('⚠️')[0]}</span>
                <span className="text-gray-700 group-hover:text-gray-900 font-medium leading-tight">
                  {s.title}
                </span>
              </a>
            );
          })}
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
                <pre
                  className={`${colors.code} text-green-300 text-xs p-4 overflow-x-auto font-mono leading-relaxed`}
                >
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
          See these patterns in action across the rest of this project.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/nextjs-concepts"
            className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Next.js Concepts →
          </Link>
          <Link
            href="/dashboard"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            View the Dashboard →
          </Link>
          <Link
            href="https://nextjs.org/docs/app/building-your-application/rendering"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Official Docs →
          </Link>
        </div>
      </div>
    </main>
  );
}
