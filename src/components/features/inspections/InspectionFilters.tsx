'use client';

import { VEHICLE_TYPES, INSPECTION_STATUSES } from '@/constants/defaults';
import { InspectionStatus, VehicleType } from '@/types/inspection';
import { SecondaryButton } from '@/components/styled/SecondaryButton';

interface InspectionFiltersProps {
  searchQuery: string;
  status: InspectionStatus | '';
  vehicleType: VehicleType | '';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: InspectionStatus | '') => void;
  onVehicleTypeChange: (value: VehicleType | '') => void;
  onReset: () => void;
}

export function InspectionFilters({
  searchQuery,
  status,
  vehicleType,
  onSearchChange,
  onStatusChange,
  onVehicleTypeChange,
  onReset,
}: InspectionFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Placa, marca, inspector..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as InspectionStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {INSPECTION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Vehículo
          </label>
          <select
            value={vehicleType}
            onChange={(e) => onVehicleTypeChange(e.target.value as VehicleType | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <SecondaryButton
            onClick={onReset}
            className="w-full"
            style={{ padding: '8px 16px', width: '100%' }}
          >
            Limpiar Filtros
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
