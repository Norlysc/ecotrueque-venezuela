import { achievementProgress, communityTotals, ecoPointsForTrade, equivalences, isAchievementUnlocked } from '../utils/eco';
import type { AchievementStats } from '../utils/eco';
import { getEcoLevel } from '../constants/theme';

const base: AchievementStats = {
  total_trades: 0, eco_points: 0, co2_saved_kg: 0, waste_reduced_kg: 0,
  reviews_given: 0, reviews_received: 0, reputation_score: 0,
};

describe('EcoPoints por trueque (misma fórmula que complete_trade)', () => {
  it('laptop (15 kg CO₂, 2 kg residuos) por bicicleta (5 kg, 1 kg) da 69 puntos', () => {
    expect(ecoPointsForTrade(15 + 5, 2 + 1)).toBe(69);
  });

  it('un trueque sin impacto estimado otorga los 20 puntos base', () => {
    expect(ecoPointsForTrade(0, 0)).toBe(20);
  });

  it('redondea hacia abajo como FLOOR en SQL', () => {
    expect(ecoPointsForTrade(10.3, 0.5)).toBe(42); // 20,6 + 1,5 + 20 = 42,1
  });
});

describe('Niveles ecológicos', () => {
  it.each([
    [0, 'seedling'], [69, 'seedling'], [99, 'seedling'], [100, 'sprout'], [136, 'sprout'],
    [300, 'guardian'], [700, 'protector'], [1500, 'hero'], [3000, 'legend'], [9999, 'legend'],
  ])('%i EcoPoints corresponden al nivel %s', (points, level) => {
    expect(getEcoLevel(points as number)).toBe(level);
  });
});

describe('Analogías del panel de impacto', () => {
  it('convierte 39 kg de CO₂ y 6 kg de residuos', () => {
    expect(equivalences(39, 6)).toEqual({ trees: 1, kmWithoutCar: 234, bottles: 200, litersWater: 1200 });
  });

  it('devuelve ceros sin impacto', () => {
    expect(equivalences(0, 0)).toEqual({ trees: 0, kmWithoutCar: 0, bottles: 0, litersWater: 0 });
  });
});

describe('Impacto de la comunidad', () => {
  it('no cuenta dos veces un trueque: ambas partes reciben el mismo impacto', () => {
    const totals = communityTotals([
      { co2_saved_kg: 29, waste_reduced_kg: 3.5, total_trades: 1 },
      { co2_saved_kg: 29, waste_reduced_kg: 3.5, total_trades: 1 },
    ]);
    expect(totals).toEqual({ total_co2: 29, total_waste: 3.5, total_trades: 1, total_users: 2 });
  });

  it('acepta valores NUMERIC que llegan como texto y nulos', () => {
    const totals = communityTotals([{ co2_saved_kg: '10.50', waste_reduced_kg: null, total_trades: null }, {}]);
    expect(totals.total_co2).toBeCloseTo(5.25);
    expect(totals.total_waste).toBe(0);
  });

  it('sin perfiles el impacto es cero', () => {
    expect(communityTotals([])).toEqual({ total_co2: 0, total_waste: 0, total_trades: 0, total_users: 0 });
  });
});

describe('Logros', () => {
  it('«Primera Semilla» se desbloquea con el primer trueque', () => {
    expect(isAchievementUnlocked('trades_count', 1, base)).toBe(false);
    expect(isAchievementUnlocked('trades_count', 1, { ...base, total_trades: 1 })).toBe(true);
  });

  it('«Nivel Brote» depende de los EcoPoints', () => {
    expect(isAchievementUnlocked('eco_points', 100, { ...base, eco_points: 136 })).toBe(true);
    expect(isAchievementUnlocked('eco_points', 300, { ...base, eco_points: 136 })).toBe(false);
  });

  it('«Reputación Perfecta» exige 5 estrellas con al menos 5 reseñas', () => {
    expect(achievementProgress('reputation_stars', { ...base, reputation_score: 5, reviews_received: 2 })).toBe(0);
    expect(isAchievementUnlocked('reputation_stars', 5, { ...base, reputation_score: 5, reviews_received: 5 })).toBe(true);
  });

  it('las reseñas escritas y recibidas cuentan por separado', () => {
    const s = { ...base, reviews_given: 1, reviews_received: 4 };
    expect(achievementProgress('reviews_given', s)).toBe(1);
    expect(achievementProgress('reviews_received', s)).toBe(4);
  });

  it('un tipo de requisito desconocido nunca se desbloquea', () => {
    expect(isAchievementUnlocked('otro_tipo', 1, { ...base, total_trades: 99 })).toBe(false);
  });
});
