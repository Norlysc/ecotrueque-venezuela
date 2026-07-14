import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  Platform,
  Share,
  Linking,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { Settings, ChevronRight, Edit3, Shield, Bell, Share2, HelpCircle, Info, LogOut, Moon, Sun, Monitor } from 'lucide-react-native';
import { useThemeStore } from '@stores/themeStore';
import { useDeleteListing } from '@hooks/useListings';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@stores/authStore';
import { useUserListings } from '@hooks/useListings';
import { useAuth } from '@hooks/useAuth';
import { useTradeHistory, useMyReviews } from '@hooks/useTrades';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar } from '@components/ui/Avatar';
import { Badge } from '@components/ui/Badge';
import { ListingCard } from '@components/listing/ListingCard';
import { ECO_LEVELS, getEcoLevel, COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import type { Listing } from '@/types/app.types';

const TABS = ['Publicaciones', 'Historial', 'Reseñas'] as const;
type TabId = typeof TABS[number];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('Publicaciones');

  const { data: myListings } = useUserListings();
  const { data: tradeHistory } = useTradeHistory();
  const { data: myReviews } = useMyReviews();
  const { mutate: deleteListing } = useDeleteListing();
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();

  const cycleTheme = () => {
    const next = themeMode === 'system' ? 'dark' : themeMode === 'dark' ? 'light' : 'system';
    setThemeMode(next);
  };

  const themeLabel = themeMode === 'dark' ? 'Modo oscuro' : themeMode === 'light' ? 'Modo claro' : 'Tema del sistema';
  const ThemeIcon = themeMode === 'dark' ? Moon : themeMode === 'light' ? Sun : Monitor;

  const handleDeleteListing = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) {
        deleteListing(id);
      }
    } else {
      Alert.alert(
        'Eliminar publicación',
        '¿Estás seguro? Esta acción no se puede deshacer.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => deleteListing(id) },
        ]
      );
    }
  };

  const level = getEcoLevel(profile?.eco_points ?? 0);
  const levelInfo = ECO_LEVELS[level];
  const nextLevelKey = Object.keys(ECO_LEVELS).find(
    (k) => ECO_LEVELS[k as keyof typeof ECO_LEVELS].minPoints > (profile?.eco_points ?? 0)
  );
  const nextLevel = nextLevelKey ? ECO_LEVELS[nextLevelKey as keyof typeof ECO_LEVELS] : null;

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro que quieres cerrar sesión?')) {
        signOut();
      }
      return;
    }
    Alert.alert('Cerrar sesión', '¿Estás seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleShareProfile = async () => {
    const text = `¡Hola! Únete a EcoTrueque Venezuela y empieza a intercambiar objetos de forma ecológica 🌿\nhttps://ecotrueque.ve`;
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try { await navigator.share({ title: 'EcoTrueque Venezuela', text }); } catch {}
      } else {
        await navigator.clipboard?.writeText(text);
        Toast.show({ type: 'success', text1: 'Enlace copiado', text2: 'Comparte EcoTrueque con tus amigos' });
      }
    } else {
      await Share.share({ message: text });
    }
  };

  const handleHelp = () => {
    const email = 'soporte@ecotrueque.ve';
    const subject = encodeURIComponent('Ayuda y soporte — EcoTrueque');
    Linking.openURL(`mailto:${email}?subject=${subject}`).catch(() => {
      Toast.show({ type: 'info', text1: 'Soporte', text2: `Escríbenos a ${email}` });
    });
  };

  const handleAbout = () => {
    router.push('/about');
  };

  const handleComingSoon = (feature: string) => {
    Toast.show({ type: 'info', text1: 'Próximamente', text2: `${feature} estará disponible pronto` });
  };

  const MENU_ITEMS = [
    { icon: Edit3,       label: 'Editar perfil',          onPress: () => router.push('/edit-profile') },
    { icon: Shield,      label: 'Sitios seguros',          onPress: () => router.push('/(tabs)/map') },
    { icon: Bell,        label: 'Notificaciones',          onPress: () => router.push('/notifications') },
    { icon: ThemeIcon,   label: themeLabel,                onPress: cycleTheme, isTheme: true },
    { icon: Share2,      label: 'Compartir perfil',        onPress: handleShareProfile },
    { icon: HelpCircle,  label: 'Ayuda y soporte',         onPress: handleHelp },
    { icon: Info,        label: 'Acerca de EcoTrueque',    onPress: handleAbout },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header con gradiente */}
      <LinearGradient
        colors={['#085041', '#0F6E56', '#1D9E75']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity style={styles.settingsBtn}>
          <Settings size={22} color="rgba(255,255,255,0.8)" strokeWidth={1.75} />
        </TouchableOpacity>

        <Avatar
          uri={profile?.avatar_url ?? null}
          name={profile?.full_name ?? ''}
          size="2xl"
          ecoLevel={level}
          isDark={isDark}
        />

        <Text style={styles.profileName}>{profile?.full_name ?? 'Usuario'}</Text>
        <Text style={styles.profileLocation}>
          📍 {profile?.city ?? ''} {profile?.state ? `, ${profile.state}` : ''}
        </Text>

        <View style={styles.badgesRow}>
          {profile?.is_verified && <Badge label="Verificado" variant="verified" size="sm" />}
          <Badge
            label={`${levelInfo.emoji} ${levelInfo.label}`}
            variant="eco"
            size="sm"
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Trueques', value: profile?.total_trades ?? 0 },
            { label: 'Reputación', value: `${(profile?.reputation_score ?? 0).toFixed(1)}⭐` },
            { label: 'Activos', value: profile?.active_listings_count ?? 0 },
            { label: 'EcoPoints', value: profile?.eco_points ?? 0 },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Mini card eco */}
      <TouchableOpacity
        onPress={() => router.push('/eco/dashboard')}
        style={[styles.ecoMiniCard, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0' }]}
        activeOpacity={0.8}
      >
        <View style={styles.ecoMiniContent}>
          <Text style={styles.ecoMiniEmoji}>{levelInfo.emoji}</Text>
          <View>
            <Text style={[styles.ecoMiniTitle, { color: COLORS.primaryDark }]}>
              {levelInfo.label} · {profile?.eco_points ?? 0} pts
            </Text>
            {nextLevel && (
              <Text style={[styles.ecoMiniSubtitle, { color: COLORS.primary }]}>
                {nextLevel.minPoints - (profile?.eco_points ?? 0)} pts para {nextLevel.label}
              </Text>
            )}
          </View>
        </View>
        <ChevronRight size={18} color={COLORS.primary} strokeWidth={1.75} />
      </TouchableOpacity>

      {/* Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabItem,
              activeTab === tab && { borderBottomColor: COLORS.primary, borderBottomWidth: 2 },
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab ? COLORS.primary : theme.textSecondary },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenido del tab */}
      <View style={styles.tabContent}>
        {activeTab === 'Publicaciones' && (
          <View style={styles.listingsGrid}>
            {(myListings ?? []).map((listing: Listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                variant="grid"
                onPress={() => router.push(`/listing/${listing.id}`)}
                isDark={isDark}
                ownerActions={{
                  onEdit: () => router.push(`/edit-listing/${listing.id}`),
                  onDelete: () => handleDeleteListing(listing.id),
                }}
              />
            ))}
            {(myListings ?? []).length === 0 && (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyEmoji}>📦</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Aún no tienes publicaciones
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'Historial' && (
          <View style={styles.historialList}>
            {(tradeHistory ?? []).length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyEmoji}>🔄</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Sin historial de trueques aún
                </Text>
              </View>
            ) : (
              (tradeHistory ?? []).map((trade: any) => (
                <View key={trade.id} style={[styles.tradeHistoryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.tradeHistoryItems}>
                    <View style={styles.tradeHistoryItem}>
                      <Text style={[styles.tradeHistoryItemLabel, { color: theme.textTertiary }]}>Intercambiaste</Text>
                      <Text style={[styles.tradeHistoryItemName, { color: theme.text }]} numberOfLines={2}>
                        {trade.offered_listing?.title ?? '—'}
                      </Text>
                    </View>
                    <Text style={styles.tradeHistoryArrow}>🔄</Text>
                    <View style={styles.tradeHistoryItem}>
                      <Text style={[styles.tradeHistoryItemLabel, { color: theme.textTertiary }]}>Por</Text>
                      <Text style={[styles.tradeHistoryItemName, { color: theme.text }]} numberOfLines={2}>
                        {trade.requested_listing?.title ?? '—'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tradeHistoryMeta}>
                    <Text style={[styles.tradeHistoryDate, { color: theme.textTertiary }]}>
                      {formatDistanceToNow(new Date(trade.completed_at ?? trade.created_at), { locale: es, addSuffix: true })}
                    </Text>
                    {trade.eco_impact_total?.co2_saved_kg > 0 && (
                      <Text style={[styles.tradeHistoryEco, { color: COLORS.primary }]}>
                        🌿 +{trade.eco_impact_total.co2_saved_kg} kg CO₂
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'Reseñas' && (
          <View style={styles.reviewsList}>
            {(myReviews ?? []).length === 0 ? (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyEmoji}>⭐</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Sin reseñas todavía
                </Text>
              </View>
            ) : (
              (myReviews ?? []).map((review: any) => (
                <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.reviewHeader}>
                    <Avatar
                      uri={review.reviewer?.avatar_url ?? null}
                      name={review.reviewer?.full_name ?? ''}
                      size="sm"
                      isDark={isDark}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reviewerName, { color: theme.text }]}>
                        {review.reviewer?.full_name ?? 'Usuario'}
                      </Text>
                      <Text style={[styles.reviewDate, { color: theme.textTertiary }]}>
                        {formatDistanceToNow(new Date(review.created_at), { locale: es, addSuffix: true })}
                      </Text>
                    </View>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Text key={s} style={{ fontSize: 14 }}>{s <= review.rating ? '⭐' : '☆'}</Text>
                      ))}
                    </View>
                  </View>
                  {review.comment && (
                    <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>
                      "{review.comment}"
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </View>

      {/* Menú */}
      <View style={[styles.menuSection, { backgroundColor: theme.surface }]}>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            style={[
              styles.menuItem,
              i < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}
          >
            <View style={[styles.menuIconBg, { backgroundColor: isDark ? '#252523' : '#F0F2F5' }]}>
              <item.icon size={18} color={COLORS.primary} strokeWidth={1.75} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.text, flex: 1 }]}>{item.label}</Text>
            {(item as any).isTheme ? (
              /* Pastilla indicadora del modo activo */
              <View style={[styles.themeBadge, { backgroundColor: isDark ? '#252523' : '#E8F5F0' }]}>
                <Text style={[styles.themeBadgeText, { color: COLORS.primary }]}>
                  {themeMode === 'dark' ? '🌙' : themeMode === 'light' ? '☀️' : '⚙️'}
                </Text>
              </View>
            ) : (
              <ChevronRight size={16} color={theme.textTertiary} strokeWidth={1.75} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity onPress={handleSignOut} style={[styles.signOutBtn, { backgroundColor: theme.surface }]}>
        <LogOut size={18} color={COLORS.error} strokeWidth={1.75} />
        <Text style={[styles.signOutText, { color: COLORS.error }]}>Cerrar sesión</Text>
      </TouchableOpacity>

      <View style={{ height: SPACING['3xl'] + insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingBottom: SPACING['2xl'],
    paddingHorizontal: SPACING.base,
    position: 'relative',
  },
  settingsBtn: { position: 'absolute', right: SPACING.base, top: 56 },
  profileName: {
    color: '#fff',
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: SPACING.md,
  },
  profileLocation: { color: 'rgba(255,255,255,0.75)', fontSize: TYPOGRAPHY.size.sm, marginTop: 4 },
  badgesRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.base,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: '#fff', fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: TYPOGRAPHY.size.xs },
  ecoMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: SPACING.base,
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
  },
  ecoMiniContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  ecoMiniEmoji: { fontSize: 28 },
  ecoMiniTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  ecoMiniSubtitle: { fontSize: TYPOGRAPHY.size.sm },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md },
  tabLabel: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  tabContent: { minHeight: 200 },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  emptyTab: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  emptyText: { fontSize: TYPOGRAPHY.size.base, textAlign: 'center' },
  menuSection: {
    margin: SPACING.base,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    gap: SPACING.md,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: TYPOGRAPHY.size.base },
  themeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeBadgeText: { fontSize: 16 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    margin: SPACING.base,
    marginTop: 0,
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    ...SHADOWS.xs,
  },
  signOutText: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  historialList: { padding: SPACING.sm },
  tradeHistoryCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
  },
  tradeHistoryItems: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  tradeHistoryItem: { flex: 1 },
  tradeHistoryItemLabel: { fontSize: TYPOGRAPHY.size.xs, marginBottom: 2 },
  tradeHistoryItemName: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  tradeHistoryArrow: { fontSize: 20 },
  tradeHistoryMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tradeHistoryDate: { fontSize: TYPOGRAPHY.size.xs },
  tradeHistoryEco: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.medium },
  reviewsList: { padding: SPACING.sm },
  reviewCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  reviewerName: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  reviewDate: { fontSize: TYPOGRAPHY.size.xs },
  starsRow: { flexDirection: 'row', gap: 1 },
  reviewComment: { fontSize: TYPOGRAPHY.size.sm, fontStyle: 'italic' },
});
