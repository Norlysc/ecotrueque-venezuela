import { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { Heart, MapPin, Pencil, Trash2 } from 'lucide-react-native';
import { Avatar } from '@components/ui/Avatar';
import { Badge } from '@components/ui/Badge';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { CATEGORIES } from '@constants/categories';
import { useToggleFavorite } from '@hooks/useListings';
import { useAuthStore } from '@stores/authStore';
import type { Listing } from '@/types/app.types';

type CardVariant = 'grid' | 'featured' | 'horizontal';

interface ListingCardProps {
  listing: Listing;
  variant?: CardVariant;
  onPress: () => void;
  onFavoritePress?: () => void;
  isDark?: boolean;
  isSelected?: boolean;
  ownerActions?: { onEdit: () => void; onDelete: () => void };
}

export function ListingCard({
  listing,
  variant = 'grid',
  onPress,
  onFavoritePress,
  isDark = false,
  isSelected = false,
  ownerActions,
}: ListingCardProps) {
  const theme = isDark ? THEME.dark : THEME.light;
  const category = CATEGORIES.find((c) => c.id === listing.category);
  const imageUri = listing.images?.[0]?.url;

  const { user } = useAuthStore();
  const { mutate: toggleFav } = useToggleFavorite();

  const [isFav, setIsFav] = useState(listing.is_favorited ?? false);
  const [localCount, setLocalCount] = useState(listing.favorites_count ?? 0);

  useEffect(() => { setIsFav(listing.is_favorited ?? false); }, [listing.is_favorited]);
  useEffect(() => { setLocalCount(listing.favorites_count ?? 0); }, [listing.favorites_count]);

  const handleFavoritePress = () => {
    if (!user) return;
    const willFav = !isFav;
    setIsFav(willFav);
    setLocalCount((c) => c + (willFav ? 1 : -1));
    toggleFav({ listingId: listing.id, isFavorited: isFav });
    onFavoritePress?.();
  };

  if (variant === 'grid') {
    const cardInner = (
      <>
        {/* Imagen */}
        <View style={styles.gridImageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.gridImage} resizeMode="cover" />
          ) : (
            <View style={[styles.gridImagePlaceholder, { backgroundColor: isDark ? '#252523' : '#F0F2F5' }]}>
              <Text style={styles.imagePlaceholderEmoji}>{category?.emoji ?? '📦'}</Text>
            </View>
          )}

          {/* Badge tipo */}
          <View style={styles.gridBadge}>
            <Badge
              label={listing.type === 'good' ? '📦 Bien' : '🤝 Servicio'}
              variant="info"
              size="xs"
            />
          </View>

          {/* Favorito (solo para no-dueños) */}
          {!ownerActions && (
            <TouchableOpacity
              onPress={handleFavoritePress}
              style={styles.favoriteBtn}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Heart
                size={16}
                color={isFav ? '#E53935' : 'rgba(255,255,255,0.9)'}
                fill={isFav ? '#E53935' : 'none'}
                strokeWidth={isFav ? 0 : 1.75}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Contenido */}
        <View style={styles.gridContent}>
          <Text style={[styles.gridTitle, { color: theme.text }]} numberOfLines={2}>
            {listing.title}
          </Text>

          {listing.distance_km !== undefined && (
            <View style={styles.distanceRow}>
              <MapPin size={10} color={theme.textTertiary} strokeWidth={1.75} />
              <Text style={[styles.distanceText, { color: theme.textTertiary }]}>
                {listing.distance_km.toFixed(1)} km
              </Text>
            </View>
          )}

          <Text style={[styles.lookingFor, { color: COLORS.primary }]} numberOfLines={1}>
            🔄 {listing.looking_for}
          </Text>

          {/* Footer */}
          <View style={styles.gridFooter}>
            {listing.user && !ownerActions && (
              <Avatar
                uri={listing.user.avatar_url}
                name={listing.user.full_name}
                size="xs"
                isDark={isDark}
              />
            )}
            <View style={styles.ecoStat}>
              <Text style={styles.ecoStatText}>🌿 {listing.eco_impact.co2_saved_kg}kg</Text>
            </View>
            {localCount > 0 && (
              <View style={styles.favStat}>
                <Heart size={10} color="#E53935" fill="#E53935" strokeWidth={0} />
                <Text style={styles.favStatText}>{localCount}</Text>
              </View>
            )}
          </View>
        </View>
      </>
    );

    // Con acciones de dueño: la card y los botones son componentes hermanos (no anidados)
    if (ownerActions) {
      return (
        <View style={[styles.gridCardWrapper, { width: '47%' }]}>
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={[
              styles.gridCard,
              { backgroundColor: theme.card, borderColor: isSelected ? COLORS.primary : 'transparent', borderWidth: isSelected ? 2 : 0, width: '100%' },
              SHADOWS.sm,
            ]}
          >
            {cardInner}
          </TouchableOpacity>

          {/* Barra de acciones — fuera del TouchableOpacity */}
          <View style={[styles.ownerActionBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <TouchableOpacity style={styles.ownerActionBtn} onPress={ownerActions.onEdit}>
              <Pencil size={13} color={COLORS.primary} strokeWidth={1.75} />
              <Text style={[styles.ownerActionLabel, { color: COLORS.primary }]}>Editar</Text>
            </TouchableOpacity>
            <View style={[styles.ownerActionDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity style={styles.ownerActionBtn} onPress={ownerActions.onDelete}>
              <Trash2 size={13} color="#E53935" strokeWidth={1.75} />
              <Text style={[styles.ownerActionLabel, { color: '#E53935' }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[
          styles.gridCard,
          { backgroundColor: theme.card, borderColor: isSelected ? COLORS.primary : 'transparent', borderWidth: isSelected ? 2 : 0 },
          SHADOWS.sm,
        ]}
      >
        {cardInner}
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[styles.featuredCard, SHADOWS.md]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.featuredImage} resizeMode="cover" />
        ) : (
          <View style={[styles.featuredImage, { backgroundColor: isDark ? '#252523' : '#F0F2F5', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 48 }}>{category?.emoji ?? '📦'}</Text>
          </View>
        )}

        <View style={styles.featuredOverlay} />

        <View style={styles.featuredTopBadges}>
          <Badge label={category?.emoji + ' ' + (category?.label ?? '')} variant="neutral" size="xs" />
        </View>

        <View style={styles.featuredBottom}>
          <Text style={styles.featuredTitle} numberOfLines={2}>{listing.title}</Text>
          <Text style={styles.featuredLookingFor} numberOfLines={1}>
            🔄 {listing.looking_for}
          </Text>
          <View style={styles.featuredFooter}>
            {listing.user && (
              <>
                <Avatar uri={listing.user.avatar_url} name={listing.user.full_name} size="xs" isDark />
                <Text style={styles.featuredOwner} numberOfLines={1}>{listing.user.full_name}</Text>
              </>
            )}
            <Badge label={`🌿 ${listing.eco_impact.co2_saved_kg}kg`} variant="eco" size="xs" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Horizontal variant
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.horizontalCard,
        { backgroundColor: theme.card, borderColor: isSelected ? COLORS.primary : 'transparent', borderWidth: isSelected ? 2 : 0 },
        SHADOWS.sm,
      ]}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.horizontalImage} resizeMode="cover" />
      ) : (
        <View style={[styles.horizontalImage, { backgroundColor: isDark ? '#252523' : '#F0F2F5', alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ fontSize: 30 }}>{category?.emoji ?? '📦'}</Text>
        </View>
      )}

      <View style={styles.horizontalContent}>
        <Text style={[styles.horizontalTitle, { color: theme.text }]} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={[styles.horizontalCategory, { color: theme.textSecondary }]}>
          {category?.emoji} {category?.label}
        </Text>
        <Text style={[styles.horizontalLookingFor, { color: COLORS.primary }]} numberOfLines={1}>
          🔄 {listing.looking_for}
        </Text>
        {listing.distance_km !== undefined && (
          <Text style={[styles.distanceText, { color: theme.textTertiary }]}>
            📍 {listing.distance_km.toFixed(1)} km
          </Text>
        )}
      </View>

      <TouchableOpacity onPress={handleFavoritePress} style={styles.horizontalFavorite}>
        <Heart
          size={18}
          color={isFav ? '#E53935' : theme.textTertiary}
          fill={isFav ? '#E53935' : 'none'}
          strokeWidth={isFav ? 0 : 1.75}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Grid
  gridCardWrapper: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  gridCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    width: '47%',
  },
  gridImageContainer: { position: 'relative', height: 150 },
  gridImage: { width: '100%', height: '100%' },
  gridImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderEmoji: { fontSize: 40 },
  gridBadge: { position: 'absolute', bottom: SPACING.sm, left: SPACING.sm },
  favoriteBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContent: { padding: SPACING.sm, gap: 4 },
  gridTitle: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  distanceText: { fontSize: TYPOGRAPHY.size.xs },
  lookingFor: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.medium },
  gridFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  ecoStat: { flex: 1 },
  ecoStatText: { fontSize: TYPOGRAPHY.size.xs, color: COLORS.primary },
  favStat: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  favStatText: { fontSize: TYPOGRAPHY.size.xs, color: '#E53935', fontWeight: TYPOGRAPHY.weight.medium },

  // Owner action bar (hermano de la card, no anidado)
  ownerActionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  ownerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  ownerActionDivider: { width: 1, marginVertical: 8 },
  ownerActionLabel: { fontSize: 11, fontWeight: TYPOGRAPHY.weight.semibold },

  // Featured
  featuredCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    width: 280,
    position: 'relative',
  },
  featuredImage: { width: '100%', height: 220 },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  featuredTopBadges: { position: 'absolute', top: SPACING.md, left: SPACING.md, flexDirection: 'row', gap: SPACING.xs },
  featuredBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 4,
  },
  featuredTitle: { color: '#fff', fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold },
  featuredLookingFor: { color: 'rgba(255,255,255,0.8)', fontSize: TYPOGRAPHY.size.xs },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  featuredOwner: { color: 'rgba(255,255,255,0.8)', fontSize: TYPOGRAPHY.size.xs, flex: 1 },

  // Horizontal
  horizontalCard: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  horizontalImage: { width: 100, height: 100 },
  horizontalContent: { flex: 1, padding: SPACING.sm, gap: 4 },
  horizontalTitle: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  horizontalCategory: { fontSize: TYPOGRAPHY.size.xs },
  horizontalLookingFor: { fontSize: TYPOGRAPHY.size.xs },
  horizontalFavorite: { padding: SPACING.sm, justifyContent: 'center' },
});
