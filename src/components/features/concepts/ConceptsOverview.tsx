'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Concept {
  id: string;
  number: number;
  title: string;
  icon: string;
  badge: string;
  badgeColor: string;
  summary: string;
  details: string[];
  code: string;
  tip: string;
  link: string;
}

const concepts: Concept[] = [
  {
    id: 'routing',
    number: 1,
    title: 'Routing',
    icon: '🗺️',
    badge: 'App Router',
    badgeColor: 'bg-blue-100 text-blue-700',
    summary: 'Enrutamiento basado en archivos con el App Router de Next.js',
    details: [
      'Cada carpeta dentro de `app/` define un segmento de ruta. Un archivo `page.tsx` la hace pública.',
      '`layout.tsx` envuelve rutas hijas y no se re-renderiza al navegar — ideal para barras de navegación o sidebars.',
      '`<Link>` activa navegación client-side sin recarga. Next.js hace prefetch automático de las rutas visibles.',
      'Segmentos dinámicos: `app/inspections/[id]/page.tsx` → `/inspections/abc123`. Accede con `params.id`.',
      '`usePathname()` devuelve la ruta activa. `useRouter()` permite navegación imperativa con `router.push()`.',
    ],
    code: `// Estructura de archivos → rutas públicas
app/
  page.tsx              // → /
  dashboard/
    page.tsx            // → /dashboard
    layout.tsx          // layout compartido para /dashboard/*
  inspections/
    page.tsx            // → /inspections
    [id]/
      page.tsx          // → /inspections/:id  (segmento dinámico)

// Navegación declarativa con <Link>
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      <Link
        href="/dashboard"
        className={pathname === '/dashboard' ? 'font-bold text-blue-600' : 'text-gray-600'}
      >
        Dashboard
      </Link>
      <Link href="/inspections">Inspecciones</Link>
    </nav>
  );
}

// Segmento dinámico — params inyectados por Next.js
// app/inspections/[id]/page.tsx
export default function InspectionDetail({
  params,
}: {
  params: { id: string };
}) {
  return <h1>Inspección #{params.id}</h1>;
}`,
    tip: 'El App Router usa React Server Components por defecto. Solo agrega "use client" cuando necesites hooks o interactividad.',
    link: '/nextjs-concepts',
  },
  {
    id: 'data-fetching',
    number: 2,
    title: 'Data Fetching',
    icon: '📡',
    badge: 'Server Components',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    summary: 'Fetch de datos directo en Server Components — sin useEffect ni librerías extra',
    details: [
      'Los Server Components pueden ser `async` — llama a la BD o a APIs directamente con `await`.',
      'Next.js extiende `fetch` con opciones de caché: `force-cache` (estático), `no-store` (dinámico), `revalidate: N` (ISR).',
      'Usa `Promise.all()` para fetches paralelos y evitar waterfalls de red.',
      'Para datos que cambian frecuentemente, `cache: "no-store"` garantiza datos frescos en cada request.',
      '`unstable_cache` de `next/cache` permite cachear funciones que no usan `fetch` (consultas a BD, etc.).',
    ],
    code: `// Server Component async — fetch sin useEffect
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Fetch paralelo — sin waterfall
  const [inspections, stats] = await Promise.all([
    fetchInspections(),
    fetchStats(),
  ]);

  return (
    <main>
      <StatsCards stats={stats} />
      <InspectionTable data={inspections} />
    </main>
  );
}

// Opciones de caché en fetch
async function fetchInspections() {
  // ISR: revalida cada 60 segundos
  const res = await fetch('/api/inspections', {
    next: { revalidate: 60 },
  });
  return res.json();
}

async function fetchLiveData() {
  // Dinámico: siempre fresco, sin caché
  const res = await fetch('/api/live', { cache: 'no-store' });
  return res.json();
}

async function fetchStaticContent() {
  // Estático: se cachea indefinidamente hasta que se invalide
  const res = await fetch('/api/config', { cache: 'force-cache' });
  return res.json();
}`,
    tip: 'Coloca el fetch lo más cerca posible del componente que lo necesita. React deduplicará automáticamente peticiones idénticas en el mismo render.',
    link: '/nextjs-concepts',
  },
  {
    id: 'streaming',
    number: 3,
    title: 'Streaming',
    icon: '🌊',
    badge: 'Suspense + RSC',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    summary: 'Envía partes de la UI al navegador en cuanto estén listas — sin bloquear toda la página',
    details: [
      'Con el App Router, Next.js puede **streamear** el HTML de una página: la UI se envía progresivamente al navegador.',
      'Envuelve componentes lentos en `<Suspense fallback={<Skeleton />}>` para mostrar un placeholder inmediatamente.',
      'El archivo `loading.tsx` en cualquier segmento crea automáticamente un límite Suspense con el skeleton como fallback.',
      'Los componentes fuera del Suspense se renderizan y envían primero; los lentos llegan después sin bloquear.',
      'El header, navegación y partes estáticas son instantáneos — el usuario ve contenido útil de inmediato.',
    ],
    code: `// Sin Streaming — toda la página espera al componente más lento
export default async function SlowPage() {
  const data = await fetchSlowData(); // bloquea 3 segundos
  return <DataView data={data} />;    // el usuario espera 3s en blanco
}

// ─────────────────────────────────────────────────────────────

// Con Streaming — partes rápidas llegan de inmediato
import { Suspense } from 'react';

export default function FastPage() {
  return (
    <main>
      {/* Renderiza instantáneamente */}
      <Header />
      <QuickStats />

      {/* Envía el skeleton inmediatamente, reemplaza con datos cuando llegan */}
      <Suspense fallback={<TableSkeleton />}>
        <SlowInspectionTable />   {/* hace fetch interno de 3s */}
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />          {/* hace fetch interno de 2s */}
      </Suspense>
    </main>
  );
}

// loading.tsx — crea un límite Suspense automático para toda la ruta
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}`,
    tip: 'Granularidad: múltiples límites Suspense pequeños dan mejor UX que uno grande. Cada parte carga independientemente.',
    link: '/suspense-lazy',
  },
  {
    id: 'server-actions',
    number: 4,
    title: 'Server Actions',
    icon: '⚡',
    badge: 'use server',
    badgeColor: 'bg-violet-100 text-violet-700',
    summary: 'Funciones del servidor invocables desde el cliente — sin escribir API routes',
    details: [
      'Una Server Action es una función `async` marcada con `"use server"` que corre exclusivamente en el servidor.',
      'Conecta formularios directamente al servidor: `<form action={myAction}>` — sin `onSubmit` ni `fetch`.',
      'Llama a `revalidatePath()` o `revalidateTag()` para invalidar el caché y refrescar la UI tras una mutación.',
      'Desde Client Components, llama a Server Actions como funciones normales en event handlers.',
      'Retorna datos tipados para que el cliente los consuma; usa `redirect()` para navegar tras éxito.',
    ],
    code: `// app/inspections/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Invocada desde un formulario — recibe FormData automáticamente
export async function createInspection(formData: FormData) {
  const vehicleId = formData.get('vehicleId') as string;
  const inspector = formData.get('inspector') as string;

  await db.inspections.create({ vehicleId, inspector });

  revalidatePath('/inspections');   // invalida caché
  redirect('/inspections');         // navega al listado
}

// Invocada desde un event handler con datos tipados
export async function updateStatus(
  id: string,
  status: 'pending' | 'passed' | 'failed'
) {
  await db.inspections.update(id, { status });
  revalidatePath('/dashboard');
  return { success: true };
}

// Uso en Server Component — form nativo
export default function NewInspectionPage() {
  return (
    <form action={createInspection}>
      <input name="vehicleId" placeholder="ID Vehículo" />
      <input name="inspector" placeholder="Inspector" />
      <button type="submit">Crear Inspección</button>
    </form>
  );
}

// Uso en Client Component — event handler
'use client';
export function StatusButton({ id }: { id: string }) {
  return (
    <button onClick={() => updateStatus(id, 'passed')}>
      Aprobar
    </button>
  );
}`,
    tip: 'Siempre valida los datos en la Server Action (nunca confíes en el cliente). Usa Zod para validación tipada y segura.',
    link: '/server-actions',
  },
  {
    id: 'autenticacion',
    number: 5,
    title: 'Autenticación',
    icon: '🔐',
    badge: 'Middleware + Guards',
    badgeColor: 'bg-red-100 text-red-700',
    summary: 'Protege rutas en el servidor con middleware y en el cliente con guards de componente',
    details: [
      'El `middleware.ts` en la raíz corre antes de cada request — el lugar ideal para proteger rutas a nivel de servidor.',
      'Usa `NextResponse.redirect()` en el middleware para redirigir a `/login` si el token es inválido o inexistente.',
      'El `matcher` limita en qué rutas corre el middleware — evita que corra en activos estáticos o rutas públicas.',
      'Los Client Component guards (`ProtectedRoute`) verifican el estado de auth en el cliente como segunda capa de defensa.',
      'Almacena el token en cookies HttpOnly (no localStorage) — el middleware puede leerlas de forma segura.',
    ],
    code: `// middleware.ts — protección a nivel de servidor (corre ANTES del render)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  const isProtected = request.nextUrl.pathname.startsWith('/dashboard');

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/inspections/:path*'],
};

// ─────────────────────────────────────────────────────────────

// ProtectedRoute — guard de componente (segunda capa, lado cliente)
'use client';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return <LoadingSpinner />;
  return <>{children}</>;
}

// Uso en cualquier página protegida
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}`,
    tip: 'El middleware es la primera línea de defensa. El guard de componente evita flashes de contenido protegido. Usa ambos juntos.',
    link: '/login',
  },
  {
    id: 'server-vs-client',
    number: 6,
    title: 'Server vs Client Components',
    icon: '🖥️',
    badge: 'use client',
    badgeColor: 'bg-orange-100 text-orange-700',
    summary: 'Elige el tipo correcto de componente según si necesitas interactividad o acceso al servidor',
    details: [
      'Sin directiva = **Server Component** (por defecto). Con `"use client"` al inicio = **Client Component**.',
      'Server Components: renderizan en el servidor, envían solo HTML, pueden ser `async`, acceden a BD y secretos.',
      'Client Components: se hidratan en el navegador, soportan hooks (`useState`, `useEffect`), eventos y APIs del browser.',
      '`"use client"` crea una frontera: todos los imports por debajo también se tratan como Client Components.',
      'Patrón óptimo: Server Component como contenedor (fetch de datos) + Client Component para la interactividad.',
    ],
    code: `// ✅ Server Component — fetch de datos, sin "use client"
// app/inspections/page.tsx
import { InspectionFilters } from './InspectionFilters'; // Client Component
import { InspectionTable } from './InspectionTable';     // Server Component

export default async function InspectionsPage() {
  // Consulta directa a la BD — imposible en Client Component
  const inspections = await db.inspections.findMany();

  return (
    <div>
      <InspectionFilters />                    {/* interactivo */}
      <InspectionTable data={inspections} />   {/* solo renderiza, sin estado */}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

// ✅ Client Component — interactividad, hooks, eventos
// components/InspectionFilters.tsx
'use client';

import { useState } from 'react';

export function InspectionFilters({ onFilter }: { onFilter: (v: string) => void }) {
  const [status, setStatus] = useState('all');

  return (
    <select
      value={status}
      onChange={(e) => {
        setStatus(e.target.value);
        onFilter(e.target.value);
      }}
    >
      <option value="all">Todos</option>
      <option value="passed">Aprobados</option>
      <option value="failed">Rechazados</option>
    </select>
  );
}

// ❌ No permitido en Server Components:
// useState, useEffect, onClick, window, localStorage`,
    tip: 'Regla de oro: sube los Server Components lo más arriba posible en el árbol. Baja "use client" lo más que puedas hacia las hojas.',
    link: '/server-vs-client',
  },
  {
    id: 'suspense-lazy',
    number: 7,
    title: 'Suspense & React.lazy',
    icon: '⏳',
    badge: 'Code Splitting',
    badgeColor: 'bg-teal-100 text-teal-700',
    summary: 'Divide tu bundle y carga componentes pesados solo cuando se necesitan',
    details: [
      '`React.lazy(() => import(...))` carga un componente de forma diferida — su código no se incluye en el bundle inicial.',
      '`<Suspense fallback={...}>` envuelve el componente lazy y muestra el fallback mientras carga el chunk.',
      'En Next.js usa `dynamic()` de `next/dynamic` — equivalente a `React.lazy` con SSR opcional.',
      'Usa `{ ssr: false }` en `dynamic` para componentes que usan APIs del browser (mapas, editores de texto, etc.).',
      'Combina múltiples Suspense para mostrar partes de la UI progresivamente — mejor UX que un spinner global.',
    ],
    code: `import { Suspense, lazy } from 'react';

// React.lazy — carga el componente solo cuando se renderiza por primera vez
const HeavyChart = lazy(() => import('./HeavyChart'));
const HeavyMap   = lazy(() => import('./HeavyMap'));

export default function Dashboard() {
  return (
    <div>
      {/* Renderiza inmediatamente */}
      <QuickStats />

      {/* Carga el chunk de HeavyChart solo cuando el Suspense se activa */}
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 rounded" />}>
        <HeavyChart />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 rounded" />}>
        <HeavyMap />
      </Suspense>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

// Next.js — dynamic() con opciones extra
import dynamic from 'next/dynamic';

// Sin SSR — solo carga en el browser (para window, mapas, etc.)
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// Con loading personalizado
const RichEditor = dynamic(() => import('./RichEditor'), {
  loading: () => <p>Cargando editor...</p>,
});`,
    tip: 'Componentes candidatos para lazy: gráficos (Chart.js, Recharts), mapas, editores rich-text, modales pesados. Ahorra hasta 40% del bundle inicial.',
    link: '/suspense-lazy',
  },
  {
    id: 'form-validation',
    number: 8,
    title: 'Validación de Formularios',
    icon: '✅',
    badge: 'Zod + RHF',
    badgeColor: 'bg-green-100 text-green-700',
    summary: 'Valida formularios con React Hook Form y Zod — en el cliente y en el servidor',
    details: [
      '**React Hook Form (RHF)** gestiona el estado del formulario con mínimas re-renders y excelente DX.',
      '**Zod** define el esquema de validación con TypeScript — el mismo esquema sirve para cliente y servidor.',
      '`zodResolver(schema)` conecta Zod con RHF — los errores fluyen automáticamente a cada campo.',
      'En Server Actions, valida con `schema.safeParse(data)` antes de tocar la BD.',
      '`useActionState` (React 19) / `useFormState` conecta el resultado de una Server Action con el estado del formulario.',
    ],
    code: `// schemas/inspection.ts — esquema Zod compartido
import { z } from 'zod';

export const inspectionSchema = z.object({
  vehicleId: z.string().min(3, 'Mínimo 3 caracteres'),
  inspector: z.string().min(2, 'Nombre requerido'),
  date: z.string().date('Fecha inválida'),
  type: z.enum(['car', 'truck', 'motorcycle'], {
    errorMap: () => ({ message: 'Tipo inválido' }),
  }),
});

export type InspectionFormData = z.infer<typeof inspectionSchema>;

// ─────────────────────────────────────────────────────────────

// Client Component — React Hook Form + zodResolver
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function InspectionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
  });

  const onSubmit = async (data: InspectionFormData) => {
    await createInspection(data); // Server Action
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input {...register('vehicleId')} placeholder="ID Vehículo" />
        {errors.vehicleId && <p className="text-red-500">{errors.vehicleId.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Crear Inspección'}
      </button>
    </form>
  );
}

// Server Action — valida de nuevo en el servidor (nunca confíes solo en el cliente)
'use server';
export async function createInspection(data: unknown) {
  const result = inspectionSchema.safeParse(data);
  if (!result.success) return { errors: result.error.flatten() };

  await db.inspections.create(result.data);
  revalidatePath('/inspections');
}`,
    tip: 'Valida SIEMPRE en el servidor. La validación del cliente es UX; la del servidor es seguridad. Son complementarias, no alternativas.',
    link: '/form-validation',
  },
];

