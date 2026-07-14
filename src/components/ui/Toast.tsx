import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@constants/theme';

interface ToastProps {
  text1?: string;
  text2?: string;
}

function SuccessToast({ text1, text2 }: ToastProps) {
  return (
    <View style={[styles.container, styles.success]}>
      <View style={[styles.iconCircle, { backgroundColor: COLORS.success }]}>
        <CheckCircle size={18} color="#fff" strokeWidth={1.75} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  );
}

function ErrorToast({ text1, text2 }: ToastProps) {
  return (
    <View style={[styles.container, styles.error]}>
      <View style={[styles.iconCircle, { backgroundColor: COLORS.error }]}>
        <AlertCircle size={18} color="#fff" strokeWidth={1.75} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  );
}

function InfoToast({ text1, text2 }: ToastProps) {
  return (
    <View style={[styles.container, styles.info]}>
      <View style={[styles.iconCircle, { backgroundColor: COLORS.info }]}>
        <Info size={18} color="#fff" strokeWidth={1.75} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  );
}

export const toastConfig = {
  success: (props: any) => <SuccessToast {...props} />,
  error: (props: any) => <ErrorToast {...props} />,
  info: (props: any) => <InfoToast {...props} />,
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    ...SHADOWS.lg,
  },
  success: { backgroundColor: '#ECFDF5', borderLeftWidth: 4, borderLeftColor: COLORS.success },
  error: { backgroundColor: '#FEF2F2', borderLeftWidth: 4, borderLeftColor: COLORS.error },
  info: { backgroundColor: '#EFF6FF', borderLeftWidth: 4, borderLeftColor: COLORS.info },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: { flex: 1, gap: 2 },
  title: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: '#111827',
  },
  message: {
    fontSize: TYPOGRAPHY.size.sm,
    color: '#4B5563',
  },
});
