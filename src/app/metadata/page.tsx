import Link from 'next/link';

const sections = [
  {
    id: 'what-is-metadata',
    number: 1,
    title: '¿Qué es Metadata y por qué importa?',
    icon: '🏷️',
    color: 'blue',
    summary: 'Metadata controla cómo los buscadores y redes sociales ven e indexan tu app',
    details: [
      'La **metadata** incluye el `<title>`, `<meta description>`, Open Graph (OG), Twitter Cards, robots, canónicos y más.',
      'Next.js App Router gestiona la metadata con la API `Metadata` — sin necesidad de librerías como `react-helmet`.',
      'Una buena metadata afecta directamente el **CTR en buscadores**, las vistas previas en redes sociales y el posicionamiento SEO.',
      'Next.js **fusiona automáticamente** la metadata de los segmentos padre e hijo — defines lo compartido en el layout y lo específico en la página.',
      'La metadata se genera en el **servidor** — los crawlers de buscadores la ven aunque no ejecuten JavaScript.',
    ],
    code: `// La metadata se declara exportando el objeto 'metadata' o la función 'generateMetadata'
// desde cualquier page.tsx o layout.tsx

// ─── Metadata generada en el servidor (en el <head> del HTML) ─
// app/page.tsx → <title>Inspections Playground</title>
// app/page.tsx → <meta name="description" content="..." />
// app/page.tsx → <meta property="og:title" content="..." />

// Cuando hay múltiples layouts y páginas, Next.js los combina:
// app/layout.tsx          → metadata base (título, charset, viewport)
// app/dashboard/page.tsx  → sobreescribe title, description
// app/blog/[slug]/page.tsx → título dinámico por artículo

// ─── Output HTML resultante ───────────────────────────────────
// <head>
//   <title>Dashboard | Inspections Playground</title>
//   <meta name="description" content="Visualiza tus inspecciones" />
//   <meta property="og:title" content="Dashboard | Inspections Playground" />
//   <meta property="og:image" content="https://example.com/og/dashboard.png" />
//   <meta name="twitter:card" content="summary_large_image" />
//   <link rel="canonical" href="https://example.com/dashboard" />
// </head>

// ─── Viewport y robots (siempre en el layout raíz) ───────────
// Next.js añade automáticamente:
// <meta name="viewport" content="width=device-width, initial-scale=1" />
// No necesitas declararlo manualmente.`,
    tip: 'La metadata de layout.tsx se hereda en todas las páginas hijas — pon los valores por defecto ahí y sobreescríbelos en páginas específicas.',
  },
  {
    id: 'static-metadata',
    number: 2,
    title: 'Metadata Estática',
    icon: '📄',
    color: 'green',
    summary: 'Exporta el objeto metadata con valores fijos — ideal para páginas cuyo título no cambia',
    details: [
      'Exporta `export const metadata: Metadata` desde cualquier `page.tsx` o `layout.tsx` para metadata estática.',
      'El tipo `Metadata` de `"next"` provee autocompletado y validación TypeScript para todos los campos soportados.',
      'El campo `title` puede ser un string o un objeto con `template` y `default` — el template aplica a todas las páginas hijas.',
      '`openGraph` define cómo se ve el enlace cuando se comparte en LinkedIn, Facebook, Slack, etc.',
      '`twitter` define las Twitter Cards — el tipo `"summary_large_image"` muestra una imagen grande en el tweet.',
    ],
    code: `// app/layout.tsx — metadata base para toda la app
import type { Metadata } from 'next';

export const metadata: Metadata = {
  // Título con template: %s se reemplaza por el título de la página hija
  title: {
    template: '%s | Inspections Playground',
    default:  'Inspections Playground',   // cuando no hay título de página
  },

  description: 'Sistema moderno de gestión de inspecciones de vehículos',

  // Open Graph — para compartir en redes sociales
  openGraph: {
    type:        'website',
    siteName:    'Inspections Playground',
    title:       'Inspections Playground',
    description: 'Sistema moderno de gestión de inspecciones de vehículos',
    images: [
      {
        url:    '/og-default.png',   // 1200×630px recomendado
        width:  1200,
        height: 630,
        alt:    'Inspections Playground',
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card:        'summary_large_image',
    title:       'Inspections Playground',
    description: 'Sistema moderno de gestión de inspecciones',
    images:      ['/og-default.png'],
  },

  // Robots — controla indexación
  robots: {
    index:  true,
    follow: true,
  },
};

// ─────────────────────────────────────────────────────────────

// app/dashboard/page.tsx — sobreescribe solo title y description
export const metadata: Metadata = {
  title:       'Dashboard',   // → "Dashboard | Inspections Playground" (template del layout)
  description: 'Visualiza todas tus inspecciones con estadísticas en tiempo real.',
};

// app/login/page.tsx
export const metadata: Metadata = {
  title:  'Iniciar Sesión',
  robots: { index: false, follow: false },  // no indexar la página de login
};`,
    tip: 'Usa el `title.template` en el layout raíz para que todas las páginas tengan el nombre de la app como sufijo automáticamente.',
  },
  {
    id: 'dynamic-metadata',
    number: 3,
    title: 'Metadata Dinámica con generateMetadata',
    icon: '⚡',
    color: 'violet',
    summary: 'Genera metadata en el servidor con datos reales — para páginas con rutas dinámicas',
    details: [
      '`generateMetadata` es una función `async` que reemplaza al objeto `metadata` cuando necesitas datos dinámicos.',
      'Recibe los mismos `params` y `searchParams` que el componente de página — puedes hacer fetch dentro de ella.',
      'Next.js **deduplicará** el fetch de `generateMetadata` con el mismo fetch del componente de página — sin doble petición.',
      'Debe retornar un objeto del tipo `Metadata` — puede incluir todos los mismos campos que `metadata` estático.',
      'Se ejecuta en el servidor antes de renderizar la página — los crawlers ven la metadata correcta.',
    ],
    code: `// app/inspections/[id]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

// ─── generateMetadata — corre en el servidor, antes del componente ─
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata   // metadata del layout padre (para extender)
): Promise<Metadata> {
  const { id } = await params;

  // Este fetch se DEDUPLICA con el mismo fetch en el componente de página
  const inspection = await fetch(\`https://api.example.com/inspections/\${id}\`, {
    next: { tags: [\`inspection-\${id}\`] },
  }).then((r) => r.json());

  if (!inspection) return { title: 'Inspección no encontrada' };

  // Extender la imagen OG del padre si no hay una específica
  const parentImages = (await parent).openGraph?.images ?? [];

  return {
    title:       \`Inspección #\${inspection.vehicleId}\`,
    description: \`Detalles de la inspección del vehículo \${inspection.vehicleId} — \${inspection.status}\`,
    openGraph: {
      title:  \`Inspección #\${inspection.vehicleId}\`,
      images: [
        \`/api/og?vehicleId=\${inspection.vehicleId}&status=\${inspection.status}\`,
        ...parentImages,   // ← incluye la imagen OG del layout padre
      ],
    },
    // URL canónica — evita contenido duplicado en SEO
    alternates: {
      canonical: \`https://example.com/inspections/\${id}\`,
    },
  };
}

// ─── El componente de página usa el mismo fetch (deduplicado) ─
export default async function InspectionDetailPage({ params }: Props) {
  const { id } = await params;

  // Same URL → React deduplicates — solo una petición HTTP real
  const inspection = await fetch(\`https://api.example.com/inspections/\${id}\`).then(r => r.json());
  if (!inspection) notFound();

  return <InspectionDetail inspection={inspection} />;
}`,
    tip: 'El fetch dentro de `generateMetadata` y el del componente de página son deduplicados automáticamente — escríbelos sin preocuparte por el rendimiento.',
  },
  {
    id: 'og-images',
    number: 4,
    title: 'Imágenes Open Graph Dinámicas',
    icon: '🖼️',
    color: 'amber',
    summary: 'Genera imágenes OG con texto dinámico usando next/og — sin Photoshop ni assets manuales',
    details: [
      '`ImageResponse` de `next/og` genera imágenes PNG dinámicas en el servidor usando JSX — ideal para tarjetas de compartir.',
      'Se crea como un **Route Handler** en `app/api/og/route.tsx` que retorna la imagen con el tipo correcto.',
      'Soporta texto, colores, gradientes, bordes redondeados y fuentes personalizadas — con JSX limpio.',
      'Las imágenes generadas se **cachean automáticamente** en el CDN de Vercel — no se regeneran en cada petición.',
      'El tamaño estándar es **1200×630px** — el recomendado para Open Graph por Twitter, LinkedIn y Facebook.',
    ],
    code: `// app/api/og/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';  // Edge Runtime para máxima velocidad

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const vehicleId = searchParams.get('vehicleId') ?? 'ABC-123';
  const status    = searchParams.get('status')    ?? 'pending';

  const statusColor = {
    passed:  '#16a34a',  // verde
    failed:  '#dc2626',  // rojo
    pending: '#d97706',  // ámbar
  }[status] ?? '#6b7280';

  return new ImageResponse(
    (
      // JSX — se renderiza como imagen PNG de 1200×630
      <div
        style={{
          width:           '100%',
          height:          '100%',
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'flex-start',
          justifyContent:  'flex-end',
          background:      'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
          padding:         '60px',
          fontFamily:      'sans-serif',
        }}
      >
        <div style={{ fontSize: 20, color: '#94a3b8', marginBottom: 12 }}>
          Inspections Playground
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>
          Inspección
        </div>
        <div style={{ fontSize: 48, fontWeight: 600, color: '#60a5fa', marginTop: 8 }}>
          #{vehicleId}
        </div>
        <div
          style={{
            marginTop:    24,
            padding:      '8px 24px',
            borderRadius: 9999,
            background:   statusColor,
            color:        'white',
            fontSize:     24,
            fontWeight:   600,
          }}
        >
          {status === 'passed' ? 'Aprobado' : status === 'failed' ? 'Fallido' : 'Pendiente'}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

// ─── Uso en generateMetadata ──────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const inspection = await getInspection(id);

  return {
    openGraph: {
      images: [
        \`/api/og?vehicleId=\${inspection.vehicleId}&status=\${inspection.status}\`
      ],
    },
  };
}`,
    tip: 'Previsualiza tu imagen OG en https://opengraph.xyz o https://cards-dev.twitter.com/validator antes de lanzar. Una imagen rota no se muestra en redes sociales.',
  },
  {
    id: 'sitemap-robots',
    number: 5,
    title: 'Sitemap y robots.txt',
    icon: '🗺️',
    color: 'teal',
    summary: 'Genera sitemap.xml y robots.txt dinámicamente para mejorar el rastreo de buscadores',
    details: [
      'Next.js genera `sitemap.xml` y `robots.txt` automáticamente desde archivos especiales en `app/`.',
      '`app/sitemap.ts` puede ser un objeto estático o una función async que retorna las URLs con fechas y frecuencias.',
      '`app/robots.ts` controla qué rutas pueden rastrear los bots — siempre bloquea APIs internas y áreas privadas.',
      'Para sitemaps grandes (> 50k URLs), usa `generateSitemaps()` para generar múltiples archivos divididos.',
      'El sitemap se regenera en cada `next build` para sitios estáticos, o en cada petición para sitios dinámicos.',
    ],
    code: `// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas estáticas (siempre presentes)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url:              'https://example.com',
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         1.0,
    },
    {
      url:              'https://example.com/about',
      lastModified:     new Date(),
      changeFrequency:  'yearly',
      priority:         0.5,
    },
  ];

  // Rutas dinámicas — genera una entrada por inspección pública
  const inspections = await db.inspections.findAll({ where: { isPublic: true } });
  const dynamicRoutes: MetadataRoute.Sitemap = inspections.map((i) => ({
    url:             \`https://example.com/inspections/\${i.id}\`,
    lastModified:    i.updatedAt,
    changeFrequency: 'weekly' as const,
    priority:        0.8,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}

// ─────────────────────────────────────────────────────────────

// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  [
          '/api/',          // no indexar endpoints de API
          '/dashboard/',    // no indexar área autenticada
          '/admin/',        // no indexar área de administración
        ],
      },
      {
        userAgent: 'Googlebot',
        allow:     '/',     // Google puede rastrear todo lo público
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  };
}

// ─── Output generado ──────────────────────────────────────────
// GET /sitemap.xml → XML con todas las URLs
// GET /robots.txt  →
// User-agent: *
// Allow: /
// Disallow: /api/
// Sitemap: https://example.com/sitemap.xml`,
    tip: 'Siempre verifica tu sitemap en Google Search Console después del primer deploy. Un sitemap incorrecto puede hacer que Google no indexe tus páginas.',
  },
  {
    id: 'metadata-templates',
    number: 6,
    title: 'Templates de Título y Fusión',
    icon: '🔗',
    color: 'indigo',
    summary: 'Cómo Next.js combina la metadata de layouts y páginas — y cómo controlarlo',
    details: [
      'Next.js **fusiona** la metadata de los segmentos más cercanos hacia arriba — la página sobreescribe al layout cuando hay conflicto.',
      'El `title.template` define el patrón del título — `%s` se reemplaza por el `title` de la página hija.',
      '`title.absolute` sobreescribe el template completamente — para páginas donde no quieres el sufijo.',
      'Los arrays de metadata (como `openGraph.images`) se **reemplazan**, no se concatenan — usa `(await parent).openGraph?.images` para extender.',
      'Puedes inspeccionar la metadata generada con `curl -s https://tu-app.com/pagina | grep "<title>"` en producción.',
    ],
    code: `// ─── Cómo funciona la fusión ─────────────────────────────────

// app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | Mi App',    // %s = título de la página hija
    default:  'Mi App',         // cuando no hay título de página
  },
  description: 'Descripción por defecto',
  openGraph: { images: ['/og-default.png'] },
};

// app/dashboard/page.tsx
export const metadata: Metadata = {
  title: 'Dashboard',           // → "Dashboard | Mi App" (usa el template del layout)
  description: 'Mi dashboard',  // sobreescribe la descripción del layout
  // openGraph no declarado → hereda el del layout (/og-default.png)
};

// app/landing/page.tsx
export const metadata: Metadata = {
  title: {
    absolute: 'La Mejor Landing del Mundo',  // ← ignora el template del layout
  },
  // → <title>La Mejor Landing del Mundo</title>
};

// ─────────────────────────────────────────────────────────────

// ─── Extender imágenes del padre ────────────────────────────
// app/blog/[slug]/page.tsx
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPost(params.slug);
  const parentImages = (await parent).openGraph?.images ?? [];

  return {
    title: post.title,   // → "Título del Post | Mi App"
    openGraph: {
      images: [
        post.coverImage,   // imagen específica del post
        ...parentImages,   // ← incluye /og-default.png del layout
      ],
    },
  };
}

// ─── Campos que se fusionan vs reemplazan ────────────────────
// Fusión (hereda del padre si no se declara):
//   title.template, robots, viewport, themeColor
// Reemplazo (el hijo sobreescribe completamente):
//   description, openGraph.images, twitter.images`,
    tip: 'Si el título de tu página muestra "undefined | Mi App", significa que alguna página hija no declaró `title`. Añade `title.default` en el layout raíz para evitarlo.',
  },
  {
    id: 'icons-manifest',
    number: 7,
    title: 'Iconos, Favicon y Web App Manifest',
    icon: '🎨',
    color: 'orange',
    summary: 'Configura favicon, iconos para móviles y el manifest de PWA desde Next.js',
    details: [
      'Coloca `favicon.ico` en `app/` y Next.js lo sirve automáticamente en `/favicon.ico`.',
      'Para iconos de Apple y Android, coloca `apple-icon.png` y `icon.png` en `app/` — Next.js añade los `<link>` automáticamente.',
      'También puedes generar iconos dinámicamente exportando `generateImageMetadata` desde `app/icon.tsx`.',
      '`app/manifest.ts` genera el `manifest.json` para PWA — define nombre, colores, iconos e icono de pantalla de inicio.',
      'Con `app/opengraph-image.tsx` puedes crear una imagen OG estática con JSX — sin Route Handler.',
    ],
    code: `// ─── Estructura de archivos para iconos automáticos ──────────
// app/
//   favicon.ico          → /favicon.ico (32×32 o SVG)
//   icon.png             → <link rel="icon"> (generalmente 32×32)
//   icon.svg             → <link rel="icon" type="image/svg+xml">
//   apple-icon.png       → <link rel="apple-touch-icon"> (180×180)
//   opengraph-image.png  → imagen OG estática (1200×630)

// ─────────────────────────────────────────────────────────────

// app/manifest.ts — genera /manifest.json para PWA
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Inspections Playground',
    short_name:       'Inspections',
    description:      'Sistema de gestión de inspecciones de vehículos',
    start_url:        '/',
    display:          'standalone',   // oculta la barra del navegador en móvil
    background_color: '#ffffff',
    theme_color:      '#2563eb',      // color de la barra de estado en móvil
    icons: [
      {
        src:     '/icon-192.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'maskable',
      },
      {
        src:   '/icon-512.png',
        sizes: '512x512',
        type:  'image/png',
      },
    ],
  };
}

// ─── Icono dinámico con ImageResponse ─────────────────────────
// app/icon.tsx — genera el favicon dinámicamente
import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width:           '100%',
        height:          '100%',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        background:      '#2563eb',
        borderRadius:    '50%',
        color:           'white',
        fontSize:        20,
        fontWeight:      700,
      }}
    >
      I
    </div>,
    { ...size }
  );
}`,
    tip: 'Para una PWA completa necesitas `manifest.ts`, un icono de 512×512 con `purpose: "maskable"` y el `theme_color` en la metadata. Verifica con Chrome DevTools → Application → Manifest.',
  },
  {
    id: 'seo-checklist',
    number: 8,
    title: 'Checklist de SEO y Metadata',
    icon: '✅',
    color: 'slate',
    summary: 'Lo que debe tener toda app Next.js antes de lanzarse a producción',
    details: [
      '**Title único por página**: Descriptivo, < 60 caracteres, con el nombre de la marca al final (usa `title.template`).',
      '**Meta description**: Única, 120–160 caracteres, incluye la palabra clave principal y un call-to-action implícito.',
      '**Open Graph completo**: `og:title`, `og:description`, `og:image` (1200×630) y `og:url` en cada página pública.',
      '**URL canónica**: Evita contenido duplicado con `alternates.canonical` en rutas con parámetros de query.',
      '**robots.txt**: Bloquea `/api/*`, `/admin/*`, rutas de auth. Incluye la URL del sitemap.',
    ],
    code: `// app/layout.tsx — configuración base completa de producción
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

export const metadata: Metadata = {
  // ✅ Título con template
  title: {
    template: '%s | Inspections Playground',
    default:  'Inspections Playground',
  },

  // ✅ Descripción por defecto
  description: 'Sistema moderno de gestión de inspecciones de vehículos con Next.js.',

  // ✅ Open Graph base
  openGraph: {
    type:        'website',
    siteName:    'Inspections Playground',
    url:         siteUrl,
    images: [{
      url:    \`\${siteUrl}/og-default.png\`,
      width:  1200,
      height: 630,
      alt:    'Inspections Playground',
    }],
  },

  // ✅ Twitter Cards
  twitter: {
    card:    'summary_large_image',
    creator: '@tuTwitter',
  },

  // ✅ Robots
  robots: { index: true, follow: true },

  // ✅ Canonical base (las páginas individuales lo sobreescriben)
  alternates: { canonical: siteUrl },

  // ✅ Metadata técnica
  metadataBase: new URL(siteUrl),   // ← necesario para URLs relativas en OG
};

// ─── Checklist de validación ──────────────────────────────────
// □ next build sin errores de metadata
// □ <title> correcto en cada página pública (inspecionar HTML)
// □ og:image visible en https://opengraph.xyz
// □ sitemap.xml accesible y válido
// □ robots.txt correcto (no bloquea páginas que deben indexarse)
// □ Google Search Console: sitemap enviado
// □ Lighthouse SEO score > 90`,
    tip: 'Añade `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL)` en el layout raíz. Sin esto, las URLs relativas en OG y Twitter Cards no funcionan correctamente.',
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

export default function MetadataPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 text-sm font-mono mb-3 tracking-widest uppercase">
            Next.js · SEO · Open Graph · Metadata API
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Metadata{' '}
            <span className="text-indigo-400">Estática y Dinámica</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Cómo configurar títulos, descripciones, Open Graph, Twitter Cards, imágenes OG
            dinámicas, sitemap y robots.txt con la Metadata API de Next.js.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2 bg-indigo-900/50 border border-indigo-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
              <strong>metadata</strong> — objeto estático exportado
            </span>
            <span className="flex items-center gap-2 bg-violet-900/50 border border-violet-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
              <strong>generateMetadata</strong> — función async con datos reales
            </span>
            <span className="flex items-center gap-2 bg-amber-900/50 border border-amber-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              <strong>ImageResponse</strong> — imágenes OG dinámicas con JSX
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="https://nextjs.org/docs/app/building-your-application/optimizing/metadata"
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
          Combina metadata con revalidación de caché para una app de producción completa.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/cache-revalidation"
            className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Revalidación de Caché →
          </Link>
          <Link
            href="/production-build"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Build de Producción →
          </Link>
          <Link
            href="https://nextjs.org/docs/app/building-your-application/optimizing/metadata"
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