const colorMap: Record<string, { border: string; iconBg: string; accent: string }> = {
  'bg-blue-100 text-blue-700': {
    border: 'border-blue-200',
    iconBg: 'bg-blue-50',
    accent: 'text-blue-600',
  },
  'bg-indigo-100 text-indigo-700': {
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-50',
    accent: 'text-indigo-600',
  },
  'bg-cyan-100 text-cyan-700': {
    border: 'border-cyan-200',
    iconBg: 'bg-cyan-50',
    accent: 'text-cyan-600',
  },
  'bg-violet-100 text-violet-700': {
    border: 'border-violet-200',
    iconBg: 'bg-violet-50',
    accent: 'text-violet-600',
  },
  'bg-red-100 text-red-700': {
    border: 'border-red-200',
    iconBg: 'bg-red-50',
    accent: 'text-red-600',
  },
  'bg-orange-100 text-orange-700': {
    border: 'border-orange-200',
    iconBg: 'bg-orange-50',
    accent: 'text-orange-600',
  },
  'bg-teal-100 text-teal-700': {
    border: 'border-teal-200',
    iconBg: 'bg-teal-50',
    accent: 'text-teal-600',
  },
  'bg-green-100 text-green-700': {
    border: 'border-green-200',
    iconBg: 'bg-green-50',
    accent: 'text-green-600',
  },
};

