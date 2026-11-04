// Cálculos ecológicos puros (sin acceso a la red), compartidos por los servicios y las pruebas

/** Misma fórmula que complete_trade en 003_functions.sql: FLOOR(CO₂ × 2 + residuos × 3 + 20) */
export function ecoPointsForTrade(co2Kg: number, wasteKg: number): number {
  return Math.floor(co2Kg * 2 + wasteKg * 3 + 20);
}

/** Analogías educativas del panel de impacto */
export function equivalences(co2Kg: number, wasteKg: number) {
  return {
    trees: Math.floor(co2Kg / 21),
    kmWithoutCar: Math.floor(co2Kg * 6),
    bottles: Math.floor(wasteKg / 0.03),
    litersWater: Math.floor(wasteKg * 200),
  };
}

type ProfileTotals = { co2_saved_kg?: number | string | null; waste_reduced_kg?: number | string | null; total_trades?: number | null };

/**
 * Impacto de la comunidad a partir de los perfiles. complete_trade suma el impacto total del
 * intercambio a las dos partes, así que la suma de perfiles cuenta cada trueque dos veces.
 */
export function communityTotals(profiles: ProfileTotals[]) {
  const sum = (key: keyof ProfileTotals) => profiles.reduce((acc, p) => acc + (Number(p[key]) || 0), 0);
  return {
    total_co2: sum('co2_saved_kg') / 2,
    total_waste: sum('waste_reduced_kg') / 2,
    total_trades: sum('total_trades') / 2,
    total_users: profiles.length,
  };
}

export type AchievementStats = {
  total_trades: number;
  eco_points: number;
  co2_saved_kg: number;
  waste_reduced_kg: number;
  reviews_given: number;
  reviews_received: number;
  reputation_score: number;
};

/** Valor actual del usuario para un tipo de requisito de la tabla achievements */
export function achievementProgress(requirementType: string, s: AchievementStats): number {
  switch (requirementType) {
    case 'trades_count': return s.total_trades;
    case 'eco_points': return s.eco_points;
    case 'co2_saved_kg': return s.co2_saved_kg;
    case 'waste_reduced_kg': return s.waste_reduced_kg;
    case 'reviews_given': return s.reviews_given;
    case 'reviews_received': return s.reviews_received;
    // «Mantén 5 estrellas con 5+ reseñas»
    case 'reputation_stars': return s.reviews_received >= 5 ? s.reputation_score : 0;
    default: return 0;
  }
}

export function isAchievementUnlocked(requirementType: string, requirementValue: number, s: AchievementStats): boolean {
  return achievementProgress(requirementType, s) >= requirementValue;
}
