// Ubicación aproximada: el mapa y las distancias nunca muestran el punto exacto de una publicación

/** Tamaño de la cuadrícula en grados (0,005° ≈ 550 m en latitud) */
export const APPROX_GRID_DEG = 0.005;

const toGrid = (value: number) => {
  // Centro de la celda, con redondeo a 6 decimales para evitar restos de coma flotante
  const cell = Math.floor(value / APPROX_GRID_DEG) * APPROX_GRID_DEG + APPROX_GRID_DEG / 2;
  return Math.round(cell * 1e6) / 1e6;
};

/** Lleva las coordenadas al centro de su celda de la cuadrícula */
export function approximateCoords(latitude: number, longitude: number) {
  return { latitude: toGrid(latitude), longitude: toGrid(longitude) };
}

/** Distancia aproximada para mostrar: «Menos de 1 km», o en pasos de 0,5 km */
export function formatApproxDistance(km: number): string {
  if (!Number.isFinite(km) || km < 1) return 'Menos de 1 km';
  const rounded = Math.round(km * 2) / 2;
  return `${String(rounded).replace('.', ',')} km`;
}
