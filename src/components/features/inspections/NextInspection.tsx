'use client';

import { useState, useCallback } from 'react';
import { SecondaryButton } from '@/components/styled/SecondaryButton';

interface NextInspectionProps {
  fecha?: string;
  onDateChange?: (date: string) => void;
  onPostpone?: () => void;
  onClear?: () => void;
}

export function NextInspection({
  fecha,
  onDateChange,
  onPostpone,
  onClear,
}: NextInspectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(fecha || '');

  const handlePostpone = useCallback(() => {
    if (onPostpone) {
      onPostpone();
    } else {
      // Default: postpone by 30 days
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 30);
      const dateString = newDate.toISOString().split('T')[0];
      setEditDate(dateString);
      if (onDateChange) {
        onDateChange(dateString);
      }
    }
  }, [onPostpone, onDateChange]);

  const handleSaveDate = useCallback(() => {
    if (onDateChange) {
      onDateChange(editDate);
    }
    setIsEditing(false);
  }, [editDate, onDateChange]);

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
    }
    setEditDate('');
    setIsEditing(false);
  }, [onClear]);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Próxima Inspección</h4>
      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SecondaryButton onClick={handleSaveDate} style={{ padding: '8px 16px' }}>
            Guardar
          </SecondaryButton>
          <SecondaryButton onClick={() => setIsEditing(false)} style={{ padding: '8px 16px' }}>
            Cancelar
          </SecondaryButton>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-gray-900 font-medium">
            {fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'No programada'}
          </p>
          <div className="flex gap-2">
            <SecondaryButton onClick={() => setIsEditing(true)} style={{ padding: '8px 16px' }}>
              Establecer Fecha
            </SecondaryButton>
            <SecondaryButton onClick={handlePostpone} style={{ padding: '8px 16px' }}>
              Posponer 30 días
            </SecondaryButton>
            {fecha && (
              <SecondaryButton onClick={handleClear} style={{ padding: '8px 16px' }}>
                Limpiar
              </SecondaryButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
