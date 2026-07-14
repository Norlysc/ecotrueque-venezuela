import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';

type ButtonVariant = 'primary' | 'eco' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type IconPosition = 'left' | 'right';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: IconPosition;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const SIZE_STYLES = {
  xs: { height: 32, paddingHorizontal: SPACING.md, fontSize: TYPOGRAPHY.size.xs, iconSize: 14 },
  sm: { height: 38, paddingHorizontal: SPACING.md, fontSize: TYPOGRAPHY.size.sm, iconSize: 16 },
  md: { height: 46, paddingHorizontal: SPACING.base, fontSize: TYPOGRAPHY.size.base, iconSize: 18 },
  lg: { height: 54, paddingHorizontal: SPACING.lg, fontSize: TYPOGRAPHY.size.md, iconSize: 20 },
  xl: { height: 60, paddingHorizontal: SPACING.xl, fontSize: TYPOGRAPHY.size.lg, iconSize: 22 },
} as const;

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || isLoading;
  const iconColor = variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#fff';

  const IconLeft = icon;
  const IconRight = icon;

  const content = (
    <View style={[styles.content, { gap: icon ? SPACING.xs : 0 }]}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#fff'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && IconLeft && (
            <IconLeft size={sizeStyle.iconSize} color={iconColor} strokeWidth={1.75} />
          )}
          <Text
            style={[
              styles.label,
              {
                fontSize: sizeStyle.fontSize,
                color:
                  variant === 'outline'
                    ? COLORS.primary
                    : variant === 'ghost'
                    ? COLORS.primary
                    : '#fff',
                fontWeight: TYPOGRAPHY.weight.semibold,
              },
            ]}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && IconRight && (
            <IconRight size={sizeStyle.iconSize} color={iconColor} strokeWidth={1.75} />
          )}
        </>
      )}
    </View>
  );

  const buttonStyle = [
    styles.base,
    { height: sizeStyle.height, paddingHorizontal: sizeStyle.paddingHorizontal },
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  if (variant === 'primary') {
    if (isDisabled) {
      return (
        <View style={[buttonStyle, { backgroundColor: COLORS.gray300 }]}>
          {content}
        </View>
      );
    }
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[buttonStyle, SHADOWS.green]}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: RADIUS.md }]}
        />
        {content}
      </TouchableOpacity>
    );
  }

  if (variant === 'eco') {
    if (isDisabled) {
      return <View style={[buttonStyle, { backgroundColor: COLORS.gray300 }]}>{content}</View>;
    }
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[buttonStyle, SHADOWS.green]}>
        <LinearGradient
          colors={[COLORS.primaryDarker, COLORS.primary, COLORS.primaryLighter]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: RADIUS.md }]}
        />
        {content}
      </TouchableOpacity>
    );
  }

  const solidStyles: Record<string, ViewStyle> = {
    secondary: { backgroundColor: isDisabled ? COLORS.gray300 : COLORS.secondary },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: isDisabled ? COLORS.gray300 : COLORS.primary,
    },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: isDisabled ? COLORS.gray300 : COLORS.error },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[buttonStyle, solidStyles[variant]]}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { letterSpacing: 0.2 },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
});
