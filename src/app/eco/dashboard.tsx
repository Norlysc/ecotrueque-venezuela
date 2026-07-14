import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@stores/authStore';
import { useEcoMetrics } from '@hooks/useTrades';
import { useTotalFavorites } from '@hooks/useListings';
import { RingChart, DonutChart, AnimatedBar } from '@components/ui/Charts';
import { ECO_LEVELS, getEcoLevel, COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import type { EcoLevel } from '@/types/app.types';

const LEVEL_ORDER: EcoLevel[] = ['seedling', 'sprout', 'guardian', 'protector', 'hero', 'legend'];

export default function EcoDashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { data: metrics } = useEcoMetrics();
  const { data: totalFavorites = 0 } = useTotalFavorites(profile?.id);

  const ecoPoints = profile?.eco_points ?? 0;
  const currentLevel = getEcoLevel(ecoPoints);
  const levelInfo = ECO_LEVELS[currentLevel];
  const nextLevelKey = LEVEL_ORDER[LEVEL_ORDER.indexOf(currentLevel) + 1];
  const nextLevel = nextLevelKey ? ECO_LEVELS[nextLevelKey] : null;
  const progressToNext = nextLevel
    ? ((ecoPoints - levelInfo.minPoints) / (nextLevel.minPoints - levelInfo.minPoints)) * 100
    : 100;

  const co2Saved = profile?.co2_saved_kg ?? 0;
  const wasteReduced = profile?.waste_reduced_kg ?? 0;
  const totalTrades = profile?.total_trades ?? 0;
  const treesEquivalent = Math.floor(co2Saved / 21);
  const bottlesEquivalent = Math.floor(wasteReduced / 0.03);
  const kmWithoutCar = Math.floor(co2Saved * 6);
  const litersWaterSaved = Math.floor(wasteReduced * 200);

  const ACHIEVEMENTS = [
    { emoji: '🌱', title: 'Primera semilla', desc: 'Completa tu primer trueque', pts: 50, progress: Math.min(totalTrades / 1, 1), unlocked: totalTrades >= 1 },
    { emoji: '🔄', title: 'Cinco trueques', desc: 'Realiza 5 trueques ecológicos', pts: 100, progress: Math.min(totalTrades / 5, 1), unlocked: totalTrades >= 5 },
    { emoji: '📸', title: 'Fotógrafo', desc: 'Publica con 5 fotos', pts: 30, progress: 0, unlocked: false },
    { emoji: '⭐', title: 'Calificación perfecta', desc: 'Recibe 5 estrellas', pts: 80, progress: 0, unlocked: false },
    { emoji: '🗺️', title: 'Explorador', desc: 'Realiza trueques en 3 estados', pts: 120, progress: 0, unlocked: false },
    { emoji: '♻️', title: 'Reciclador', desc: 'Ahorra 10 kg de residuos', pts: 150, progress: Math.min(wasteReduced / 10, 1), unlocked: wasteReduced >= 10 },
    { emoji: '🌿', title: 'Guardián verde', desc: 'Alcanza nivel Guardián', pts: 200, progress: Math.min(ecoPoints / 300, 1), unlocked: ecoPoints >= 300 },
    { emoji: '🌍', title: 'Leyenda verde', desc: 'Alcanza 3000 EcoPoints', pts: 500, progress: Math.min(ecoPoints / 3000, 1), unlocked: ecoPoints >= 3000 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color={theme.text} strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mi Impacto Ecológico</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card principal nivel */}
        <LinearGradient
          colors={[COLORS.primaryDarker, COLORS.primaryDark, COLORS.primary]}
          style={styles.levelCard}
        >
          <View style={styles.levelBadge}>
            <Text style={styles.levelEmoji}>{levelInfo.emoji}</Text>
          </View>
          <Text style={styles.levelLabel}>{levelInfo.label}</Text>
          <Text style={styles.levelPoints}>{ecoPoints} EcoPoints</Text>

          {/* Barra de progreso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progressToNext, 100)}%` }]} />
            </View>
            {nextLevel && (
              <Text style={styles.progressLabel}>
                {nextLevel.minPoints - ecoPoints} pts para {nextLevel.label} {nextLevel.emoji}
              </Text>
            )}
          </View>

          <Text style={styles.levelDescription}>{levelInfo.description}</Text>
        </LinearGradient>

        {/* Grid métricas */}
        <View style={styles.metricsGrid}>
          {[
            { emoji: '🌿', label: 'CO₂ evitado', value: `${co2Saved} kg`, sub: `≈ ${treesEquivalent} árboles` },
            { emoji: '♻️', label: 'Residuos evitados', value: `${wasteReduced} kg`, sub: `≈ ${bottlesEquivalent} botellas` },
            { emoji: '💰', label: 'Dinero ahorrado', value: `$${((metrics?.estimated_money_saved_usd ?? 0)).toFixed(0)}`, sub: 'en intercambios' },
            { emoji: '🤝', label: 'Trueques', value: String(totalTrades), sub: 'completados' },
          ].map((m) => (
            <View key={m.label} style={[styles.metricCard, { backgroundColor: isDark ? '#252523' : '#F8F9FA' }]}>
              <Text style={styles.metricEmoji}>{m.emoji}</Text>
              <Text style={[styles.metricValue, { color: COLORS.primary }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: theme.text }]}>{m.label}</Text>
              <Text style={[styles.metricSub, { color: theme.textTertiary }]}>{m.sub}</Text>
            </View>
          ))}
        </View>

        {/* ── SECCIÓN ESTADÍSTICAS ── */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Estadísticas</Text>

        {/* Anillos de progreso */}
        <View style={[styles.statsCard, { backgroundColor: isDark ? '#1C1C1A' : '#fff' }]}>
          <Text style={[styles.statsCardTitle, { color: theme.text }]}>Progreso hacia metas</Text>
          <Text style={[styles.statsCardSub, { color: theme.textSecondary }]}>
            CO₂ meta 50 kg · Residuos meta 20 kg · Trueques meta 10
          </Text>
          <View style={styles.ringsRow}>
            <RingChart
              progress={co2Saved / 50}
              color="#22C55E"
              label="CO₂ evitado"
              valueText={`${co2Saved} kg`}
              emoji="🌿"
              isDark={isDark}
            />
            <RingChart
              progress={wasteReduced / 20}
              color="#3B82F6"
              label="Residuos"
              valueText={`${wasteReduced} kg`}
              emoji="♻️"
              isDark={isDark}
            />
            <RingChart
              progress={totalTrades / 10}
              color="#F59E0B"
              label="Trueques"
              valueText={String(totalTrades)}
              emoji="🤝"
              isDark={isDark}
            />
          </View>
        </View>

        {/* Distribución de impacto — dona */}
        {(co2Saved + wasteReduced + totalTrades) > 0 && (
          <View style={[styles.statsCard, { backgroundColor: isDark ? '#1C1C1A' : '#fff' }]}>
            <Text style={[styles.statsCardTitle, { color: theme.text }]}>Distribución de impacto</Text>
            <Text style={[styles.statsCardSub, { color: theme.textSecondary }]}>
              Qué actividad genera más impacto ecológico
            </Text>
            <DonutChart
              isDark={isDark}
              segments={[
                { label: 'CO₂ ahorrado',    value: co2Saved * 2,        color: '#22C55E', emoji: '🌿' },
                { label: 'Residuos',         value: wasteReduced * 3,    color: '#3B82F6', emoji: '♻️' },
                { label: 'Bonus trueques',   value: totalTrades * 20,    color: '#F59E0B', emoji: '🤝' },
                { label: 'Likes recibidos',  value: totalFavorites * 5,  color: '#EC4899', emoji: '❤️' },
              ].filter(s => s.value > 0)}
            />
          </View>
        )}

        {/* Barras de metas */}
        <View style={[styles.statsCard, { backgroundColor: isDark ? '#1C1C1A' : '#fff' }]}>
          <Text style={[styles.statsCardTitle, { color: theme.text }]}>Metas ecológicas</Text>
          <View style={styles.barsCol}>
            <AnimatedBar
              label="CO₂ evitado"
              sublabel="Meta: 50 kg"
              value={co2Saved}
              max={50}
              color="#22C55E"
              formatValue={(v) => `${v} kg`}
              isDark={isDark}
            />
            <AnimatedBar
              label="Residuos evitados"
              sublabel="Meta: 20 kg"
              value={wasteReduced}
              max={20}
              color="#3B82F6"
              formatValue={(v) => `${v} kg`}
              isDark={isDark}
            />
            <AnimatedBar
              label="Trueques completados"
              sublabel="Meta: 10 trueques"
              value={totalTrades}
              max={10}
              color="#F59E0B"
              isDark={isDark}
            />
            <AnimatedBar
              label="EcoPoints acumulados"
              sublabel="Meta: 300 pts (Guardián)"
              value={ecoPoints}
              max={300}
              color="#8B5CF6"
              formatValue={(v) => `${v} pts`}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Card huella en el planeta */}
        <View style={[styles.planetCard, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0' }]}>
          <Text style={[styles.planetTitle, { color: COLORS.primaryDark }]}>
            🌍 Tu huella en el planeta
          </Text>
          {[
            { emoji: '🌳', label: 'Árboles equivalentes', value: treesEquivalent },
            { emoji: '🚗', label: 'km sin usar auto', value: kmWithoutCar },
            { emoji: '💧', label: 'Litros de agua ahorrados', value: litersWaterSaved },
            { emoji: '❤️', label: 'Likes recibidos en tus publicaciones', value: totalFavorites },
          ].map((item) => (
            <View key={item.label} style={styles.planetRow}>
              <Text style={styles.planetItemEmoji}>{item.emoji}</Text>
              <Text style={[styles.planetItemLabel, { color: COLORS.primaryDark }]}>{item.label}</Text>
              <Text style={[styles.planetItemValue, { color: COLORS.primary }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Logros */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🏆 Logros</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((a) => (
            <View
              key={a.title}
              style={[
                styles.achievementCard,
                {
                  backgroundColor: isDark ? '#252523' : '#F8F9FA',
                  opacity: a.unlocked || a.progress > 0 ? 1 : 0.5,
                },
              ]}
            >
              <View style={styles.achievementEmoji}>
                <Text style={styles.achievementEmojiText}>{a.emoji}</Text>
                {a.unlocked && (
                  <View style={styles.unlockCheck}>
                    <Check size={10} color="#fff" strokeWidth={1.75} />
                  </View>
                )}
              </View>
              <Text style={[styles.achievementTitle, { color: theme.text }]} numberOfLines={1}>
                {a.title}
              </Text>
              <Text style={[styles.achievementPts, { color: COLORS.primary }]}>+{a.pts} pts</Text>
              {!a.unlocked && a.progress > 0 && (
                <View style={styles.achievementProgress}>
                  <View style={[styles.achievementProgressFill, { width: `${a.progress * 100}%` }]} />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Niveles eco */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Niveles EcoTrueque</Text>
        <View style={[styles.levelsContainer, { backgroundColor: isDark ? '#252523' : '#F8F9FA' }]}>
          {LEVEL_ORDER.map((levelKey, i) => {
            const lvl = ECO_LEVELS[levelKey];
            const isCurrent = levelKey === currentLevel;
            const isPast = LEVEL_ORDER.indexOf(levelKey) < LEVEL_ORDER.indexOf(currentLevel);

            return (
              <View key={levelKey} style={styles.levelRow}>
                {/* Línea conectora */}
                {i > 0 && (
                  <View
                    style={[
                      styles.levelConnector,
                      { backgroundColor: isPast || isCurrent ? COLORS.primary : theme.border },
                    ]}
                  />
                )}
                <View style={styles.levelRowContent}>
                  <View
                    style={[
                      styles.levelDot,
                      {
                        backgroundColor: isCurrent || isPast ? COLORS.primary : theme.border,
                        borderColor: isCurrent ? COLORS.primaryLight : 'transparent',
                        borderWidth: isCurrent ? 3 : 0,
                      },
                    ]}
                  >
                    <Text style={styles.levelDotEmoji}>{lvl.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.levelRowName, { color: isCurrent ? COLORS.primary : theme.text }]}>
                      {lvl.label}
                      {isCurrent && <Text style={[styles.currentTag, { color: COLORS.primary }]}> ← Tú</Text>}
                    </Text>
                    <Text style={[styles.levelRowPts, { color: theme.textTertiary }]}>
                      {lvl.minPoints === Infinity ? '3000+' : `${lvl.minPoints}`} pts
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: SPACING['3xl'] + insets.bottom }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
    ...SHADOWS.xs,
  },
  headerTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.bold },
  levelCard: {
    margin: SPACING.base,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    alignItems: 'center',
    ...SHADOWS.green,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  levelEmoji: { fontSize: 44 },
  levelLabel: { color: '#fff', fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold },
  levelPoints: { color: 'rgba(255,255,255,0.8)', fontSize: TYPOGRAPHY.size.base, marginTop: 4 },
  progressContainer: { width: '100%', marginTop: SPACING.lg, gap: SPACING.xs },
  progressBar: {
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: RADIUS.full, backgroundColor: '#fff' },
  progressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: TYPOGRAPHY.size.xs, textAlign: 'center' },
  levelDescription: { color: 'rgba(255,255,255,0.7)', fontSize: TYPOGRAPHY.size.sm, marginTop: SPACING.sm, textAlign: 'center' },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  metricCard: {
    width: '47%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    gap: 4,
  },
  metricEmoji: { fontSize: 28 },
  metricValue: { fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold },
  metricLabel: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium, textAlign: 'center' },
  metricSub: { fontSize: TYPOGRAPHY.size.xs, textAlign: 'center' },
  // Stats cards
  statsCard: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.base,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  statsCardTitle: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: 2,
  },
  statsCardSub: {
    fontSize: TYPOGRAPHY.size.xs,
    marginBottom: SPACING.base,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
  },
  barsCol: { gap: SPACING.md },
  planetCard: { marginHorizontal: SPACING.base, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base },
  planetTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.md },
  planetRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  planetItemEmoji: { fontSize: 22, width: 32 },
  planetItemLabel: { flex: 1, fontSize: TYPOGRAPHY.size.sm },
  planetItemValue: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold },
  sectionTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.bold, marginHorizontal: SPACING.base, marginBottom: SPACING.md },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  achievementCard: {
    width: '22%',
    alignItems: 'center',
    padding: SPACING.xs,
    borderRadius: RADIUS.md,
    gap: 4,
    position: 'relative',
  },
  achievementEmoji: { position: 'relative' },
  achievementEmojiText: { fontSize: 32 },
  unlockCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementTitle: { fontSize: 10, fontWeight: TYPOGRAPHY.weight.medium, textAlign: 'center' },
  achievementPts: { fontSize: 10 },
  achievementProgress: {
    width: '100%',
    height: 3,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  achievementProgressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.full },
  levelsContainer: { marginHorizontal: SPACING.base, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base },
  levelRow: { position: 'relative' },
  levelConnector: { position: 'absolute', left: 19, top: -20, width: 2, height: 20 },
  levelRowContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  levelDot: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelDotEmoji: { fontSize: 20 },
  levelRowName: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  currentTag: { fontWeight: TYPOGRAPHY.weight.bold },
  levelRowPts: { fontSize: TYPOGRAPHY.size.sm },
});
