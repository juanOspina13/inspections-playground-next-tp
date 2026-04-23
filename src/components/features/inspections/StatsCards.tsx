'use client';

import { DashboardStats } from '@/types/inspection';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600 text-sm font-medium">Total</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600 text-sm font-medium">Aprobadas</p>
        <p className="text-2xl font-bold text-green-600 mt-2">{stats.aprobadas}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600 text-sm font-medium">Rechazadas</p>
        <p className="text-2xl font-bold text-red-600 mt-2">{stats.rechazadas}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600 text-sm font-medium">Pendientes</p>
        <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pendientes}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-600 text-sm font-medium">Tasa Aprobación</p>
        <p className="text-2xl font-bold text-blue-600 mt-2">{stats.tasaAprobacion}</p>
      </div>
    </div>
  );
}
