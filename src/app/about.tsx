import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Linking,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Shield, Star, Award, Wind, MessageCircle, Mail } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';

const VERSION = '1.0.0';

const STEPS = [
  {
    emoji: '📝',
    title: 'Regístrate gratis',
    desc: 'Crea tu cuenta con email y contraseña. Obtienes puntos ecológicos desde el primer día.',
  },
  {
    emoji: '📸',
    title: 'Publica lo que ya no usas',
    desc: 'Toma fotos de objetos que tengas en casa, describe lo que buscas a cambio y publícalos en el mapa.',
  },
  {
    emoji: '🗺️',
    title: 'Explora el mapa',
    desc: 'Busca trueques cercanos a tu ubicación. Filtra por categoría, radio de distancia o palabras clave.',
  },
  {
    emoji: '🤝',
    title: 'Propón un trueque',
    desc: 'Cuando encuentres algo que te interese, envía una solicitud de trueque al dueño del objeto.',
  },
  {
    emoji: '💬',
    title: 'Coordina por chat',
    desc: 'Usa el chat integrado para hablar con la otra persona, acordar detalles y elegir un sitio seguro para el intercambio.',
  },
  {
    emoji: '🌿',
    title: 'Gana EcoPoints',
    desc: 'Cada trueque completado te suma puntos ecológicos. Sube de nivel y desbloquea logros por cuidar el planeta.',
  },
];

const FEATURES = [
  { icon: MapPin,        label: 'Mapa interactivo',      desc: 'Visualiza trueques en tiempo real cerca de ti en todo Venezuela.' },
  { icon: Shield,        label: 'Sitios seguros',         desc: 'Puntos de intercambio verificados como centros comerciales y metros.' },
  { icon: Star,          label: 'Sistema de reseñas',     desc: 'Califica y lee opiniones sobre otros usuarios para intercambios confiables.' },
  { icon: Award,         label: 'Niveles ecológicos',     desc: 'Desde Semilla hasta Leyenda Verde — sube de nivel con cada trueque.' },
  { icon: Wind,          label: 'Impacto CO₂',            desc: 'Cada trueque calcula cuántos kg de CO₂ evitaste enviar al planeta.' },
  { icon: MessageCircle, label: 'Chat en tiempo real',    desc: 'Mensajes instantáneos entre usuarios para coordinar el intercambio.' },
];

