import Link from 'next/link';

const sections = [
  {
    id: 'what-are-server-actions',
    number: 1,
    title: '¿Qué son las Server Actions?',
    icon: '⚡',
    color: 'violet',
    summary: 'Funciones async del servidor que el cliente puede invocar directamente — sin API routes',
    details: [
      'Una **Server Action** es una función marcada con `"use server"` que se ejecuta exclusivamente en el servidor, invocada desde el cliente.',
      'Next.js genera automáticamente un endpoint HTTP encubierto para cada Server Action — sin escribir route handlers.',
      'Pueden mutare datos, acceder a la BD, enviar emails, o cualquier operación del servidor — todo sin exponer código al cliente.',
      'A diferencia de las API Routes, las Server Actions están directamente acopladas al componente que las usa, lo que reduce el boilerplate.',
      'Se invocan desde formularios (`action={serverAction}`), desde event handlers de Client Components, o directamente en Server Components.',
    ],
    code: `// Cómo funciona bajo el hood:
//
// 1. Tú escribes una Server Action (función con "use server")
// 2. Next.js genera un endpoint oculto: POST /_next/action/abc123
// 3. React serializa los argumentos y hace POST a ese endpoint
// 4. La función corre en el servidor, retorna un resultado serializado
// 5. React actualiza la UI con el resultado

// app/inspections/actions.ts
'use server';

// Invocada desde un form:
export async function createInspection(formData: FormData) { ... }

// Invocada desde un event handler:
export async function deleteInspection(id: string) { ... }

// Invocada con datos tipados (no FormData):
export async function updateStatus(id: string, status: 'pending' | 'passed' | 'failed') {
  await db.inspections.update(id, { status });
  revalidatePath('/inspections');
}

// ─────────────────────────────────────────────────────────────
// Tres formas de definirlas:

// A) "use server" en archivo — todas las exports son Server Actions
'use server';
export async function create(formData: FormData) { ... }
export async function remove(id: string) { ... }

// B) "use server" en la función — solo esa función es Server Action
export async function myAction(data: string) {
  'use server';
  await db.save(data);
}

// C) Inline en Server Component (no funciona en Client Components)
export default function Page() {
  async function save(formData: FormData) {
    'use server';
    await db.save(formData.get('name'));
  }
  return <form action={save}><button>Guardar</button></form>;
}`,
    tip: 'Pon las Server Actions en un archivo `actions.ts` con `"use server"` al inicio. Es más limpio, testeable y reutilizable entre múltiples páginas.',
  },
  {
    id: 'action-responses',
    number: 2,
    title: 'Respuestas de Server Actions',
    icon: '📨',
    color: 'blue',
    summary: 'Cómo estructurar los valores de retorno para que el cliente los consuma correctamente',
    details: [
      'Las Server Actions pueden `return` cualquier valor serializable — string, number, objeto, array. No pueden retornar funciones o clases.',
      'El patrón estándar es retornar `{ success: true, data }` o `{ success: false, errors }` — discriminated union.',
      'También pueden `throw` para errores no recuperables — el Error Boundary o `error.tsx` más cercano los capturará.',
      'Pueden llamar a `redirect()` o `notFound()` de `next/navigation` — estas funciones lanzan un error especial que Next.js intercepta.',
      '`redirect()` y `return` son mutuamente excluyentes en la misma ruta de código — `redirect` no retorna.',
    ],
    code: `// app/inspections/actions.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// ─── Patrón 1: Discriminated union (mejor para formularios) ──
export type ActionResult<T = void> =
  | { success: true;  data: T }
  | { success: false; errors: Record<string, string[]>; message?: string };

const Schema = z.object({
  vehicleId: z.string().min(3, 'Mínimo 3 caracteres'),
  mileage:   z.string().transform(Number).pipe(z.number().positive()),
});

export async function createInspection(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {

  const result = Schema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: 'Por favor corrige los errores del formulario',
    };
  }

  try {
    const inspection = await db.inspections.create(result.data);
    revalidatePath('/inspections');
    return { success: true, data: { id: inspection.id } };
  } catch (err) {
    return {
      success: false,
      errors: {},
      message: 'Error al guardar. Intenta de nuevo.',
    };
  }
}

// ─── Patrón 2: Redirect después de éxito ─────────────────────
export async function createAndRedirect(formData: FormData) {
  const result = Schema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    // Con redirect no podemos retornar errores inline — solo si usas cookies o searchParams
    redirect(\`/inspections/new?error=\${encodeURIComponent('Datos inválidos')}\`);
  }

  const inspection = await db.inspections.create(result.data);
  revalidatePath('/inspections');
  redirect(\`/inspections/\${inspection.id}\`);  // ← lanza internamente, no retorna
}

// ─── Patrón 3: Throw para errores críticos ────────────────────
export async function deleteInspection(id: string) {
  const existing = await db.inspections.findById(id);
  if (!existing) throw new Error(\`Inspección \${id} no encontrada\`);  // → error.tsx
  await db.inspections.delete(id);
  revalidatePath('/inspections');
}`,
    tip: 'Usa el patrón discriminated union para formularios (retorna errores inline). Usa `redirect()` para flujos de una sola acción donde no necesitas mostrar errores inline.',
  },
  {
    id: 'use-action-state',
    number: 3,
    title: 'useActionState — El Hook Central',
    icon: '🎣',
    color: 'cyan',
    summary: 'Conecta una Server Action con el estado de la UI y el ciclo de vida del formulario',
    details: [
      '`useActionState` (React 19) reemplaza a `useFormState` de `react-dom` — misma API pero ahora en el paquete principal de React.',
      'Firma: `const [state, action, isPending] = useActionState(fn, initialState)` — devuelve estado, una action envuelve y un flag pending.',
      'Cuando el form envía, React llama a `fn(prevState, formData)` — la función recibe el estado anterior como primer argumento.',
      'El `state` retornado por la función es el nuevo estado — React lo guarda y lo pasa como `prevState` en el próximo submit.',
      'Funciona con **progressive enhancement**: si JS está deshabilitado, el form hace POST normal; con JS, actualiza el estado sin recarga.',
    ],
    code: `// ─── Firma completa de useActionState ────────────────────────
const [
  state,      // último valor retornado por la Server Action (o initialState)
  formAction, // función para pasar como action={formAction} en el form
  isPending,  // true mientras la acción está en vuelo
] = useActionState(
  serverAction,  // la Server Action — DEBE aceptar (prevState, formData)
  initialState,  // valor de state en el primer render
);

// ─── Ejemplo completo ─────────────────────────────────────────
// app/inspections/new/InspectionForm.tsx
'use client';

import { useActionState } from 'react';
import { createInspection, type ActionResult } from './actions';
import { SubmitButton } from '@/components/SubmitButton';

const initial: ActionResult = { success: false, errors: {} };

export function InspectionForm() {
  const [state, formAction, isPending] = useActionState(createInspection, initial);

  // Muestra un banner de éxito cuando la acción tuvo éxito
  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-green-700 font-semibold text-lg">✓ Inspección creada</p>
        <p className="text-green-600 text-sm mt-1">ID: {state.data.id}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Error de nivel de formulario */}
      {!state.success && state.message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="vehicleId" className="block text-sm font-medium mb-1">
          ID del Vehículo
        </label>
        <input
          id="vehicleId"
          name="vehicleId"
          type="text"
          aria-describedby="vehicleId-error"
          className={\`w-full border rounded-lg px-3 py-2 \${
            !state.success && state.errors?.vehicleId
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300'
          }\`}
        />
        {!state.success && state.errors?.vehicleId && (
          <p id="vehicleId-error" className="text-red-600 text-xs mt-1">
            {state.errors.vehicleId[0]}
          </p>
        )}
      </div>

      <SubmitButton label="Crear Inspección" pendingLabel="Creando…" />
    </form>
  );
}`,
    tip: 'En React 19 usa `useActionState` de `"react"`. Si usas React 18, usa `useFormState` de `"react-dom"`. Ambos tienen la misma firma.',
  },
  {
    id: 'use-optimistic',
    number: 4,
    title: 'useOptimistic — Actualizaciones Optimistas',
    icon: '🚀',
    color: 'green',
    summary: 'Actualiza la UI instantáneamente antes de que el servidor confirme — mejora la UX percibida',
    details: [
      '`useOptimistic` (React 19) permite mostrar un estado temporal en la UI mientras una Server Action está en vuelo.',
      'Si la acción tiene éxito, el estado optimista se reemplaza con los datos reales del servidor. Si falla, se revierte al estado anterior.',
      'Firma: `const [optimisticState, addOptimistic] = useOptimistic(state, updateFn)` donde `updateFn(currentState, newValue)` → nextState.',
      'Elimina la percepción de latencia en acciones frecuentes: marcar como leído, añadir a favoritos, toggle de estado.',
      'Siempre combínalo con manejo de errores — si la acción falla, el usuario debe saber que su acción no se guardó.',
    ],
    code: `// Lista de inspecciones con toggle de estado optimista
'use client';

import { useOptimistic, useTransition } from 'react';
import { updateInspectionStatus } from './actions';

type Inspection = { id: string; vehicleId: string; status: 'pending' | 'passed' | 'failed' };

export function InspectionList({ inspections }: { inspections: Inspection[] }) {
  // useOptimistic recibe el estado "real" y una función para calcular el estado optimista
  const [optimisticInspections, setOptimistic] = useOptimistic(
    inspections,
    (current, { id, status }: { id: string; status: Inspection['status'] }) =>
      current.map((i) => (i.id === id ? { ...i, status } : i))
  );

  const [, startTransition] = useTransition();

  async function handleToggleStatus(id: string, newStatus: Inspection['status']) {
    // 1. Actualiza la UI inmediatamente (optimista)
    setOptimistic({ id, status: newStatus });

    // 2. Llama a la Server Action — si falla, React revierte el estado optimista
    startTransition(async () => {
      try {
        await updateInspectionStatus(id, newStatus);
      } catch {
        // El estado se revierte automáticamente en caso de error
        alert('No se pudo actualizar el estado. Intenta de nuevo.');
      }
    });
  }

  return (
    <ul className="space-y-2">
      {optimisticInspections.map((inspection) => (
        <li
          key={inspection.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <span>{inspection.vehicleId}</span>
          <select
            value={inspection.status}
            onChange={(e) =>
              handleToggleStatus(inspection.id, e.target.value as Inspection['status'])
            }
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="pending">Pendiente</option>
            <option value="passed">Aprobado</option>
            <option value="failed">Fallido</option>
          </select>
        </li>
      ))}
    </ul>
  );
}`,
    tip: 'Usa `useOptimistic` para acciones frecuentes donde el usuario espera feedback inmediato. Para operaciones críticas (pago, borrado) es mejor esperar la confirmación del servidor.',
  },
  {
    id: 'invoking-from-client',
    number: 5,
    title: 'Invocar desde Client Components',
    icon: '🖱️',
    color: 'amber',
    summary: 'Las Server Actions no son solo para formularios — pueden llamarse desde cualquier event handler',
    details: [
      'Las Server Actions son funciones `async` — puedes `await`arlas directamente en un event handler de un Client Component.',
      'Cuando se invocan fuera de un form, recibirán los argumentos directamente (no `FormData`) — puedes pasarles cualquier objeto serializable.',
      'Usa `useTransition` de React para envolver la llamada y obtener el flag `isPending` — sin bloquear el hilo de renderizado.',
      'Para botones de eliminar, confirmar o acciones de un solo clic, este patrón es más limpio que usar un form invisible.',
      'Recuerda que las Server Actions **siempre corren en el servidor** — aunque las invoques desde un onClick en el cliente.',
    ],
    code: `// Invocar Server Action desde event handlers (sin form)
'use client';

import { useTransition, useState } from 'react';
import { deleteInspection, updateStatus } from './actions';

export function InspectionActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // ─── Eliminar con confirmación ────────────────────────────
  async function handleDelete() {
    if (!confirm('¿Eliminar esta inspección?')) return;

    startTransition(async () => {
      try {
        await deleteInspection(id);
        // deleteInspection llama a revalidatePath — la lista se actualiza sola
      } catch (err) {
        setError('No se pudo eliminar. Intenta de nuevo.');
      }
    });
  }

  // ─── Pasar inspección sin form ────────────────────────────
  async function handleApprove() {
    startTransition(async () => {
      const result = await updateStatus(id, 'passed');
      if (!result.success) setError(result.message ?? 'Error al actualizar');
    });
  }

  return (
    <div className="flex gap-2">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        onClick={handleApprove}
        disabled={isPending}
        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
      >
        {isPending ? 'Actualizando…' : '✓ Aprobar'}
      </button>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
      >
        🗑 Eliminar
      </button>
    </div>
  );
}

// ─── Pasando datos no-FormData ─────────────────────────────────
// app/inspections/actions.ts
'use server';

export async function updateStatus(
  id: string,
  status: 'pending' | 'passed' | 'failed'
): Promise<{ success: boolean; message?: string }> {
  // Los argumentos son cualquier valor serializable — no solo FormData
  await db.inspections.update(id, { status });
  revalidatePath('/inspections');
  return { success: true };
}`,
    tip: 'Usa `useTransition` en lugar de `useState` manual para el estado pendiente. `startTransition` marca la actualización como no urgente y provee `isPending`.',
  },
  {
    id: 'security',
    number: 6,
    title: 'Seguridad en Server Actions',
    icon: '🔒',
    color: 'red',
    summary: 'Las Server Actions son endpoints HTTP — deben validar autenticación y autorización',
    details: [
      '⚠️ Cada Server Action es un **endpoint HTTP público** bajo `/_next/action/*`. Cualquiera puede llamarla con `fetch`.',
      'Siempre verifica la **autenticación** al inicio de la Server Action — que el usuario esté logueado.',
      'Siempre verifica la **autorización** — que el usuario tenga permiso sobre el recurso específico (no solo cualquier recurso).',
      'Nunca confíes en IDs que vengan del cliente sin verificar que pertenezcan al usuario autenticado — IDOR vulnerability.',
      'Usa `headers()` o las cookies de sesión para identificar al usuario — igual que en una API Route.',
    ],
    code: `// app/inspections/actions.ts
'use server';

import { auth } from '@/lib/auth';           // tu sistema de autenticación
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

// ❌ Inseguro — cualquiera puede eliminar cualquier inspección
export async function deleteInspectionInsecure(id: string) {
  await db.inspections.delete(id);  // sin verificar quién llama
}

// ✅ Seguro — verifica autenticación Y autorización
export async function deleteInspection(id: string) {
  // 1. Autenticación: ¿está el usuario logueado?
  const session = await auth();
  if (!session?.user) {
    throw new Error('No autenticado');
  }

  // 2. Autorización: ¿el recurso pertenece al usuario?
  const inspection = await db.inspections.findById(id);
  if (!inspection) notFound();

  if (inspection.createdBy !== session.user.id && session.user.role !== 'admin') {
    throw new Error('No autorizado para eliminar esta inspección');
  }

  // 3. Ahora sí, operación segura
  await db.inspections.delete(id);
  revalidatePath('/inspections');
}

// ─────────────────────────────────────────────────────────────
// Patrón: helper de autenticación reutilizable
async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Autenticación requerida');
  return session.user;
}

export async function createInspection(formData: FormData) {
  const user = await requireAuth();  // lanza si no está autenticado

  const vehicleId = formData.get('vehicleId') as string;
  await db.inspections.create({ vehicleId, createdBy: user.id });
  revalidatePath('/inspections');
}`,
    tip: 'Trata cada Server Action como si fuera una API Route pública — porque lo es. Valida autenticación y autorización en cada acción que mute datos.',
  },
  {
    id: 'composing-actions',
    number: 7,
    title: 'Composición y Reutilización',
    icon: '🧩',
    color: 'teal',
    summary: 'Patrones para organizar, reutilizar y testar Server Actions en proyectos reales',
    details: [
      'Separa la **lógica de negocio** de la Server Action — la acción valida y llama a servicios; los servicios hacen el trabajo real.',
      'Crea helpers reutilizables para autenticación, validación y revalidación — reduce el boilerplate entre acciones.',
      'Las Server Actions pueden componerse: una acción puede llamar a otras funciones del servidor para operaciones complejas.',
      'Para testar, extrae la lógica en funciones puras sin `"use server"` — las Server Actions en sí son difíciles de testar directamente.',
      'Agrupa las acciones por dominio: `inspections/actions.ts`, `users/actions.ts`, `reports/actions.ts`.',
    ],
    code: `// Estructura sugerida para proyectos reales:
//
// src/
//   app/
//     inspections/
//       actions.ts          ← Server Actions (solo validación + llamada a servicios)
//       page.tsx
//   services/
//     inspection-service.ts ← Lógica de negocio pura (testeable)
//   lib/
//     auth.ts               ← Helper de autenticación

// ─── services/inspection-service.ts ──────────────────────────
// Lógica de negocio PURA — sin "use server", testeable con Jest
import { db } from '@/lib/db';

export async function createInspectionRecord(data: {
  vehicleId: string;
  inspectorId: string;
  mileage: number;
}) {
  // Reglas de negocio testeable
  const existing = await db.inspections.findByVehicle(data.vehicleId, { status: 'pending' });
  if (existing) {
    throw new Error('El vehículo ya tiene una inspección pendiente');
  }

  return db.inspections.create(data);
}

// ─── app/inspections/actions.ts ───────────────────────────────
'use server';

import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { createInspectionRecord } from '@/services/inspection-service';
import { revalidatePath } from 'next/cache';

const Schema = z.object({
  vehicleId: z.string().min(3),
  mileage:   z.string().transform(Number).pipe(z.number().positive()),
});

export async function createInspectionAction(_prev: unknown, formData: FormData) {
  const user   = await requireAuth();
  const result = Schema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  try {
    await createInspectionRecord({ ...result.data, inspectorId: user.id });
    revalidatePath('/inspections');
    return { success: true };
  } catch (err) {
    return { success: false, errors: {}, message: (err as Error).message };
  }
}`,
    tip: 'Las Server Actions deben ser delgadas: validar, llamar a un servicio, revalidar y retornar. La lógica de negocio va en la capa de servicios donde puedes testearla.',
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

export default function ServerActionsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-violet-400 text-sm font-mono mb-3 tracking-widest uppercase">
            Next.js · React 19 · Server Actions
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Server Actions &{' '}
            <span className="text-violet-400">useActionState</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Cómo estructurar respuestas de Server Actions, manejar el estado del formulario
            con useActionState, actualizaciones optimistas y seguridad.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2 bg-violet-900/50 border border-violet-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
              <strong>useActionState</strong> — estado del formulario vinculado a la acción
            </span>
            <span className="flex items-center gap-2 bg-green-900/50 border border-green-700 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              <strong>useOptimistic</strong> — UI instantánea antes de la respuesta del servidor
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
          Explora validación de formularios y cómo desplegar en producción.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/form-validation"
            className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Validación de Formularios →
          </Link>
          <Link
            href="/production-build"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Build de Producción →
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
