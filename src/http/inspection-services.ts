import { api } from './api';
import { Inspection } from '@/types/inspection';

export interface GetInspectionsParams {
  status?: string;
  vehicleType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const inspectionServices = {
  // Get list of inspections
  getInspections: async (params?: GetInspectionsParams) => {
    const { data } = await api.get<Inspection[]>('/inspections', { params });
    return data;
  },

  // Get single inspection
  getInspection: async (id: string) => {
    const { data } = await api.get<Inspection>(`/inspections/${id}`);
    return data;
  },

  // Create inspection
  createInspection: async (inspection: Omit<Inspection, 'id'>) => {
    const { data } = await api.post<Inspection>('/inspections', inspection);
    return data;
  },

  // Update inspection
  updateInspection: async (id: string, inspection: Partial<Inspection>) => {
    const { data } = await api.put<Inspection>(`/inspections/${id}`, inspection);
    return data;
  },

  // Delete inspection
  deleteInspection: async (id: string) => {
    await api.delete(`/inspections/${id}`);
  },
};
