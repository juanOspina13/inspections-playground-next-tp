import Link from 'next/link';

const sections = [
  {
    id: 'html-forms',
    number: 1,
    title: 'Envío de Formularios HTML Nativo',
    icon: '📄',
    color: 'blue',
    summary: 'Cómo funcionan los formularios HTML sin JavaScript — la base de todo lo demás',
    details: [
      'Un `<form>` HTML con `action` y `method="post"` envía datos al servidor como `application/x-www-form-urlencoded` por defecto.',
      'El navegador serializa todos los campos `<input>`, `<select>` y `<textarea>` con atributo `name` en el cuerpo de la petición.',
      'Los formularios HTML funcionan **sin JavaScript** — esto se llama **progressive enhancement** y es la base del modelo de Next.js.',
      'En Next.js 15+, la prop `action` de `<form>` puede recibir directamente una **Server Action** — sin `onSubmit` ni `fetch`.',
      '`FormData` es el objeto del navegador y del servidor que representa los datos del formulario — puedes leerlo con `formData.get("campo")`.',
    ],
    code: `// Formulario HTML puro — funciona sin JS en el cliente
// app/contact/page.tsx
export default function ContactPage() {
  return (
    <form method="POST" action="/api/contact" encType="application/x-www-form-urlencoded">
      <input  name="email"   type="email"  required placeholder="tu@email.com" />
      <input  name="name"    type="text"   required placeholder="Tu nombre" />
      <select name="subject">
        <option value="bug">Bug</option>
        <option value="feature">Feature Request</option>
      </select>
      <textarea name="message" required rows={4} />
      <button type="submit">Enviar</button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Cuando el formulario se envía, el navegador crea un FormData:
// email=tu@email.com&name=Juan&subject=bug&message=hola

// Leer FormData en el servidor (Route Handler):
// app/api/contact/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const email   = formData.get('email')   as string;
  const name    = formData.get('name')    as string;
  const message = formData.get('message') as string;

  // Ahora valida y procesa...
}`,
    tip: 'El formulario HTML nativo funciona incluso cuando el JS falla. Siempre construye sobre esta base y agrega capas de JS encima.',
  },
  {
    id: 'server-actions-forms',
    number: 2,
    title: 'Server Actions en Formularios',
    icon: '⚡',
    color: 'violet',
    summary: 'Conecta un formulario directamente a una función del servidor — sin API routes',
    details: [
      'Una **Server Action** es una función `async` marcada con `"use server"` — puede ser llamada directamente desde un formulario con `action={miFuncion}`.',
      'Next.js intercepta el submit, serializa el `FormData` y llama a la función del servidor — todo sin escribir una API route.',
      'Funciona con **progressive enhancement**: si el JS está deshabilitado, el form hace un POST normal al servidor; si no, React lo intercepta.',
      'Las Server Actions se definen con `"use server"` al inicio del archivo (para archivos de solo-servidor) o al inicio de la función.',
      'Puedes colocar la Server Action en el mismo archivo del Server Component, o en un archivo separado `actions.ts` para reutilizarlas.',
    ],
    code: `// Opción 1: Server Action en el mismo archivo (solo en Server Components)
// app/inspections/new/page.tsx
export default function NewInspectionPage() {
  // La función con "use server" DEBE ser async
  async function createInspection(formData: FormData) {
    'use server';

    const vehicleId = formData.get('vehicleId') as string;
    const inspector = formData.get('inspector') as string;

    // Acceso directo a la BD — sin fetch, sin API route
    await db.inspections.create({ vehicleId, inspector });

    // Refresca los datos del servidor y redirige
    revalidatePath('/inspections');
    redirect('/inspections');
  }

  return (
    // action={createInspection} — Next.js conecta el form a la función
    <form action={createInspection}>
      <input name="vehicleId" required placeholder="ID del vehículo" />
      <input name="inspector" required placeholder="Nombre del inspector" />
      <button type="submit">Crear Inspección</button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Opción 2: Server Action en archivo separado (reutilizable)
// app/inspections/actions.ts
'use server';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createInspection(formData: FormData) {
  const vehicleId = formData.get('vehicleId') as string;
  await db.inspections.create({ vehicleId });
  revalidatePath('/inspections');
  redirect('/inspections');
}`,
    tip: 'Prefiere poner las Server Actions en un archivo separado `actions.ts` con `"use server"` al inicio. Así puedes reutilizarlas en múltiples páginas.',
  },
  {
    id: 'zod-validation',
    number: 3,
    title: 'Validación del Lado del Servidor con Zod',
    icon: '🛡️',
    color: 'green',
    summary: 'Valida la entrada del usuario en el servidor antes de tocar la base de datos',
    details: [
      'La validación del lado del cliente (HTML `required`, `type="email"`) es bypasseable — **nunca confíes en ella sola**.',
      '**Zod** es la librería estándar de facto para validación de esquemas en el ecosistema TypeScript/Next.js.',
      '`schema.safeParse(data)` retorna `{ success: true, data }` o `{ success: false, error }` — nunca lanza excepciones.',
      '`error.flatten()` convierte los errores de Zod en un objeto con `fieldErrors` y `formErrors` — perfecto para devolver al cliente.',
      'Siempre valida en la **Server Action**, no en el componente de cliente — la Server Action es el único punto de entrada confiable.',
    ],
    code: `// app/inspections/actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// 1. Define el esquema de validación
const InspectionSchema = z.object({
  vehicleId: z
    .string()
    .min(3, 'El ID del vehículo debe tener al menos 3 caracteres')
    .max(20, 'El ID del vehículo no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Solo mayúsculas, números y guiones'),

  inspector: z
    .string()
    .min(2, 'El nombre del inspector es demasiado corto')
    .max(100),

  mileage: z
    .string()
    .transform(Number)                          // convierte string → number
    .pipe(z.number().positive('El kilometraje debe ser positivo')),

  notes: z.string().max(500).optional(),
});

// 2. Usa el esquema en la Server Action
export async function createInspection(formData: FormData) {
  // Extrae los datos del FormData
  const raw = {
    vehicleId: formData.get('vehicleId'),
    inspector: formData.get('inspector'),
    mileage:   formData.get('mileage'),
    notes:     formData.get('notes'),
  };

  // 3. Valida con safeParse — nunca lanza, siempre retorna
  const result = InspectionSchema.safeParse(raw);

  if (!result.success) {
    // 4. Retorna errores estructurados al cliente
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      // { vehicleId: ['Solo mayúsculas...'], mileage: ['debe ser positivo'] }
    };
  }

  // 5. Solo llega aquí si la validación pasó — datos tipados y seguros
  const { vehicleId, inspector, mileage, notes } = result.data;
  await db.inspections.create({ vehicleId, inspector, mileage, notes });

  revalidatePath('/inspections');
  return { success: true };
}`,
    tip: 'Usa `z.string().transform(Number)` para campos numéricos del FormData — todos los valores de FormData son strings por defecto.',
  },
  {
    id: 'displaying-errors',
    number: 4,
    title: 'Mostrando Errores de Validación',
    icon: '🚨',
    color: 'red',
    summary: 'Conectar los errores del servidor con los campos del formulario en la UI',
    details: [
      'Cuando la Server Action retorna `{ errors }`, el Client Component puede leer ese objeto y mostrar mensajes debajo de cada campo.',
      '`useActionState` (React 19) / `useFormState` (React 18) de `react-dom` es el hook diseñado para manejar el estado de respuesta de una Server Action.',
      'Asegúrate de usar `aria-describedby` en los inputs para asociar el mensaje de error con el campo — accesibilidad.',
      'Puedes también usar clases CSS condicionales (`border-red-500`) para resaltar visualmente los campos inválidos.',
      'Los errores de nivel de formulario (ej: "el vehículo ya existe") van en `formErrors`; los de campo van en `fieldErrors`.',
    ],
    code: `// app/inspections/new/InspectionForm.tsx
'use client';

import { useActionState } from 'react';  // React 19 (era useFormState en React 18)
import { createInspection } from './actions';

// Estado inicial — sin errores
const initialState = { success: false, errors: {} };

export function InspectionForm() {
  // useActionState(acción, estadoInicial) — llama a la acción en el submit
  const [state, formAction, isPending] = useActionState(createInspection, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {/* Error a nivel de formulario */}
      {state.errors?.form && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {state.errors.form}
        </div>
      )}

      {/* Campo con error inline */}
      <div>
        <label htmlFor="vehicleId">ID del Vehículo</label>
        <input
          id="vehicleId"
          name="vehicleId"
          type="text"
          aria-describedby="vehicleId-error"
          className={\`border rounded-lg px-3 py-2 w-full \${
            state.errors?.vehicleId ? 'border-red-500' : 'border-gray-300'
          }\`}
        />
        {state.errors?.vehicleId && (
          <p id="vehicleId-error" className="text-red-600 text-sm mt-1">
            {state.errors.vehicleId[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="mileage">Kilometraje</label>
        <input id="mileage" name="mileage" type="number" min="0"
          aria-describedby="mileage-error"
          className={\`border rounded-lg px-3 py-2 w-full \${
            state.errors?.mileage ? 'border-red-500' : 'border-gray-300'
          }\`}
        />
        {state.errors?.mileage && (
          <p id="mileage-error" className="text-red-600 text-sm mt-1">
            {state.errors.mileage[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {isPending ? 'Guardando…' : 'Crear Inspección'}
      </button>
    </form>
  );
}`,
    tip: 'Siempre asocia los mensajes de error con los inputs usando `aria-describedby`. Los lectores de pantalla anunciarán el error cuando el usuario enfoque el campo.',
  },
  {
    id: 'use-form-status',
    number: 5,
    title: 'useFormStatus — Estado Pendiente',
    icon: '⏳',
    color: 'amber',
    summary: 'Muestra un spinner o deshabilita el botón mientras el formulario está enviando',
    details: [
      '`useFormStatus` (de `react-dom`) lee el estado del `<form>` más cercano — retorna `{ pending, data, method, action }`.',
      'Debe usarse dentro de un componente que sea **hijo del form** — no puede leerse en el mismo componente que renderiza el form.',
      'El patrón más limpio es extraer el botón en su propio componente: `<SubmitButton />` que use `useFormStatus` internamente.',
      '`pending` es `true` desde que el usuario envía hasta que la Server Action retorna — ideal para spinners y deshabilitar el botón.',
      'También puedes leer `data` (el FormData enviado) para mostrar "Guardando inspección ABC-123…" con el valor real del campo.',
    ],
    code: `// components/SubmitButton.tsx
'use client';

import { useFormStatus } from 'react-dom';

// ✅ Este componente es hijo del form, puede leer useFormStatus
export function SubmitButton({ label = 'Guardar', pendingLabel = 'Guardando…' }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={\`flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5
        rounded-lg font-semibold transition
        \${pending ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}\`}
    >
      {pending && (
        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      )}
      {pending ? pendingLabel : label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Uso en el formulario:
// app/inspections/new/InspectionForm.tsx
'use client';
import { useActionState } from 'react';
import { SubmitButton } from '@/components/SubmitButton';
import { createInspection } from './actions';

export function InspectionForm() {
  const [state, formAction] = useActionState(createInspection, { errors: {} });

  return (
    <form action={formAction} className="space-y-4">
      <input name="vehicleId" type="text" />
      <input name="mileage"   type="number" />

      {/* SubmitButton lee useFormStatus del <form> que lo contiene */}
      <SubmitButton label="Crear Inspección" pendingLabel="Creando…" />
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// ❌ No hacer esto — useFormStatus en el mismo componente que renderiza el form
'use client';
function MalEjemplo() {
  const { pending } = useFormStatus();  // ⚠️ Siempre será false — no está dentro del form
  return <form action={...}><button disabled={pending}>Enviar</button></form>;
}`,
    tip: 'Extrae siempre el botón de submit en su propio componente para usar `useFormStatus`. Es un patrón establecido en la documentación oficial de React.',
  },
  {
    id: 'progressive-enhancement',
    number: 6,
    title: 'Progressive Enhancement',
    icon: '🚀',
    color: 'teal',
    summary: 'Formularios que funcionan sin JS y mejoran cuando JS está disponible',
    details: [
      'El modelo de formularios de Next.js está diseñado para **progressive enhancement** — el form debe funcionar con JS deshabilitado.',
      'Con `action={serverAction}`, si JS está deshabilitado, el navegador hace un `POST` normal; si JS está activo, React lo intercepta.',
      'Para que el form funcione sin JS, la Server Action debe usar `redirect()` después de guardar — sin `return` de estado al cliente.',
      'Para mejorar la experiencia con JS, combina la Server Action con `useActionState` para mostrar errores inline sin recargar la página.',
      'Las validaciones HTML (`required`, `minLength`, `type`) actúan como primera línea — rápidas, sin red. Zod en el servidor es la segunda línea.',
    ],
    code: `// El mismo formulario funciona en 3 niveles:

// ─── Nivel 1: Sin JS ──────────────────────────────────────────
// El browser hace POST y la página se recarga con el resultado

// app/inspections/actions.ts
'use server';
export async function createInspection(formData: FormData) {
  const result = InspectionSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    // Sin JS, redirigimos con los errores en la URL (patrón PRG)
    redirect('/inspections/new?error=validation_failed');
  }

  await db.inspections.create(result.data);
  redirect('/inspections');  // ← redirige siempre — requerido para no-JS
}

// ─── Nivel 2: Con JS — errores inline sin recarga ─────────────
'use client';
import { useActionState } from 'react';

export function InspectionFormEnhanced() {
  const [state, action] = useActionState(
    createInspectionEnhanced,  // versión que retorna estado en vez de redirigir
    { success: false, errors: {} }
  );

  // Con JS: muestra errores inline, sin recarga de página
  return (
    <form action={action}>
      <input name="vehicleId" required minLength={3} maxLength={20} />
      {state.errors?.vehicleId && (
        <p className="text-red-600 text-sm">{state.errors.vehicleId[0]}</p>
      )}
      <button type="submit">Crear</button>
    </form>
  );
}

// ─── Nivel 3: Con JS + optimistic update ─────────────────────
// useOptimistic() — actualiza la UI antes de que el servidor responda
import { useOptimistic } from 'react';
// (ver la sección de Server Actions para ejemplos de useOptimistic)`,
    tip: 'Empieza con el formulario HTML básico que funciona sin JS, luego agrega `useActionState` para mejorarlo. No al revés.',
  },
  {
    id: 'revalidation',
    number: 7,
    title: 'revalidatePath y revalidateTag',
    icon: '🔄',
    color: 'indigo',
    summary: 'Actualiza datos cacheados del servidor después de mutar datos en una Server Action',
    details: [
      '`revalidatePath("/ruta")` invalida el caché de Next.js para esa ruta — la próxima visita obtiene datos frescos del servidor.',
      '`revalidateTag("nombre")` invalida todas las peticiones `fetch` que tengan ese tag — útil para invalidar grupos de datos.',
      'Si no revalidas, el usuario verá datos desactualizados hasta el próximo deploy o intervalo de ISR.',
      'Llama `revalidatePath` o `revalidateTag` dentro de la Server Action, justo antes del `redirect()`.',
      'Para `revalidateTag`, etiqueta tu fetch con `{ next: { tags: [\'inspections\'] } }` y luego invalida con `revalidateTag(\'inspections\')`.',
    ],
    code: `// app/inspections/actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export async function createInspection(formData: FormData) {
  const vehicleId = formData.get('vehicleId') as string;
  await db.inspections.create({ vehicleId });

  // Opción 1: revalidar una ruta específica
  revalidatePath('/inspections');              // recarga los datos de esa página
  revalidatePath('/dashboard');               // también el dashboard que muestra stats

  redirect('/inspections');
}

export async function deleteInspection(id: string) {
  await db.inspections.delete(id);

  // Opción 2: revalidar por tag (más granular)
  revalidateTag('inspections');    // invalida todos los fetches con este tag
  redirect('/inspections');
}

// ─────────────────────────────────────────────────────────────
// Para usar revalidateTag, etiqueta el fetch:
// app/inspections/page.tsx (Server Component)
async function getInspections() {
  const res = await fetch('/api/inspections', {
    next: {
      tags: ['inspections'],        // ← etiqueta para invalidación selectiva
      revalidate: 60,               // también revalida cada 60 segundos (ISR)
    },
  });
  return res.json();
}

// Cuando deleteInspection() llama revalidateTag('inspections'),
// este fetch se invalida y la próxima carga de página trae datos frescos.`,
    tip: 'Usa `revalidatePath` para rutas específicas (simples). Usa `revalidateTag` cuando múltiples páginas consumen los mismos datos y quieres invalidarlos todos a la vez.',
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

export default function FormValidationPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-400 text-sm font-mono mb-3 tracking-widest uppercase">
            Next.js · Server Actions · Zod
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Envío de Formularios &{' '}
            <span className="text-green-400">Validación del Servidor</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Cómo conectar formularios HTML a Server Actions, validar la entrada del
            usuario con Zod en el servidor y mostrar errores de vuelta en la UI.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2 bg-green-900/50 border border-green-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              <strong>Server Action</strong> — función del servidor invocada desde el form
            </span>
            <span className="flex items-center gap-2 bg-violet-900/50 border border-violet-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
              <strong>Zod</strong> — validación de esquemas con inferencia TypeScript
            </span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations"
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
          Ve los formularios en acción y profundiza en Server Actions.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/server-actions"
            className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Server Actions →
          </Link>
          <Link
            href="/forms/react-hook-form"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Ver Formularios →
          </Link>
          <Link
            href="https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations"
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