export function ConceptsOverview() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Conceptos Next.js</h2>
        <p className="text-gray-500 text-sm mt-1">
          Haz clic en cada concepto para ver el resumen, detalles y un ejemplo de código.
        </p>
      </div>

      {concepts.map((concept) => {
        const isOpen = expanded === concept.id;
        const colors = colorMap[concept.badgeColor] ?? {
          border: 'border-gray-200',
          iconBg: 'bg-gray-50',
          accent: 'text-gray-600',
        };

        return (
          <div
            key={concept.id}
            className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-all duration-200 ${colors.border}`}
          >
            {/* Header — always visible */}
            <button
              onClick={() => toggle(concept.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-lg text-xl flex-shrink-0 ${colors.iconBg}`}
              >
                {concept.icon}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-gray-400">
                    #{concept.number}
                  </span>
                  <h3 className="font-semibold text-gray-900">{concept.title}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${concept.badgeColor}`}
                  >
                    {concept.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{concept.summary}</p>
              </div>

              <span
                className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-5">
                {/* Details */}
                <ul className="space-y-2">
                  {concept.details.map((detail, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className={`mt-0.5 flex-shrink-0 ${colors.accent}`}>▸</span>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: detail.replace(
                            /\*\*(.+?)\*\*/g,
                            '<strong>$1</strong>'
                          ),
                        }}
                      />
                    </li>
                  ))}
                </ul>

                {/* Code block */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Ejemplo de código
                    </span>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre font-mono">
                    <code>{concept.code}</code>
                  </pre>
                </div>

                {/* Tip */}
                <div className={`flex gap-2 rounded-lg p-3 ${colors.iconBg} border ${colors.border}`}>
                  <span className="text-base flex-shrink-0">💡</span>
                  <p className="text-sm text-gray-700">{concept.tip}</p>
                </div>

                {/* Link */}
                <div className="flex justify-end">
                  <Link
                    href={concept.link}
                    className={`text-sm font-medium ${colors.accent} hover:underline flex items-center gap-1`}
                  >
                    Ver guía completa →
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
