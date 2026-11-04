import { describe, expect, it } from '@jest/globals';
import { REPORT_STATUS_LABEL, availableActions, countByStatus, filterReports } from '../utils/reports';
import type { ReportStatus } from '../utils/reports';

const r = (id: string, status: ReportStatus, created_at: string) => ({ id, status, created_at });
const lista = [
  r('a', 'resolved', '2026-11-01T10:00:00Z'),
  r('b', 'pending', '2026-11-02T10:00:00Z'),
  r('c', 'reviewed', '2026-11-03T10:00:00Z'),
  r('d', 'pending', '2026-11-04T10:00:00Z'),
];

describe('Panel de administración: conteo de reportes', () => {
  it('cuenta los reportes por estado y el total', () => {
    expect(countByStatus(lista)).toEqual({ all: 4, pending: 2, reviewed: 1, resolved: 1 });
  });

  it('sin reportes todos los contadores son cero', () => {
    expect(countByStatus([])).toEqual({ all: 0, pending: 0, reviewed: 0, resolved: 0 });
  });
});

describe('Panel de administración: filtro y orden', () => {
  it('«Pendientes» muestra solo los pendientes, del más reciente al más antiguo', () => {
    expect(filterReports(lista, 'pending').map((x) => x.id)).toEqual(['d', 'b']);
  });

  it('«Todos» muestra primero los pendientes, luego en revisión y al final los resueltos', () => {
    expect(filterReports(lista, 'all').map((x) => x.id)).toEqual(['d', 'b', 'c', 'a']);
  });

  it('no modifica la lista original', () => {
    const copia = lista.map((x) => x.id);
    filterReports(lista, 'all');
    expect(lista.map((x) => x.id)).toEqual(copia);
  });
});

describe('Panel de administración: acciones disponibles', () => {
  it('un reporte pendiente se puede pasar a revisión o resolver', () => {
    expect(availableActions('pending', null)).toEqual({ review: true, resolve: true, reopen: false, pauseListing: false });
  });

  it('un reporte resuelto solo se puede reabrir', () => {
    expect(availableActions('resolved', null)).toMatchObject({ review: false, resolve: false, reopen: true });
  });

  it('solo se ofrece pausar una publicación que está activa', () => {
    expect(availableActions('pending', 'active').pauseListing).toBe(true);
    expect(availableActions('pending', 'paused').pauseListing).toBe(false);
  });

  it('cada estado tiene su etiqueta en español', () => {
    expect(REPORT_STATUS_LABEL).toEqual({ pending: 'Pendiente', reviewed: 'En revisión', resolved: 'Resuelto' });
  });
});
