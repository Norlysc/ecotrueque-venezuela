export type CategoryId =
  | 'electronics'
  | 'clothing'
  | 'food'
  | 'books'
  | 'furniture'
  | 'tools'
  | 'services'
  | 'sports'
  | 'health'
  | 'art'
  | 'toys'
  | 'vehicles'
  | 'education'
  | 'beauty'
  | 'other';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'electronics',
    label: 'Electrónica',
    emoji: '💻',
    color: '#378ADD',
    subcategories: [
      'Teléfonos',
      'Computadoras',
      'Tablets',
      'Televisores',
      'Audio',
      'Cámaras',
      'Accesorios',
      'Electrodomésticos',
    ],
  },
  {
    id: 'clothing',
    label: 'Ropa',
    emoji: '👕',
    color: '#7F77DD',
    subcategories: [
      'Ropa de hombre',
      'Ropa de mujer',
      'Ropa infantil',
      'Zapatos',
      'Bolsos',
      'Accesorios',
      'Ropa deportiva',
      'Uniformes',
    ],
  },
  {
    id: 'food',
    label: 'Alimentos',
    emoji: '🥑',
    color: '#34C759',
    subcategories: [
      'Frutas y verduras',
      'Granos y cereales',
      'Lácteos',
      'Conservas',
      'Semillas',
      'Plantas comestibles',
      'Café y cacao',
      'Especias',
    ],
  },
  {
    id: 'books',
    label: 'Libros',
    emoji: '📚',
    color: '#EF9F27',
    subcategories: [
      'Literatura venezolana',
      'Textos escolares',
      'Libros universitarios',
      'Revistas',
      'Manga y cómics',
      'Libros técnicos',
      'Religión',
      'Autoayuda',
    ],
  },
  {
    id: 'furniture',
    label: 'Muebles',
    emoji: '🛋️',
    color: '#C87E10',
    subcategories: [
      'Sala',
      'Comedor',
      'Habitación',
      'Cocina',
      'Oficina',
      'Decoración',
      'Colchones',
      'Almacenamiento',
    ],
  },
  {
    id: 'tools',
    label: 'Herramientas',
    emoji: '🔧',
    color: '#6B7280',
    subcategories: [
      'Herramientas eléctricas',
      'Herramientas manuales',
      'Plomería',
      'Electricidad',
      'Carpintería',
      'Jardinería',
      'Mecánica',
      'Construcción',
    ],
  },
  {
    id: 'services',
    label: 'Servicios',
    emoji: '🤝',
    color: '#1D9E75',
    subcategories: [
      'Clases particulares',
      'Reparaciones',
      'Diseño gráfico',
      'Programación',
      'Fotografía',
      'Corte y costura',
      'Cocina',
      'Transporte',
    ],
  },
  {
    id: 'sports',
    label: 'Deportes',
    emoji: '⚽',
    color: '#E24B4A',
    subcategories: [
      'Fútbol',
      'Béisbol',
      'Baloncesto',
      'Ciclismo',
      'Natación',
      'Pesas y gym',
      'Artes marciales',
      'Otros deportes',
    ],
  },
  {
    id: 'health',
    label: 'Salud',
    emoji: '💊',
    color: '#34C759',
    subcategories: [
      'Equipos médicos',
      'Suplementos',
      'Plantas medicinales',
      'Movilidad',
      'Óptica',
      'Odontología',
      'Fisioterapia',
      'Bienestar',
    ],
  },
  {
    id: 'art',
    label: 'Arte',
    emoji: '🎨',
    color: '#FF6B6B',
    subcategories: [
      'Pinturas',
      'Esculturas',
      'Artesanías venezolanas',
      'Cerámica',
      'Tejidos',
      'Fotografía',
      'Música',
      'Manualidades',
    ],
  },
  {
    id: 'toys',
    label: 'Juguetes',
    emoji: '🧸',
    color: '#FF9F0A',
    subcategories: [
      'Juguetes para bebés',
      'Juguetes educativos',
      'Videojuegos',
      'Juegos de mesa',
      'Muñecas',
      'Carros y vehículos',
      'Rompecabezas',
      'Disfraces',
    ],
  },
  {
    id: 'vehicles',
    label: 'Vehículos',
    emoji: '🚗',
    color: '#374151',
    subcategories: [
      'Automóviles',
      'Motos',
      'Bicicletas',
      'Repuestos',
      'Accesorios',
      'Neumáticos',
      'Audio automotriz',
      'Otros',
    ],
  },
  {
    id: 'education',
    label: 'Educación',
    emoji: '🎓',
    color: '#5E56C4',
    subcategories: [
      'Preescolar',
      'Primaria',
      'Secundaria',
      'Universidad',
      'Idiomas',
      'Música',
      'Arte',
      'Profesional',
    ],
  },
  {
    id: 'beauty',
    label: 'Belleza',
    emoji: '💄',
    color: '#F472B6',
    subcategories: [
      'Maquillaje',
      'Skincare',
      'Cuidado del cabello',
      'Perfumes',
      'Uñas',
      'Depilación',
      'Spa',
      'Natural y orgánico',
    ],
  },
  {
    id: 'other',
    label: 'Otros',
    emoji: '📦',
    color: '#9CA3AF',
    subcategories: [
      'Coleccionables',
      'Mascotas',
      'Plantas',
      'Semillas',
      'Insumos agrícolas',
      'Material de oficina',
      'Religioso',
      'Varios',
    ],
  },
];

export const CATEGORIES_MAP = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  },
  {} as Record<CategoryId, Category>
);

export const getCategoryById = (id: CategoryId): Category =>
  CATEGORIES_MAP[id] ?? CATEGORIES[CATEGORIES.length - 1];
