import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Package, type LucideIcon } from 'lucide-react-native';
import { COLORS, RADIUS } from '@constants/theme';
import { getCategoryById, type CategoryId } from '@constants/categories';

type TileVariant = 'soft' | 'solid' | 'onDark' | 'plain';

interface IconTileProps {
  icon: LucideIcon;
  size?: number;
  iconSize?: number;
  variant?: TileVariant;
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Ícono de la marca dentro de un recuadro verde suave. Reemplaza a los emojis
// para darle a la app un aspecto uniforme y profesional.
export function IconTile({
  icon: Icon,
  size = 40,
  iconSize,
  variant = 'soft',
  rounded = false,
  style,
}: IconTileProps) {
  const bg =
    variant === 'solid' ? COLORS.primary
    : variant === 'onDark' ? 'rgba(255,255,255,0.16)'
    : variant === 'plain' ? 'transparent'
    : `${COLORS.primary}18`;
  const color = variant === 'solid' || variant === 'onDark' ? '#FFFFFF' : COLORS.primary;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: rounded ? size / 2 : Math.min(RADIUS.md, size / 3),
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Icon size={iconSize ?? Math.round(size * 0.5)} color={color} strokeWidth={1.75} />
    </View>
  );
}

// Ícono de una categoría (si no existe, usa el de "Otros")
export function CategoryIcon({
  categoryId,
  ...rest
}: Omit<IconTileProps, 'icon'> & { categoryId?: string | null }) {
  const icon = categoryId ? getCategoryById(categoryId as CategoryId)?.icon ?? Package : Package;
  return <IconTile icon={icon} {...rest} />;
}
