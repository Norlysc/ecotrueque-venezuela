import { View, Text, Image, StyleSheet } from 'react-native';
import { TYPOGRAPHY, SPACING } from '@constants/theme';

interface UniversityFooterProps {
  // true sobre el fondo verde (texto claro); false sobre fondo claro
  onDark?: boolean;
}

// Créditos académicos: logo de la universidad, facultad y autores
export function UniversityFooter({ onDark = true }: UniversityFooterProps) {
  const main = onDark ? '#FFFFFF' : '#0A5C43';
  const soft = onDark ? 'rgba(255,255,255,0.8)' : '#4B5563';

  return (
    <View style={[styles.container, onDark && styles.containerOnDark]}>
      <View style={styles.logoWrap}>
        <Image source={require('../../../assets/logo-uvm.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.texts}>
        <Text style={[styles.university, { color: main }]}>Universidad Valle del Momboy</Text>
        <Text style={[styles.faculty, { color: soft }]}>
          Facultad de Ingeniería · Escuela de Ingeniería Computación/Industrial
        </Text>
        <Text style={[styles.authors, { color: soft }]}>
          Br. Rhonny Jaimes · Br. Norlys Castañeda
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING['2xl'],
    paddingHorizontal: SPACING.base,
    maxWidth: 560,
    alignSelf: 'center',
  },
  containerOnDark: {
    backgroundColor: 'rgba(8, 60, 45, 0.55)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 18,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logo: { width: 52, height: 52 },
  texts: { flexShrink: 1, gap: 2 },
  university: { fontSize: TYPOGRAPHY.size.sm, fontWeight: TYPOGRAPHY.weight.bold },
  faculty: { fontSize: TYPOGRAPHY.size.xs },
  authors: { fontSize: TYPOGRAPHY.size.xs, fontWeight: TYPOGRAPHY.weight.semibold },
});
