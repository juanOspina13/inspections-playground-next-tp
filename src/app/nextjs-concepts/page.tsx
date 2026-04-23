import Link from 'next/link';

const concepts = [
  {
    number: 1,
    title: 'Getting Started',
    icon: '🚀',
    color: 'blue',
    summary: 'Setup del proyecto y estructura de carpetas de Next.js',
    details: [
      'Next.js usa el App Router (directorio `app/`) como sistema de enrutamiento basado en el sistema de archivos.',
      'El comando `npx create-next-app@latest` genera la estructura inicial con TypeScript, Tailwind y ESLint preconfigurados.',
      'El servidor de desarrollo (`npm run dev`) permite hot-reload automático en el puerto 3000.',
      'La carpeta `public/` sirve activos estáticos directamente desde la raíz del sitio.',
    ],
    code: `// Estructura básica de un proyecto Next.js
app/
  layout.tsx    ← Layout raíz (envuelve toda la app)
  page.tsx      ← Página principal (ruta "/")
  globals.css   ← Estilos globales
public/
  images/       ← Activos estáticos accesibles via URL
next.config.ts  ← Configuración de Next.js`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/getting-started',
  },
  {
    number: 2,
    title: 'CSS Styling',
    icon: '🎨',
    color: 'purple',
    summary: 'Tailwind CSS, CSS Modules y la librería clsx',
    details: [
      '**Tailwind CSS**: Clases utilitarias aplicadas directamente en el JSX. No requiere archivos CSS separados por componente.',
      '**CSS Modules**: Archivos `.module.css` que generan nombres de clase únicos, evitando colisiones de estilos.',
      '**clsx**: Librería para aplicar clases condicionalmente de forma limpia.',
      '**Sass / CSS-in-JS**: Otras alternativas como styled-components o emotion también son compatibles.',
    ],
    code: `// Tailwind — clases utilitarias inline
<h1 className="text-3xl font-bold text-blue-600">Hola</h1>

// CSS Modules — estilos con scope de componente
import styles from './card.module.css';
<div className={styles.card}>...</div>

// clsx — clases condicionales
import clsx from 'clsx';
<span className={clsx('px-2 py-1 rounded', {
  'bg-green-500 text-white': status === 'paid',
  'bg-gray-200 text-gray-600': status === 'pending',
})}>
  {status}
</span>`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/css-styling',
  },
  {
    number: 3,
    title: 'Optimizing Fonts & Images',
    icon: '🖼️',
    color: 'green',
    summary: 'next/font y next/image para carga optimizada',
    details: [
      '**next/font**: Descarga fuentes en tiempo de build y las aloja en el servidor, eliminando solicitudes externas y reduciendo layout shift (CLS).',
      '**next/image**: Optimiza imágenes automáticamente: lazy loading, redimensionado, conversión a WebP/AVIF y prevención de layout shift.',
      'Las imágenes requieren `width` y `height` explícitos (o `fill` con contenedor posicionado).',
      'Se puede usar `priority` en imágenes LCP (above the fold) para cargarlas de inmediato.',
    ],
    code: `// next/font — sin layout shift, auto-hosted
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

// Aplica la variable CSS en el layout
<html className={inter.className}>...</html>

// next/image — optimización automática
import Image from 'next/image';
<Image
  src="/hero.png"
  alt="Hero"
  width={1000}
  height={760}
  priority          // carga inmediata para LCP
/>`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/optimizing-fonts-images',
  },
  {
    number: 4,
    title: 'Layouts & Pages',
    icon: '📐',
    color: 'orange',
    summary: 'Sistema de enrutamiento basado en archivos (App Router)',
    details: [
      'Cada carpeta dentro de `app/` crea un segmento de ruta. Un archivo `page.tsx` dentro la hace pública.',
      '`layout.tsx` define la UI compartida entre sus hijos. No se re-renderiza al navegar entre rutas hijas.',
      'Los layouts pueden anidarse: el layout raíz envuelve toda la app, layouts internos envuelven sus secciones.',
      'Archivos especiales: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.',
    ],
    code: `// app/dashboard/layout.tsx — layout compartido
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />           {/* se mantiene al navegar */}
      <main>{children}</main>
    </div>
  );
}

// app/dashboard/page.tsx → ruta "/dashboard"
// app/dashboard/invoices/page.tsx → ruta "/dashboard/invoices"`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages',
  },
  {
    number: 5,
    title: 'Navigating Between Pages',
    icon: '🔗',
    color: 'teal',
    summary: 'Componente <Link>, prefetching y navegación client-side',
    details: [
      '`<Link>` reemplaza a `<a>` y activa navegación del lado del cliente sin recargas completas.',
      'Next.js **prefetcha** automáticamente las rutas visibles en el viewport, haciendo la navegación instantánea.',
      'El hook `usePathname()` permite detectar la ruta activa para resaltar elementos de navegación.',
      'Para navegación imperativa (programática) se usa `useRouter()` con `router.push()`.',
    ],
    code: `import Link from 'next/link';
import { usePathname } from 'next/navigation';

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx('p-2 rounded', {
        'bg-blue-600 text-white': isActive,
        'text-gray-600 hover:bg-gray-100': !isActive,
      })}
    >
      {children}
    </Link>
  );
}`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/navigating-between-pages',
  },
  {
    number: 7,
    title: 'Fetching Data',
    icon: '📡',
    color: 'indigo',
    summary: 'Server Components, fetch nativo y patrones de data fetching',
    details: [
      'Los **Server Components** pueden ser `async` y realizar fetch directo sin `useEffect` ni librerías extra.',
      'Next.js extiende el `fetch` nativo con opciones de caché: `force-cache` (estático), `no-store` (dinámico), `revalidate` (ISR).',
      'Se recomienda **no** usar un ORM/cliente en el componente raíz y pasarlo a hijos para evitar waterfalls.',
      'Para requests paralelos se usa `Promise.all()`. Para secuenciales, `await` en cascada.',
    ],
    code: `// Server Component — fetch directo (sin useEffect)
export default async function DashboardPage() {
  // Parallel fetching — evita waterfall
  const [revenue, invoices] = await Promise.all([
    fetchRevenue(),
    fetchLatestInvoices(),
  ]);

  return <Dashboard revenue={revenue} invoices={invoices} />;
}

// fetch con opciones de caché
const data = await fetch('/api/data', {
  next: { revalidate: 3600 }, // ISR: revalida cada hora
});`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/fetching-data',
  },
  {
    number: 8,
    title: 'Static & Dynamic Rendering',
    icon: '⚡',
    color: 'yellow',
    summary: 'SSG, SSR e ISR — cómo y cuándo se renderiza cada ruta',
    details: [
      '**Renderizado estático (SSG)**: El HTML se genera en build time. Ideal para contenido que no cambia. Máximo rendimiento y cacheabilidad.',
      '**Renderizado dinámico (SSR)**: El HTML se genera en cada request. Necesario cuando los datos cambian frecuentemente o dependen del usuario.',
      'Una ruta se vuelve dinámica automáticamente al usar `cookies()`, `headers()`, `searchParams` o `fetch` con `no-store`.',
      '**ISR (Incremental Static Regeneration)**: Combina ambos — genera estático pero revalida cada N segundos.',
    ],
    code: `// Estático (por defecto) — generado en build
export default async function Page() {
  const data = await fetch('/api/posts', {
    next: { revalidate: 60 }, // ISR: cada 60s
  });
  return <Posts data={data} />;
}

// Dinámico — se ejecuta en cada request
import { cookies } from 'next/headers';

export default async function Dashboard() {
  const session = cookies().get('session'); // fuerza dynamic
  const data = await fetchUserData(session?.value);
  return <UserDashboard data={data} />;
}`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/static-and-dynamic-rendering',
  },
  {
    number: 9,
    title: 'Streaming',
    icon: '🌊',
    color: 'cyan',
    summary: 'Suspense y loading skeletons para UX progresiva',
    details: [
      '**Streaming** permite enviar partes del HTML al navegador tan pronto como estén listas, sin esperar toda la página.',
      '`loading.tsx` crea automáticamente un Suspense boundary para la ruta completa, mostrando un fallback durante la carga.',
      'Para streaming granular, se envuelven componentes lentos en `<Suspense fallback={<Skeleton />}>`.',
      'Esto permite que partes rápidas de la UI sean interactivas mientras las lentas aún cargan.',
    ],
    code: `// loading.tsx — skeleton para toda la ruta
export default function Loading() {
  return <DashboardSkeleton />;
}

// Suspense granular — solo el componente lento espera
import { Suspense } from 'react';

export default function Page() {
  return (
    <main>
      <StaticHeader />         {/* se muestra inmediatamente */}
      <Suspense fallback={<RevenueChartSkeleton />}>
        <RevenueChart />       {/* hace fetch async */}
      </Suspense>
      <Suspense fallback={<LatestInvoicesSkeleton />}>
        <LatestInvoices />
      </Suspense>
    </main>
  );
}`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/streaming',
  },
  {
    number: 10,
    title: 'Search & Pagination',
    icon: '🔍',
    color: 'rose',
    summary: 'URL search params como fuente de verdad para búsqueda y paginación',
    details: [
      'Guardar el estado de búsqueda en la **URL** (query params) permite compartir resultados, usar el botón atrás y hacer SSR.',
      'El hook `useSearchParams()` lee los parámetros desde el cliente; `searchParams` prop los lee desde el servidor.',
      '`useRouter()` y `usePathname()` permiten actualizar la URL sin recargar la página.',
      'Se recomienda `debounce` en el input de búsqueda para reducir requests al servidor.',
    ],
    code: `'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    term ? params.set('query', term) : params.delete('query');
    replace(\`\${pathname}?\${params.toString()}\`);
  }, 300);

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/adding-search-and-pagination',
  },
  {
    number: 11,
    title: 'Mutating Data',
    icon: '✏️',
    color: 'amber',
    summary: 'Server Actions y revalidación del cache de Next.js',
    details: [
      '**Server Actions** son funciones `async` con la directiva `"use server"` que se ejecutan en el servidor pero se invocan desde el cliente.',
      'Se pueden usar directamente en el atributo `action` de un `<form>` o invocar desde event handlers.',
      'Después de mutar datos, se llama a `revalidatePath()` o `revalidateTag()` para invalidar el caché y mostrar datos frescos.',
      'Permiten manejar errores con `try/catch` y retornar estados de validación al cliente.',
    ],
    code: `// actions.ts
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInvoice(formData: FormData) {
  const rawData = {
    customerId: formData.get('customerId'),
    amount: Number(formData.get('amount')),
    status: formData.get('status'),
  };

  await db.insert(invoices).values(rawData);
  revalidatePath('/dashboard/invoices'); // limpia caché
  redirect('/dashboard/invoices');        // redirige
}

// En el formulario
<form action={createInvoice}>
  <input name="amount" type="number" />
  <button type="submit">Crear</button>
</form>`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/mutating-data',
  },
  {
    number: 12,
    title: 'Handling Errors',
    icon: '🛡️',
    color: 'red',
    summary: 'error.tsx, notFound() y manejo de errores en Server Actions',
    details: [
      '`error.tsx` es un archivo especial que actúa como Error Boundary para una ruta. Debe ser un Client Component (`"use client"`).',
      'Recibe las props `error` (objeto Error) y `reset` (función para reintentar el render).',
      'La función `notFound()` de `next/navigation` muestra el archivo `not-found.tsx` de la ruta más cercana.',
      'Para Server Actions, se recomienda usar `try/catch` y retornar estados de error en lugar de lanzar excepciones.',
    ],
    code: `// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Algo salió mal</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Reintentar</button>
    </div>
  );
}

