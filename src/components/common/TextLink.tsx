import React, { useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useUserRole } from '../../hooks/useUserRole';
import type { TextLinkProps } from '../../types/common.types';
import { makeTextLinkStyles } from './TextLink.styles';
import { RoleTheme } from '../../types/roleManager.types';

const TextLink: React.FC<TextLinkProps> = ({
  text,
  linkText,
  onPress,
  disabled = false,
  textStyle,
  linkStyle,
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeTextLinkStyles(themeColors as RoleTheme), [themeColors]);

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7}>
      <Text style={[styles.text, textStyle]}>
        {text}{' '}
        <Text style={[styles.link, { color: themeColors.primary }, linkStyle]}>
          {linkText}
        </Text>
      </Text>
    </TouchableOpacity>
  );
};

export default TextLink;
