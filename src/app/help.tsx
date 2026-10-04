import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  useColorScheme,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Mail,
  Shield,
  Info,
  AlertTriangle,
  UserRound,
  Package,
  Handshake,
  Sprout,
  LifeBuoy,
} from 'lucide-react-native';
import { IconTile } from '@components/ui/IconTile';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS } from '@constants/theme';

const SUPPORT_EMAIL = 'soporte@ecotrueque.ve';

interface Faq {
  q: string;
  a: string;
}

const FAQ_GROUPS: { icon: typeof Package; title: string; items: Faq[] }[] = [
  {
    icon: UserRound,
    title: 'Mi cuenta',
    items: [
      {
        q: '¿Cómo creo mi cuenta?',
        a: 'En la pantalla de inicio toca “Regístrate gratis”, ingresa tu nombre, correo y una contraseña de al menos 6 caracteres. Empiezas en el nivel Semilla.',
      },
      {
        q: 'Olvidé mi contraseña, ¿qué hago?',
        a: 'En “Iniciar sesión” toca “¿Olvidé mi contraseña?” e ingresa tu correo. Te llegará un enlace para crear una nueva contraseña. El enlace sirve una sola vez y vence en poco tiempo: usa siempre el correo más reciente.',
      },
      {
        q: '¿Cómo cambio mi foto o mis datos?',
        a: 'Ve a Perfil → “Editar perfil”. Ahí puedes cambiar tu foto, nombre, teléfono, ciudad y estado.',
      },
    ],
  },
  {
    icon: Package,
    title: 'Publicaciones',
    items: [
      {
        q: '¿Cómo publico algo para intercambiar?',
        a: 'Toca el botón verde “+” de la barra inferior y sigue los 4 pasos: tipo (bien o servicio) y categoría, título y qué buscas a cambio, fotos, y revisión final.',
      },
      {
        q: '¿Cuántas fotos puedo subir?',
        a: 'Hasta 5 fotos por publicación, y al menos 1 es obligatoria. Las publicaciones con buenas fotos consiguen más trueques.',
      },
      {
        q: '¿Cómo edito, pauso o elimino una publicación?',
        a: 'En tu Perfil, en la lista de tus publicaciones, usa “Editar” o “Eliminar”. Desde el detalle de la publicación también puedes pausarla y reactivarla.',
      },
    ],
  },
  {
    icon: Handshake,
    title: 'Trueques',
    items: [
      {
        q: '¿Cómo propongo un trueque?',
        a: 'Abre la publicación que te interesa y toca “Proponer trueque”. Elige cuál de tus publicaciones ofreces a cambio. El dueño recibirá una notificación y podrá aceptar o rechazar.',
      },
      {
        q: '¿Cómo se completa un trueque?',
        a: 'Cuando la solicitud es aceptada, coordinen el encuentro por el chat. Después del intercambio, ambos deben confirmar que se realizó (desde el chat o en “Solicitudes de trueque”). Al confirmar los dos, el trueque se completa y reciben sus EcoPoints.',
      },
      {
        q: '¿Qué pasa si rechazan mi solicitud?',
        a: 'Recibirás una notificación y la solicitud quedará como “Rechazado”. Tu publicación sigue activa, así que puedes proponerla en otro trueque.',
      },
      {
        q: '¿Para qué sirven las reseñas?',
        a: 'Al terminar un trueque puedes calificar a la otra persona de 1 a 5 estrellas. El promedio forma su reputación, que ayuda a la comunidad a intercambiar con confianza.',
      },
    ],
  },
  {
    icon: Sprout,
    title: 'EcoPoints y niveles',
    items: [
      {
        q: '¿Cómo gano EcoPoints?',
        a: 'Cada trueque completado te da puntos según el CO₂ y los residuos que se evitaron: CO₂ × 2 + residuos × 3 + 20 puntos de base. Además, los logros desbloqueados te dan puntos extra.',
      },
      {
        q: '¿Qué niveles existen?',
        a: 'Semilla (0), Brote (100), Guardián (300), Protector (700), Héroe Eco (1.500) y Leyenda Verde (3.000 puntos). Puedes ver tu progreso en “Mi Impacto Ecológico”.',
      },
      {
        q: '¿Cómo se calcula el impacto ecológico?',
        a: 'Cada categoría tiene un valor promedio de CO₂ y residuos evitados al reutilizar un objeto en lugar de comprar uno nuevo. Por ejemplo, un artículo de electrónica evita unos 15 kg de CO₂.',
      },
    ],
  },
];

