import { supabase } from '@lib/supabase';

export const REPORT_REASONS = [
  'Estafa o intento de fraude',
  'Comportamiento ofensivo o acoso',
  'Artículo falso o engañoso',
  'No se presentó al encuentro',
  'Otro motivo',
] as const;

export const reportsService = {
  // Tabla public.reports (001_initial_schema.sql); RLS solo permite insertar como reporter_id propio
  async reportUser(data: {
    reporterId: string;
    reportedUserId: string;
    listingId?: string | null;
    reason: string;
    description?: string;
  }): Promise<void> {
    const { error } = await supabase.from('reports').insert({
      reporter_id: data.reporterId,
      reported_user_id: data.reportedUserId,
      reported_listing_id: data.listingId ?? null,
      reason: data.reason,
      description: data.description?.trim() || null,
    });
    if (error) throw error;
  },
};
