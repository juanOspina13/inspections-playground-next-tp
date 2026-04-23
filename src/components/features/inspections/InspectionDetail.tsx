'use client';

import { useEffect, useRef } from 'react';
import { Inspection } from '@/types/inspection';
import { useInspectionDetail } from '@/hooks/useInspectionDetail';
import { NextInspection } from './NextInspection';
import { SEVERITY_LEVELS } from '@/constants/defaults';

interface InspectionDetailProps {
  inspection: Inspection | null;
  onClose: () => void;
}

export function InspectionDetail({ inspection, onClose }: InspectionDetailProps) {
  const { itemCounts } = useInspectionDetail(inspection);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (inspection) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [inspection, onClose]);

  if (!inspection) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {inspection.marca} {inspection.modelo}
            </h2>
            <p className="text-gray-600 mt-1">Placa: {inspection.placa}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Vehículo</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Marca</p>
                <p className="font-medium text-gray-900">{inspection.marca}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Modelo</p>
                <p className="font-medium text-gray-900">{inspection.modelo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Año</p>
                <p className="font-medium text-gray-900">{inspection.año}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="font-medium text-gray-900">
                  {inspection.tipo.charAt(0).toUpperCase() + inspection.tipo.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inspector</p>
                <p className="font-medium text-gray-900">{inspection.inspector}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-medium text-gray-900">
                  {new Date(inspection.fecha).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Bien</p>
                <p className="text-2xl font-bold text-green-700">{itemCounts.bien}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Observación</p>
                <p className="text-2xl font-bold text-yellow-700">{itemCounts.observacion}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Falla</p>
                <p className="text-2xl font-bold text-red-700">{itemCounts.falla}</p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías de Inspección</h3>
            <div className="space-y-6">
              {inspection.categorias.map((category, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">{category.categoria}</h4>
                  <div className="space-y-2">
                    {category.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.nombre}</p>
                          {item.observacion && (
                            <p className="text-sm text-gray-600 mt-1">{item.observacion}</p>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              item.resultado === 'bien'
                                ? 'bg-green-100 text-green-800'
                                : item.resultado === 'observacion'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.resultado.charAt(0).toUpperCase() + item.resultado.slice(1)}
                          </span>
                          {item.severidad && (
                            <p className="text-xs text-gray-600 mt-1">
                              Severidad:{' '}
                              {SEVERITY_LEVELS.find((s) => s.value === item.severidad)?.label ||
                                item.severidad}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Observations */}
          {inspection.observacionesGenerales && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones Generales</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {inspection.observacionesGenerales}
              </p>
            </div>
          )}

          {/* Next Inspection */}
          <div>
            <NextInspection fecha={inspection.proximaInspeccion} />
          </div>
        </div>
      </div>
    </div>
  );
}
