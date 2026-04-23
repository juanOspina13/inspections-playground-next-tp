import Link from 'next/link';

const sections = [
  {
    id: 'what-are-rsc',
    number: 1,
    title: '¿Qué son los Server Components?',
    icon: '🖥️',
    color: 'blue',
    summary: 'Componentes que se renderizan exclusivamente en el servidor — el nuevo valor por defecto en App Router',
    details: [
      '**Los Server Components (RSC)** se renderizan en el servidor y envían solo HTML al navegador. No se envía JavaScript al cliente.',
      'Son el valor **por defecto** en el App Router de Next.js. Cualquier archivo sin `"use client"` al inicio es un Server Component.',
      'Pueden ser `async` — puedes usar `await` directamente en el cuerpo del componente para llamadas a la base de datos, archivos o fetch.',
      'Tienen acceso a recursos exclusivos del servidor: sistema de archivos, variables de entorno, bases de datos y servicios backend.',
      'Como su código nunca llega al navegador, pueden importar secretos y librerías solo del servidor de forma segura.',
    ],
    code: `// app/dashboard/page.tsx  ← Server Component por defecto (sin directiva)
import { db } from '@/lib/database';   // seguro — permanece en el servidor

export default async function DashboardPage() {
  // Consulta directa a la BD — sin useEffect, sin estado de carga, sin rutas API
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

// ✅ Disponible en Server Components:
//   - async/await al nivel superior
//   - importar secretos / clientes de BD
//   - acceder a process.env (sin prefijo NEXT_PUBLIC_)
//   - importar librerías grandes solo-servidor (no inflan el bundle)`,
    tip: 'Piensa en los Server Components como el "backend" de tu UI — obtienen y preparan datos, luego se los entregan a los Client Components para la interactividad.',
  },
  {
    id: 'what-are-client',
    number: 2,
    title: '¿Qué son los Client Components?',
    icon: '💻',
    color: 'violet',
    summary: 'Componentes interactivos que se ejecutan en el navegador — se activan con "use client"',
    details: [
      'Agrega `"use client"` al **principio** del archivo para marcarlo como Client Component. Es un opt-in, no el valor por defecto.',
      'Los Client Components se pre-renderizan en el servidor (HTML) y luego se **hidratan** en el navegador — así obtienen interactividad.',
      'Tienen acceso a las APIs del navegador: `window`, `document`, `localStorage`, `navigator`, event listeners.',
      'Soportan hooks de React: `useState`, `useEffect`, `useRef`, `useContext`, hooks personalizados y hooks de terceros.',
      '`"use client"` crea una **frontera** — cada módulo importado por debajo de esa frontera también se trata como Client Component.',
    ],
    code: `'use client';  // ← Esta directiva marca el archivo Y todos sus imports como Client Components

import { useState } from 'react';

export function InspectionFilters({ onFilterChange }: { onFilterChange: (f: string) => void }) {
  const [status, setStatus] = useState('all');

  function handleChange(newStatus: string) {
    setStatus(newStatus);
    onFilterChange(newStatus);  // notifica al padre
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

// ✅ Disponible en Client Components:
//   - useState, useEffect, useRef, useContext
//   - manejadores onClick, onChange, onSubmit
//   - APIs del navegador (window, localStorage, navigator)
//   - Hooks y context providers de terceros`,
    tip: '"use client" es una declaración de frontera, no un interruptor en tiempo de ejecución. Le dice al bundler de React dónde ocurre la división servidor/cliente.',
  },
  {
    id: 'key-differences',
    number: 3,
    title: 'Diferencias Clave de un Vistazo',
    icon: '⚖️',
    color: 'slate',
    summary: 'Comparación lado a lado de capacidades, restricciones y compromisos',
    details: [
      '**Entorno de renderizado**: Los Server Components solo se ejecutan en el servidor. Los Client Components se ejecutan en ambos (SSR + hidratación en el navegador).',
      '**Tamaño del bundle**: Los Server Components no contribuyen JavaScript al bundle del cliente. Los Client Components sí se incluyen en el bundle.',
      '**Acceso a datos**: Los Server Components acceden al backend directamente. Los Client Components obtienen datos via APIs o reciben datos como props.',
      '**Interactividad**: Los Server Components no pueden usar estado, efectos ni manejadores de eventos. Los Client Components pueden usar todos los hooks de React.',
      '**Renderizado async**: Los Server Components pueden ser funciones `async`. Los Client Components no pueden ser `async` (usa `useEffect` o SWR/React Query).',
    ],
    code: `// ─────────────────────────────────────────────────────────
//  CAPACIDAD              SERVER COMPONENT   CLIENT COMPONENT
// ─────────────────────────────────────────────────────────
//  async/await            ✅ SÍ              ❌ NO
//  fetch / BD / FS        ✅ SÍ              ❌ NO (usa rutas API)
//  process.env secretos   ✅ SÍ              ❌ NO
//  useState / useReducer  ❌ NO              ✅ SÍ
//  useEffect / useRef     ❌ NO              ✅ SÍ
//  onClick / onChange     ❌ NO              ✅ SÍ
//  window / localStorage  ❌ NO              ✅ SÍ
//  Context Providers      ❌ NO              ✅ SÍ
//  Suspense (como padre)  ✅ SÍ              ✅ SÍ
//  JS en el bundle        ✅ CERO            ⚠️  SÍ (incluido)
//  SEO / first-paint      ✅ RÁPIDO          ⚠️  MÁS LENTO (hidratación)
// ─────────────────────────────────────────────────────────`,
    tip: 'Ante la duda, empieza con un Server Component. Agrega "use client" solo cuando realmente necesites interactividad o APIs del navegador.',
  },
  {
    id: 'when-server',
    number: 4,
    title: 'Cuándo Usar Server Components',
    icon: '🖥️✅',
    color: 'green',
    summary: 'Úsalos para obtener datos, contenido estático, layouts y todo lo que no sea interactivo',
    details: [
      '**Obtención de datos**: Consulta bases de datos, APIs o el sistema de archivos directamente — sin rutas API ni estado de carga en el cliente.',
      '**UI estática o de solo lectura**: Tarjetas, tablas, listas y páginas que muestran datos sin interacción del usuario.',
      '**Shells de layout**: Encabezados, barras laterales y navegación compartida que no necesitan estado específico del usuario.',
      '**Dependencias pesadas**: Librerías como `moment`, `lodash` o parsers de markdown se quedan en el servidor y nunca llegan al bundle del cliente.',
      '**Contenido crítico para SEO**: El HTML renderizado en servidor está disponible inmediatamente para los crawlers y mejora los Core Web Vitals (LCP, FID).',
    ],
    code: `// ✅ Casos de uso ideales para Server Components

// 1. Obtención de datos async — sin boilerplate
export default async function InspectionsPage() {
  const data = await fetchInspections();  // se ejecuta en el servidor
  return <InspectionTable rows={data} />;
}

// 2. Acceder a secretos de forma segura
async function getProtectedData() {
  const res = await fetch('https://api.internal.com/data', {
    headers: { Authorization: \`Bearer \${process.env.API_SECRET}\` },
    // process.env.API_SECRET NUNCA se envía al navegador
  });
  return res.json();
}

// 3. Librerías pesadas — sin costo en el bundle
import { marked } from 'marked';         // librería de 100kb
import { highlight } from 'highlight.js'; // librería de 200kb

export default async function DocsPage({ params }: { params: { slug: string } }) {
  const raw = await readFile(\`docs/\${params.slug}.md\`, 'utf-8');
  const html = marked(highlight(raw));    // solo se ejecuta en el servidor
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}`,
    tip: 'Los Server Components brillan cuando tu componente es principalmente "mostrar estos datos" sin manejadores de clic ni estado local.',
  },
  {
    id: 'when-client',
    number: 5,
    title: 'Cuándo Usar Client Components',
    icon: '💻✅',
    color: 'amber',
    summary: 'Úsalos para interactividad, APIs del navegador y UI con estado',
    details: [
      '**Interacción del usuario**: Cualquier componente con onClick, onChange, onSubmit, drag-and-drop o eventos de teclado.',
      '**Estado local**: Componentes que gestionan su propio estado con `useState` o `useReducer`.',
      '**Efectos secundarios**: Componentes que necesitan `useEffect` para sincronizarse con sistemas externos, timers o suscripciones.',
      '**APIs exclusivas del navegador**: Leer `window.innerWidth`, `localStorage`, `navigator.geolocation`, `IntersectionObserver`.',
      '**Context Providers**: Los providers que envuelven el árbol deben ser Client Components porque mantienen estado (`createContext` + `useState`).',
    ],
    code: `'use client';

// ✅ Casos de uso ideales para Client Components

// 1. Componente de filtro interactivo
import { useState } from 'react';
export function StatusFilter({ onChange }: { onChange: (s: string) => void }) {
  const [active, setActive] = useState('all');
  return (
    <select value={active} onChange={(e) => { setActive(e.target.value); onChange(e.target.value); }}>
      <option value="all">Todos</option>
      <option value="passed">Aprobado</option>
      <option value="failed">Fallido</option>
    </select>
  );
}

// 2. Componente que usa APIs del navegador
export function ScrollToTop() {
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      ↑ Arriba
    </button>
  );
}

// 3. Context Provider (debe ser cliente)
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}`,
    tip: 'Mantén los Client Components lo más pequeños y hoja posible. Empuja el estado hacia abajo para que solo la parte interactiva use el cliente.',
  },
  {
    id: 'composing',
    number: 6,
    title: 'Componiéndolos Juntos',
    icon: '🧩',
    color: 'cyan',
    summary: 'El patrón dorado: los Server Components controlan el árbol, los Client Components son las hojas',
    details: [
      'Los Server Components **pueden renderizar** Client Components importándolos y usándolos como cualquier elemento JSX.',
      'Los Client Components **no pueden importar** Server Components directamente (se tratarían como Client Components).',
      'Para usar un Server Component dentro de un Client Component, pásalo como **children** o como **prop** (ya está renderizado en el servidor).',
      'Este patrón — llamado "patrón donut" — mantiene la mayor parte del árbol en el servidor con islas interactivas en el cliente.',
      'Envolver Server Components lentos en `<Suspense>` permite streaming: las partes rápidas se renderizan inmediatamente mientras las lentas cargan.',
    ],
    code: `// ✅ CORRECTO: Server Component renderiza un Client Component (import normal)
// app/dashboard/page.tsx  ← Server Component
import { InspectionFilters } from '@/components/InspectionFilters';  // Client Component
import { InspectionTable }   from '@/components/InspectionTable';    // Server Component

export default async function DashboardPage() {
  const data = await fetchInspections();
  return (
    <div>
      <InspectionFilters />          {/* Cliente — interactivo */}
      <InspectionTable rows={data} /> {/* Servidor — muestra datos */}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

// ✅ CORRECTO: Pasar Server Component como children a un Client Component
// app/layout.tsx  ← Server Component
import { Sidebar } from '@/components/Sidebar';  // Client Component

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar>
      {children}  {/* children es un Server Component — ya renderizado */}
    </Sidebar>
  );
}

// ─────────────────────────────────────────────────────────────

// ❌ INCORRECTO: Importar un Server Component dentro de un Client Component
'use client';
// ¡Este import convierte ServerOnlyComponent en Client Component!
import { ServerOnlyComponent } from './ServerOnlyComponent';`,
    tip: 'Usa la prop children para pasar Server Components a través de wrappers de Client Components. Esto mantiene la división servidor/cliente limpia.',
  },
  {
    id: 'data-down',
    number: 7,
    title: 'Pasando Datos del Servidor a Client Components',
    icon: '📦',
    color: 'indigo',
    summary: 'Obtén en el servidor, serializa como props — mantén secretos y lógica pesada en el servidor',
    details: [
      'El patrón más limpio: obtén datos en un Server Component y pásalos como **props serializables** a los Client Components.',
      'Solo valores planos y serializables en JSON pueden cruzar la frontera servidor/cliente: strings, números, arrays, objetos planos.',
      '**No puedes** pasar: funciones, instancias de clases, Dates (usa `.toISOString()`), Maps, Sets ni referencias circulares como props.',
      'Para interacciones complejas, considera dividir: Server Component obtiene datos iniciales, Client Component gestiona el estado del cliente sobre ellos.',
      'Usa el paquete `"server-only"` en archivos que nunca deben ser importados por Client Components — lanza un error de build si se importan.',
    ],
    code: `// ✅ Servidor obtiene → Cliente muestra e interactúa

// app/inspections/page.tsx  ← Server Component
import { InspectionDashboard } from '@/components/InspectionDashboard';

export default async function InspectionsPage() {
  // Se ejecuta en el servidor: tiene acceso a BD, secretos, cómputo pesado
  const inspections = await db.findMany({ where: { active: true } });
  const summary = computeStats(inspections); // CPU-intensivo — permanece en el servidor

  // Pasa solo datos serializables al cliente
  return (
    <InspectionDashboard
      initialData={inspections}  // ✅ array plano de objetos
      summary={summary}           // ✅ objeto plano con números
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
  // El cliente gestiona filtrado/ordenamiento sobre los datos del servidor
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
    tip: 'Serializa las Dates como strings ISO. Pasa solo los datos mínimos que necesita el Client Component — no todo el registro de la base de datos.',
  },
  {
    id: 'boundaries',
    number: 8,
    title: 'Entendiendo la Frontera "use client"',
    icon: '🚧',
    color: 'orange',
    summary: 'La frontera se propaga hacia abajo — todo lo importado se convierte en Client Component',
    details: [
      '`"use client"` se propaga a **todos los imports** en ese archivo. Si `ComponentA.tsx` tiene `"use client"`, cada módulo que importa se convierte en Client Component.',
      '**No necesitas** `"use client"` en cada archivo — solo en la raíz de cada subárbol de cliente.',
      'Una sola frontera `"use client"` en el nivel superior cubre todo un árbol de componentes importados.',
      'Poner `"use client"` demasiado alto en el árbol (p.ej., en layout.tsx) convierte accidentalmente toda la app en Client Components.',
      'El objetivo es que la frontera esté lo más **profunda y estrecha** posible para maximizar el renderizado en servidor.',
    ],
    code: `// ❌ MAL: "use client" demasiado alto — convierte todo accidentalmente
// app/layout.tsx
'use client';  // ← ¡Ahora TODOS los hijos e imports son Client Components!
export default function RootLayout({ children }) { ... }

// ─────────────────────────────────────────────────────────────

// ✅ BIEN: "use client" solo donde se necesita
// app/layout.tsx  ← Server Component (sin directiva)
import { Header }   from '@/components/Header';    // Server Component
import { Providers } from '@/components/Providers'; // Client Component (tiene "use client")

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Header />       {/* permanece en el servidor */}
        <Providers>      {/* la frontera de cliente empieza aquí */}
          {children}
        </Providers>
      </body>
    </html>
  );
}

