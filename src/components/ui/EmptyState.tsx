import { View, Text, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Button } from './Button';
import { IconTile } from './IconTile';
import { THEME, TYPOGRAPHY, SPACING } from '@constants/theme';

interface EmptyStateProps {
  emoji?: string;
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  isDark?: boolean;
}

export function EmptyState({
  emoji = '📭',
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  isDark = false,
}: EmptyStateProps) {
  const theme = isDark ? THEME.dark : THEME.light;

  return (
    <View style={styles.container}>
      {icon ? (
        <IconTile icon={icon} size={80} iconSize={36} rounded style={{ marginBottom: SPACING.sm }} />
      ) : (
        <Text style={styles.emoji}>{emoji}</Text>
      )}
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
    gap: SPACING.md,
  },
  emoji: { fontSize: 64, marginBottom: SPACING.sm },
  title: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.base,
    textAlign: 'center',
    lineHeight: 24,
  },
});
