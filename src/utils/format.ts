// Formatos numéricos para mostrar en pantalla (sin depender de Intl, que en Hermes es limitado)

/** Entero con punto como separador de miles: 12345.6 → "12.346" */
export function formatThousands(value: number): string {
  const n = Math.round(Number.isFinite(value) ? value : 0);
  const sign = n < 0 ? '-' : '';
  return sign + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Kilogramos redondeados: 2400.4 → "2.400 kg" */
export function formatKg(value: number): string {
  return `${formatThousands(value)} kg`;
}
