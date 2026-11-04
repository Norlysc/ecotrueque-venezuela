import { supabase } from '@lib/supabase';
import type { ReportStatus } from '@utils/reports';

type PersonRef = { id: string; full_name: string; avatar_url: string | null } | null;

export interface AdminReport {
  id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
  admin_note: string | null;
  reporter: PersonRef;
  reported_user: PersonRef;
  reported_listing: { id: string; title: string; status: string } | null;
}

// Panel de administración (supabase/migrations/024_panel_administracion.sql).
// La política reports_select_admin y las funciones admin_* comprueban en el servidor que
// quien llama es administrador; la app solo muestra la pantalla a esas cuentas.
export const adminService = {
  async getReports(): Promise<AdminReport[]> {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id, reason, description, status, created_at, reviewed_at, admin_note,
        reporter:profiles!reporter_id(id, full_name, avatar_url),
        reported_user:profiles!reported_user_id(id, full_name, avatar_url),
        reported_listing:listings!reported_listing_id(id, title, status)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as AdminReport[];
  },

  async updateReport(reportId: string, status: ReportStatus, note?: string): Promise<void> {
    const { error } = await supabase.rpc('admin_update_report', { p_report_id: reportId, p_status: status, p_note: note ?? null });
    if (error) throw error;
  },

  async pauseListing(listingId: string): Promise<void> {
    const { error } = await supabase.rpc('admin_pause_listing', { p_listing_id: listingId });
    if (error) throw error;
  },
};
