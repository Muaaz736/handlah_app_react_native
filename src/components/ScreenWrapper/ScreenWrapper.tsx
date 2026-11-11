import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getColorWithOpacity } from '../../utils/colors';
import { isIOS } from '../../utils/helpers';
import { useUserRole } from '../../hooks/useUserRole';
import type { ScreenWrapperProps } from '../../types/screenWrapper.types';
import { OfflineBanner } from '../common';
import { makeScreenWrapperStyles } from './ScreenWrapper.styles';
import { RoleTheme } from '../../types/roleManager.types';

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  showShadow = true,
  shadowHeight = 120,
  backgroundColor,
  gradientColors,
  gradientLocations = [0, 0.118, 0.2774, 0.4327, 0.5913],
  statusBarStyle = 'light-content',
  statusBarBackground,
  borderRadius = 25,
  containerStyle,
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeScreenWrapperStyles(themeColors as RoleTheme), [themeColors]);

  const resolvedBackgroundColor = backgroundColor ?? themeColors.background;

  const resolvedGradientColors =
    gradientColors ||
    (themeColors.gradient as string[]) || [
      '#10610D',
      '#6cb126cf',
      '#a3e05eb2',
      '#eaf8dab2',
      themeColors.background,
    ];

  const resolvedStatusBarBackground =
    statusBarBackground || getColorWithOpacity(themeColors.secondary, 0.2);

  const scrollViewRef = useRef<ScrollView>(null);
  const [currentShadowHeight, setCurrentShadowHeight] =
    useState<number>(shadowHeight);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const scrollY = event.nativeEvent.contentOffset.y;

    const minHeight = 60;
    const scrollThreshold = 100;

    let newHeight: number;
    if (scrollY <= 0) {
      newHeight = shadowHeight;
    } else if (scrollY >= scrollThreshold) {
      newHeight = minHeight;
    } else {
      const progress = scrollY / scrollThreshold;
      newHeight = shadowHeight - (shadowHeight - minHeight) * progress;
    }

    setCurrentShadowHeight(newHeight);
  };

  const showSolidColor = currentShadowHeight <= 60;

  const content = (
    <View style={[styles.contentContainer, { backgroundColor: resolvedBackgroundColor }]}>
      {showShadow && (
        <View
          style={[
            styles.gradientWrapper,
            {
              height: showSolidColor ? 60 : currentShadowHeight,
              borderBottomLeftRadius: borderRadius,
              borderBottomRightRadius: borderRadius,
            },
          ]}
        >
          {!showSolidColor && (
            <LinearGradient
              colors={resolvedGradientColors}
              locations={gradientLocations}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradient}
            />
          )}
        </View>
      )}

      <View style={styles.contentLayer}>
        {scrollable ? (
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
            scrollEventThrottle={16}
            onScroll={showShadow ? handleScroll : undefined}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.nonScrollableContent}>{children}</View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, containerStyle]}
      edges={['top']}
    >
      <OfflineBanner />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={isIOS ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ScreenWrapper;
