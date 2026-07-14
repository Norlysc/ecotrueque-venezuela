import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  useColorScheme, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, Package, MessageCircle, Flag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@services/auth.service';
import { tradesService } from '@services/trades.service';
import { usePublicUserListings } from '@hooks/useListings';
import { Avatar } from '@components/ui/Avatar';
import { Badge } from '@components/ui/Badge';
import { ListingCard } from '@components/listing/ListingCard';
import { ECO_LEVELS, getEcoLevel, COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import type { Review } from '@/types/app.types';

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          color="#FFC107"
          fill={s <= Math.round(rating) ? '#FFC107' : 'transparent'}
          strokeWidth={1.5}
        />
      ))}
    </View>
  );
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => authService.getProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });

  const { data: listings, isLoading: isLoadingListings } = usePublicUserListings(userId);

  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: () => tradesService.getMyReviews(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });

  const ecoLevel = getEcoLevel(profile?.eco_points ?? 0);
  const levelInfo = ECO_LEVELS[ecoLevel];
  const reputationScore = profile?.reputation_score ?? 0;

  if (isLoadingProfile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingHeader, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={theme.text} strokeWidth={1.75} />
          </TouchableOpacity>
        </View>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingHeader, { paddingTop: insets.top + 8, backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={22} color={theme.text} strokeWidth={1.75} />
          </TouchableOpacity>
        </View>
        <Text style={[{ color: theme.textSecondary, textAlign: 'center', marginTop: 60 }]}>
          Usuario no encontrado
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header gradient */}
        <LinearGradient
          colors={['#085041', '#0F6E56', '#1D9E75']}
          style={[styles.header, { paddingTop: insets.top + 48 }]}
        >
          <Avatar
            uri={profile.avatar_url ?? null}
            name={profile.full_name}
            size="2xl"
            ecoLevel={ecoLevel}
            isDark={false}
          />

          <Text style={styles.profileName}>{profile.full_name}</Text>
          {(profile.city || profile.state) && (
            <Text style={styles.profileLocation}>
              📍 {[profile.city, profile.state].filter(Boolean).join(', ')}
            </Text>
          )}

          {/* Badges */}
          <View style={styles.badgesRow}>
            {profile.is_verified && <Badge label="✓ Verificado" variant="verified" size="sm" />}
            <Badge label={`${levelInfo.emoji} ${levelInfo.label}`} variant="eco" size="sm" />
          </View>

          {/* Rating */}
          {reputationScore > 0 && (
            <View style={styles.ratingRow}>
              <StarRow rating={reputationScore} size={18} />
              <Text style={styles.ratingText}>{reputationScore.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>
                ({(reviews ?? []).length} reseña{(reviews ?? []).length !== 1 ? 's' : ''})
              </Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Trueques', value: profile.total_trades },
              { label: 'EcoPoints', value: profile.eco_points },
              { label: 'Activos', value: profile.active_listings_count },
            ].map(stat => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Bio */}
        {profile.bio && (
          <View style={[styles.bioCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.bioText, { color: theme.textSecondary }]}>{profile.bio}</Text>
          </View>
        )}

        {/* Tabs */}
        <View style={[styles.tabsRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('listings')}
            style={[styles.tabItem, activeTab === 'listings' && { borderBottomColor: COLORS.primary, borderBottomWidth: 2 }]}
          >
            <Package size={16} color={activeTab === 'listings' ? COLORS.primary : theme.textSecondary} strokeWidth={1.75} />
            <Text style={[styles.tabLabel, { color: activeTab === 'listings' ? COLORS.primary : theme.textSecondary }]}>
              Publicaciones ({(listings ?? []).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('reviews')}
            style={[styles.tabItem, activeTab === 'reviews' && { borderBottomColor: COLORS.primary, borderBottomWidth: 2 }]}
          >
            <Star size={16} color={activeTab === 'reviews' ? COLORS.primary : theme.textSecondary} strokeWidth={1.75} />
            <Text style={[styles.tabLabel, { color: activeTab === 'reviews' ? COLORS.primary : theme.textSecondary }]}>
              Reseñas ({(reviews ?? []).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab content */}
        {activeTab === 'listings' && (
          <View style={styles.listingsGrid}>
            {isLoadingListings ? (
              <ActivityIndicator color={COLORS.primary} style={{ padding: SPACING['2xl'] }} />
            ) : (listings ?? []).length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 40 }}>📦</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Sin publicaciones activas</Text>
              </View>
            ) : (
              (listings ?? []).map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  variant="grid"
                  onPress={() => router.push(`/listing/${listing.id}`)}
                  isDark={isDark}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.reviewsList}>
            {isLoadingReviews ? (
              <ActivityIndicator color={COLORS.primary} style={{ padding: SPACING['2xl'] }} />
            ) : (reviews ?? []).length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 40 }}>⭐</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Sin reseñas todavía</Text>
              </View>
            ) : (
              (reviews ?? []).map((review: Review) => (
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
                      <StarRow rating={review.rating} size={13} />
                    </View>
                    <Text style={[styles.reviewDate, { color: theme.textTertiary }]}>
                      {new Date(review.created_at).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
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

        <View style={{ height: SPACING['3xl'] + insets.bottom }} />
      </ScrollView>

      {/* Back button — rendered after ScrollView so it sits on top */}
      <TouchableOpacity
        style={[styles.floatingBack, { top: insets.top + 8 }]}
        onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
      >
        <ArrowLeft size={20} color="#fff" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1 },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
    ...SHADOWS.xs,
  },
  backBtn: { padding: SPACING.xs },
  floatingBack: {
    position: 'absolute',
    left: SPACING.base,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingBottom: SPACING['2xl'],
    paddingHorizontal: SPACING.base,
  },
  profileName: {
    color: '#fff',
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  profileLocation: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: TYPOGRAPHY.size.sm,
    marginTop: 4,
  },
  badgesRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm, flexWrap: 'wrap', justifyContent: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md },
  ratingText: { color: '#fff', fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold },
  ratingCount: { color: 'rgba(255,255,255,0.7)', fontSize: TYPOGRAPHY.size.sm },
  statsRow: { flexDirection: 'row', marginTop: SPACING.lg, gap: SPACING.base },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: '#fff', fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: TYPOGRAPHY.size.xs },
  bioCard: {
    margin: SPACING.base,
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  bioText: { fontSize: TYPOGRAPHY.size.sm, lineHeight: 20 },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  tabLabel: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  reviewsList: { padding: SPACING.base, gap: SPACING.sm },
  reviewCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.base,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  reviewerName: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 2 },
  reviewDate: { fontSize: TYPOGRAPHY.size.xs },
  reviewComment: { fontSize: TYPOGRAPHY.size.sm, fontStyle: 'italic' },
  emptyState: { flex: 1, alignItems: 'center', paddingVertical: SPACING['3xl'], gap: SPACING.md, width: '100%' },
  emptyText: { fontSize: TYPOGRAPHY.size.base, textAlign: 'center' },
});
