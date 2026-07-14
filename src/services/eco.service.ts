import { supabase } from '@lib/supabase';
import { getEcoLevel } from '@constants/theme';
import type { EcoMetrics, UserProfile } from '@/types/app.types';

const ACHIEVEMENTS_CONFIG = [
  { key: 'first_trade', requirement_type: 'trades_count', requirement_value: 1, points_reward: 50 },
  { key: 'five_trades', requirement_type: 'trades_count', requirement_value: 5, points_reward: 100 },
  { key: 'ten_trades', requirement_type: 'trades_count', requirement_value: 10, points_reward: 200 },
  { key: 'eco_guardian', requirement_type: 'eco_points', requirement_value: 300, points_reward: 150 },
  { key: 'co2_saver', requirement_type: 'co2_saved_kg', requirement_value: 50, points_reward: 100 },
  { key: 'waste_reducer', requirement_type: 'waste_reduced_kg', requirement_value: 10, points_reward: 75 },
];

export const ecoService = {
  async getMetrics(userId: string): Promise<EcoMetrics> {
    const [profileRes, achievementsRes, tradesRes] = await Promise.all([
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
      trees_equivalent: Math.floor(co2 / 21),
      bottles_equivalent: Math.floor(waste / 0.03),
      km_without_car: Math.floor(co2 * 6),
      liters_water_saved: Math.floor(waste * 200),
      achievements: (achievementsRes.data ?? []) as any[],
      recent_trades: (tradesRes.data ?? []) as any[],
    };
  },

  async checkAndUnlockAchievements(userId: string): Promise<void> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return;

    const { data: unlockedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedIds = new Set((unlockedAchievements ?? []).map((ua: any) => ua.achievement_id));

    const { data: achievements } = await supabase.from('achievements').select('*');

    for (const achievement of achievements ?? []) {
      if (unlockedIds.has(achievement.id)) continue;

      let progress = 0;
      if (achievement.requirement_type === 'trades_count') {
        progress = profile.total_trades ?? 0;
      } else if (achievement.requirement_type === 'eco_points') {
        progress = profile.eco_points ?? 0;
      } else if (achievement.requirement_type === 'co2_saved_kg') {
        progress = profile.co2_saved_kg ?? 0;
      } else if (achievement.requirement_type === 'waste_reduced_kg') {
        progress = profile.waste_reduced_kg ?? 0;
      }

      if (progress >= achievement.requirement_value) {
        await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: achievement.id,
        });

        await supabase
          .from('profiles')
          .update({ eco_points: (profile.eco_points ?? 0) + achievement.points_reward })
          .eq('id', userId);

        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'achievement_unlocked',
          title: `🏆 ¡Logro desbloqueado!`,
          body: `${achievement.emoji} ${achievement.title} (+${achievement.points_reward} pts)`,
          data: { achievement_id: achievement.id },
        });
      }
    }
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

    if (!totals) return { total_co2: 0, total_waste: 0, total_trades: 0, total_users: 0 };

    return {
      total_co2: totals.reduce((sum, p) => sum + (p.co2_saved_kg ?? 0), 0),
      total_waste: totals.reduce((sum, p) => sum + (p.waste_reduced_kg ?? 0), 0),
      total_trades: totals.reduce((sum, p) => sum + (p.total_trades ?? 0), 0),
      total_users: totals.length,
    };
  },
};
