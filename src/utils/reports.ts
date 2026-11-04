// Reglas de presentación de los reportes del panel de administración (sin acceso a red)

export type ReportStatus = 'pending' | 'reviewed' | 'resolved';
export type ReportFilter = 'all' | ReportStatus;

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  pending: 'Pendiente',
  reviewed: 'En revisión',
  resolved: 'Resuelto',
};

/** Conteo por estado para los filtros del panel */
export function countByStatus(reports: { status: ReportStatus }[]): Record<ReportFilter, number> {
  const c: Record<ReportFilter, number> = { all: reports.length, pending: 0, reviewed: 0, resolved: 0 };
  for (const r of reports) if (r.status in c) c[r.status] += 1;
  return c;
}

/** Filtra y ordena: primero los pendientes, luego en revisión y al final los resueltos; dentro, los más recientes primero */
export function filterReports<T extends { status: ReportStatus; created_at: string }>(reports: T[], filter: ReportFilter): T[] {
  const orden: Record<ReportStatus, number> = { pending: 0, reviewed: 1, resolved: 2 };
  return reports
    .filter((r) => filter === 'all' || r.status === filter)
    .sort((a, b) => orden[a.status] - orden[b.status] || b.created_at.localeCompare(a.created_at));
}

/** Acciones disponibles para un reporte según su estado y el de la publicación reportada */
export function availableActions(status: ReportStatus, listingStatus?: string | null) {
  return {
    review: status === 'pending',
    resolve: status !== 'resolved',
    reopen: status === 'resolved',
    pauseListing: listingStatus === 'active',
  };
}
