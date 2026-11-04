import { supabase } from '@lib/supabase';
import { getEcoLevel } from '@constants/theme';
import { achievementProgress, communityTotals, equivalences } from '@utils/eco';
import type { AchievementStats } from '@utils/eco';
import type { EcoMetrics, UserProfile } from '@/types/app.types';

export const ecoService = {
  async getMetrics(userId: string): Promise<EcoMetrics> {
    const [profileRes, achievementsRes, tradesRes, catalogRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', userId),
      supabase
        .from('trades')
        .select('*')
        .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
        .order('completed_at', { ascending: false })
        .limit(10),
      supabase.from('achievements').select('*').order('requirement_value'),
    ]);

    const profile = profileRes.data as UserProfile;
    const ecoPoints = profile?.eco_points ?? 0;
    const co2 = profile?.co2_saved_kg ?? 0;
    const waste = profile?.waste_reduced_kg ?? 0;
    const trades = profile?.total_trades ?? 0;

    const currentLevel = getEcoLevel(ecoPoints);
    const nextLevelPoints =
      currentLevel === 'legend' ? ecoPoints : [100, 300, 700, 1500, 3000, Infinity][
        ['seedling', 'sprout', 'guardian', 'protector', 'hero', 'legend'].indexOf(currentLevel) + 1
      ] ?? ecoPoints;

    return {
      eco_points: ecoPoints,
      eco_level: currentLevel,
      next_level_points: nextLevelPoints === Infinity ? ecoPoints : nextLevelPoints,
      co2_saved_kg: co2,
      waste_reduced_kg: waste,
      total_trades: trades,
      estimated_money_saved_usd: trades * 15,
      trees_equivalent: equivalences(co2, waste).trees,
      bottles_equivalent: equivalences(co2, waste).bottles,
      km_without_car: equivalences(co2, waste).kmWithoutCar,
      liters_water_saved: equivalences(co2, waste).litersWater,
      achievements: (achievementsRes.data ?? []) as any[],
      achievement_catalog: (catalogRes.data ?? []) as any[],
      recent_trades: (tradesRes.data ?? []) as any[],
    };
  },

  // Registra en user_achievements los logros alcanzados y suma su recompensa de EcoPoints.
  // Devuelve los EcoPoints resultantes si se desbloqueó algo, o null si no hubo cambios.
  async checkAndUnlockAchievements(userId: string): Promise<number | null> {
    const [profileRes, unlockedRes, catalogRes, givenRes, receivedRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', userId),
      supabase.from('achievements').select('*'),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('reviewer_id', userId),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('reviewed_id', userId),
    ]);
    const profile = profileRes.data as UserProfile | null;
    if (!profile || !catalogRes.data) return null;

    const unlockedIds = new Set((unlockedRes.data ?? []).map((ua: { achievement_id: string }) => ua.achievement_id));
    let ecoPoints = profile.eco_points ?? 0;
    let changed = false;

    // Se repite mientras haya desbloqueos, porque una recompensa puede alcanzar un logro de EcoPoints
    for (let pending = true; pending; ) {
      pending = false;
      const stats: AchievementStats = {
        total_trades: profile.total_trades ?? 0,
        eco_points: ecoPoints,
        co2_saved_kg: Number(profile.co2_saved_kg) || 0,
        waste_reduced_kg: Number(profile.waste_reduced_kg) || 0,
        reviews_given: givenRes.count ?? 0,
        reviews_received: receivedRes.count ?? 0,
        reputation_score: Number(profile.reputation_score) || 0,
      };
      for (const achievement of catalogRes.data) {
        if (unlockedIds.has(achievement.id)) continue;
        if (achievementProgress(achievement.requirement_type, stats) < achievement.requirement_value) continue;

        // La restricción UNIQUE (user_id, achievement_id) evita duplicados si dos sesiones coinciden
        const { error } = await supabase.from('user_achievements').insert({ user_id: userId, achievement_id: achievement.id });
        unlockedIds.add(achievement.id);
        if (error) continue;

        ecoPoints += achievement.points_reward ?? 0;
        changed = pending = true;
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'achievement_unlocked',
          title: '¡Logro desbloqueado!',
          body: `${achievement.title} (+${achievement.points_reward} pts)`,
          data: { achievement_id: achievement.id },
        });
      }
    }

    if (!changed) return null;
    await supabase.from('profiles').update({ eco_points: ecoPoints, eco_level: getEcoLevel(ecoPoints) }).eq('id', userId);
    return ecoPoints;
  },

  async getCommunityRanking(limit = 20, city?: string) {
    let query = supabase
      .from('profiles')
      .select('id, full_name, avatar_url, eco_points, eco_level, city, state, total_trades')
      .order('eco_points', { ascending: false })
      .limit(limit);

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async getGlobalStats() {
    const { data: totals } = await supabase
      .from('profiles')
      .select('co2_saved_kg, waste_reduced_kg, total_trades')
      .not('co2_saved_kg', 'is', null);

    return communityTotals(totals ?? []);
  },
};
