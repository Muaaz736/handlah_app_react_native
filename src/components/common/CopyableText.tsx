import React, { useState } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { showSuccessToast } from './CustomToast';
import colors from '../../utils/colors';

/** Empty, "-", "N/A" or "none" — nothing worth copying. */
export function isCopyable(value: unknown): value is string | number {
  if (value == null) return false;
  const s = String(value).trim();
  return s !== '' && s !== '-' && s !== '—' && s.toUpperCase() !== 'N/A' && s.toLowerCase() !== 'none';
}

interface Props {
  value: string | number | null | undefined;
  /** What's being copied, for the toast and screen readers ("Account number"). */
  label?: string;
  style?: StyleProp<TextStyle>;
  /** Shown when there's no value. */
  fallback?: string;
  iconColor?: string;
}

/**
 * A value that can be copied: the text itself can be long-pressed and selected, and a copy icon next to it puts it on
 * the clipboard in one tap. No icon when there's nothing to copy.
 */
const CopyableText: React.FC<Props> = ({ value, label, style, fallback = 'N/A', iconColor }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copyable = isCopyable(value);
  const text = copyable ? String(value).trim() : fallback;

  const onCopy = () => {
    Clipboard.setString(text);
    setCopied(true);
    showSuccessToast(
      label
        ? t('common.copied_label', { defaultValue: '{{label}} copied', label })
        : t('common.copied', { defaultValue: 'Copied' }),
      t('common.copied', { defaultValue: 'Copied' }),
    );
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text selectable style={[style, { flexShrink: 1 }]}>
        {text}
      </Text>
      {copyable ? (
        <TouchableOpacity
          onPress={onCopy}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={
            label ? t('common.copy_label', { defaultValue: 'Copy {{label}}', label }) : t('common.copy', { defaultValue: 'Copy' })
          }
          style={{ marginLeft: 6, padding: 2 }}
        >
          <Feather name={copied ? 'check' : 'copy'} size={15} color={iconColor ?? colors.gray ?? '#7F7F7F'} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default CopyableText;
