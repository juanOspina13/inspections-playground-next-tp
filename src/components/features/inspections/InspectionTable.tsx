'use client';

import { Inspection } from '@/types/inspection';
import { StatusBadge } from './StatusBadge';

interface InspectionTableProps {
  inspections: Inspection[];
  onRowClick: (inspection: Inspection) => void;
}

export function InspectionTable({ inspections, onRowClick }: InspectionTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Placa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Vehículo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Inspector
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {inspections.map((inspection) => (
            <tr
              key={inspection.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick(inspection)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {inspection.placa}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {inspection.marca} {inspection.modelo} ({inspection.año})
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {inspection.inspector}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(inspection.fecha).toLocaleDateString('es-ES')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={inspection.estado} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(inspection);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {inspections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron inspecciones
        </div>
      )}
    </div>
  );
}
