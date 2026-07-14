import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
  Platform,
  useColorScheme,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Share2, Heart, MapPin, ChevronRight, Edit2, Pause, Play, MessageCircle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListingDetail, useToggleFavorite, useTradeMatches, useUpdateListing } from '@hooks/useListings';
import { useAuthStore } from '@stores/authStore';
import { chatService } from '@services/chat.service';
import type { TradeMatch, ListingImage } from '@/types/app.types';
import { Avatar } from '@components/ui/Avatar';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { ListingCard } from '@components/listing/ListingCard';
import { ListingCardSkeleton } from '@components/ui/Skeleton';
import { COLORS, THEME, ECO_LEVELS, getEcoLevel, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { CATEGORIES } from '@constants/categories';

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: '✨ Nuevo', color: COLORS.success },
  like_new: { label: '🌟 Como nuevo', color: COLORS.success },
  good: { label: '👍 Buen estado', color: COLORS.primary },
  fair: { label: '🔶 Regular', color: COLORS.warning },
  poor: { label: '🔧 Para reparar', color: COLORS.error },
};

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [imageIndex, setImageIndex] = useState(0);

  const { width: screenWidth } = useWindowDimensions();
  const { profile } = useAuthStore();
  const { data: listing, isLoading } = useListingDetail(id);
  const { mutate: toggleFavorite } = useToggleFavorite();
  const { mutate: updateListing } = useUpdateListing();
  const { data: matches } = useTradeMatches(id);

  const [isFav, setIsFav] = useState(listing?.is_favorited ?? false);
  const [chatLoading, setChatLoading] = useState(false);
  useEffect(() => { setIsFav(listing?.is_favorited ?? false); }, [listing?.is_favorited]);

  const isOwner = profile?.id === listing?.user_id;
  const category = CATEGORIES.find((c) => c.id === listing?.category);
  const ownerLevel = getEcoLevel(listing?.user?.eco_points ?? 0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/');
    }
  };

  const handleShare = async () => {
    const text = `Mira este trueque en EcoTrueque: ${listing?.title}`;
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try { await navigator.share({ title: listing?.title ?? 'EcoTrueque', text }); } catch {}
      } else {
        await navigator.clipboard?.writeText(text);
        Toast.show({ type: 'success', text1: 'Enlace copiado', text2: 'Comparte este trueque con tus contactos' });
      }
    } else {
      await Share.share({ message: text });
    }
  };

  const handleFavorite = () => {
    if (!listing) return;
    setIsFav((prev) => !prev);
    toggleFavorite({ listingId: listing.id, isFavorited: listing.is_favorited ?? false });
  };

  const handleChat = async () => {
    if (!profile?.id || !listing?.user_id || !listing?.id) return;
    setChatLoading(true);
    try {
      const conversationId = await chatService.getOrCreateListingConversation(
        profile.id,
        listing.user_id,
        listing.id
      );
      router.push(`/chat/${conversationId}`);
    } catch {
      Toast.show({ type: 'error', text1: 'No se pudo abrir el chat', text2: 'Intenta de nuevo' });
    } finally {
      setChatLoading(false);
    }
  };

  if (isLoading || !listing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.floatingHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
            <ArrowLeft size={20} color="#fff" strokeWidth={1.75} />
          </TouchableOpacity>
        </View>
        <View style={{ padding: SPACING.base, gap: SPACING.base }}>
          <ListingCardSkeleton isDark={isDark} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header flotante animado — solo visual, no intercepta eventos */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.animatedHeader,
          { paddingTop: insets.top, backgroundColor: theme.surface, opacity: headerOpacity },
        ]}
      >
        <View style={styles.headerBtnDark} />
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {listing.title}
        </Text>
        <View style={styles.headerBtnDark} />
      </Animated.View>

      {/* Botones flotantes sobre imagen */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
          <ArrowLeft size={20} color="#fff" strokeWidth={1.75} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
            <Share2 size={20} color="#fff" strokeWidth={1.75} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFavorite} style={styles.headerBtn}>
            <Heart
              size={20}
              color={isFav ? COLORS.error : '#fff'}
              fill={isFav ? COLORS.error : 'none'}
              strokeWidth={isFav ? 0 : 1.75}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* Galería de imágenes */}
        <View style={styles.gallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setImageIndex(Math.round(e.nativeEvent.contentOffset.x / screenWidth))
            }
          >
            {listing.images.length > 0 ? (
              listing.images.map((img: ListingImage, i: number) => (
                <View key={i} style={{ width: screenWidth, height: 300 }}>
                  <Image
                    source={{ uri: img.url }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                </View>
              ))
            ) : (
              <View style={{ width: screenWidth, height: 300, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#1E1E1C' : '#F0F2F5' }}>
                <Text style={{ fontSize: 72 }}>{category?.emoji ?? '📦'}</Text>
                <Text style={{ fontSize: 14, color: isDark ? '#888' : '#999', marginTop: 8 }}>Sin fotos</Text>
              </View>
            )}
          </ScrollView>

          {/* Gradiente inferior */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.galleryGradient}
          />

          {/* Badges sobre imagen */}
          <View style={styles.imageBadges}>
            <Badge label={listing.type === 'good' ? '📦 Bien' : '🤝 Servicio'} variant="info" size="sm" />
            {category && (
              <Badge label={`${category.emoji} ${category.label}`} variant="neutral" size="sm" />
            )}
          </View>

          {/* Paginación */}
          {listing.images.length > 1 && (
            <View style={styles.pagination}>
              {listing.images.map((_: ListingImage, i: number) => (
                <View
                  key={i}
                  style={[styles.paginationDot, i === imageIndex && styles.paginationDotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Contenido */}
        <View style={[styles.content, { backgroundColor: theme.background }]}>
          {/* Título y condición */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.text }]}>{listing.title}</Text>
            {listing.condition && CONDITION_LABELS[listing.condition] && (
              <Badge
                label={CONDITION_LABELS[listing.condition].label}
                variant="neutral"
                size="sm"
              />
            )}
          </View>

          {/* Busca a cambio */}
          <View style={[styles.lookingForCard, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0' }]}>
            <Text style={[styles.lookingForLabel, { color: COLORS.primaryDark }]}>
              🔄 Busca a cambio:
            </Text>
            <Text style={[styles.lookingForText, { color: COLORS.primaryDarker }]}>
              {listing.looking_for}
            </Text>
          </View>

          {/* Métricas eco */}
          <View style={styles.ecoMetrics}>
            {[
              { emoji: '🌿', label: 'CO₂ evitado', value: `${listing.eco_impact.co2_saved_kg} kg` },
              { emoji: '♻️', label: 'Residuos', value: `${listing.eco_impact.waste_reduced_kg} kg` },
              {
                emoji: '💵',
                label: 'Valor USD',
                value: listing.eco_impact.estimated_value_usd
                  ? `$${listing.eco_impact.estimated_value_usd}`
                  : 'N/A',
              },
            ].map((m) => (
              <View
                key={m.label}
                style={[styles.ecoMetric, { backgroundColor: isDark ? '#252523' : '#F8F9FA' }]}
              >
                <Text style={styles.ecoMetricEmoji}>{m.emoji}</Text>
                <Text style={[styles.ecoMetricValue, { color: COLORS.primary }]}>{m.value}</Text>
                <Text style={[styles.ecoMetricLabel, { color: theme.textTertiary }]}>{m.label}</Text>
              </View>
            ))}
          </View>

          {/* Descripción */}
          {listing.description.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Descripción</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {listing.description}
              </Text>
            </View>
          )}

          {/* Tags */}
          {listing.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {listing.tags.map((tag: string) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: isDark ? '#252523' : '#F0F2F5' }]}
                >
                  <Text style={[styles.tagText, { color: theme.textSecondary }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Ubicación */}
          {(listing.city || listing.state) && (
            <TouchableOpacity
              style={[styles.locationCard, { backgroundColor: isDark ? '#252523' : '#F8F9FA' }]}
            >
              <MapPin size={18} color={COLORS.primary} strokeWidth={1.75} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.locationText, { color: theme.text }]}>
                  {listing.city}, {listing.state}
                </Text>
                {listing.distance_km !== undefined && (
                  <Text style={[styles.distanceText, { color: COLORS.primary }]}>
                    A {listing.distance_km.toFixed(1)} km de ti
                  </Text>
                )}
              </View>
              <ChevronRight size={16} color={theme.textTertiary} strokeWidth={1.75} />
            </TouchableOpacity>
          )}

          {/* Card dueño */}
          {listing.user && (
            <TouchableOpacity
              onPress={() => listing.user?.id && router.push(`/user/${listing.user.id}`)}
              activeOpacity={0.8}
              style={[styles.ownerCard, { backgroundColor: isDark ? '#252523' : '#F8F9FA' }]}
            >
              <Avatar
                uri={listing.user.avatar_url}
                name={listing.user.full_name}
                size="md"
                ecoLevel={ownerLevel}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.ownerName, { color: theme.text }]}>{listing.user.full_name}</Text>
                <View style={styles.ownerStats}>
                  <Text style={[styles.ownerStat, { color: theme.textSecondary }]}>
                    ⭐ {listing.user.reputation_score.toFixed(1)}
                  </Text>
                  <Text style={[styles.ownerStat, { color: theme.textSecondary }]}>
                    🔄 {listing.user.total_trades} trueques
                  </Text>
                </View>
              </View>
              <View>
                {listing.user.is_verified && <Badge label="✓ Verificado" variant="verified" size="xs" />}
                <Badge label={`${ECO_LEVELS[ownerLevel].emoji} ${ECO_LEVELS[ownerLevel].label}`} variant="eco" size="xs" />
              </View>
            </TouchableOpacity>
          )}

          {/* Matches inteligentes */}
          {(matches ?? []).length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                🎯 Matches inteligentes
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Personas que buscan lo que tú tienes
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.matchesRow}>
                  {(matches ?? []).filter((m) => m?.listing != null).map((match: TradeMatch) => (
                    <View
                      key={match.listing.id}
                      style={[styles.matchCard, { backgroundColor: isDark ? '#252523' : '#F8F9FA' }]}
                    >
                      <View style={styles.matchScore}>
                        <Text style={styles.matchScoreText}>{Math.round(match.score * 100)}%</Text>
                      </View>
                      <ListingCard
                        listing={match.listing}
                        variant="grid"
                        onPress={() => router.push(`/listing/${match.listing.id}`)}
                        isDark={isDark}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View style={{ height: 100 + insets.bottom }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.surface, paddingBottom: insets.bottom + 8 },
        ]}
      >
        {isOwner ? (
          <View style={styles.ownerActions}>
            <Button
              label="Editar"
              variant="outline"
              size="md"
              icon={Edit2}
              onPress={() => router.push(`/edit-listing/${id}`)}
            />
            <Button
              label={listing.status === 'active' ? 'Pausar' : 'Activar'}
              variant="ghost"
              size="md"
              icon={listing.status === 'active' ? Pause : Play}
              onPress={() => updateListing({ id, updates: { status: listing.status === 'active' ? 'paused' : 'active' } as any })}
            />
          </View>
        ) : (
          <View style={styles.buyerActions}>
            <Button
              label={chatLoading ? 'Abriendo...' : 'Chat'}
              variant="outline"
              size="md"
              icon={MessageCircle}
              onPress={handleChat}
              disabled={chatLoading}
            />
            <Button
              label="Proponer trueque 🤝"
              variant="primary"
              size="md"
              onPress={() =>
                router.push({ pathname: '/trade/request', params: { listingId: listing.id } })
              }
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  headerTitle: { flex: 1, fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnDark: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: { flexDirection: 'row', gap: SPACING.sm },
  gallery: { height: 300, position: 'relative' },
  galleryImage: { width: '100%', height: '100%' },
  galleryGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  imageBadges: {
    position: 'absolute',
    bottom: SPACING.base,
    left: SPACING.base,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  pagination: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.base,
    flexDirection: 'row',
    gap: 4,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: { backgroundColor: '#fff', width: 18 },
  content: { borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg, marginTop: -16, padding: SPACING.base },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.md },
  title: { flex: 1, fontSize: TYPOGRAPHY.size.xl, fontWeight: TYPOGRAPHY.weight.bold },
  lookingForCard: { borderRadius: RADIUS.md, padding: SPACING.base, marginBottom: SPACING.base },
  lookingForLabel: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold, marginBottom: 4 },
  lookingForText: { fontSize: TYPOGRAPHY.size.base },
  ecoMetrics: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.base },
  ecoMetric: { flex: 1, alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.md, gap: 4 },
  ecoMetricEmoji: { fontSize: 22 },
  ecoMetricValue: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold },
  ecoMetricLabel: { fontSize: TYPOGRAPHY.size.xs, textAlign: 'center' },
  section: { marginBottom: SPACING.base },
  sectionTitle: { fontSize: TYPOGRAPHY.size.md, fontWeight: TYPOGRAPHY.weight.bold, marginBottom: SPACING.xs },
  sectionSubtitle: { fontSize: TYPOGRAPHY.size.sm, marginBottom: SPACING.sm },
  description: { fontSize: TYPOGRAPHY.size.base, lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.base },
  tag: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  tagText: { fontSize: TYPOGRAPHY.size.sm },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.base,
  },
  locationText: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.medium },
  distanceText: { fontSize: TYPOGRAPHY.size.sm },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.base,
  },
  ownerName: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.semibold },
  ownerStats: { flexDirection: 'row', gap: SPACING.md, marginTop: 4 },
  ownerStat: { fontSize: TYPOGRAPHY.size.sm },
  matchesRow: { flexDirection: 'row', gap: SPACING.md, paddingBottom: SPACING.sm },
  matchCard: { width: 200, borderRadius: RADIUS.md, overflow: 'hidden', position: 'relative' },
  matchScore: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  matchScoreText: { color: '#fff', fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.bold },
  bottomBar: {
    padding: SPACING.base,
    ...SHADOWS.lg,
  },
  ownerActions: { flexDirection: 'row', gap: SPACING.md },
  buyerActions: { flexDirection: 'row', gap: SPACING.md },
});
