import Link from 'next/link';

const sections = [
  {
    id: 'cache-overview',
    number: 1,
    title: '¿Por qué existe el caché?',
    icon: '🗄️',
    color: 'blue',
    summary: 'Next.js cachea agresivamente para que las rutas estáticas sean instantáneas — la revalidación te devuelve el control',
    details: [
      'Next.js tiene **4 capas de caché independientes**: Request Memoization, Data Cache, Full Route Cache y Router Cache (cliente).',
      'El Data Cache y el Full Route Cache persisten entre deploys — los datos cacheados en build siguen sirviendo hasta que los invalidas.',
      'Sin revalidación, los datos solo se actualizan en el próximo `next build`. Con revalidación, puedes actualizarlos sin redesplegar.',
      'La revalidación puede ser **basada en tiempo** (ISR — cada N segundos) o **bajo demanda** (al mutar datos).',
      'Entender qué capa cachea qué dato es clave para depurar datos desactualizados en producción.',
    ],
    code: `// Las 4 capas de caché de Next.js:
//
// ┌─────────────────────────────────────────────────────────────┐
// │ 1. Request Memoization                                      │
// │    Scope: un solo render tree                               │
// │    Qué: deduplicación de fetch() idénticos en el mismo req  │
// │    Control: automático — no necesitas hacer nada            │
// ├─────────────────────────────────────────────────────────────┤
// │ 2. Data Cache                                               │
// │    Scope: entre peticiones y deploys (persistente)          │
// │    Qué: resultados de fetch() con cache: 'force-cache'      │
// │    Control: revalidate, revalidateTag, revalidatePath       │
// ├─────────────────────────────────────────────────────────────┤
// │ 3. Full Route Cache                                         │
// │    Scope: entre peticiones y deploys (persistente)          │
// │    Qué: HTML y RSC payload de rutas estáticas               │
// │    Control: revalidatePath, dynamic = 'force-dynamic'       │
// ├─────────────────────────────────────────────────────────────┤
// │ 4. Router Cache (cliente)                                   │
// │    Scope: sesión del navegador                              │
// │    Qué: segmentos de ruta visitados                         │
// │    Control: router.refresh(), expiración automática         │
// └─────────────────────────────────────────────────────────────┘

// En Next.js 15+: fetch() es NO cacheado por defecto
const data = await fetch('/api/data');                              // no-store
const data = await fetch('/api/data', { cache: 'force-cache' });   // cachear
const data = await fetch('/api/data', { next: { revalidate: 60 }}); // ISR`,
    tip: 'Cuando veas datos desactualizados en producción, primero identifica qué capa está cacheando. La mayoría son Data Cache (fetch) o Full Route Cache (HTML).',
  },
  {
    id: 'time-based',
    number: 2,
    title: 'Revalidación Basada en Tiempo (ISR)',
    icon: '⏱️',
    color: 'green',
    summary: 'Los datos se refrescan automáticamente cada N segundos — sin intervención manual',
    details: [
      '**ISR (Incremental Static Regeneration)** regenera la página en background cuando su caché expira, sin bloquear al usuario.',
      'El primer usuario después de la expiración recibe la versión anterior; el siguiente recibe la regenerada.',
      'Se configura con `revalidate` en el `fetch()`, o con la exportación `export const revalidate` a nivel de segmento.',
      'La exportación de segmento `revalidate` aplica a todos los fetches de esa ruta que no tengan su propio `revalidate`.',
      'Si un fetch tiene `revalidate: 10` y el segmento tiene `revalidate: 60`, gana el **más corto** (10).',
    ],
    code: `// ─── Opción A: revalidate en el fetch() ─────────────────────
// Solo este fetch se revalida cada 60 segundos
async function getInspections() {
  const res = await fetch('https://api.example.com/inspections', {
    next: { revalidate: 60 },   // segundos
  });
  if (!res.ok) throw new Error('Error al obtener inspecciones');
  return res.json();
}

// ─── Opción B: revalidate a nivel de segmento ────────────────
// app/inspections/page.tsx
export const revalidate = 60;   // ← exportación especial de Next.js

export default async function InspectionsPage() {
  // Todos los fetches sin revalidate propio usan el del segmento
  const inspections = await getInspections();
  const stats       = await getStats();        // también revalida cada 60s
  return <InspectionDashboard data={inspections} stats={stats} />;
}

// ─── Valores recomendados según el tipo de datos ─────────────
export const revalidate = 0;      // sin caché — equivale a force-dynamic
export const revalidate = 30;     // datos casi en tiempo real (ej: stock, precios)
export const revalidate = 300;    // datos de producto (5 minutos)
export const revalidate = 3600;   // datos editoriales (1 hora)
export const revalidate = false;  // cachear indefinidamente (hasta revalidación manual)

// ─── Comportamiento con fetch() de terceros (sin control) ────
// Si usas un ORM/DB directamente (sin fetch), usa el segmento:
// app/dashboard/page.tsx
export const revalidate = 60;

export default async function Dashboard() {
  const rows = await db.inspections.findAll();  // sin fetch — usa el revalidate del segmento
  return <Table rows={rows} />;
}`,
    tip: 'Usa `export const revalidate` a nivel de segmento cuando tu ruta usa un ORM o cliente de BD (no fetch). Es la única forma de aplicar ISR sin fetch.',
  },
  {
    id: 'revalidatepath',
    number: 3,
    title: 'revalidatePath — Invalidar una Ruta',
    icon: '🔄',
    color: 'violet',
    summary: 'Invalida el Full Route Cache y el Data Cache de una ruta específica inmediatamente',
    details: [
      '`revalidatePath(path)` invalida el **Full Route Cache** (HTML) y el **Data Cache** de todos los fetches de esa ruta.',
      'Se llama dentro de Server Actions, Route Handlers o el servidor — no en Client Components.',
      'El segundo argumento opcional puede ser `"layout"` o `"page"`: `"layout"` invalida la ruta y todas sus sub-rutas.',
      'La revalidación ocurre en la **próxima petición** a esa ruta — no inmediatamente al llamar la función.',
      'Llama `revalidatePath` justo antes del `redirect()` o del `return` en la Server Action para garantizar datos frescos.',
    ],
    code: `// app/inspections/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

// ─── Revalidar una ruta exacta ────────────────────────────────
export async function createInspection(formData: FormData) {
  await db.inspections.create({
    vehicleId: formData.get('vehicleId') as string,
  });

  revalidatePath('/inspections');       // invalida /inspections
  redirect('/inspections');
}

// ─── Revalidar con layout (invalida rutas hijas también) ────
export async function deleteInspection(id: string) {
  await db.inspections.delete(id);

  // 'layout' invalida /inspections y TODAS las rutas bajo /inspections/*
  revalidatePath('/inspections', 'layout');
  // Equivale a invalidar:
  //   /inspections
  //   /inspections/[id]
  //   /inspections/[id]/edit
  //   /inspections/stats  (si existe)

  redirect('/inspections');
}

// ─── Revalidar múltiples rutas ────────────────────────────────
export async function updateInspection(id: string, data: Partial<Inspection>) {
  await db.inspections.update(id, data);

  revalidatePath('/inspections');           // lista de inspecciones
  revalidatePath(\`/inspections/\${id}\`);     // detalle de esta inspección
  revalidatePath('/dashboard');             // dashboard con estadísticas
  // No hace redirect — retorna al cliente con datos frescos
}

// ─── En un Route Handler (webhook de CMS) ────────────────────
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { path } = await request.json();
  revalidatePath(path);
  return Response.json({ revalidated: true });
}`,
    tip: 'Cuando mutes datos que se muestran en múltiples rutas (ej: un dashboard + una lista), llama `revalidatePath` para cada ruta afectada.',
  },
  {
    id: 'revalidatetag',
    number: 4,
    title: 'revalidateTag — Invalidar por Etiqueta',
    icon: '🏷️',
    color: 'cyan',
    summary: 'Agrupa fetches con una etiqueta y los invalida todos a la vez con un solo llamado',
    details: [
      '`revalidateTag(tag)` invalida todos los fetches cacheados que tengan esa etiqueta, independientemente de en qué ruta estén.',
      'Es más granular que `revalidatePath` — puedes invalidar solo los datos de inspecciones sin tocar los datos de usuarios.',
      'Las etiquetas se asignan con `{ next: { tags: [\'nombre\'] } }` en el objeto de opciones del `fetch()`.',
      'Un fetch puede tener **múltiples etiquetas** — se invalida si cualquiera de sus etiquetas es revalidada.',
      'Ideal para arquitecturas donde el mismo dato se consume en múltiples páginas diferentes.',
    ],
    code: `// ─── Paso 1: Etiquetar los fetches ───────────────────────────
// lib/api.ts (o directamente en los Server Components)

async function getInspections() {
  const res = await fetch('https://api.example.com/inspections', {
    next: {
      tags: ['inspections'],      // etiqueta para revalidación selectiva
      revalidate: false,          // cachear indefinidamente hasta revalidación manual
    },
  });
  return res.json();
}

async function getInspectionById(id: string) {
  const res = await fetch(\`https://api.example.com/inspections/\${id}\`, {
    next: {
      tags: ['inspections', \`inspection-\${id}\`],  // múltiples etiquetas
    },
  });
  return res.json();
}

async function getDashboardStats() {
  const res = await fetch('https://api.example.com/stats', {
    next: { tags: ['inspections', 'stats'] },  // depende de inspections también
  });
  return res.json();
}

// ─── Paso 2: Revalidar por etiqueta en la Server Action ───────
// app/inspections/actions.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function createInspection(formData: FormData) {
  await db.inspections.create({ vehicleId: formData.get('vehicleId') as string });

  // Invalida TODOS los fetches con la etiqueta 'inspections':
  // → getInspections()         (lista en /inspections)
  // → getDashboardStats()      (estadísticas en /dashboard)
  // → cualquier otro fetch con esa etiqueta en cualquier ruta
  revalidateTag('inspections');
}

export async function deleteInspection(id: string) {
  await db.inspections.delete(id);

  revalidateTag(\`inspection-\${id}\`);  // solo invalida el detalle de este ID
  revalidateTag('inspections');          // también la lista y el dashboard
}

// ─── revalidatePath vs revalidateTag ─────────────────────────
// revalidatePath → invalida UNA ruta (y su HTML)
// revalidateTag  → invalida TODOS los fetches con ese tag (puede ser muchas rutas)
//
// Úsalos juntos cuando quieras tanto invalidar el HTML como los datos:
revalidateTag('inspections');       // invalida los datos
revalidatePath('/inspections');     // invalida el HTML de la ruta`,
    tip: 'Diseña tu estrategia de tags antes de escribir los fetches. Una buena taxonomía (inspections, users, stats) hace que la revalidación sea predecible.',
  },
  {
    id: 'on-demand-webhook',
    number: 5,
    title: 'Revalidación Bajo Demanda — Webhooks',
    icon: '🔔',
    color: 'amber',
    summary: 'Un CMS o sistema externo llama a tu API para invalidar el caché cuando cambia el contenido',
    details: [
      'La revalidación bajo demanda es ideal para **CMS headless** (Contentful, Sanity, Strapi) — invalida al guardar, no por polling.',
      'Expones un **Route Handler** que recibe el webhook del CMS y llama a `revalidateTag` o `revalidatePath`.',
      'Siempre protege el endpoint con un **secreto** — sin autenticación, cualquiera podría vaciar tu caché.',
      'El secreto se guarda en una variable de entorno y se incluye en la configuración del webhook del CMS.',
      'El Route Handler debe responder rápido (< 1s) — el CMS puede reintentar si no recibe respuesta.',
    ],
    code: `// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. Verificar el secreto — siempre primero
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json(
      { error: 'Token de revalidación inválido' },
      { status: 401 }
    );
  }

  // 2. Leer el payload del CMS
  let body: { type?: string; slug?: string; tag?: string; path?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 });
  }

  // 3. Revalidar según el tipo de contenido
  if (body.tag) {
    revalidateTag(body.tag);                      // invalidar por tag
  }
  if (body.path) {
    revalidatePath(body.path);                    // invalidar por ruta exacta
  }
  if (body.type === 'inspection' && body.slug) {
    revalidateTag('inspections');                 // todos los datos de inspecciones
    revalidatePath(\`/inspections/\${body.slug}\`);  // la ruta específica
  }

  return Response.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
  });
}

// ─── Variables de entorno necesarias ─────────────────────────
// .env.local
// REVALIDATE_SECRET=un_secreto_largo_y_aleatorio_aqui

// ─── Configuración en el CMS (ejemplo Contentful) ────────────
// URL del webhook: https://tu-app.vercel.app/api/revalidate
// Header: x-revalidate-secret: [valor de REVALIDATE_SECRET]
// Payload (cuando se publica una entrada):
// {
//   "type": "inspection",
//   "slug": "{{entry.fields.slug}}"
// }`,
    tip: 'Genera el secreto con `openssl rand -hex 32` — nunca uses strings predecibles. Rótalo si se filtra, igual que una contraseña.',
  },
  {
    id: 'router-refresh',
    number: 6,
    title: 'router.refresh() — Router Cache del Cliente',
    icon: '🌐',
    color: 'indigo',
    summary: 'Cuando los datos del servidor cambian, el Router Cache del cliente puede mostrar datos viejos',
    details: [
      'El **Router Cache** almacena los segmentos de ruta visitados en el navegador — permite navegación instantánea sin petición al servidor.',
      'Si una Server Action muta datos y hace `revalidatePath`, el servidor tiene datos frescos — pero el cliente puede seguir mostrando el caché.',
      'En Next.js 15, el Router Cache para rutas dinámicas expira en **0 segundos** por defecto (comportamiento mejorado vs v14).',
      '`router.refresh()` vacía el Router Cache y vuelve a cargar los datos desde el servidor — el equivalente cliente de `revalidatePath`.',
      'Se usa típicamente después de una mutación exitosa en un Client Component que no usa un form con Server Action.',
    ],
    code: `// ─── Cuándo usar router.refresh() ────────────────────────────
// Scenario: eliminas un item con un onClick y quieres que la lista se actualice

'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { deleteInspection } from './actions';

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    if (!confirm('¿Eliminar esta inspección?')) return;

    startTransition(async () => {
      await deleteInspection(id);
      // La Server Action llama a revalidatePath en el servidor.
      // router.refresh() sincroniza el Router Cache del cliente con los nuevos datos.
      router.refresh();
    });
  }

  return (
    <button onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Eliminando…' : 'Eliminar'}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// ¿Cuándo NO necesitas router.refresh()?
//
// ✅ Cuando usas <form action={serverAction}> — React recarga automáticamente
// ✅ Cuando la Server Action hace redirect() — la navegación invalida el caché
// ✅ Cuando usas useActionState — React sincroniza el estado del form
//
// ✅ Cuando SÍ necesitas router.refresh():
// → onClick handlers que llaman a Server Actions sin form
// → Después de una mutación exitosa donde el usuario se queda en la misma página

// ─── Expiración del Router Cache (Next.js 15) ────────────────
// next.config.ts — ajustar tiempos de expiración
export default {
  experimental: {
    staleTimes: {
      dynamic: 30,   // rutas dinámicas (ƒ): cachear 30 segundos en el cliente
      static: 180,   // rutas estáticas (○): cachear 3 minutos en el cliente
    },
  },
};`,
    tip: 'Si ves que un `useActionState` actualiza el estado del form pero los datos de la página no se refrescan, añade `router.refresh()` justo después de la acción exitosa.',
  },
  {
    id: 'unstable-nostore',
    number: 7,
    title: 'noStore() y unstable_cache',
    icon: '⚙️',
    color: 'red',
    summary: 'Herramientas avanzadas para controlar el caché en funciones que no usan fetch()',
    details: [
      '`unstable_cache` (stable en Next.js 15 como `cacheLife`/`cacheTag`) cachea el resultado de cualquier función async — no solo `fetch()`.',
      'Permite cachear llamadas a ORM, consultas de BD, o cualquier función costosa con la misma API de tags y revalidate.',
      '`connection()` (anteriormente `noStore()`) opta una ruta fuera del caché estático — hace la ruta dinámica.',
      '`cache()` de React memoiza una función para la duración de un render — útil para deduplicar llamadas al ORM en el mismo request.',
      'Para la mayoría de casos, `fetch()` con las opciones de caché es suficiente — `unstable_cache` es para casos avanzados.',
    ],
    code: `import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { connection } from 'next/server';

// ─── unstable_cache — cachear funciones no-fetch ─────────────
// Cachea el resultado de consultas de BD con la API de tags/revalidate
const getCachedInspections = unstable_cache(
  async (status?: string) => {
    // Consulta directa al ORM — sin fetch()
    return db.inspections.findAll({ where: { status } });
  },
  ['inspections'],               // cache key base
  {
    tags: ['inspections'],       // ← se invalida con revalidateTag('inspections')
    revalidate: 60,              // también se revalida cada 60 segundos
  }
);

// Uso igual que cualquier función async:
export default async function InspectionsPage() {
  const inspections = await getCachedInspections('pending');
  return <Table data={inspections} />;
}

// ─── cache() de React — memoización por request ──────────────
// La misma llamada al ORM desde distintos Server Components en el mismo render
// solo ejecuta la consulta UNA vez (como Request Memoization pero para no-fetch)
export const getUser = cache(async (id: string) => {
  return db.users.findById(id);
});

// En cualquier Server Component del mismo render tree:
const user = await getUser('abc');  // primera llamada → consulta a la BD
const user = await getUser('abc');  // segunda llamada → devuelve el resultado cacheado

// ─── connection() — optar por renderizado dinámico ───────────
import { connection } from 'next/server';

export default async function RealtimePage() {
  // Fuerza la ruta a ser dinámica (no cacheada)
  // Útil cuando tienes datos que deben ser siempre frescos
  await connection();

  const liveData = await getLiveData();
  return <LiveDashboard data={liveData} />;
}`,
    tip: 'Usa `unstable_cache` cuando tu app usa Prisma, Drizzle u otro ORM directamente (sin fetch). Te da el mismo control de tags y revalidación que `fetch()`.',
  },
  {
    id: 'debug-cache',
    number: 8,
    title: 'Depurando el Caché',
    icon: '🐛',
    color: 'teal',
    summary: 'Cómo identificar qué está cacheado, por qué y cómo forzar datos frescos durante el desarrollo',
    details: [
      'En desarrollo (`next dev`), el **Data Cache está deshabilitado** — siempre ves datos frescos. Los problemas de caché solo aparecen en producción.',
      'El output de `next build` muestra `○` (estático) o `ƒ` (dinámico) por ruta — si esperas `ƒ` pero ves `○`, algo te está hackeando al caché.',
      '`NEXT_PRIVATE_DEBUG_CACHE=1` imprime en consola qué fetches se leen del caché vs hacen petición real.',
      'Para probar el caché localmente: `next build && next start` (no `next dev`).',
      'Si sospechas del Router Cache del cliente, abre DevTools → Application → Cache Storage → busca `next-router-*`.',
    ],
    code: `# ─── Variables de debug útiles ───────────────────────────────
# Ver qué fetches usan el caché
NEXT_PRIVATE_DEBUG_CACHE=1 next build

# Probar el caché localmente (simula producción)
next build && next start

# ─── Forzar rutas como dinámicas ─────────────────────────────
// app/dashboard/page.tsx
// Si next build muestra ○ pero debería ser ƒ:

// Opción 1: Exportación de segmento
export const dynamic = 'force-dynamic';

// Opción 2: Usa una API dinámica
import { cookies } from 'next/headers';
const c = await cookies();  // ← hace la ruta dinámica automáticamente

// Opción 3: connection() explícito
import { connection } from 'next/server';
await connection();

// ─── Diagnóstico de caché desactualizado ─────────────────────
// Pregúntate:
// 1. ¿El fetch tiene cache: 'force-cache' o revalidate: false?
//    → Usa revalidateTag o revalidatePath después de mutar
//
// 2. ¿La ruta es estática (○) pero debería ser dinámica?
//    → Agrega dynamic = 'force-dynamic' o usa cookies()/headers()
//
// 3. ¿El HTML está desactualizado pero los datos del fetch sí se actualizan?
//    → El Full Route Cache está desactualizado → usa revalidatePath
//
// 4. ¿Todo parece correcto en el servidor pero el cliente sigue mostrando datos viejos?
//    → Router Cache del cliente → usa router.refresh()

// ─── Deshabilitar el caché completamente (desarrollo) ────────
// next.config.ts
export default {
  // Solo para depuración — NO en producción
  experimental: {
    staleTimes: { dynamic: 0, static: 0 },
  },
};`,
    tip: 'Siempre testea el caché con `next build && next start`, nunca con `next dev`. El servidor de desarrollo desactiva el Data Cache y el Full Route Cache.',
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

export default function CacheRevalidationPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-cyan-950 to-gray-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-cyan-400 text-sm font-mono mb-3 tracking-widest uppercase">
            Next.js · Caché · ISR · Revalidación
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Revalidación de{' '}
            <span className="text-cyan-400">Caché</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Las 4 capas de caché de Next.js, revalidación basada en tiempo (ISR),
            revalidación bajo demanda con revalidatePath y revalidateTag, y cómo depurar
            datos desactualizados en producción.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2 bg-cyan-900/50 border border-cyan-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <strong>revalidatePath</strong> — invalida el HTML de una ruta
            </span>
            <span className="flex items-center gap-2 bg-violet-900/50 border border-violet-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
              <strong>revalidateTag</strong> — invalida fetches por etiqueta
            </span>
            <span className="flex items-center gap-2 bg-green-900/50 border border-green-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              <strong>ISR</strong> — regeneración automática cada N segundos
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="https://nextjs.org/docs/app/building-your-application/caching"
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
          Explora el build de producción y cómo añadir metadata para SEO.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/production-build"
            className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Build de Producción →
          </Link>
          <Link
            href="/metadata"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Metadata →
          </Link>
          <Link
            href="https://nextjs.org/docs/app/building-your-application/caching"
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
