import Link from 'next/link';

const sections = [
  {
    id: 'next-build',
    number: 1,
    title: 'next build — Entendiendo el Output',
    icon: '🏗️',
    color: 'slate',
    summary: 'Qué hace next build, cómo interpretar su output y los tipos de páginas generadas',
    details: [
      '`next build` analiza toda la app, determina qué rutas son estáticas/dinámicas, y genera el bundle optimizado en `.next/`.',
      'El output muestra cada ruta con su tamaño y un símbolo: `○` estático, `ƒ` dinámico (función serverless), `●` estático con datos.',
      '**First Load JS** es el JavaScript enviado al navegador en la primera carga — idealmente < 100KB por ruta.',
      'El flag `(Static)` significa que la página se genera en build time y se sirve como HTML desde CDN — máxima velocidad.',
      'El flag `(Dynamic)` significa que la página se genera en cada petición en el servidor — necesario cuando los datos cambian frecuentemente.',
    ],
    code: `# Ejecutar el build de producción
$ next build

# Output típico:
Route (app)                              Size     First Load JS
┌ ○ /                                   5.2 kB          98.2 kB
├ ○ /about                              1.1 kB          94.1 kB
├ ƒ /dashboard                          8.4 kB         101.4 kB
├ ○ /blog                               3.2 kB          96.2 kB
├ ● /blog/[slug]                        4.1 kB          97.1 kB
│   ├ /blog/nextjs-16                   
│   ├ /blog/react-19
│   └ [+2 more paths]
└ ƒ /api/inspections                    0 B                0 B

○  (Static)   prerendered as static content
●  (SSG)      prerendered at build time (uses getStaticProps / generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand

# Símbolos importantes:
# ○  Estático puro — HTML en CDN, tiempo de carga ~0ms
# ●  SSG — generado en build con datos, re-generado con ISR opcionalmente
# ƒ  Dinámico — función serverless, se ejecuta en cada petición

# El build también muestra warnings importantes:
# ⚠ Large bundle detected — considera code splitting
# ⚠ Route /dashboard might be slow — usa Suspense + streaming`,
    tip: 'Apunta a que la mayoría de tus rutas sean `○` (estáticas). Cada ruta `ƒ` (dinámica) es una función serverless que añade latencia.',
  },
  {
    id: 'static-dynamic',
    number: 2,
    title: 'Renderizado Estático vs Dinámico',
    icon: '⚖️',
    color: 'blue',
    summary: 'Cómo Next.js decide si una ruta es estática o dinámica — y cómo controlarlo',
    details: [
      'Next.js determina el modo de renderizado **automáticamente** en build time — analiza el código de la ruta.',
      'Una ruta es **estática** si no usa `cookies()`, `headers()`, `searchParams`, ni `fetch` sin caché.',
      'Una ruta se vuelve **dinámica** en cuanto usa cualquier API dinámica: `cookies()`, `headers()`, `connection()`, o `noStore()`.',
      'Puedes forzar una ruta estática con `export const dynamic = "force-static"` o dinámica con `"force-dynamic"`.',
      'En Next.js 15+, los `fetch` son **no cacheados por defecto** (`no-store`) — debes optar al caché explícitamente con `force-cache`.',
    ],
    code: `// ─── Ruta estática (○) ───────────────────────────────────────
// app/about/page.tsx — sin datos dinámicos, se genera en build
export default function AboutPage() {
  return <h1>Acerca de nosotros</h1>;  // siempre lo mismo
}

// ─── Ruta estática con datos (●) ─────────────────────────────
// app/blog/[slug]/page.tsx — generada en build para cada slug
export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((p) => ({ slug: p.slug }));  // genera /blog/abc, /blog/xyz
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug);
  return <article>{post.content}</article>;
}

// ─── Ruta dinámica (ƒ) ───────────────────────────────────────
// app/dashboard/page.tsx — se ejecuta en cada petición
import { cookies } from 'next/headers';  // ← hace la ruta dinámica automáticamente

export default async function Dashboard() {
  const session = await cookies().get('session');
  const data = await db.getUserData(session?.value);
  return <DashboardUI data={data} />;
}

// ─── Forzar el modo de renderizado ───────────────────────────
// Forzar estático aunque uses datos dinámicos (cuidado: los datos se congelan)
export const dynamic = 'force-static';

// Forzar dinámico aunque Next.js lo infiera estático
export const dynamic = 'force-dynamic';

// ─── Control del caché en fetch (Next.js 15+) ────────────────
// Por defecto: no cache
const data = await fetch('/api/data');                             // no-store

// Cachear indefinidamente (revalidar manualmente)
const data = await fetch('/api/data', { cache: 'force-cache' });

// ISR: revalidar cada N segundos
const data = await fetch('/api/data', { next: { revalidate: 60 } });`,
    tip: 'Revisa el output de `next build`. Si ves más `ƒ` de lo esperado, busca llamadas a `cookies()` o `headers()` que podrían moverse a un Server Component más abajo.',
  },
  {
    id: 'isr',
    number: 3,
    title: 'ISR — Incremental Static Regeneration',
    icon: '🔄',
    color: 'green',
    summary: 'Páginas estáticas que se regeneran automáticamente a intervalos — lo mejor de ambos mundos',
    details: [
      '**ISR** combina la velocidad del HTML estático (CDN) con la frescura de los datos dinámicos — sin regenerar todo en cada deploy.',
      'Con `revalidate`, Next.js sirve el HTML cacheado y, cuando expira el intervalo, regenera la página en background.',
      'El usuario que dispara la regeneración sigue recibiendo la versión anterior; el siguiente usuario recibe la nueva.',
      'La **revalidación bajo demanda** con `revalidatePath()` o `revalidateTag()` invalida el caché inmediatamente — ideal para CMS.',
      'ISR funciona tanto con `fetch` (opción `revalidate`) como con la exportación `revalidate` a nivel de segmento de ruta.',
    ],
    code: `// ─── ISR con fetch ───────────────────────────────────────────
// Revalida los datos cada 60 segundos
async function getInspections() {
  const res = await fetch('https://api.example.com/inspections', {
    next: { revalidate: 60 },   // segundos
  });
  return res.json();
}

export default async function InspectionsPage() {
  const inspections = await getInspections();
  return <InspectionTable data={inspections} />;
}

// ─── ISR a nivel de segmento ─────────────────────────────────
// app/inspections/page.tsx
export const revalidate = 60;    // toda la ruta revalida cada 60 segundos

// ─── ISR bajo demanda (mejor para contenido editado por humanos) ──
// Cuando un editor guarda en el CMS, se llama a este webhook:
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');

  // Verifica que la petición venga de tu CMS
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Token inválido' }, { status: 401 });
  }

  const { path, tag } = await request.json();

  if (tag)  revalidateTag(tag);
  if (path) revalidatePath(path);

  return Response.json({ revalidated: true, timestamp: Date.now() });
}

// ─── Elegir el intervalo de ISR ──────────────────────────────
// Datos que cambian raramente     → revalidate: 3600 (1 hora)
// Datos de producto/blog          → revalidate: 300  (5 minutos)
// Datos casi en tiempo real       → revalidate: 30   (30 segundos)
// Datos en tiempo real            → sin caché, ruta dinámica`,
    tip: 'Para contenido editorial (blog, catálogo), usa ISR con revalidación bajo demanda. El CMS llama al webhook y la página se regenera instantáneamente.',
  },
  {
    id: 'caching',
    number: 4,
    title: 'Capas de Caché en Next.js',
    icon: '🗄️',
    color: 'amber',
    summary: 'Next.js tiene 4 capas de caché independientes — entenderlas evita bugs difíciles',
    details: [
      '**Request Memoization**: deduplicación de `fetch` idénticos dentro de un mismo render — automática, en memoria.',
      '**Data Cache**: resultados de `fetch` persisten entre peticiones y deploys — controlado por `cache` y `revalidate`.',
      '**Full Route Cache**: el HTML y el RSC payload de rutas estáticas se almacenan en el servidor — se invalida con `revalidatePath`.',
      '**Router Cache**: en el cliente, Next.js cachea los segmentos de ruta visitados para navegación instantánea — dura la sesión.',
      'En desarrollo (`next dev`), el caché está deshabilitado para que siempre veas datos frescos. En producción (`next start`) sí aplica.',
    ],
    code: `// ─── 1. Request Memoization (automático) ─────────────────────
// Estas dos llamadas en el mismo render hacen UNA sola petición HTTP
async function PageHeader() {
  const user = await getUser();   // fetch a /api/user
  return <Header name={user.name} />;
}

async function PageSidebar() {
  const user = await getUser();   // MISMO fetch — reutiliza el resultado en memoria
  return <Sidebar avatar={user.avatar} />;
}

// ─── 2. Data Cache ────────────────────────────────────────────
// force-cache: persiste entre peticiones y deploys hasta revalidación
const products = await fetch('/api/products', { cache: 'force-cache' });

// no-store: nunca cachear — siempre datos frescos
const session  = await fetch('/api/session',  { cache: 'no-store' });

// ISR: cachear, revalidar cada 60s
const posts    = await fetch('/api/posts',    { next: { revalidate: 60 } });

// ─── 3. Full Route Cache ──────────────────────────────────────
// Invalidar el HTML cacheado de una ruta:
import { revalidatePath } from 'next/cache';
revalidatePath('/products');        // invalida solo esa ruta
revalidatePath('/products', 'layout'); // invalida esa ruta y todas las hijas

// ─── 4. Router Cache (cliente) ───────────────────────────────
// No controlable directamente — dura la sesión del navegador
// Para "forzar" un refresh del Router Cache:
import { useRouter } from 'next/navigation';
const router = useRouter();
router.refresh();  // invalida el Router Cache y re-fetcha los datos del servidor

// ─── Deshabilitar caché completamente (debug) ─────────────────
// next.config.ts
export default {
  experimental: {
    staleTimes: {
      dynamic: 0,   // Router Cache para rutas dinámicas: 0 segundos
      static: 0,    // Router Cache para rutas estáticas: 0 segundos
    },
  },
};`,
    tip: 'Si ves datos desactualizados en producción, primero revisa qué capa está cacheando. La mayoría de los bugs de caché son del Router Cache (cliente) o del Data Cache.',
  },
  {
    id: 'env-variables',
    number: 5,
    title: 'Variables de Entorno',
    icon: '🔑',
    color: 'cyan',
    summary: 'Cómo gestionar secretos y configuración entre servidor y cliente de forma segura',
    details: [
      'Las variables en `.env.local` son accesibles en el **servidor** con `process.env.NOMBRE` — nunca se envían al cliente.',
      'Solo las variables con prefijo `NEXT_PUBLIC_` se exponen al **cliente** — úsalas solo para valores no sensibles.',
      'En Server Components, Server Actions y Route Handlers puedes leer cualquier variable de entorno sin prefijo.',
      'En Client Components solo puedes leer `NEXT_PUBLIC_*` — si intentas leer otra, Next.js la reemplaza por `undefined` en el build.',
      'Nunca pongas secretos en variables `NEXT_PUBLIC_` — se incrustan en el bundle de JavaScript y son visibles para cualquiera.',
    ],
    code: `# .env.local — solo para desarrollo local (nunca en git)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=mi_secreto_super_largo_y_aleatorio
STRIPE_SECRET_KEY=sk_test_...

# Solo para el cliente (valores no sensibles)
NEXT_PUBLIC_API_URL=https://api.midominio.com
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...

# .env.production — valores de producción (en CI/CD o plataforma de deploy)
# .env.development — valores de desarrollo
# .env — valores por defecto para todos los entornos (sí puede estar en git si no tiene secretos)

# ─────────────────────────────────────────────────────────────

// Server Component o Server Action — acceso completo
async function getInspections() {
  const db = new Pool({ connectionString: process.env.DATABASE_URL }); // ✅
  return db.query('SELECT * FROM inspections');
}

// Client Component — solo NEXT_PUBLIC_*
'use client';
function MapWidget() {
  // ✅ Variable pública — se incrusta en el bundle del cliente
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  // ❌ Undefined en el cliente — Next.js no la expone
  const secret = process.env.JWT_SECRET;  // undefined en producción

  return <Map apiKey={apiKey} />;
}

// Validar variables de entorno al inicio (recomendado)
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL:             z.string().url(),
  JWT_SECRET:               z.string().min(32),
  NEXT_PUBLIC_API_URL:      z.string().url(),
});

export const env = envSchema.parse(process.env);
// Lanza en build time si falta alguna variable — evita sorpresas en producción`,
    tip: 'Valida tus variables de entorno con Zod al inicio de la app (`lib/env.ts`). Si una variable obligatoria falta, el build fallará con un mensaje claro.',
  },
  {
    id: 'bundle-analysis',
    number: 6,
    title: 'Análisis de Bundle y Optimización',
    icon: '📦',
    color: 'indigo',
    summary: 'Cómo encontrar y reducir lo que hace grande tu bundle de JavaScript',
    details: [
      '`@next/bundle-analyzer` genera un mapa visual de tu bundle — identifica qué librerías ocupan más espacio.',
      'El "First Load JS" de cada ruta es la métrica clave — incluye el bundle compartido y el código específico de esa ruta.',
      'Imágenes no optimizadas no afectan el bundle JS pero sí el Core Web Vitals — usa siempre `<Image>` de Next.js.',
      '`next/font` optimiza fuentes automáticamente: las descarga en build time y las sirve como assets estáticos sin layout shift.',
      'Revisa las importaciones de librerías grandes (lodash, date-fns, momentjs) — muchas tienen formas de importar solo lo que necesitas.',
    ],
    code: `# Instalar el bundle analyzer
$ npm install --save-dev @next/bundle-analyzer

// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer';

const config = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})({
  // tu configuración de Next.js
});

export default config;

# Ejecutar y abrir el análisis
$ ANALYZE=true next build
# Abre automáticamente dos mapas de treemap en el navegador:
# - Bundle del cliente (lo que se envía al navegador)
# - Bundle del servidor (lo que corre en Node.js)

# ─────────────────────────────────────────────────────────────

// Optimizaciones comunes:

// 1. Importar solo lo necesario de librerías grandes
// ❌ Importa TODO lodash (~70KB)
import _ from 'lodash';

// ✅ Importa solo la función que necesitas
import debounce from 'lodash/debounce';

// 2. Usar next/font en lugar de <link> a Google Fonts
// ❌ layout.tsx
<link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet" />

// ✅ Descarga y sirve la fuente localmente en build
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
// La fuente se sirve sin petición externa, sin layout shift

// 3. Lazy loading de componentes pesados
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// 4. Optimizar imágenes con el componente Image
import Image from 'next/image';
// ✅ Lazy loading, WebP automático, size correcto, sin CLS
<Image src="/hero.jpg" width={1200} height={600} alt="Hero" priority />`,
    tip: 'Corre `ANALYZE=true next build` antes de cada release importante. El 80% de los problemas de bundle vienen de 2-3 librerías mal importadas.',
  },
  {
    id: 'deployment',
    number: 7,
    title: 'Deployment — Vercel y Alternativas',
    icon: '🚀',
    color: 'teal',
    summary: 'Opciones para desplegar Next.js y qué configurar antes del primer deploy',
    details: [
      '**Vercel** es la plataforma creadora de Next.js — cero configuración, detecta automáticamente y activa todas las features (ISR, Edge, etc.).',
      '`next start` sirve la app desde el build de `.next/` — para servidores Node.js propios (VPS, contenedores Docker).',
      '`next export` (estático) genera un directorio `out/` con HTML puro — para S3, GitHub Pages, Netlify con solo HTML.',
      '⚠️ El export estático no soporta Server Actions, ISR ni rutas dinámicas — solo funciona si toda la app es estática.',
      'Para Docker, el build multi-stage con `output: "standalone"` genera una imagen mínima (~100MB) sin `node_modules` completos.',
    ],
    code: `# ─── Vercel (recomendado) ────────────────────────────────────
# 1. Conecta el repo en vercel.com
# 2. Configura las variables de entorno
# 3. Cada push a main hace un deploy automático

# ─── Node.js propio ───────────────────────────────────────────
$ next build        # genera .next/
$ next start -p 3000  # sirve desde .next/ en puerto 3000

# Para servir en producción con PM2:
$ pm2 start npm --name "inspections" -- start
$ pm2 save && pm2 startup

# ─── Docker (recomendado para contenedores) ───────────────────
# next.config.ts — genera un build standalone
export default {
  output: 'standalone',  // incluye solo los archivos necesarios
};

# Dockerfile multi-stage
FROM node:20-alpine AS base

# Instalar dependencias
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner — imagen mínima
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]   # generado por output: 'standalone'

# ─── Checklist antes del primer deploy ───────────────────────
# ✅ Variables de entorno configuradas en la plataforma
# ✅ DATABASE_URL apunta a base de datos de producción
# ✅ next build sin errores ni warnings críticos
# ✅ HTTPS habilitado (Vercel lo hace automáticamente)
# ✅ Dominio personalizado configurado
# ✅ Error monitoring (Sentry, Datadog) integrado`,
    tip: 'Si es tu primer proyecto en producción, usa Vercel. Si tu empresa ya tiene infraestructura Docker, usa `output: "standalone"`. Evita el export estático a menos que la app sea 100% estática.',
  },
  {
    id: 'performance-checklist',
    number: 8,
    title: 'Checklist de Rendimiento',
    icon: '✅',
    color: 'green',
    summary: 'Lo que debes revisar antes de considerar una app Next.js lista para producción',
    details: [
      '**Lighthouse / Core Web Vitals**: LCP < 2.5s, FID/INP < 100ms, CLS < 0.1. Revisa en producción, no en desarrollo.',
      '**Bundle size**: First Load JS < 100KB por ruta. Usa `@next/bundle-analyzer` para identificar librerías pesadas.',
      '**Imágenes**: Todas las imágenes con `<Image>` de Next.js. `priority` en la imagen above-the-fold (LCP).',
      '**Fuentes**: Usa `next/font` — elimina el round-trip a Google Fonts y el layout shift.',
      '**Rutas estáticas**: La mayoría de rutas deben ser `○` en el output de build. Minimiza las rutas `ƒ`.',
    ],
    code: `// ─── Checklist condensado ────────────────────────────────────

// ✅ 1. Imágenes optimizadas
import Image from 'next/image';
<Image
  src="/hero.jpg"
  alt="Hero de la aplicación"
  width={1200}
  height={600}
  priority          // ← para la imagen LCP (above the fold)
  sizes="100vw"     // ← ayuda al navegador a elegir el tamaño correcto
/>

// ✅ 2. Fuentes sin layout shift
import { Inter, Roboto_Mono } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], display: 'swap' });
export default function RootLayout({ children }) {
  return <html className={inter.className}>{children}</html>;
}

// ✅ 3. Metadata para SEO
export const metadata = {
  title: { template: '%s | Inspections Playground', default: 'Inspections Playground' },
  description: 'Sistema de gestión de inspecciones de vehículos',
  openGraph: { images: ['/og-image.jpg'] },
};

// ✅ 4. Streaming para páginas lentas
export default function DashboardPage() {
  return (
    <>
      <StaticHeader />
      <Suspense fallback={<Skeleton />}>
        <SlowDataComponent />     {/* Server Component async */}
      </Suspense>
    </>
  );
}

// ✅ 5. Error boundaries
// app/error.tsx — captura errores en producción sin romper la app
'use client';
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={reset}>Reintentar</button>
    </div>
  );
}

// ✅ 6. not-found.tsx — página 404 personalizada
// app/not-found.tsx
export default function NotFound() {
  return <div><h2>404 — Página no encontrada</h2><Link href="/">Inicio</Link></div>;
}`,
    tip: 'Mide con Lighthouse en producción (no en localhost). El modo desarrollo de Next.js deshabilita optimizaciones y daría resultados engañosos.',
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

export default function ProductionBuildPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400 text-sm font-mono mb-3 tracking-widest uppercase">
            Next.js · Performance · Deployment
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Build de Producción &{' '}
            <span className="text-slate-400">Entendiendo Next.js</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Cómo funciona next build, estático vs dinámico, ISR, capas de caché,
            variables de entorno y un checklist completo de producción.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
              <strong>○ Estático</strong> — HTML desde CDN, instantáneo
            </span>
            <span className="flex items-center gap-2 bg-green-900/50 border border-green-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              <strong>● ISR</strong> — estático + revalidación automática
            </span>
            <span className="flex items-center gap-2 bg-blue-900/50 border border-blue-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              <strong>ƒ Dinámico</strong> — función serverless por petición
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="https://nextjs.org/docs/app/building-your-application/deploying"
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
              <div className="p-6 pb-0">
                <div className="flex items-start gap-4">
                  <span
                    className={`${colors.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mt-1`}
                  >
                    {String(section.number).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                    <p className="text-gray-500 text-sm mt-0.5">{section.summary}</p>
                  </div>
                </div>

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
          Explora los demás conceptos de Next.js y React en este proyecto.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/nextjs-concepts"
            className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Next.js Concepts →
          </Link>
          <Link
            href="/server-actions"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Server Actions →
          </Link>
          <Link
            href="https://nextjs.org/docs/app/building-your-application/deploying"
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
