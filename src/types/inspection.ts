export type InspectionStatus = 'aprobada' | 'rechazada' | 'pendiente' | 'en_progreso';
export type VehicleType = 'sedan' | 'suv' | 'camioneta' | 'camion' | 'motocicleta' | 'bus';
export type Severity = 'baja' | 'media' | 'alta' | 'critica';
export type InspectionResult = 'bien' | 'observacion' | 'falla';

export interface InspectionItem {
  nombre: string;
  resultado: InspectionResult;
  observacion?: string;
  severidad?: Severity;
}

export interface InspectionCategory {
  categoria: string;
  items: InspectionItem[];
}

export interface Inspection {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  año: number;
  tipo: VehicleType;
  inspector: string;
  fecha: string;
  estado: InspectionStatus;
  categorias: InspectionCategory[];
  observacionesGenerales?: string;
  proximaInspeccion?: string;
}

export interface DashboardStats {
  total: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
  tasaAprobacion: string;
}