// ─────────────────────────────────────────────────────────────

// ✅ Frontera estrecha: solo el botón interactivo es Client Component
// components/LikeButton.tsx
'use client';  // la frontera es solo este pequeño componente
import { useState } from 'react';
export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>{liked ? '❤️' : '🤍'}</button>;
}`,
    tip: 'Audita la ubicación de tus "use client". Cada uno arrastra un subárbol al bundle del cliente. Fronteras estrechas = bundles más pequeños.',
  },
  {
    id: 'anti-patterns',
    number: 9,
    title: 'Errores Comunes y Anti-Patrones',
    icon: '⚠️',
    color: 'red',
    summary: 'Trampas que reducen el rendimiento, rompen los builds o desperdician el modelo RSC',
    details: [
      '**Convertir todo en Client Components**: Agregar `"use client"` para evitar errores anula el propósito de RSC. Diagnostica la causa raíz en su lugar.',
      '**Hacer fetch en useEffect cuando un Server Component podría hacerlo**: El fetch en el cliente es más lento (waterfall) y expone la lógica de obtención al navegador.',
      '**Pasar valores no serializables como props**: Funciones, instancias de clases y Dates (como objetos) no pueden cruzar la frontera servidor/cliente.',
      '**Importar módulos solo-servidor en Client Components**: Imports como `fs`, `crypto` o clientes de BD en un archivo Client Component fallarán en el build.',
      '**Árboles enormes de Client Components**: Anidar muchos Client Components sin ningún Server Component re-introduce el costo de bundle del "React clásico".',
    ],
    code: `// ❌ Anti-patrón 1: Fetch en useEffect cuando RSC puede hacerlo
