import React, { useState, useEffect, useRef, useMemo } from 'react';
import { enforceHttps } from '../../utils/httpsGuard';
import {
  Image,
  ImageProps,
  ActivityIndicator,
  View,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { getImageAsync } from '../../redux/services/authService';
import { getOfflineImageUri } from '../../services/offline/OfflineQueueService';
import colors from '../../utils/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUserRole } from '../../hooks/useUserRole';
import { AppDispatch } from '../../types/store.types';
import { makeRemoteImageStyles } from './RemoteImage.styles';
import { RoleTheme } from '../../types/roleManager.types';


interface RemoteImageProps extends Omit<ImageProps, 'source'> {
  imageId?: string | object | null | undefined;
  imageIds?: string[];
  fallbackSource?: any;
}

interface SingleItemProps {
  id: string | object;
  style?: any;
  imageProps?: any;
  themeColors: any;
  onPress?: (uri: string) => void;
  styles: any;
}

const SingleRemoteImage: React.FC<SingleItemProps> = ({ id, style, imageProps = {}, themeColors, onPress, styles }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { resolve(); }, [id]);

  const resolve = async () => {
    if (!id || id === 'null' || id === 'undefined') {
      setUri(null); setLoading(false); return;
    }
    try {
      setLoading(true); setError(false);

      if (typeof id === 'object' && id !== null) {
        const obj = id as any;
        const url = obj.signedurl || obj.signedUrl || obj.url;
        if (url) { setUri(url); setLoading(false); return; }
      }

      if (typeof id === 'string') {
        if (id.startsWith('http://') || id.startsWith('https://')) {
          setUri(enforceHttps(id)); setLoading(false); return;
        }
        if (id.startsWith('offline_')) {
          const entry = await getOfflineImageUri(id);
          setUri(entry?.localUri ?? null);
          if (!entry?.localUri) setError(true);
          setLoading(false); return;
        }
        const res = await dispatch(getImageAsync(id)).unwrap();
        const url = res.signedurl || res.signedUrl || res.url;
        if (url) { setUri(url); } else { throw new Error('No signed URL'); }
      }
      setLoading(false);
    } catch {
      setError(true); setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.itemContainer, style]}>
        <ActivityIndicator size="small" color={themeColors.primary} />
      </View>
    );
  }
  if (error || !uri) {
    return (
      <View style={[styles.itemContainer, style]}>
        <View style={styles.placeholder} />
      </View>
    );
  }
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress ? () => onPress(uri!) : undefined}
      disabled={!onPress}
    >
      <Image
        source={{ uri }}
        style={style}
        {...imageProps}
        onError={() => setError(true)}
      />
    </TouchableOpacity>
  );
};

interface MultiProps {
  ids: string[];
  style?: any;
  imageProps?: any;
  themeColors: any;
  onPreview?: (uri: string) => void;
  styles: any;
}

const MultiRemoteImage: React.FC<MultiProps> = ({ ids, style, imageProps = {}, themeColors, onPreview, styles }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    setItemWidth(e.nativeEvent.layout.width);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!itemWidth) return;
    const idx = Math.round(e.nativeEvent.contentOffset.x / itemWidth);
    setActiveIndex(Math.max(0, Math.min(idx, ids.length - 1)));
  };

  return (
    <View onLayout={handleLayout}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {ids.map(id => (
          <View key={id} style={[{ width: itemWidth }, styles.scrollItem]}>
            <SingleRemoteImage
              id={id}
              style={[style, itemWidth ? { width: itemWidth } : undefined]}
              imageProps={imageProps}
              themeColors={themeColors}
              onPress={onPreview}
              styles={styles}
            />
          </View>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={styles.dotsRow}>
        {ids.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex
                ? { backgroundColor: themeColors.primary, width: 16 }
                : { backgroundColor: colors.border },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const RemoteImage: React.FC<RemoteImageProps> = ({
  imageId,
  imageIds,
  fallbackSource,
  style,
  ...imageProps
}) => {
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeRemoteImageStyles(themeColors as RoleTheme), [themeColors]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const renderPreviewModal = () => (
    <Modal
      visible={!!previewUri}
      transparent={false}
      animationType="fade"
      onRequestClose={() => setPreviewUri(null)}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.previewModal}>
        <TouchableWithoutFeedback onPress={() => setPreviewUri(null)}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        {previewUri && (
          <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
        )}
        <TouchableOpacity
          style={styles.previewCloseBtn}
          onPress={() => setPreviewUri(null)}
          activeOpacity={0.8}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );

  const validIds = imageIds?.filter(id => id && id !== 'null' && id !== 'undefined') ?? [];

  if (imageIds !== undefined) {
    if (validIds.length === 0) {
      // No images — show fallback
      if (fallbackSource) return <Image source={fallbackSource} style={style} {...imageProps} />;
      return <View style={[styles.itemContainer, style]}><View style={styles.placeholder} /></View>;
    }

    if (validIds.length === 1) {
      return (
        <>
          <SingleRemoteImage
            id={validIds[0]}
            style={style}
            imageProps={imageProps}
            themeColors={themeColors}
            onPress={uri => setPreviewUri(uri)}
            styles={styles}
          />
          {renderPreviewModal()}
        </>
      );
    }

    return (
      <>
        <MultiRemoteImage
          ids={validIds}
          style={style}
          imageProps={imageProps}
          themeColors={themeColors}
          onPreview={uri => setPreviewUri(uri)}
          styles={styles}
        />
        {renderPreviewModal()}
      </>
    );
  }

  if (!imageId) {
    if (fallbackSource) return <Image source={fallbackSource} style={style} {...imageProps} />;
    return <View style={[styles.itemContainer, style]}><View style={styles.placeholder} /></View>;
  }

  return (
    <>
      <SingleRemoteImage
        id={imageId}
        style={style}
        imageProps={imageProps}
        themeColors={themeColors}
        onPress={uri => setPreviewUri(uri)}
        styles={styles}
      />
      {renderPreviewModal()}
    </>
  );
};


export default RemoteImage;
