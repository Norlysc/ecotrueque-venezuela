import { TouchableOpacity, View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Home, Map, MessageCircle, User } from 'lucide-react-native';
import { NavIcon, PublishButton, NAV_HEIGHT, NAV_INACTIVE_LIGHT, NAV_INACTIVE_DARK } from '@components/ui/BottomNav';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotificationStore } from '@stores/notificationStore';
import { COLORS, THEME, SHADOWS } from '@constants/theme';

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
          height: NAV_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
          ...SHADOWS.sm,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? NAV_INACTIVE_DARK : NAV_INACTIVE_LIGHT,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => <NavIcon icon={Home} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) => <NavIcon icon={Map} color={color} focused={focused} />,
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
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              <NavIcon icon={MessageCircle} color={color} focused={focused} />
              <BadgeCount count={unreadMessageCount} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => <NavIcon icon={User} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: 4,
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
