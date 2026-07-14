import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  useColorScheme,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MapPin, Bell, Search, X, ChevronRight, List, Grid2x2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@stores/authStore';
import { useLocationStore } from '@stores/locationStore';
import { useNotificationStore } from '@stores/notificationStore';
import { useNearbyListings } from '@hooks/useListings';
import { useLocation } from '@hooks/useLocation';
import { Avatar } from '@components/ui/Avatar';
import { ListingCard } from '@components/listing/ListingCard';
import { ListingCardSkeleton } from '@components/ui/Skeleton';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { CATEGORIES } from '@constants/categories';
import type { CategoryId } from '@constants/categories';
import type { Listing } from '@/types/app.types';

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { city: gpsCity, state: gpsState } = useLocationStore();
  const { unreadCount } = useNotificationStore();

  // Usar la ciudad del perfil si existe; si no, la ubicación GPS
  const displayCity = profile?.city ?? gpsCity ?? null;
  const displayState = profile?.state ?? gpsState ?? null;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;

  useLocation();

  const { data: listings, isLoading, refetch, isRefetching } = useNearbyListings({
    category: selectedCategory ?? undefined,
    search_query: searchQuery || undefined,
  });

  const handleSearchFocus = useCallback((focused: boolean) => {
    setIsSearchFocused(focused);
    Animated.timing(searchAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [searchAnim]);

  const searchBorderColor = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.border, COLORS.primary],
  });

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Eco-amigo';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {getGreeting()}, 👋
            </Text>
            <Text style={[styles.name, { color: theme.text }]}>{firstName}</Text>
            {(displayCity || displayState) && (
              <View style={styles.locationRow}>
                <MapPin size={12} color={COLORS.primary} strokeWidth={1.75} />
                <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                  {displayCity ?? displayState}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/eco/dashboard')}
              style={[styles.iconBtn, { backgroundColor: isDark ? '#252523' : '#F0F2F5' }]}
            >
              <Text style={styles.ecoIcon}>🌿</Text>
            </TouchableOpacity>

            {/* Campanita — navega a notificaciones + vibración */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/notifications');
              }}
              style={[styles.iconBtn, { backgroundColor: isDark ? '#252523' : '#F0F2F5' }]}
            >
              <Bell size={20} color={theme.text} strokeWidth={1.75} />
              {unreadCount > 0 && (
                <View style={[styles.notifDot, unreadCount > 9 && styles.notifDotWide]}>
                  <Text style={styles.notifDotText}>
                    {unreadCount > 99 ? '99+' : unreadCount > 9 ? `${unreadCount}` : `${unreadCount}`}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Avatar — navega al perfil */}
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Avatar
                uri={profile?.avatar_url ?? null}
                name={profile?.full_name ?? ''}
                size="sm"
                ecoLevel={profile?.eco_level}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Buscador */}
        <Animated.View style={[styles.searchBar, { borderColor: searchBorderColor, backgroundColor: theme.surface }]}>
          <Search size={18} color={isSearchFocused ? COLORS.primary : theme.textTertiary} strokeWidth={1.75} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar trueques..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => handleSearchFocus(true)}
            onBlur={() => handleSearchFocus(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={theme.textTertiary} strokeWidth={1.75} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Banner eco */}
        <TouchableOpacity
          onPress={() => router.push('/eco/dashboard')}
          style={styles.ecoBanner}
          activeOpacity={0.85}
        >
          <View style={styles.ecoBannerContent}>
            <Text style={styles.ecoBannerEmoji}>🌍</Text>
            <View>
              <Text style={styles.ecoBannerTitle}>Impacto de tu comunidad</Text>
              <Text style={styles.ecoBannerStat}>2,400 kg CO₂ evitados este mes</Text>
            </View>
          </View>
          <ChevronRight size={18} color="rgba(255,255,255,0.8)" strokeWidth={1.75} />
        </TouchableOpacity>

        {/* Filtros de categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: !selectedCategory ? COLORS.primary : isDark ? '#252523' : '#F0F2F5',
              },
            ]}
          >
            <Text style={styles.categoryChipEmoji}>✨</Text>
            <Text
              style={[
                styles.categoryChipLabel,
                { color: !selectedCategory ? '#fff' : theme.textSecondary },
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    cat.id === selectedCategory ? COLORS.primary : isDark ? '#252523' : '#F0F2F5',
                },
              ]}
            >
              <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryChipLabel,
                  { color: cat.id === selectedCategory ? '#fff' : theme.textSecondary },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Toggle grid/lista */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedCategory
              ? CATEGORIES.find((c) => c.id === selectedCategory)?.label
              : 'Cerca de ti'}
          </Text>
          <TouchableOpacity
            onPress={() => setIsGridView(!isGridView)}
            style={[styles.viewToggle, { backgroundColor: isDark ? '#252523' : '#F0F2F5' }]}
          >
            {isGridView ? <List size={18} color={theme.textSecondary} strokeWidth={1.75} /> : <Grid2x2 size={18} color={theme.textSecondary} strokeWidth={1.75} />}
          </TouchableOpacity>
        </View>

        {/* Listings */}
        {isLoading ? (
          <View style={isGridView ? styles.grid : undefined}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} isDark={isDark} />
            ))}
          </View>
        ) : (
          <View style={isGridView ? styles.grid : undefined}>
            {(listings ?? []).map((listing: Listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                variant={isGridView ? 'grid' : 'horizontal'}
                onPress={() => router.push(`/listing/${listing.id}`)}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        {!isLoading && (listings ?? []).length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin resultados</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Intenta cambiar los filtros o ampliar el radio de búsqueda
            </Text>
          </View>
        )}

        <View style={{ height: SPACING['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.base,
    ...SHADOWS.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  greeting: { fontSize: TYPOGRAPHY.size.sm },
  name: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: TYPOGRAPHY.size.xs },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ecoIcon: { fontSize: 18 },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifDotWide: {
    minWidth: 20,
    borderRadius: 9,
  },
  notifDotText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.size.base },
  ecoBanner: {
    margin: SPACING.base,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryDark,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.green,
  },
  ecoBannerContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  ecoBannerEmoji: { fontSize: 32 },
  ecoBannerTitle: { color: 'rgba(255,255,255,0.8)', fontSize: TYPOGRAPHY.size.sm },
  ecoBannerStat: { color: '#fff', fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold },
  categoriesScroll: { marginVertical: SPACING.sm },
  categoriesContent: { paddingHorizontal: SPACING.base, gap: SPACING.sm },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  categoryChipEmoji: { fontSize: 16 },
  categoryChipLabel: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  sectionTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.bold },
  viewToggle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm,
  },
  emptyState: { alignItems: 'center', paddingVertical: SPACING['4xl'] },
  emptyEmoji: { fontSize: 56, marginBottom: SPACING.base },
  emptyTitle: { fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: TYPOGRAPHY.size.base, textAlign: 'center', paddingHorizontal: SPACING['2xl'] },
});