// app/dashboard/invoices/[id]/page.tsx
import { notFound } from 'next/navigation';

const invoice = await fetchInvoice(id);
if (!invoice) notFound(); // muestra not-found.tsx`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/error-handling',
  },
  {
    number: 13,
    title: 'Form Validation & Accessibility',
    icon: '✅',
    color: 'lime',
    summary: 'Validación server-side con Zod y mejoras de accesibilidad',
    details: [
      'La validación **server-side** en Server Actions previene datos inválidos independientemente del cliente.',
      'Zod es la librería recomendada para validar y tipar los datos del formulario en el servidor.',
      'El hook `useActionState` (React 19+) conecta la acción del servidor con el estado del cliente para mostrar errores.',
      'Los atributos ARIA (`aria-describedby`, `aria-live`) mejoran la accesibilidad para lectores de pantalla.',
    ],
    code: `// Validación con Zod en Server Action
import { z } from 'zod';

const InvoiceSchema = z.object({
  customerId: z.string({ required_error: 'Selecciona un cliente' }),
  amount: z.coerce.number().gt(0, 'El monto debe ser mayor a 0'),
  status: z.enum(['pending', 'paid'], { message: 'Estado inválido' }),
});

export async function createInvoice(prevState: State, formData: FormData) {
  const result = InvoiceSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  // proceder con datos validados...
}

// En el componente — useActionState
const [state, formAction] = useActionState(createInvoice, initialState);`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/improving-accessibility',
  },
  {
    number: 14,
    title: 'Authentication',
    icon: '🔐',
    color: 'violet',
    summary: 'NextAuth.js, middleware y protección de rutas',
    details: [
      '**NextAuth.js** (Auth.js) integra autenticación con providers OAuth, credenciales y más con mínima configuración.',
      'El middleware (`middleware.ts`) protege rutas completas antes de que el servidor procese la request.',
      'Las Server Actions pueden verificar la sesión directamente con `auth()` para proteger mutaciones.',
      'Las callbacks `authorized` del middleware controlan el acceso basándose en la sesión del usuario.',
    ],
    code: `// auth.config.ts
export const authConfig = {
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith('/dashboard');
      if (isProtected) return isLoggedIn; // redirige al login si no hay sesión
      return true;
    },
  },
};

// middleware.ts — protege rutas automáticamente
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/adding-authentication',
  },
  {
    number: 15,
    title: 'Metadata',
    icon: '🏷️',
    color: 'sky',
    summary: 'SEO, Open Graph y metadata estática y dinámica',
    details: [
      'Next.js provee una **Metadata API** para definir metadatos SEO de forma declarativa, sin `<head>` manual.',
      'La metadata **estática** se exporta como objeto `metadata` desde `layout.tsx` o `page.tsx`.',
      'La metadata **dinámica** se genera con la función `generateMetadata()` que puede hacer fetch de datos.',
      'Soporta Open Graph, Twitter Cards, favicons, manifest, y más de forma nativa.',
    ],
    code: `// Metadata estática — en layout.tsx o page.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard', // %s = título de cada página
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Learn Dashboard',
  metadataBase: new URL('https://acme.example.com'),
  openGraph: {
    images: '/og-image.png',
  },
};

