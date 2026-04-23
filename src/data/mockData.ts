import { Inspection } from '@/types/inspection';

export const mockInspections: Inspection[] = [
  {
    id: '1',
    placa: 'ABC-123',
    marca: 'Toyota',
    modelo: 'Camry',
    año: 2022,
    tipo: 'sedan',
    inspector: 'Juan Pérez',
    fecha: '2024-04-10',
    estado: 'aprobada',
    categorias: [
      {
        categoria: 'Motor',
        items: [
          { nombre: 'Cilindros', resultado: 'bien' },
          { nombre: 'Inyectores', resultado: 'bien' },
          { nombre: 'Correa de distribución', resultado: 'bien' },
        ],
      },
      {
        categoria: 'Frenos',
        items: [
          { nombre: 'Pastillas', resultado: 'bien' },
          { nombre: 'Discos', resultado: 'bien' },
          { nombre: 'Cilindro maestro', resultado: 'bien' },
        ],
      },
      {
        categoria: 'Luces',
        items: [
          { nombre: 'Focos delanteros', resultado: 'bien' },
          { nombre: 'Focos traseros', resultado: 'bien' },
          { nombre: 'Intermitentes', resultado: 'bien' },
        ],
      },
    ],
    observacionesGenerales: 'Vehículo en buen estado general',
    proximaInspeccion: '2025-04-10',
  },
  {
    id: '2',
    placa: 'XYZ-789',
    marca: 'Honda',
    modelo: 'CR-V',
    año: 2021,
    tipo: 'suv',
    inspector: 'María García',
    fecha: '2024-04-12',
    estado: 'en_progreso',
    categorias: [
      {
        categoria: 'Motor',
        items: [
          { nombre: 'Cilindros', resultado: 'bien' },
          { nombre: 'Inyectores', resultado: 'observacion', observacion: 'Leve carbonización detectada', severidad: 'baja' },
          { nombre: 'Correa de distribución', resultado: 'bien' },
        ],
      },
      {
        categoria: 'Frenos',
        items: [
          { nombre: 'Pastillas', resultado: 'observacion', observacion: 'Desgaste moderado', severidad: 'media' },
          { nombre: 'Discos', resultado: 'bien' },
          { nombre: 'Cilindro maestro', resultado: 'bien' },
        ],
      },
      {
        categoria: 'Luces',
        items: [
          { nombre: 'Focos delanteros', resultado: 'bien' },
          { nombre: 'Focos traseros', resultado: 'observacion', observacion: 'Una unidad con leve reducción de intensidad', severidad: 'baja' },
          { nombre: 'Intermitentes', resultado: 'bien' },
        ],
      },
    ],
    observacionesGenerales: 'En proceso de inspección detallada',
    proximaInspeccion: undefined,
  },
  {
    id: '3',
    placa: 'DEF-456',
    marca: 'Ford',
    modelo: 'Ranger',
    año: 2020,
    tipo: 'camioneta',
    inspector: 'Carlos López',
    fecha: '2024-04-08',
    estado: 'rechazada',
    categorias: [
      {
        categoria: 'Motor',
        items: [
          { nombre: 'Cilindros', resultado: 'falla', observacion: 'Pérdida de compresión en cilindro 3', severidad: 'critica' },
          { nombre: 'Inyectores', resultado: 'falla', observacion: 'Inyectores obstruidos', severidad: 'alta' },
          { nombre: 'Correa de distribución', resultado: 'observacion', observacion: 'Falta poco para cambio programado', severidad: 'media' },
        ],
      },
      {
        categoria: 'Frenos',
        items: [
          { nombre: 'Pastillas', resultado: 'falla', observacion: 'Desgaste extremo - requiere cambio inmediato', severidad: 'critica' },
          { nombre: 'Discos', resultado: 'falla', observacion: 'Discos dañados y deformados', severidad: 'alta' },
          { nombre: 'Cilindro maestro', resultado: 'observacion', observacion: 'Pérdida menor de fluido', severidad: 'media' },
        ],
      },
      {
        categoria: 'Luces',
        items: [
          { nombre: 'Focos delanteros', resultado: 'falla', observacion: 'No funcionan', severidad: 'alta' },
          { nombre: 'Focos traseros', resultado: 'bien' },
          { nombre: 'Intermitentes', resultado: 'falla', observacion: 'Conexión defectuosa', severidad: 'media' },
        ],
      },
    ],
    observacionesGenerales: 'Vehículo no apto para circular. Requiere reparaciones mayores antes de pasar nueva inspección',
    proximaInspeccion: undefined,
  },
  {
    id: '4',
    placa: 'GHI-321',
    marca: 'Chevrolet',
    modelo: 'Spark',
    año: 2023,
    tipo: 'sedan',
    inspector: 'Ana Martínez',
    fecha: '2024-04-15',
    estado: 'pendiente',
    categorias: [
      {
        categoria: 'Motor',
        items: [
          { nombre: 'Cilindros', resultado: 'bien' },
          { nombre: 'Inyectores', resultado: 'bien' },
          { nombre: 'Correa de distribución', resultado: 'bien' },
        ],
      },
      {
        categoria: 'Frenos',
        items: [
          { nombre: 'Pastillas', resultado: 'bien' },
          { nombre: 'Discos', resultado: 'bien' },
          { nombre: 'Cilindro maestro', resultado: 'bien' },
        ],
      },
      {
        categoria: 'Luces',
        items: [
          { nombre: 'Focos delanteros', resultado: 'bien' },
          { nombre: 'Focos traseros', resultado: 'bien' },
          { nombre: 'Intermitentes', resultado: 'bien' },
        ],
      },
    ],
    observacionesGenerales: 'Inspección pendiente de finalizar',
    proximaInspeccion: undefined,
  },
  {
    id: '5',
    placa: 'JKL-654',
    marca: 'Nissan',
    modelo: 'Altima',
    año: 2021,
    tipo: 'sedan',
    inspector: 'Roberto Silva',
    fecha: '2024-04-14',
    estado: 'aprobada',
    categorias: [
      {
        categoria: 'Motor',
        items: [
          { nombre: 'Cilindros', resultado: 'bien' },
          { nombre: 'Inyectores', resultado: 'bien' },
          { nombre: 'Correa de distribución', resultado: 'bien' },
        ],
      },
      {
        categoria: 'Frenos',
        items: [
          { nombre: 'Pastillas', resultado: 'bien' },
          { nombre: 'Discos', resultado: 'bien' },
          { nombre: 'Cilindro maestro', resultado: 'bien' },
        ],
      },
      {
        categoria: 'Luces',
        items: [
          { nombre: 'Focos delanteros', resultado: 'bien' },
          { nombre: 'Focos traseros', resultado: 'bien' },
          { nombre: 'Intermitentes', resultado: 'bien' },
        ],
      },
    ],
    observacionesGenerales: 'Vehículo en excelente estado',
    proximaInspeccion: '2025-04-14',
  },
];
