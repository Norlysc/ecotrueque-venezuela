import { TouchableOpacity, View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Plus, Home, Map, MessageCircle, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationStore } from '@stores/notificationStore';
import { COLORS, THEME, SHADOWS } from '@constants/theme';

function PublishButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.publishBtn} activeOpacity={0.85}>
      <View style={styles.publishBtnInner}>
        <Plus size={28} color="#fff" strokeWidth={1.5} />
      </View>
    </TouchableOpacity>
  );
}

function BadgeCount({ count }: { count: number }) {
  if (count <= 0) return null;
  const label = count > 99 ? '99+' : count > 9 ? `${count}` : `${count}`;
  return (
    <View style={[styles.badge, count > 9 && styles.badgeWide]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const { unreadMessageCount } = useNotificationStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          ...SHADOWS.sm,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? '#6B7280' : '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: () => (
            <PublishButton onPress={() => router.push('/(tabs)/publish')} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconWrap}>
              <MessageCircle size={size} color={color} strokeWidth={1.5} />
              <BadgeCount count={unreadMessageCount} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  publishBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  publishBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.green,
  },
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeWide: {
    minWidth: 22,
    borderRadius: 9,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
});
