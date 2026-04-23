'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { Inspection } from '@/types/inspection';

export function useInspectionDetail(inspection: Inspection | null) {
  // Count items by result type
  const itemCounts = useMemo(() => {
    if (!inspection) {
      return { bien: 0, observacion: 0, falla: 0 };
    }

    const counts = {
      bien: 0,
      observacion: 0,
      falla: 0,
    };

    inspection.categorias.forEach((category) => {
      category.items.forEach((item) => {
        counts[item.resultado]++;
      });
    });

    return counts;
  }, [inspection]);

  // Handle escape key to close modal
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Emit event to close modal
      window.dispatchEvent(new Event('closeInspectionDetail'));
    }
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (inspection) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [inspection, handleEscape]);

  return {
    itemCounts,
  };
}
