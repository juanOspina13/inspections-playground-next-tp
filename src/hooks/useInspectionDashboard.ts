'use client';

import { useMemo, useState, useCallback } from 'react';
import { Inspection, DashboardStats, VehicleType, InspectionStatus } from '@/types/inspection';

interface DashboardFilters {
  status: InspectionStatus | '';
  vehicleType: VehicleType | '';
  searchQuery: string;
}

export function useInspectionDashboard(inspections: Inspection[]) {
  const [filters, setFilters] = useState<DashboardFilters>({
    status: '',
    vehicleType: '',
    searchQuery: '',
  });

  // Compute stats
  const stats = useMemo((): DashboardStats => {
    const total = inspections.length;
    const aprobadas = inspections.filter((i) => i.estado === 'aprobada').length;
    const rechazadas = inspections.filter((i) => i.estado === 'rechazada').length;
    const pendientes = inspections.filter((i) => i.estado === 'pendiente').length;
    const tasaAprobacion =
      total > 0 ? ((aprobadas / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      aprobadas,
      rechazadas,
      pendientes,
      tasaAprobacion: `${tasaAprobacion}%`,
    };
  }, [inspections]);

  // Filter inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((inspection) => {
      // Filter by status
      if (filters.status && inspection.estado !== filters.status) {
        return false;
      }

      // Filter by vehicle type
      if (filters.vehicleType && inspection.tipo !== filters.vehicleType) {
        return false;
      }

      // Filter by search query (search in placa, marca, modelo, inspector)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [
          inspection.placa,
          inspection.marca,
          inspection.modelo,
          inspection.inspector,
        ];
        const matches = searchFields.some((field) =>
          field.toLowerCase().includes(query)
        );
        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }, [inspections, filters]);

  const handleFilterChange = useCallback(
    (newFilters: Partial<DashboardFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      status: '',
      vehicleType: '',
      searchQuery: '',
    });
  }, []);

  return {
    filters,
    stats,
    filteredInspections,
    handleFilterChange,
    resetFilters,
  };
}
