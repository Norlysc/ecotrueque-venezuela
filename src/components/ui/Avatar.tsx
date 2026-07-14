import { View, Text, Image, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS, THEME, TYPOGRAPHY, RADIUS, SHADOWS } from '@constants/theme';
import { ECO_LEVELS, getEcoLevel } from '@constants/theme';
import type { EcoLevel } from '@/types/app.types';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 60,
  xl: 80,
  '2xl': 100,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 10,
  sm: 14,
  md: 16,
  lg: 22,
  xl: 30,
  '2xl': 38,
};

const COLOR_PALETTE = [
  '#1D9E75', '#7F77DD', '#EF9F27', '#E24B4A', '#378ADD',
  '#34C759', '#FF6B6B', '#F472B6', '#0F6E56', '#5E56C4',
];

const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
};

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: AvatarSize;
  ecoLevel?: EcoLevel;
  isOnline?: boolean;
  isVerified?: boolean;
  isDark?: boolean;
}

export function Avatar({
  uri,
  name,
  size = 'md',
  ecoLevel,
  isOnline,
  isVerified,
  isDark = false,
}: AvatarProps) {
  const theme = isDark ? THEME.dark : THEME.light;
  const dim = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const bgColor = getColorFromName(name);
  const borderColor = ecoLevel ? ECO_LEVELS[ecoLevel].color : undefined;
  const badgeSize = dim <= 36 ? 8 : dim <= 60 ? 10 : 14;
  const borderWidth = ecoLevel ? (dim >= 60 ? 3 : 2) : 0;

  return (
    <View style={[styles.wrapper, { width: dim, height: dim }]}>
      <View
        style={[
          styles.container,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            borderWidth,
            borderColor: borderColor ?? 'transparent',
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: dim, height: dim, borderRadius: dim / 2 }}
          />
        ) : (
          <View
            style={[
              styles.initials,
              {
                width: dim,
                height: dim,
                borderRadius: dim / 2,
                backgroundColor: bgColor,
              },
            ]}
          >
            <Text style={[styles.initialsText, { fontSize, color: '#fff' }]}>
              {getInitials(name)}
            </Text>
          </View>
        )}
      </View>

      {/* Dot online */}
      {isOnline !== undefined && (
        <View
          style={[
            styles.onlineDot,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: isOnline ? COLORS.success : COLORS.gray400,
              borderColor: theme.background,
              right: borderWidth > 0 ? -2 : 0,
              bottom: borderWidth > 0 ? -2 : 0,
            },
          ]}
        />
      )}

      {/* Badge verificado */}
      {isVerified && (
        <View style={[styles.verifiedBadge, { borderColor: theme.background }]}>
          <Check size={badgeSize - 2} color="#fff" strokeWidth={1.75} />
        </View>
      )}
    </View>
  );
}

interface AvatarGroupProps {
  users: { uri?: string | null; name: string }[];
  max?: number;
  size?: AvatarSize;
  isDark?: boolean;
}

export function AvatarGroup({ users, max = 3, size = 'sm', isDark = false }: AvatarGroupProps) {
  const theme = isDark ? THEME.dark : THEME.light;
  const dim = SIZE_MAP[size];
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <View style={{ flexDirection: 'row' }}>
      {visible.map((user, i) => (
        <View key={i} style={{ marginLeft: i > 0 ? -(dim * 0.3) : 0 }}>
          <Avatar uri={user.uri} name={user.name} size={size} isDark={isDark} />
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={[
            styles.overflowBadge,
            {
              width: dim,
              height: dim,
              borderRadius: dim / 2,
              backgroundColor: COLORS.gray400,
              marginLeft: -(dim * 0.3),
              borderColor: theme.background,
            },
          ]}
        >
          <Text style={{ color: '#fff', fontSize: FONT_SIZE_MAP[size] - 2, fontWeight: '700' }}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  container: { overflow: 'hidden' },
  initials: { alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontWeight: TYPOGRAPHY.weight.bold },
  onlineDot: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.info,
    borderRadius: RADIUS.full,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  overflowBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