const SAFETY_TIPS = [
  'Reúnete siempre en lugares públicos y concurridos: centros comerciales, estaciones del metro o comisarías.',
  'Prefiere hacer el intercambio de día y, si puedes, ve acompañado.',
  'Revisa bien el artículo antes de entregar el tuyo.',
  'No compartas datos bancarios ni envíes dinero por adelantado: EcoTrueque es para intercambiar, no para comprar.',
  'Revisa la reputación y las reseñas del otro usuario antes de coordinar.',
];

export default function HelpScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = normalize(query.trim());

  const groups = FAQ_GROUPS.map((g) => ({
    ...g,
    items: q ? g.items.filter((f) => normalize(f.q + ' ' + f.a).includes(q)) : g.items,
  })).filter((g) => g.items.length > 0);

  const sendEmail = (subject: string) => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`).catch(() => {
      Toast.show({ type: 'info', text1: 'Soporte', text2: `Escríbenos a ${SUPPORT_EMAIL}` });
    });
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
        <IconTile icon={LifeBuoy} size={60} iconSize={30} variant="onDark" rounded style={{ marginTop: 8 }} />
        <Text style={styles.headerTitle}>Ayuda y soporte</Text>
        <Text style={styles.headerSub}>Encuentra respuestas o escríbenos</Text>

        {/* Buscador */}
        <View style={[styles.searchBox, { backgroundColor: theme.background }]}>
          <Search size={18} color={theme.textTertiary} strokeWidth={1.75} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar en preguntas frecuentes..."
            placeholderTextColor={theme.textTertiary}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={18} color={theme.textTertiary} strokeWidth={1.75} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ── PREGUNTAS FRECUENTES ──────────────────── */}
        <Section title="Preguntas frecuentes" theme={theme}>
          {groups.length === 0 && (
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              No encontramos resultados para “{query}”. Prueba con otras palabras o escríbenos.
            </Text>
          )}
          {groups.map((g) => (
            <View key={g.title} style={styles.group}>
              <View style={styles.groupTitleRow}>
                <g.icon size={14} color={COLORS.primary} strokeWidth={2} />
                <Text style={[styles.groupTitle, { color: theme.textSecondary, marginBottom: 0 }]}>{g.title.toUpperCase()}</Text>
              </View>
              <View style={[styles.faqCard, { borderColor: theme.border, backgroundColor: isDark ? '#1A1A18' : '#F8FAF9' }]}>
                {g.items.map((f, i) => {
                  const key = `${g.title}-${f.q}`;
                  const isOpen = openKey === key || q.length > 0;
                  return (
                    <View
                      key={key}
                      style={[styles.faqItem, i > 0 && { borderTopWidth: 1, borderTopColor: theme.border }]}
                    >
                      <TouchableOpacity
                        style={styles.faqQuestion}
                        onPress={() => setOpenKey(openKey === key ? null : key)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.faqQText, { color: theme.text }]}>{f.q}</Text>
                        {isOpen ? (
                          <ChevronUp size={18} color={COLORS.primary} strokeWidth={1.75} />
                        ) : (
                          <ChevronDown size={18} color={theme.textTertiary} strokeWidth={1.75} />
                        )}
                      </TouchableOpacity>
                      {isOpen && (
                        <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>{f.a}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </Section>

        {/* ── SEGURIDAD ─────────────────────────────── */}
        <Section title="Consejos de seguridad" theme={theme}>
          <View style={[styles.tipBox, { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary + '30' }]}>
            {SAFETY_TIPS.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Shield size={16} color={COLORS.primary} strokeWidth={1.75} />
                <Text style={[styles.tipText, { color: isDark ? theme.text : COLORS.primaryDark }]}>{tip}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/map')}
            style={[styles.linkRow, { borderColor: theme.border }]}
            activeOpacity={0.8}
          >
            <Shield size={18} color={COLORS.primary} strokeWidth={1.75} />
            <Text style={[styles.linkText, { color: theme.text }]}>Ver sitios seguros en el mapa</Text>
          </TouchableOpacity>
        </Section>

        {/* ── CONTACTO ──────────────────────────────── */}
        <Section title="¿No encontraste lo que buscabas?" theme={theme}>
          <Text style={[styles.paragraph, { color: theme.textSecondary, marginBottom: SPACING.md }]}>
            Nuestro equipo te responde por correo, normalmente en menos de 48 horas.
          </Text>
          <TouchableOpacity
            onPress={() => sendEmail('Ayuda y soporte — EcoTrueque')}
            style={[styles.contactBtn, { backgroundColor: COLORS.primary }]}
            activeOpacity={0.85}
          >
            <Mail size={16} color="#fff" strokeWidth={1.75} />
            <Text style={styles.contactBtnText}>Escribir a {SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => sendEmail('Reporte de problema — EcoTrueque')}
            style={[styles.secondaryBtn, { borderColor: theme.border }]}
            activeOpacity={0.8}
          >
            <AlertTriangle size={16} color="#E53935" strokeWidth={1.75} />
            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
              Reportar un problema o un usuario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/about')}
            style={[styles.linkRow, { borderColor: theme.border }]}
            activeOpacity={0.8}
          >
            <Info size={18} color={COLORS.primary} strokeWidth={1.75} />
            <Text style={[styles.linkText, { color: theme.text }]}>Acerca de EcoTrueque</Text>
          </TouchableOpacity>
        </Section>

        <View style={{ height: insets.bottom + SPACING['3xl'] }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children, theme }: { title: string; children: React.ReactNode; theme: any }) {
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.base,
    position: 'relative',
  },
  backBtn: { position: 'absolute', left: SPACING.base, top: 56, padding: SPACING.xs },
  headerEmoji: { fontSize: 48, marginTop: 8 },
  headerTitle: {
    color: '#fff',
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: SPACING.sm,
  },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: TYPOGRAPHY.size.sm, marginTop: 6 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
    maxWidth: 560,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    height: 46,
    borderRadius: RADIUS.lg,
  },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.size.base, height: '100%' },

  content: { paddingHorizontal: SPACING.base, width: '100%', maxWidth: 820, alignSelf: 'center' },

  section: { marginTop: SPACING['2xl'] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  sectionAccent: { width: 4, height: 20, borderRadius: 2 },
  sectionTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },

  paragraph: { fontSize: TYPOGRAPHY.size.base, lineHeight: 24 },

  group: { marginBottom: SPACING.lg },
  groupTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  groupTitle: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  faqCard: { borderWidth: 1, borderRadius: RADIUS.lg, overflow: 'hidden' },
  faqItem: { paddingHorizontal: SPACING.md },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  faqQText: { flex: 1, fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium },
  faqAnswer: { fontSize: TYPOGRAPHY.size.sm, lineHeight: 21, paddingBottom: SPACING.md },

  tipBox: { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md, gap: SPACING.md },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  tipText: { flex: 1, fontSize: TYPOGRAPHY.size.sm, lineHeight: 20 },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
  },
  linkText: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium },

  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  contactBtnText: { color: '#fff', fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginTop: SPACING.sm,
  },
  secondaryBtnText: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium },
});
