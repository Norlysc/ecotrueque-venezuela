import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { THEME, RADIUS, SPACING } from '@constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  isDark?: boolean;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = RADIUS.sm, style, isDark = false }: SkeletonProps) {
  const theme = isDark ? THEME.dark : THEME.light;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? '#333332' : '#E5E7EB',
          opacity,
        },
        style,
      ]}
    />
  );
}

interface ListingCardSkeletonProps {
  isDark?: boolean;
}

export function ListingCardSkeleton({ isDark = false }: ListingCardSkeletonProps) {
  const theme = isDark ? THEME.dark : THEME.light;
  return (
    <View style={[styles.cardSkeleton, { backgroundColor: theme.surface }]}>
      <Skeleton height={150} borderRadius={RADIUS.md} isDark={isDark} />
      <View style={styles.cardSkeletonContent}>
        <Skeleton height={14} width="80%" isDark={isDark} />
        <Skeleton height={12} width="50%" isDark={isDark} />
        <Skeleton height={12} width="65%" isDark={isDark} />
      </View>
    </View>
  );
}

interface ProfileSkeletonProps {
  isDark?: boolean;
}

export function ProfileSkeleton({ isDark = false }: ProfileSkeletonProps) {
  return (
    <View style={styles.profileSkeleton}>
      <View style={styles.profileSkeletonHeader}>
        <Skeleton width={100} height={100} borderRadius={50} isDark={isDark} />
        <View style={styles.profileSkeletonInfo}>
          <Skeleton height={18} width="60%" isDark={isDark} />
          <Skeleton height={14} width="40%" isDark={isDark} />
          <Skeleton height={14} width="70%" isDark={isDark} />
        </View>
      </View>
      <Skeleton height={80} isDark={isDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    width: '47%',
  },
  cardSkeletonContent: {
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  profileSkeleton: {
    gap: SPACING.base,
    padding: SPACING.base,
  },
  profileSkeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  profileSkeletonInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
});
