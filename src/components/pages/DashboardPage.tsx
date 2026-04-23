'use client';

import { useState } from 'react';
import { useInspectionDashboard } from '@/hooks/useInspectionDashboard';
import { mockInspections } from '@/data/mockData';
import {
  StatsCards,
  InspectionFilters,
  InspectionTable,
  InspectionDetail,
} from '@/components/features/inspections';

export function DashboardPage() {
  const {
    filters,
    stats,
    filteredInspections,
    handleFilterChange,
    resetFilters,
  } = useInspectionDashboard(mockInspections);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(
    mockInspections[0] || null
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Inspecciones
          </h1>
          <p className="text-gray-600 mt-2">
            Visualiza y gestiona todas las inspecciones de vehículos
          </p>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <InspectionFilters
          searchQuery={filters.searchQuery}
          status={filters.status}
          vehicleType={filters.vehicleType}
          onSearchChange={(value) =>
            handleFilterChange({ searchQuery: value })
          }
          onStatusChange={(value) =>
            handleFilterChange({ status: value })
          }
          onVehicleTypeChange={(value) =>
            handleFilterChange({ vehicleType: value })
          }
          onReset={resetFilters}
        />

        {/* Table */}
        <InspectionTable
          inspections={filteredInspections}
          onRowClick={setSelectedInspection}
        />

        {/* Detail Modal */}
        {selectedInspection && (
          <InspectionDetail
            inspection={selectedInspection}
            onClose={() => setSelectedInspection(null)}
          />
        )}
      </div>
    </div>
  );
}
