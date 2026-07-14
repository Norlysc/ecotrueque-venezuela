import { TouchableOpacity, View, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { THEME, RADIUS, SHADOWS } from '@constants/theme';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  isDark?: boolean;
}

export function Card({ children, variant = 'elevated', onPress, style, isDark }: CardProps) {
  const colorScheme = useColorScheme();
  const dark = isDark ?? colorScheme === 'dark';
  const theme = dark ? THEME.dark : THEME.light;

  const variantStyles: Record<CardVariant, ViewStyle> = {
    elevated: {
      backgroundColor: theme.card,
      ...SHADOWS.sm,
    },
    outlined: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filled: {
      backgroundColor: theme.surface,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const cardStyle = [
    styles.card,
    variantStyles[variant],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
});
