'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

// Define validation schema
const formSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(20, 'El nombre no debe exceder 20 caracteres'),
  email: z.string().email('Correo inválido'),
  age: z
    .number()
    .min(18, 'Debes tener al menos 18 años')
    .max(120, 'Edad inválida'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/[0-9]/, 'Debe contener un número'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'admin', 'moderator']),
  terms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof formSchema>;

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p className="text-red-600 text-sm mt-1">{message}</p>;
}

export default function ReactHookFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    setSubmittedData(data);
    setSubmitted(true);
    console.log('Form submitted:', data);

    setTimeout(() => {
      reset();
      setSubmitted(false);
      setSubmittedData(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Volver al Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            React Hook Form + Zod
          </h1>
          <p className="text-gray-600 mb-8">
            Ejemplo de formulario moderno con validación declarativa usando Zod
            y React Hook Form. Minimiza re-renders y proporciona validación robusta.
          </p>

          {submitted && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✓ Formulario validado y enviado exitosamente
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario
              </label>
              <input
                type="text"
                placeholder="nombre123"
                {...register('username')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.username
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <FieldError message={errors.username?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="tu@ejemplo.com"
                {...register('email')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad
              </label>
              <input
                type="number"
                placeholder="25"
                {...register('age', { valueAsNumber: true })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.age
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <FieldError message={errors.age?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Abc12345"
                {...register('password')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <FieldError message={errors.password?.message} />
              <p className="text-xs text-gray-500 mt-1">
                Debe tener al menos 8 caracteres, una mayúscula y un número
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                placeholder="Abc12345"
                {...register('confirmPassword')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <select
                {...register('role')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.role
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Selecciona un rol</option>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
                <option value="moderator">Moderador</option>
              </select>
              <FieldError message={errors.role?.message} />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                {...register('terms')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                Acepto los términos y condiciones
              </label>
              <FieldError message={errors.terms?.message} />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Registrarse
            </button>
          </form>

          {submittedData && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Datos validados:</h3>
              <pre className="text-sm bg-white p-3 rounded border border-gray-300 overflow-auto max-h-64">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">Ventajas:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Validación declarativa con Zod</li>
              <li>✓ Minimiza re-renders innecesarios</li>
              <li>✓ Validación en tiempo real o al enviar</li>
              <li>✓ Mensajes de error integrados</li>
              <li>✓ Integración fácil con resolver (Zod, Yup, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
