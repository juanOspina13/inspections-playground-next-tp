export const LOGIN_DEFAULTS = {
  email: 'test@example.com',
  password: 'password123',
};

export const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedán' },
  { value: 'suv', label: 'SUV' },
  { value: 'camioneta', label: 'Camioneta' },
  { value: 'camion', label: 'Camión' },
  { value: 'motocicleta', label: 'Motocicleta' },
  { value: 'bus', label: 'Bus' },
];

export const INSPECTION_STATUSES = [
  { value: 'aprobada', label: 'Aprobada', color: 'bg-green-100 text-green-800' },
  { value: 'rechazada', label: 'Rechazada', color: 'bg-red-100 text-red-800' },
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'en_progreso', label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
];

export const SEVERITY_LEVELS = [
  { value: 'baja', label: 'Baja', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'media', label: 'Media', color: 'bg-orange-100 text-orange-800' },
  { value: 'alta', label: 'Alta', color: 'bg-red-100 text-red-800' },
  { value: 'critica', label: 'Crítica', color: 'bg-red-200 text-red-900' },
];