// Metadata dinámica — con datos del servidor
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const invoice = await fetchInvoice(params.id);
  return {
    title: \`Factura #\${invoice.id}\`,
    description: \`Detalles de la factura de \${invoice.customer}\`,
  };
}`,
    docUrl: 'https://nextjs.org/learn/dashboard-app/adding-metadata',
  },
];

const colorMap: Record<string, { bg: string; border: string; badge: string; code: string; link: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-600', code: 'bg-blue-950', link: 'text-blue-600 hover:text-blue-800' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-600', code: 'bg-purple-950', link: 'text-purple-600 hover:text-purple-800' },
  green: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-600', code: 'bg-green-950', link: 'text-green-600 hover:text-green-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500', code: 'bg-orange-950', link: 'text-orange-600 hover:text-orange-800' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', badge: 'bg-teal-600', code: 'bg-teal-950', link: 'text-teal-600 hover:text-teal-800' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-600', code: 'bg-indigo-950', link: 'text-indigo-600 hover:text-indigo-800' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-500', code: 'bg-yellow-950', link: 'text-yellow-600 hover:text-yellow-800' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', badge: 'bg-cyan-600', code: 'bg-cyan-950', link: 'text-cyan-600 hover:text-cyan-800' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', badge: 'bg-rose-600', code: 'bg-rose-950', link: 'text-rose-600 hover:text-rose-800' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-600', code: 'bg-amber-950', link: 'text-amber-600 hover:text-amber-800' },
  red: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-600', code: 'bg-red-950', link: 'text-red-600 hover:text-red-800' },
  lime: { bg: 'bg-lime-50', border: 'border-lime-200', badge: 'bg-lime-600', code: 'bg-lime-950', link: 'text-lime-600 hover:text-lime-800' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-600', code: 'bg-violet-950', link: 'text-violet-600 hover:text-violet-800' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-600', code: 'bg-sky-950', link: 'text-sky-600 hover:text-sky-800' },
};

