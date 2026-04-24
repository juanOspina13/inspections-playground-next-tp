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
import { ConceptsOverview } from '@/components/features/concepts/ConceptsOverview';
import type { Inspection } from '@/types/inspection';

type Tab = 'inspections' | 'concepts';

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
  const [activeTab, setActiveTab] = useState<Tab>('inspections');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Inspecciones
          </h1>
          <p className="text-gray-600 mt-2">
            Visualiza y gestiona todas las inspecciones de vehículos
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('inspections')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'inspections'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            🔍 Inspecciones
          </button>
          <button
            onClick={() => setActiveTab('concepts')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'concepts'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            📚 Conceptos Next.js
          </button>
        </div>

        {activeTab === 'inspections' && (
          <>
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
          </>
        )}

        {activeTab === 'concepts' && <ConceptsOverview />}
      </div>
    </div>
  );
}
