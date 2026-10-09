import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Plus, Home, Map, MessageCircle, User, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, THEME, SHADOWS } from '@constants/theme';

export const NAV_INACTIVE_LIGHT = '#4B5563';
export const NAV_INACTIVE_DARK = '#9CA3AF';

// Ícono de la barra inferior: la sección activa lleva una píldora verde detrás
export function NavIcon({ icon: Icon, color, focused }: { icon: LucideIcon; color: string; focused: boolean }) {
  return (
    <View style={[styles.pill, focused && styles.pillActive]}>
      <Icon size={24} color={color} strokeWidth={focused ? 2.2 : 1.9} />
    </View>
  );
}

export function PublishButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.publishBtn}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Publicar un trueque"
    >
      <View style={styles.publishBtnInner}>
        <Plus size={30} color="#fff" strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

const ITEMS: { label: string; icon: LucideIcon; href: '/(tabs)' | '/(tabs)/map' | '/(tabs)/chat' | '/(tabs)/profile' }[] = [
  { label: 'Inicio', icon: Home, href: '/(tabs)' },
  { label: 'Mapa', icon: Map, href: '/(tabs)/map' },
  { label: 'Chat', icon: MessageCircle, href: '/(tabs)/chat' },
  { label: 'Perfil', icon: User, href: '/(tabs)/profile' },
];

// Barra inferior para pantallas que están fuera de las pestañas (ej. panel de impacto)
export function BottomNav() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const inactive = isDark ? NAV_INACTIVE_DARK : NAV_INACTIVE_LIGHT;

  const item = (it: (typeof ITEMS)[number]) => (
    <TouchableOpacity
      key={it.label}
      style={styles.item}
      onPress={() => router.replace(it.href)}
      accessibilityRole="button"
      accessibilityLabel={`Ir a ${it.label}`}
    >
      <NavIcon icon={it.icon} color={inactive} focused={false} />
      <Text style={[styles.label, { color: inactive }]}>{it.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: theme.tabBar, borderTopColor: theme.tabBarBorder, paddingBottom: insets.bottom, height: NAV_HEIGHT + insets.bottom },
      ]}
    >
      {item(ITEMS[0])}
      {item(ITEMS[1])}
      <PublishButton onPress={() => router.push('/(tabs)/publish')} />
      {item(ITEMS[2])}
      {item(ITEMS[3])}
    </View>
  );
}

export const NAV_HEIGHT = 68;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    ...SHADOWS.sm,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 6 },
  label: { fontSize: 12, fontWeight: '700' },
  pill: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: `${COLORS.primary}22` },
  publishBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  publishBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...SHADOWS.green,
  },
});
