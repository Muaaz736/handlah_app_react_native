import React, { FC, memo, useRef, useEffect, useMemo } from 'react';
import { View, Animated, Text } from 'react-native';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { makeTypingIndicatorStyles } from './TypingIndicator.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const TypingIndicator: FC = memo(() => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeTypingIndicatorStyles(themeColors as RoleTheme), [themeColors]);

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ]),
      );

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);

    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingContainer}>
      <View style={[styles.botAvatarSmall, { backgroundColor: themeColors.primary }]}> 
        <Text style={styles.botAvatarText}>✦</Text>
      </View>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
});

TypingIndicator.displayName = 'TypingIndicator';


export default TypingIndicator;
