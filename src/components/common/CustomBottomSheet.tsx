import { useUserRole } from '../../hooks/useUserRole';
import React, {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import type { CustomBottomSheetProps, CustomBottomSheetRef } from '../../types/common.types';
import { makeCustomBottomSheetStyles } from './CustomBottomSheet.styles';
import { RoleTheme } from '../../types/roleManager.types';

const CustomBottomSheet = forwardRef<CustomBottomSheetRef, CustomBottomSheetProps>(
  (
    {
      snapPoints = ['25%', '50%', '90%'],
      children,
      onSheetChanges,
      enablePanDownToClose = true,
      backgroundStyle,
      handleIndicatorStyle,
      containerStyle,
      index = -1,
      enableBackdrop = true,
      backdropOpacity = 0.5,
      backdropPressBehavior = 'close',
      enableDynamicSizing = false,
      keyboardBehavior = 'fillParent',
      keyboardBlurBehavior = 'restore',
      android_keyboardInputMode = 'adjustResize',
      ...props
    },
    ref,
  ) => {
    // ref
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeCustomBottomSheetStyles(themeColors as RoleTheme), [themeColors]);
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
      snapToPosition: (position: number) =>
        bottomSheetRef.current?.snapToPosition(position),
      expand: () => bottomSheetRef.current?.expand(),
      collapse: () => bottomSheetRef.current?.collapse(),
      close: () => bottomSheetRef.current?.close(),
      forceClose: () => bottomSheetRef.current?.forceClose(),
    }));

    // callbacks
    const handleSheetChanges = useCallback(
      (index: number) => {
        onSheetChanges?.(index);
      },
      [onSheetChanges],
    );

    // Backdrop component with custom opacity
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) =>
        enableBackdrop ? (
          <BottomSheetBackdrop
            {...props}
            opacity={backdropOpacity}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior={backdropPressBehavior}
          />
        ) : null,
      [enableBackdrop, backdropOpacity, backdropPressBehavior],
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={index}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={enablePanDownToClose}
        backgroundStyle={[styles.backgroundStyle, backgroundStyle]}
        handleIndicatorStyle={[
          styles.handleIndicatorStyle,
          handleIndicatorStyle,
        ]}
        style={styles.bottomSheetStyle}
        backdropComponent={renderBackdrop}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior={keyboardBlurBehavior}
        android_keyboardInputMode={android_keyboardInputMode}
        {...props}
      >
        <BottomSheetView style={[styles.contentContainer, containerStyle]}>
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

CustomBottomSheet.displayName = 'CustomBottomSheet';

export default CustomBottomSheet;
