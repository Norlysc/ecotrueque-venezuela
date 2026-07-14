import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@constants/theme';
import { ECO_LEVELS, getEcoLevel } from '@constants/theme';
import type { EcoLevel } from '@/types/app.types';

type BadgeVariant =
  | 'eco'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'verified';

type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  eco: { bg: '#E8F5F0', text: COLORS.primaryDark },
  primary: { bg: `${COLORS.primary}22`, text: COLORS.primaryDark },
  secondary: { bg: `${COLORS.secondary}22`, text: COLORS.secondaryDark },
  success: { bg: `${COLORS.success}22`, text: COLORS.successDark },
  warning: { bg: `${COLORS.warning}22`, text: COLORS.accentDark },
  error: { bg: `${COLORS.error}22`, text: COLORS.errorDark },
  info: { bg: `${COLORS.info}22`, text: COLORS.infoDark },
  neutral: { bg: COLORS.gray100, text: COLORS.gray600 },
  verified: { bg: `${COLORS.info}22`, text: COLORS.infoDark },
};

const SIZE_STYLES: Record<BadgeSize, { paddingH: number; paddingV: number; fontSize: number }> = {
  xs: { paddingH: SPACING.xs + 2, paddingV: 2, fontSize: TYPOGRAPHY.size.xs - 1 },
  sm: { paddingH: SPACING.sm, paddingV: SPACING.xs, fontSize: TYPOGRAPHY.size.xs },
  md: { paddingH: SPACING.md, paddingV: SPACING.xs + 2, fontSize: TYPOGRAPHY.size.sm },
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.bg,
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: variantStyle.text, fontSize: sizeStyle.fontSize },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

interface EcoBadgeProps {
  level: EcoLevel;
  size?: BadgeSize;
}

export function EcoBadge({ level, size = 'sm' }: EcoBadgeProps) {
  const levelInfo = ECO_LEVELS[level];
  return (
    <Badge
      label={`${levelInfo.emoji} ${levelInfo.label}`}
      variant="eco"
      size={size}
    />
  );
}

interface VerifiedBadgeProps {
  size?: BadgeSize;
}

export function VerifiedBadge({ size = 'sm' }: VerifiedBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        styles.verifiedBadge,
        { paddingHorizontal: SIZE_STYLES[size].paddingH, paddingVertical: SIZE_STYLES[size].paddingV },
      ]}
    >
      <CheckCircle size={SIZE_STYLES[size].fontSize + 2} color={COLORS.info} strokeWidth={1.75} />
      <Text style={[styles.label, { color: COLORS.infoDark, fontSize: SIZE_STYLES[size].fontSize }]}>
        Verificado
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: `${COLORS.info}22`,
  },
});
