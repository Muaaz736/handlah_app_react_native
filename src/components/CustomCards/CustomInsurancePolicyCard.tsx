import { Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo } from 'react';
import { getColorWithOpacity } from '../../utils/colors';
import { ICONS } from '../../utils/Images';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CustomInsurancePolicyCardProps } from '../../types/CustomInsurancePolicyCard.types';
import { useUserRole } from '../../hooks/useUserRole';
import { makeCustomInsurancePolicyCardStyles } from './CustomInsurancePolicyCard.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomInsurancePolicyCard: React.FC<CustomInsurancePolicyCardProps> = ({
  property,
  onShare,
  onEdit,
  onDelete,
  onPress,
}) => {
      const { themeColors } = useUserRole();
      const styles = useMemo(() => makeCustomInsurancePolicyCardStyles(themeColors as RoleTheme), [themeColors]);
  return (
    <TouchableOpacity
      onPress={onPress}
      key={property.id}
      style={styles.propertyCard}
    >
      <View style={styles.propertyInfo}>
        <View style={styles.propertyNameRow}>
          <Text style={[styles.propertyName]}>{property.title}</Text>
          <Text
            style={[styles.amountBadge, { backgroundColor: getColorWithOpacity(themeColors.darkGreen, 0.5) }]}
          >
            {property.amount}
          </Text>
        </View>
        <Text style={[styles.propertyCategory]}>{property.subtitle}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onShare(property)}
        >
          <Image
            source={ICONS.SHARE_PRIMARY_ICON}
            style={[styles.shareIcon, { tintColor: themeColors.secondary }]}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(property)}
        >
          <Feather name="edit-2" size={18} color={themeColors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onDelete(property)}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={20}
            color={themeColors.secondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default CustomInsurancePolicyCard;