const ECO_LEVELS = [
  { emoji: '🌱', name: 'Semilla',      pts: '0 pts',    desc: 'Tu primer paso en el mundo del trueque' },
  { emoji: '🌿', name: 'Brote',        pts: '100 pts',  desc: 'Ya conoces el camino ecológico' },
  { emoji: '🍃', name: 'Guardián',     pts: '300 pts',  desc: 'Proteges el entorno con tus acciones' },
  { emoji: '🌳', name: 'Protector',    pts: '700 pts',  desc: 'Un pilar de la comunidad verde' },
  { emoji: '🦋', name: 'Héroe Eco',    pts: '1500 pts', desc: 'Tu impacto inspira a otros' },
  { emoji: '🌍', name: 'Leyenda Verde',pts: '3000 pts', desc: 'El nivel más alto. Eres referente ecológico' },
];

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();

  const openEmail = () => {
    Linking.openURL('mailto:soporte@ecotrueque.ve?subject=Consulta EcoTrueque').catch(() => {});
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#085041', '#0F6E56', '#1D9E75']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#fff" strokeWidth={1.75} />
        </TouchableOpacity>
        <Text style={styles.headerEmoji}>🌿</Text>
        <Text style={styles.headerTitle}>EcoTrueque Venezuela</Text>
        <Text style={styles.headerSub}>Versión {VERSION} · Intercambia. Recicla. Cuida el planeta.</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── ¿QUÉ ES? ─────────────────────────────── */}
        <Section title="¿Qué es EcoTrueque?" isDark={isDark} theme={theme}>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            EcoTrueque es una plataforma de intercambio de objetos entre venezolanos.
            En lugar de comprar o tirar cosas, puedes{' '}
            <Text style={{ color: COLORS.primary, fontWeight: TYPOGRAPHY.weight.semibold }}>
              intercambiarlas por lo que realmente necesitas
            </Text>
            , reduciendo residuos y ahorrando dinero.
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary, marginTop: SPACING.sm }]}>
            Cada trueque que realizas evita que objetos útiles terminen en la basura,
            reduce tu huella de carbono y te acerca a una comunidad que comparte tus valores ecológicos.
          </Text>
        </Section>

        {/* ── CÓMO FUNCIONA ─────────────────────────── */}
        <Section title="¿Cómo funciona?" isDark={isDark} theme={theme}>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: COLORS.primary + '18' }]}>
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
              </View>
              <View style={styles.stepText}>
                <Text style={[styles.stepTitle, { color: theme.text }]}>
                  {i + 1}. {step.title}
                </Text>
                <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                  {step.desc}
                </Text>
              </View>
            </View>
          ))}
        </Section>

        {/* ── FUNCIONALIDADES ───────────────────────── */}
        <Section title="Funcionalidades" isDark={isDark} theme={theme}>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.featureCard,
                  { backgroundColor: isDark ? '#1A1A18' : '#F8FAF9', borderColor: theme.border },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: COLORS.primary + '18' }]}>
                  <f.icon size={20} color={COLORS.primary} strokeWidth={1.75} />
                </View>
                <Text style={[styles.featureLabel, { color: theme.text }]}>{f.label}</Text>
                <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ── NIVELES ECOLÓGICOS ────────────────────── */}
        <Section title="Niveles ecológicos" isDark={isDark} theme={theme}>
          <Text style={[styles.paragraph, { color: theme.textSecondary, marginBottom: SPACING.md }]}>
            Mientras más trueques realizas, más EcoPoints acumulas y subes de nivel.
          </Text>
          {ECO_LEVELS.map((lvl, i) => (
            <View
              key={i}
              style={[
                styles.levelRow,
                { borderBottomColor: theme.border },
                i === ECO_LEVELS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.levelEmoji}>{lvl.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.levelHeader}>
                  <Text style={[styles.levelName, { color: theme.text }]}>{lvl.name}</Text>
                  <Text style={[styles.levelPts, { color: COLORS.primary }]}>{lvl.pts}</Text>
                </View>
                <Text style={[styles.levelDesc, { color: theme.textSecondary }]}>{lvl.desc}</Text>
              </View>
            </View>
          ))}
        </Section>

        {/* ── SITIOS SEGUROS ────────────────────────── */}
        <Section title="Sitios seguros de intercambio" isDark={isDark} theme={theme}>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            Para tu seguridad, EcoTrueque incluye un mapa de sitios verificados donde puedes
            realizar tus intercambios con confianza:{' '}
            <Text style={{ color: theme.text, fontWeight: TYPOGRAPHY.weight.medium }}>
              centros comerciales, estaciones del metro, comisarías y más.
            </Text>
          </Text>
          <View style={[styles.tipBox, { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary + '30' }]}>
            <Shield size={16} color={COLORS.primary} strokeWidth={1.75} />
            <Text style={[styles.tipText, { color: COLORS.primaryDark }]}>
              Siempre coordina el intercambio en lugares públicos y concurridos. Tu seguridad es lo primero.
            </Text>
          </View>
        </Section>

        {/* ── CONTACTO ──────────────────────────────── */}
        <Section title="Ayuda y contacto" isDark={isDark} theme={theme}>
          <Text style={[styles.paragraph, { color: theme.textSecondary, marginBottom: SPACING.md }]}>
            ¿Tienes alguna pregunta, sugerencia o problema? Contáctanos.
          </Text>
          <TouchableOpacity
            onPress={openEmail}
            style={[styles.contactBtn, { backgroundColor: COLORS.primary }]}
            activeOpacity={0.85}
          >
            <Mail size={16} color="#fff" strokeWidth={1.75} />
            <Text style={styles.contactBtnText}>soporte@ecotrueque.ve</Text>
          </TouchableOpacity>
        </Section>

        {/* ── PIE ───────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>
            🌿 EcoTrueque Venezuela · v{VERSION}
          </Text>
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>
            © 2025 · Hecho con ❤️ en Venezuela
          </Text>
        </View>

        <View style={{ height: insets.bottom + SPACING['2xl'] }} />
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  children,
  isDark,
  theme,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
  theme: any;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionAccent, { backgroundColor: COLORS.primary }]} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    alignItems: 'center',
    paddingBottom: SPACING['2xl'],
    paddingHorizontal: SPACING.base,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: SPACING.base,
    top: 56,
    padding: SPACING.xs,
  },
  headerEmoji: { fontSize: 52, marginTop: 8 },
  headerTitle: {
    color: '#fff',
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: SPACING.sm,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: TYPOGRAPHY.size.sm,
    marginTop: 6,
    textAlign: 'center',
  },

  content: { paddingHorizontal: SPACING.base },

  section: { marginTop: SPACING['2xl'] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  sectionAccent: { width: 4, height: 20, borderRadius: 2 },
  sectionTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },

  paragraph: { fontSize: TYPOGRAPHY.size.base, lineHeight: 24 },

  stepRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg, alignItems: 'flex-start' },
  stepNumber: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepEmoji: { fontSize: 22 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 3 },
  stepDesc: { fontSize: TYPOGRAPHY.size.sm, lineHeight: 20 },

  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  featureCard: {
    width: '47%',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  featureLabel: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  featureDesc: { fontSize: TYPOGRAPHY.size.xs, lineHeight: 18 },

  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  levelEmoji: { fontSize: 28, width: 36, textAlign: 'center' },
  levelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelName: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  levelPts: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  levelDesc: { fontSize: TYPOGRAPHY.size.xs, marginTop: 2 },

  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  tipText: { flex: 1, fontSize: TYPOGRAPHY.size.sm, lineHeight: 20 },

  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  contactBtnText: { color: '#fff', fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },

  footer: { alignItems: 'center', gap: SPACING.xs, marginTop: SPACING['2xl'], paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  footerText: { fontSize: TYPOGRAPHY.size.xs },
});