'use client';
export function InspectionList() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/inspections').then(r => r.json()).then(setData);
    // Problemas: estado de carga, waterfall, bundle en cliente, sin SSR
  }, []);
  return <Table data={data} />;
}

// ✅ En su lugar: fetch en un Server Component
export default async function InspectionsPage() {
  const data = await fetchInspections();  // rápido, SSR, sin costo de bundle
  return <Table data={data} />;           // Table también es Server Component
}

// ─────────────────────────────────────────────────────────────

// ❌ Anti-patrón 2: Pasar una función como prop (crash en runtime)
// Desde un Server Component:
<ClientButton onClick={() => console.log('hola')} />
// Error: las funciones no se pueden pasar directamente a Client Components
// porque no son serializables. Usa Server Actions:

// ✅ Server Action como prop:
async function handleClick() {
  'use server';
  // ... lógica en el servidor
}
<ClientButton action={handleClick} />

// ─────────────────────────────────────────────────────────────

// ❌ Anti-patrón 3: Importar módulos solo-servidor en un archivo de cliente
'use client';
import { readFileSync } from 'fs';  // 💥 Error de build — fs es solo del servidor`,
    tip: 'Si te encuentras agregando "use client" para corregir un error, detente y pregúntate: "¿Puede este componente ser un Server Component?"',
  },
  {
    id: 'practical-checklist',
    number: 10,
    title: 'Lista de Verificación para Decidir',
    icon: '✅',
    color: 'teal',
    summary: 'Un árbol de decisión rápido para elegir el tipo de componente correcto siempre',
    details: [
      '**¿Obtiene datos o accede al backend?** → Server Component.',
      '**¿Usa `useState`, `useReducer` o hooks personalizados con estado?** → Client Component.',
      '**¿Maneja eventos (`onClick`, `onChange`, etc.)?** → Client Component.',
      '**¿Usa `useEffect` o `useRef`?** → Client Component.',
      '**¿Usa APIs del navegador (`window`, `localStorage`, etc.)?** → Client Component.',
      '**¿Es un Context Provider?** → Client Component (mantenlo estrecho, pasa `children` de Server Components a través de él).',
      '**¿Ninguna de las anteriores (solo muestra datos)?** → Server Component — disfruta el rendimiento gratis.',
    ],
    code: `// Modelo mental rápido — haz estas preguntas en orden:

function decidirTipoDeComponente(componente) {
  if (componente.obtieneDatos || componente.accedeBD)        return 'Server Component';
  if (componente.usaEstado || componente.usaReducer)         return 'Client Component';
  if (componente.tieneEventHandlers)                         return 'Client Component';
  if (componente.usaEffectORef)                              return 'Client Component';
  if (componente.usaAPIDelNavegador)                         return 'Client Component';
  if (componente.esContextProvider)                          return 'Client Component';

  // Solo muestra datos, sin efectos secundarios → Server Component (por defecto)
  return 'Server Component';
}

// ─────────────────────────────────────────────────────────────
// Ejemplo real de división para un Dashboard de Inspecciones:
//
// app/dashboard/page.tsx                ← Servidor (async, obtiene datos)
//   └─ <StatsCards data={...} />        ← Servidor (solo muestra datos)
//   └─ <InspectionFilters />            ← Cliente (useState, onChange)
//   └─ <Suspense fallback={<Skeleton/>}>
//        └─ <InspectionTable />         ← Servidor (async, obtiene con params)
//   └─ <ExportButton />                 ← Cliente (onClick, descarga CSV)
//
// Resultado: ~90% del árbol se renderiza en servidor, solo 2 componentes
// hoja envían JavaScript al navegador.`,
    tip: 'La app ideal tiene un shell renderizado en servidor con pequeñas islas de Client Components enfocadas en los bordes para la interactividad.',
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
            Cuándo usar cada uno, cómo funcionan, cómo componerlos y los patrones
            que mantienen tu app rápida y tu bundle pequeño.
          </p>

          {/* Quick legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2 bg-blue-900/50 border border-blue-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              <strong>Server Component</strong> — se renderiza en servidor, cero JS en el bundle
            </span>
            <span className="flex items-center gap-2 bg-violet-900/50 border border-violet-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
              <strong>Client Component</strong> — se hidrata en el navegador, interactivo
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="https://nextjs.org/docs/app/building-your-application/rendering/server-components"
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
                  <span className="text-gray-400 text-xs font-mono">Ejemplo</span>
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
          Ve estos patrones en acción en el resto de este proyecto.
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
            Ver el Dashboard →
          </Link>
          <Link
            href="https://nextjs.org/docs/app/building-your-application/rendering"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Documentación oficial →
          </Link>
        </div>
      </div>
    </main>
  );
}
