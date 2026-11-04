import { describe, expect, it } from '@jest/globals';
import { APPROX_GRID_DEG, approximateCoords, formatApproxDistance } from '../utils/location';
import { formatKg, formatThousands } from '../utils/format';

// Distancia en metros entre dos puntos (fórmula del semiverseno)
function metros(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000; const r = (x: number) => (x * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

describe('Ubicación aproximada', () => {
  const valera = { latitude: 9.3177, longitude: -70.6036 };

  it('no devuelve la coordenada exacta', () => {
    const p = approximateCoords(valera.latitude, valera.longitude);
    expect(p).not.toEqual(valera);
  });

  it('se queda a menos de ~400 m del punto real (media celda de 0,005°)', () => {
    const p = approximateCoords(valera.latitude, valera.longitude);
    expect(metros(valera.latitude, valera.longitude, p.latitude, p.longitude)).toBeLessThan(400);
  });

  it('dos publicaciones cercanas de la misma celda comparten el punto mostrado', () => {
    const a = approximateCoords(9.3176, -70.6031);
    const b = approximateCoords(9.3178, -70.6039);
    expect(a).toEqual(b);
  });

  it('el punto mostrado es el centro de la celda', () => {
    const p = approximateCoords(9.3177, -70.6036);
    expect(p.latitude).toBeCloseTo(9.3175, 6);
    expect(p.longitude).toBeCloseTo(-70.6025, 6);
    expect(APPROX_GRID_DEG).toBe(0.005);
  });
});

describe('Distancia aproximada', () => {
  it.each([
    [0.04, 'Menos de 1 km'], [0.99, 'Menos de 1 km'], [1.1, '1 km'], [1.3, '1,5 km'],
    [2.74, '2,5 km'], [12.8, '13 km'], [Number.NaN, 'Menos de 1 km'],
  ])('%f km se muestra como «%s»', (km, texto) => {
    expect(formatApproxDistance(km as number)).toBe(texto);
  });
});

describe('Formato de cantidades', () => {
  it.each([[0, '0'], [39, '39'], [2400, '2.400'], [1234567.6, '1.234.568'], [-1500, '-1.500']])(
    '%f → %s', (n, texto) => expect(formatThousands(n as number)).toBe(texto),
  );

  it('formatea kilogramos', () => {
    expect(formatKg(29)).toBe('29 kg');
    expect(formatKg(Number.NaN)).toBe('0 kg');
  });
});
