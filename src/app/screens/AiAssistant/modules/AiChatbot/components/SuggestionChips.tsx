import React, { FC, memo, useMemo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { makeSuggestionChipsStyles } from './SuggestionChips.styles';

interface ISuggestionChipsProps {
  onPress: (text: string) => void;
  themeColor: string;
  visible: boolean;
  suggestions?: string[]; // allow overriding default list
  styles: ReturnType<typeof makeSuggestionChipsStyles>;
}

const DEFAULT_SUGGESTIONS = [
  'View my assets',
  'Check liabilities',
  // 'Upcoming payments',
];


const SuggestionChips: FC<ISuggestionChipsProps> = memo(
  ({ onPress, themeColor, visible, suggestions = DEFAULT_SUGGESTIONS, styles }) => {
    if (!visible) return null;
    return (
      <View style={styles.chipsContainer}>
        {suggestions.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, { borderColor: themeColor }]}
            onPress={() => onPress(s)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, { color: themeColor }]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  },
);

SuggestionChips.displayName = 'SuggestionChips';


export default SuggestionChips;