export default function NextJsConceptsPage() {

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 text-sm font-mono mb-3 tracking-widest uppercase">
            nextjs.org/learn — Dashboard App Course
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Conceptos clave de Next.js
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Una referencia visual de los 14 conceptos principales cubiertos en el curso
            oficial de Next.js, con ejemplos de código y explicaciones en español.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="https://nextjs.org/learn"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black font-semibold px-5 py-2 rounded-full text-sm hover:bg-gray-100 transition"
            >
              Curso oficial →
            </Link>
            <Link
              href="/"
              className="border border-gray-600 text-gray-300 font-semibold px-5 py-2 rounded-full text-sm hover:border-gray-400 transition"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Index / Table of contents */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">
          Índice de conceptos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {concepts.map((c) => {
            const colors = colorMap[c.color];
            return (
              <a
                key={c.number}
                href={`#concept-${c.number}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors.bg} ${colors.border} text-sm hover:shadow-sm transition group`}
              >
                <span className="text-base">{c.icon}</span>
                <span className="text-gray-700 group-hover:text-gray-900 font-medium leading-tight">
                  {c.title}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Concept cards */}
      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-12">
        {concepts.map((concept) => {
          const colors = colorMap[concept.color];
          return (
            <article
              key={concept.number}
              id={`concept-${concept.number}`}
              className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden scroll-mt-6`}
            >
              {/* Card header */}
              <div className="p-6 pb-0">
                <div className="flex items-start gap-4">
                  <span
                    className={`${colors.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mt-1`}
                  >
                    Cap. {concept.number}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span>{concept.icon}</span>
                      {concept.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">{concept.summary}</p>
                  </div>
                </div>

                {/* Key points */}
                <ul className="mt-5 space-y-2">
                  {concept.details.map((detail, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-gray-400 shrink-0 mt-0.5">▸</span>
                      <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code block */}
              <div className="mt-5 mx-6 mb-5 rounded-xl overflow-hidden border border-gray-800">
                <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-mono">Ejemplo</span>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
                <pre className={`${colors.code} text-green-300 text-xs p-4 overflow-x-auto font-mono leading-relaxed`}>
                  <code>{concept.code}</code>
                </pre>
              </div>

              {/* Footer link */}
              <div className="px-6 pb-5">
                <a
                  href={concept.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-medium ${colors.link} transition`}
                >
                  Ver capítulo en nextjs.org/learn →
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-200 bg-white py-12 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">¿Listo para practicar?</h3>
        <p className="text-gray-500 mb-6">
          Estos conceptos ya están aplicados en este mismo proyecto.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Ver el Dashboard →
          </Link>
          <Link
            href="https://nextjs.org/learn"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Curso oficial de Next.js →
          </Link>
        </div>
      </div>
    </main>
  );
}
