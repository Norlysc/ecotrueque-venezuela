import { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { COLORS, THEME, TYPOGRAPHY, SPACING, RADIUS } from '@constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  isDark?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    isPassword = false,
    isDark = false,
    style,
    ...props
  },
  ref
) {
  const theme = isDark ? THEME.dark : THEME.light;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? COLORS.error
    : isFocused
    ? COLORS.primary
    : theme.border;

  const LeftIcon = leftIcon;
  const RightIcon = rightIcon;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: theme.surface,
            borderWidth: isFocused ? 2 : 1.5,
          },
        ]}
      >
        {LeftIcon && (
          <View style={styles.leftIcon}>
            <LeftIcon
              size={18}
              color={isFocused ? COLORS.primary : theme.textTertiary}
              strokeWidth={1.75}
            />
          </View>
        )}

        <TextInput
          ref={ref}
          autoCorrect={false}
          {...props}
          style={[
            styles.input,
            { color: theme.text },
            leftIcon && { paddingLeft: 0 },
            (rightIcon || isPassword) && { paddingRight: 0 },
            style,
          ]}
          placeholderTextColor={theme.textTertiary}
          onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
          secureTextEntry={isPassword && !showPassword}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.rightIcon}
          >
            {showPassword
              ? <EyeOff size={18} color={theme.textTertiary} strokeWidth={1.75} />
              : <Eye size={18} color={theme.textTertiary} strokeWidth={1.75} />
            }
          </TouchableOpacity>
        )}

        {RightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <RightIcon size={18} color={theme.textTertiary} strokeWidth={1.75} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorRow}>
          <AlertCircle size={12} color={COLORS.error} strokeWidth={1.75} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {hint && !error && (
        <Text style={[styles.hint, { color: theme.textTertiary }]}>{hint}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.base },
  label: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    height: 52,
    paddingHorizontal: SPACING.md,
  },
  leftIcon: { marginRight: SPACING.sm },
  rightIcon: { marginLeft: SPACING.sm, padding: 4 },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.size.base,
    height: '100%',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.size.xs,
  },
  hint: {
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: SPACING.xs,
  },
});
