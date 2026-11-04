import { supabase } from '@lib/supabase';

// Tabla public.user_blocks (supabase/migrations/021_bloqueo_usuarios.sql).
// Si la migración aún no se aplicó, la lectura devuelve una lista vacía para no romper la app.
const TABLA_INEXISTENTE = ['42P01', 'PGRST205'];

export class BlocksNotAvailableError extends Error {
  constructor() {
    super('El bloqueo de usuarios aún no está activado en la base de datos');
  }
}

export const blocksService = {
  async getBlockedIds(blockerId: string): Promise<string[]> {
    const { data, error } = await supabase.from('user_blocks').select('blocked_id').eq('blocker_id', blockerId);
    if (error) {
      if (TABLA_INEXISTENTE.includes(error.code)) return [];
      throw error;
    }
    return (data ?? []).map((b: { blocked_id: string }) => b.blocked_id);
  },

  async block(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await supabase.from('user_blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
    // 23505: ya estaba bloqueado
    if (error && error.code !== '23505') {
      if (TABLA_INEXISTENTE.includes(error.code)) throw new BlocksNotAvailableError();
      throw error;
    }
  },

  async unblock(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await supabase.from('user_blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId);
    if (error) {
      if (TABLA_INEXISTENTE.includes(error.code)) throw new BlocksNotAvailableError();
      throw error;
    }
  },
};
