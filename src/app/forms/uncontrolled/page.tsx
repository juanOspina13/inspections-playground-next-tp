'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

interface FormData {
  name: string;
  email: string;
  country: string;
  subscribe: boolean;
}

export default function UncontrolledFormPage() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLSelectElement>(null);
  const subscribeRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: FormData = {
      name: nameRef.current?.value || '',
      email: emailRef.current?.value || '',
      country: countryRef.current?.value || '',
      subscribe: subscribeRef.current?.checked || false,
    };

    setFormData(data);
    setSubmitted(true);

    console.log('Form submitted:', data);

    // Reset form
    setTimeout(() => {
      if (nameRef.current) nameRef.current.value = '';
      if (emailRef.current) emailRef.current.value = '';
      if (countryRef.current) countryRef.current.value = '';
      if (subscribeRef.current) subscribeRef.current.checked = false;
      setSubmitted(false);
      setFormData(null);
    }, 2000);
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
            Formulario No Controlado
          </h1>
          <p className="text-gray-600 mb-8">
            Ejemplo de formulario no controlado usando refs. Los valores se obtienen
            directamente del DOM cuando se envía el formulario.
          </p>

          {submitted && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✓ Formulario enviado exitosamente
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                ref={nameRef}
                defaultValue=""
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu nombre"
              />
              <p className="text-sm text-gray-500 mt-1">
                Usa refs - sin estado controlado
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo
              </label>
              <input
                type="email"
                ref={emailRef}
                defaultValue=""
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tu@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País
              </label>
              <select
                ref={countryRef}
                defaultValue=""
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un país</option>
                <option value="mx">México</option>
                <option value="es">España</option>
                <option value="co">Colombia</option>
                <option value="ar">Argentina</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                ref={subscribeRef}
                id="subscribe"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="subscribe" className="ml-2 text-sm text-gray-700">
                Deseo recibir correos de marketing
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Enviar
            </button>
          </form>

          {formData && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Datos enviados:</h3>
              <pre className="text-sm bg-white p-3 rounded border border-gray-300 overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2">¿Cuándo usar formularios no controlados?</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Integración con código no-React</li>
              <li>• Formularios simples sin validación en tiempo real</li>
              <li>• Mejora de rendimiento en formularios muy complejos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
