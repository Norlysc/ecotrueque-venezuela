import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, X, MapPin, ChevronRight, ArrowRight, Crosshair } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNearbyListings } from '@hooks/useListings';
import { useLocationStore } from '@stores/locationStore';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { CATEGORIES, getCategoryById } from '@constants/categories';
import type { Listing } from '@/types/app.types';
import type { CategoryId } from '@constants/categories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WIDE = SCREEN_WIDTH >= 768;

const RADII = [5, 10, 20, 50];
const DEFAULT_LAT = 10.4806;
const DEFAULT_LNG = -66.9036;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// Inyecta Leaflet CSS y JS una sola vez
function useLeaflet(onReady: () => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const inject = () => {
      // CSS del contenedor del mapa (Leaflet necesita height explícito)
      if (!document.getElementById('eco-map-css')) {
        const style = document.createElement('style');
        style.id = 'eco-map-css';
        style.textContent = '#eco-leaflet-map { height: 100%; min-height: 280px; } .leaflet-container { height: 100%; width: 100%; }';
        document.head.appendChild(style);
      }

      if (!(window as any).L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = onReady;
        document.head.appendChild(script);
      } else {
        onReady();
      }
    };

    inject();
  }, []);
}

export default function MapScreenWeb() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();

  const storeLocation = useLocationStore();
  const [userLat, setUserLat] = useState(storeLocation.latitude ?? DEFAULT_LAT);
  const [userLng, setUserLng] = useState(storeLocation.longitude ?? DEFAULT_LNG);
  const [locLoading, setLocLoading] = useState(!storeLocation.latitude);
  const [leafletReady, setLeafletReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const [selectedRadius, setSelectedRadius] = useState(20);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  const { data: listings = [], isLoading, error: listingsError } = useNearbyListings({
    radius_km: selectedRadius,
    category: selectedCategory ?? undefined,
    search_query: searchQuery || undefined,
  });

  // Log RPC errors in development so they're visible in the browser console
  useEffect(() => {
    if (listingsError) {
      console.error('[EcoTrueque] Error cargando listings:', listingsError);
    }
  }, [listingsError]);

  // Obtener ubicación del navegador
  useEffect(() => {
    if (storeLocation.latitude) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        storeLocation.setLocation(pos.coords.latitude, pos.coords.longitude);
        setLocLoading(false);
      },
      () => setLocLoading(false),
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  useLeaflet(() => setLeafletReady(true));

  // Inicializar mapa una vez que Leaflet esté listo y ubicación resuelta
  useEffect(() => {
    if (!leafletReady || locLoading || leafletMapRef.current) return;

    const container = document.getElementById('eco-leaflet-map');
    if (!container) return;

    const L = (window as any).L;

    // Ícono por defecto roto en webpack — desactivar
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '' });

    const map = L.map('eco-leaflet-map', {
      center: [userLat, userLng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Marcador de ubicación del usuario
    const userIcon = L.divIcon({
      html: `<div style="width:14px;height:14px;border-radius:50%;background:${COLORS.primary};border:3px solid #fff;box-shadow:0 0 0 3px ${COLORS.primary}44;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      className: '',
    });
    userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup('📍 Tu ubicación');

    leafletMapRef.current = map;
    setMapReady(true);
  }, [leafletReady, locLoading, userLat, userLng]);

  // Actualizar marcadores de listings
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return;
    const L = (window as any).L;

    // Borrar marcadores anteriores
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    listings.forEach((listing) => {
      if (!listing.latitude || !listing.longitude) return;
      const cat = getCategoryById(listing.category);
      const isSelected = selectedListing?.id === listing.id;

      const icon = L.divIcon({
        html: `<div style="
          background:${isSelected ? cat.color : '#fff'};
          color:${isSelected ? '#fff' : '#222'};
          border:2.5px solid ${cat.color};
          border-radius:10px;
          padding:3px 7px;
          font-size:16px;
          box-shadow:0 2px 8px rgba(0,0,0,0.18);
          cursor:pointer;
          display:inline-flex;
          align-items:center;
          white-space:nowrap;
          transition:all .15s;
        ">${cat.emoji}</div>`,
        iconSize: [38, 30],
        iconAnchor: [19, 15],
        className: '',
      });

      const marker = L.marker([listing.latitude, listing.longitude], { icon })
        .addTo(leafletMapRef.current)
        .on('click', () => setSelectedListing(listing));

      markersRef.current.push(marker);
    });
  }, [listings, mapReady, selectedListing]);

  // Centrar mapa en listing seleccionado
  const flyTo = useCallback((listing: Listing) => {
    if (listing.latitude && listing.longitude && leafletMapRef.current) {
      leafletMapRef.current.flyTo([listing.latitude, listing.longitude], 15, { duration: 0.7 });
    }
    setSelectedListing(listing);
  }, []);

  const listingsWithDist = listings.map((l) => ({
    ...l,
    distKm:
      l.latitude && l.longitude
        ? haversineKm(userLat, userLng, l.latitude, l.longitude)
        : null,
  }));

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* ── HEADER ─────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerRow}>
          {router.canGoBack() && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={20} color={theme.text} strokeWidth={1.75} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: theme.text }]}>🗺️ Mapa de trueques</Text>
          {locLoading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: SPACING.sm }} />}
        </View>

        {/* Buscador */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#252523' : '#F0F2F5', borderColor: theme.border }]}>
          <Search size={15} color={theme.textTertiary} strokeWidth={1.75} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar trueques..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={13} color={theme.textTertiary} strokeWidth={1.75} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {RADII.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setSelectedRadius(r)}
              style={[
                styles.chip,
                { backgroundColor: r === selectedRadius ? COLORS.primary : isDark ? '#2A2A28' : '#F0F2F5' },
              ]}
            >
              <Text style={[styles.chipText, { color: r === selectedRadius ? '#fff' : theme.textSecondary }]}>
                {r} km
              </Text>
            </TouchableOpacity>
          ))}

          <View style={[styles.chipSep, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.chip,
              { backgroundColor: !selectedCategory ? COLORS.secondary : isDark ? '#2A2A28' : '#F0F2F5' },
            ]}
          >
            <Text style={[styles.chipText, { color: !selectedCategory ? '#fff' : theme.textSecondary }]}>
              Todas
            </Text>
          </TouchableOpacity>

          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(active ? null : cat.id)}
                style={[
                  styles.chip,
                  { backgroundColor: active ? cat.color : isDark ? '#2A2A28' : '#F0F2F5' },
                ]}
              >
                <Text style={styles.chipText}>{cat.emoji}</Text>
                <Text style={[styles.chipText, { color: active ? '#fff' : theme.textSecondary }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── BODY ───────────────────────────────── */}
      <View style={[styles.body, IS_WIDE && styles.bodyWide]}>

        {/* MAP */}
        <View style={[styles.mapSection, IS_WIDE && styles.mapSectionWide]}>
          {/* nativeID hace que en web sea: <div id="eco-leaflet-map"> */}
          <View nativeID="eco-leaflet-map" style={styles.mapView} />

          {/* Loader mientras carga Leaflet */}
          {(!leafletReady || locLoading) && (
            <View style={styles.mapOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[styles.mapLoadingText, { color: COLORS.primary }]}>
                Cargando mapa...
              </Text>
            </View>
          )}

          {/* Badge contador */}
          {mapReady && (
            <View style={[styles.counterBadge, { backgroundColor: theme.surface, ...SHADOWS.sm }]}>
              <Text style={[styles.counterText, { color: theme.textSecondary }]}>
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{listings.length}</Text>
                {'  '}trueques en {selectedRadius} km
              </Text>
            </View>
          )}

          {/* Botón centrar */}
          {mapReady && (
            <TouchableOpacity
              style={[styles.centerBtn, { backgroundColor: theme.surface, ...SHADOWS.md }]}
              onPress={() => leafletMapRef.current?.flyTo([userLat, userLng], 13, { duration: 0.6 })}
            >
              <Crosshair size={18} color={COLORS.primary} strokeWidth={1.75} />
            </TouchableOpacity>
          )}
        </View>

        {/* LIST */}
        <View style={[styles.listSection, { backgroundColor: theme.background, borderColor: theme.border }, IS_WIDE && styles.listSectionWide]}>
          {/* Listing seleccionado (destacado) */}
          {selectedListing && (
            <View style={[styles.selectedCard, { backgroundColor: isDark ? '#0F2D24' : '#E8F5F0', borderColor: COLORS.primary }]}>
              <TouchableOpacity
                style={styles.selectedCardInner}
                onPress={() => router.push(`/listing/${selectedListing.id}`)}
                activeOpacity={0.8}
              >
                {selectedListing.images?.[0]?.url ? (
                  <Image source={{ uri: selectedListing.images[0].url }} style={styles.selectedImg} />
                ) : (
                  <View style={[styles.selectedImgPlaceholder, { backgroundColor: getCategoryById(selectedListing.category).color + '22' }]}>
                    <Text style={{ fontSize: 26 }}>{getCategoryById(selectedListing.category).emoji}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.selectedTitle, { color: theme.text }]} numberOfLines={2}>
                    {selectedListing.title}
                  </Text>
                  <Text style={{ color: COLORS.primary, fontSize: TYPOGRAPHY.size.sm, marginTop: 2 }}>
                    {getCategoryById(selectedListing.category).emoji}{' '}
                    {getCategoryById(selectedListing.category).label}
                    {selectedListing.city ? `  ·  📍 ${selectedListing.city}` : ''}
                  </Text>
                  <Text style={{ color: COLORS.primaryDark, fontSize: TYPOGRAPHY.size.xs, marginTop: 2 }}>
                    🌱 {selectedListing.eco_impact?.co2_saved_kg ?? 0} kg CO₂ evitado
                  </Text>
                </View>
                <ChevronRight size={16} color={COLORS.primary} strokeWidth={1.75} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedListing(null)} style={styles.selectedClose}>
                <X size={13} color={theme.textTertiary} strokeWidth={1.75} />
              </TouchableOpacity>
            </View>
          )}

          {/* Cabecera de la lista */}
          <View style={[styles.listHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.listHeaderText, { color: theme.textSecondary }]}>
              {isLoading
                ? 'Buscando trueques...'
                : listings.length === 0
                ? 'Sin resultados'
                : `${listings.length} trueque${listings.length !== 1 ? 's' : ''} encontrado${listings.length !== 1 ? 's' : ''}`}
            </Text>
            {isLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>

          {/* Error de RPC */}
          {listingsError && (
            <View style={[styles.emptyState, { backgroundColor: '#FFF0F0' }]}>
              <Text style={{ fontSize: 32 }}>⚠️</Text>
              <Text style={[styles.emptyTitle, { color: '#CC0000' }]}>Error al cargar trueques</Text>
              <Text style={[styles.emptySubtitle, { color: '#666' }]}>
                {(listingsError as any)?.message ?? 'Error desconocido — abre la consola del navegador (F12) para más detalles'}
              </Text>
            </View>
          )}

          {/* Estado vacío */}
          {!isLoading && !listingsError && listings.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 44 }}>🌿</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay trueques cercanos</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Amplía el radio de búsqueda o cambia los filtros
              </Text>
            </View>
          )}

          {/* Lista de listings */}
          {listings.length > 0 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            >
              {listingsWithDist.map((listing) => {
                const cat = getCategoryById(listing.category);
                const isSelected = selectedListing?.id === listing.id;
                return (
                  <TouchableOpacity
                    key={listing.id}
                    style={[
                      styles.listingCard,
                      {
                        backgroundColor: isSelected
                          ? isDark ? '#0F2D24' : '#E8F5F0'
                          : theme.surface,
                        borderColor: isSelected ? COLORS.primary : theme.border,
                      },
                    ]}
                    onPress={() => flyTo(listing)}
                    activeOpacity={0.8}
                  >
                    {listing.images?.[0]?.url ? (
                      <Image source={{ uri: listing.images[0].url }} style={styles.cardImg} />
                    ) : (
                      <View style={[styles.cardImgPlaceholder, { backgroundColor: cat.color + '20' }]}>
                        <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                      </View>
                    )}

                    <View style={styles.cardBody}>
                      <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                        {listing.title}
                      </Text>

                      <View style={styles.cardMeta}>
                        <View style={[styles.catBadge, { backgroundColor: cat.color + '18' }]}>
                          <Text style={[styles.catBadgeText, { color: cat.color }]}>
                            {cat.emoji} {cat.label}
                          </Text>
                        </View>
                        {listing.distKm !== null && (
                          <View style={[styles.distBadge, { backgroundColor: isDark ? '#2A2A28' : '#F0F2F5' }]}>
                            <MapPin size={10} color={theme.textTertiary} strokeWidth={1.75} />
                            <Text style={[styles.distText, { color: theme.textTertiary }]}>
                              {formatDist(listing.distKm)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {listing.city && (
                        <Text style={[styles.cardCity, { color: theme.textSecondary }]} numberOfLines={1}>
                          📍 {listing.city}{listing.state ? `, ${listing.state}` : ''}
                        </Text>
                      )}

                      <View style={styles.ecoRow}>
                        <Text style={[styles.ecoText, { color: COLORS.primary }]}>
                          🌱 {listing.eco_impact?.co2_saved_kg ?? 0} kg CO₂
                        </Text>
                        <Text style={[styles.ecoText, { color: COLORS.primaryDark }]}>
                          ♻️ {listing.eco_impact?.waste_reduced_kg ?? 0} kg residuos
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.viewBtn, { backgroundColor: COLORS.primary + '14', borderColor: COLORS.primary + '30' }]}
                      onPress={() => router.push(`/listing/${listing.id}`)}
                    >
                      <Text style={[styles.viewBtnText, { color: COLORS.primary }]}>Ver</Text>
                      <ArrowRight size={12} color={COLORS.primary} strokeWidth={1.75} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: insets.bottom + SPACING.base }} />
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  backBtn: { padding: SPACING.xs },
  headerTitle: { flex: 1, fontSize: TYPOGRAPHY.size.lg, fontWeight: TYPOGRAPHY.weight.bold },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    height: 40,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.size.sm },

  // Filters
  filtersRow: { gap: SPACING.xs, paddingRight: SPACING.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  chipText: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  chipSep: { width: 1, height: 20, alignSelf: 'center', marginHorizontal: SPACING.xs },

  // Body
  body: { flex: 1, flexDirection: 'column' },
  bodyWide: { flexDirection: 'row' },

  // Map section
  mapSection: { height: 320, position: 'relative' },
  mapSectionWide: { flex: 3, height: undefined },
  mapView: { flex: 1 },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    gap: SPACING.sm,
    zIndex: 10,
  },
  mapLoadingText: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.medium },
  counterBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    zIndex: 5,
  },
  counterText: { fontSize: TYPOGRAPHY.size.xs },
  centerBtn: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },

  // List section
  listSection: { flex: 1, borderTopWidth: 1 },
  listSectionWide: { flex: 2, borderTopWidth: 0, borderLeftWidth: 1 },

  // Selected card
  selectedCard: {
    margin: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  selectedCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  selectedImg: { width: 56, height: 56, borderRadius: RADIUS.sm },
  selectedImgPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTitle: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  selectedClose: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    padding: 4,
  },

  // List header
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  listHeaderText: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.medium },
  listContent: { padding: SPACING.sm, gap: SPACING.sm },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING['2xl'], gap: SPACING.md },
  emptyTitle: { fontSize: TYPOGRAPHY.size.base, fontWeight: TYPOGRAPHY.weight.bold, textAlign: 'center' },
  emptySubtitle: { fontSize: TYPOGRAPHY.size.sm, textAlign: 'center', lineHeight: 20 },

  // Listing card
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    gap: SPACING.sm,
  },
  cardImg: { width: 68, height: 68 },
  cardImgPlaceholder: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, paddingVertical: SPACING.sm, gap: 3 },
  cardTitle: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.semibold },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexWrap: 'wrap' },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  catBadgeText: { fontSize: 10, fontWeight: TYPOGRAPHY.weight.semibold },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  distText: { fontSize: 10 },
  cardCity: { fontSize: TYPOGRAPHY.size.xs },
  ecoRow: { flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' },
  ecoText: { fontSize: 10, fontWeight: TYPOGRAPHY.weight.medium },

  // View button
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  viewBtnText: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.semibold },
});
