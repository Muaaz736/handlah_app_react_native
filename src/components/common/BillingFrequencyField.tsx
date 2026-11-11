import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomDropDown from './CustomDropDown';
import { useUserRole } from '../../hooks/useUserRole';
import FONTS from '../../utils/fonts';
import { billingFrequencyKey, billingFrequencyOptions } from '../../utils/billingFrequency';

/**
 * Billing Frequency picker for an insurance premium or warranty cost, as on the website
 * (One-Time, Weekly, Bi-Weekly, Monthly, Quarterly, Annually).
 */
export default function BillingFrequencyField({
  value,
  onChange,
  style,
  labelStyle,
}: {
  value: string | null | undefined;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}): React.ReactElement {
  const { t } = useTranslation();
  const { themeColors } = useUserRole();
  return (
    <View style={[styles.wrap, style]}>
      <Text style={[styles.label, { color: themeColors.textPrimary }, labelStyle]}>{t('utilities.billing_frequency')}</Text>
      <CustomDropDown
        options={billingFrequencyOptions()}
        value={billingFrequencyKey(value) ?? ''}
        onSelect={v => onChange((v as string) || '')}
        placeholder={t('utilities.billing_frequency_placeholder')}
        search={false}
        leftIcon
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 14, fontFamily: FONTS.display_semi_bold, marginBottom: 6 },
});
