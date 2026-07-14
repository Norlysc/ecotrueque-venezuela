import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Platform,
  Dimensions,
  TextInput,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Shield, Search, Crosshair } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useLocationStore } from '@stores/locationStore';
import { useNearbyListings } from '@hooks/useListings';
import { ListingCard } from '@components/listing/ListingCard';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { CATEGORIES } from '@constants/categories';
import type { Listing } from '@/types/app.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1A1A18' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9CA3AF' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1A1A18' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#252523' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0D0D0C' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

const RADII = [5, 10, 20];

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { latitude, longitude } = useLocationStore();
  const [selectedRadius, setSelectedRadius] = useState(10);
  const [showSafeSpots, setShowSafeSpots] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const lat = latitude ?? 10.4806;
  const lng = longitude ?? -66.9036;

  const { data: listings } = useNearbyListings({
    radius_km: selectedRadius,
    search_query: searchQuery || undefined,
  });

  const goToMyLocation = () => {
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 500);
  };

  const handleMarkerPress = (listing: Listing) => {
    setSelectedListing(listing);
    if (listing.latitude && listing.longitude) {
      mapRef.current?.animateToRegion({
        latitude: listing.latitude,
        longitude: listing.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 400);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        customMapStyle={isDark ? DARK_MAP_STYLE : []}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelectedListing(null)}
      >
        {/* Círculo de radio */}
        <Circle
          center={{ latitude: lat, longitude: lng }}
          radius={selectedRadius * 1000}
          fillColor="rgba(29, 158, 117, 0.08)"
          strokeColor="rgba(29, 158, 117, 0.3)"
          strokeWidth={1.5}
        />

        {/* Marcadores de listings */}
        {(listings ?? []).map((listing: Listing) =>
          listing.latitude && listing.longitude ? (
            <Marker
              key={listing.id}
              coordinate={{ latitude: listing.latitude, longitude: listing.longitude }}
              onPress={() => handleMarkerPress(listing)}
            >
              <View
                style={[
                  styles.markerContainer,
                  selectedListing?.id === listing.id && styles.markerContainerSelected,
                ]}
              >
                <Text style={styles.markerEmoji}>
                  {CATEGORIES.find((c) => c.id === listing.category)?.emoji ?? '📦'}
                </Text>
                {selectedListing?.id === listing.id && (
                  <Text style={styles.markerTitle} numberOfLines={1}>
                    {listing.title}
                  </Text>
                )}
              </View>
            </Marker>
          ) : null
        )}

        {/* Marcador de sitios seguros (simulado) */}
        {showSafeSpots && (
          <Marker coordinate={{ latitude: lat + 0.01, longitude: lng + 0.01 }}>
            <View style={styles.safeSpotMarker}>
              <Shield size={14} color="#fff" strokeWidth={1.75} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Header flotante */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top + 8 }]}>
        {/* Buscador */}
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Search size={18} color={theme.textTertiary} strokeWidth={1.75} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar en el mapa..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtros de radio */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {RADII.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setSelectedRadius(r)}
                style={[
                  styles.radiusChip,
                  { backgroundColor: r === selectedRadius ? COLORS.primary : theme.surface },
                ]}
              >
                <Text
                  style={[
                    styles.radiusChipText,
                    { color: r === selectedRadius ? '#fff' : theme.textSecondary },
                  ]}
                >
                  {r} km
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowSafeSpots(!showSafeSpots)}
              style={[
                styles.radiusChip,
                { backgroundColor: showSafeSpots ? COLORS.info : theme.surface },
              ]}
            >
              <Shield size={12} color={showSafeSpots ? '#fff' : theme.textSecondary} strokeWidth={1.75} />
              <Text
                style={[
                  styles.radiusChipText,
                  { color: showSafeSpots ? '#fff' : theme.textSecondary },
                ]}
              >
                Sitios seguros
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Contador */}
        <View style={[styles.counter, { backgroundColor: theme.surface }]}>
          <Text style={[styles.counterText, { color: theme.textSecondary }]}>
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
              {(listings ?? []).length}
            </Text>{' '}
            trueques en {selectedRadius} km
          </Text>
        </View>
      </View>

      {/* Botón mi ubicación */}
      <TouchableOpacity
        onPress={goToMyLocation}
        style={[styles.myLocationBtn, { backgroundColor: theme.surface, bottom: selectedListing ? 280 : 120 }]}
      >
        <Crosshair size={20} color={COLORS.primary} strokeWidth={1.75} />
      </TouchableOpacity>

      {/* Cards deslizantes */}
      {(listings ?? []).length > 0 && (
        <View style={[styles.cardsContainer, { paddingBottom: insets.bottom + 8 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContent}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH * 0.75 + SPACING.sm}
          >
            {(listings ?? []).map((listing: Listing) => (
              <View key={listing.id} style={styles.cardWrapper}>
                <ListingCard
                  listing={listing}
                  variant="horizontal"
                  onPress={() => {
                    setSelectedListing(listing);
                    router.push(`/listing/${listing.id}`);
                  }}
                  isDark={isDark}
                  isSelected={selectedListing?.id === listing.id}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
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
    paddingHorizontal: SPACING.base,
    gap: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.size.base },
  filterRow: { flexDirection: 'row' },
  radiusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    gap: 4,
    ...SHADOWS.xs,
  },
  radiusChipText: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  counter: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    ...SHADOWS.xs,
  },
  counterText: { fontSize: TYPOGRAPHY.size.sm },
  markerContainer: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    alignItems: 'center',
    ...SHADOWS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    maxWidth: 140,
  },
  markerContainerSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: SPACING.sm,
  },
  markerEmoji: { fontSize: 20 },
  markerTitle: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: '#fff',
    maxWidth: 100,
  },
  safeSpotMarker: {
    backgroundColor: COLORS.info,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  myLocationBtn: {
    position: 'absolute',
    right: SPACING.base,
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  cardsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cardsContent: { paddingHorizontal: SPACING.base, gap: SPACING.sm },
  cardWrapper: { width: SCREEN_WIDTH * 0.75 },
});
