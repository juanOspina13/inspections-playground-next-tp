'use client';

import Link from 'next/link';

export default function Home() {
  console.log("heys");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      <div 
      dangerouslySetInnerHTML={{ __html: '<div>chipmunk</div>' }}
      ></div>
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl font-bold mb-4">Inspections Playground</h1>
          <p className="text-xl text-blue-100">
            Sistema moderno de gestión de inspecciones de vehículos
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Feature 1: Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-blue-600 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Dashboard</h3>
            <p className="text-gray-600 mb-6">
              Visualiza todas las inspecciones de vehículos con filtros avanzados y
              estadísticas en tiempo real.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Ver Dashboard →
            </Link>
          </div>

          {/* Feature 2: Formularios */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-blue-600 text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Formularios</h3>
            <p className="text-gray-600 mb-6">
              Explora diferentes patrones de formularios en React: controlados,
              no controlados y con React Hook Form + Zod.
            </p>
            <div className="space-y-2">
              <Link
                href="/forms/controlled"
                className="block text-blue-600 hover:text-blue-800 font-medium"
              >
                → Formulario Controlado
              </Link>
              <Link
                href="/forms/uncontrolled"
                className="block text-blue-600 hover:text-blue-800 font-medium"
              >
                → Formulario No Controlado
              </Link>
              <Link
                href="/forms/react-hook-form"
                className="block text-blue-600 hover:text-blue-800 font-medium"
              >
                → React Hook Form + Zod
              </Link>
            </div>
          </div>

          {/* Feature 3: Autenticación */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-blue-600 text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Autenticación</h3>
            <p className="text-gray-600 mb-6">
              Sistema de login integrado con Redux para gestión de estado de usuario
              y protección de rutas.
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Ir al Login →
            </Link>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Stack Tecnológico</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Next.js 16', desc: 'Framework React moderno' },
              { name: 'Redux Toolkit', desc: 'Gestión de estado' },
              { name: 'React Query', desc: 'Fetching de datos' },
              { name: 'React Hook Form', desc: 'Gestión de formularios' },
              { name: 'Zod', desc: 'Validación de esquemas' },
              { name: 'Tailwind CSS', desc: 'Estilos utility' },
              { name: 'TypeScript', desc: 'Tipado estático' },
              { name: 'Axios', desc: 'Cliente HTTP' },
            ].map((tech) => (
              <div key={tech.name} className="border-l-4 border-blue-600 pl-4">
                <p className="font-semibold text-gray-900">{tech.name}</p>
                <p className="text-sm text-gray-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Learning — three cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Next.js Concepts */}
          <div className="bg-black text-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">▲</div>
            <h3 className="text-xl font-bold mb-3">Conceptos de Next.js</h3>
            <p className="text-gray-300 mb-6">
              Referencia visual de los 14 conceptos principales del curso oficial de Next.js:
              routing, data fetching, streaming, Server Actions, autenticación, metadata y más.
            </p>
            <Link
              href="/nextjs-concepts"
              className="inline-block bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition"
            >
              Ver conceptos →
            </Link>
          </div>

          {/* Server vs Client Components */}
          <div className="bg-gradient-to-br from-blue-950 to-gray-900 text-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">🧩</div>
            <h3 className="text-xl font-bold mb-3">Server vs Client Components</h3>
            <p className="text-gray-300 mb-6">
              Cuándo usar cada uno, cómo componerlos, patrones comunes y las trampas
              que afectan el rendimiento sin que te des cuenta.
            </p>
            <Link
              href="/server-vs-client"
              className="inline-block bg-white text-blue-900 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition"
            >
              Ver diferencias →
            </Link>
          </div>

          {/* Suspense & React.lazy */}
          <div className="bg-gradient-to-br from-cyan-900 to-indigo-950 text-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-bold mb-3">Suspense &amp; React.lazy</h3>
            <p className="text-gray-300 mb-6">
              Estados de carga declarativos, división de código bajo demanda y demo
              en vivo de spinner — con patrones de streaming de Next.js.
            </p>
            <Link
              href="/suspense-lazy"
              className="inline-block bg-white text-cyan-900 font-semibold py-2 px-4 rounded-lg hover:bg-cyan-50 transition"
            >
              Explorar carga diferida →
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-800 text-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Comienza Ahora</h2>
          <p className="mb-6 text-blue-100">
            Explora el sistema de gestión de inspecciones y aprende los patrones
            modernos de React
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition"
          >
            Ir al Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

