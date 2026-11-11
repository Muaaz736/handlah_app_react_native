import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { apiHandle } from '../../../../config/apiHandle';
import colors from '../../../../utils/colors';
import FONTS from '../../../../utils/fonts';

interface StorageData {
  plan: 'free' | 'pro' | string;
  storageUsed: number;
  storageLimit: number;
  isLimitReached: boolean;
}

interface Props {
  primaryColor: string;
}

const StoragePlanCard: React.FC<Props> = ({ primaryColor }) => {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiHandle
      .get<StorageData>('user/storage-plan')
      .then(res => {
        if (!cancelled) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const planLabel =
    data?.plan === 'pro'
      ? 'Pro'
      : data?.plan === 'free'
      ? 'Free'
      : null;

  const usedMB = Math.round(data?.storageUsed ?? 0);
  const limitMB = Math.round(data?.storageLimit ?? 0);
  const progress =
    limitMB > 0 ? Math.min(usedMB / limitMB, 1) : 0;
  const isLimitReached = data?.isLimitReached ?? false;

  const formatSize = (mb: number) =>
    mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb} MB`;

  const barColor = isLimitReached
    ? '#FF3B30'
    : progress > 0.85
    ? '#FF9500'
    : primaryColor;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Storage & Plan</Text>
        {!loading && planLabel ? (
          <View
            style={[
              styles.planBadge,
              {
                backgroundColor:
                  planLabel === 'Pro'
                    ? primaryColor
                    : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.planBadgeText,
                {
                  color:
                    planLabel === 'Pro' ? colors.white : colors.text,
                },
              ]}
            >
              {planLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {loading && (
        <ActivityIndicator
          size="small"
          color={primaryColor}
          style={{ alignSelf: 'flex-start' }}
        />
      )}

      {!loading && failed && (
        <Text style={styles.hintText}>
          Storage info unavailable.
        </Text>
      )}

      {!loading && !failed && data && (
        <>
          <View style={styles.usageRow}>
            <Text style={styles.usageText}>
              {formatSize(usedMB)} used
            </Text>
            <Text style={styles.usageText}>
              {formatSize(limitMB)} total
            </Text>
          </View>

          <View style={styles.trackBar}>
            <View
              style={[
                styles.fillBar,
                {
                  width: `${Math.round(progress * 100)}%` as any,
                  backgroundColor: barColor,
                },
              ]}
            />
          </View>

          {isLimitReached ? (
            <Text style={styles.warningText}>
              Storage is full. Remove files to free up space.
            </Text>
          ) : progress > 0.85 ? (
            <Text style={styles.cautionText}>
              Storage is almost full.
            </Text>
          ) : (
            <Text style={styles.hintText}>
              {Math.round((1 - progress) * 100)}% available
            </Text>
          )}

          <Text style={styles.manageNote}>
            To manage your subscription, visit NCHRG.com from your browser.
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.display_semi_bold,
    fontSize: 15,
    color: colors.text,
  },
  planBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  planBadgeText: {
    fontFamily: FONTS.display_semi_bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  usageText: {
    fontFamily: FONTS.display_regular,
    fontSize: 13,
    color: colors.text,
    opacity: 0.7,
  },
  trackBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 4,
  },
  warningText: {
    fontFamily: FONTS.display_medium,
    fontSize: 12,
    color: '#FF3B30',
  },
  cautionText: {
    fontFamily: FONTS.display_medium,
    fontSize: 12,
    color: '#FF9500',
  },
  hintText: {
    fontFamily: FONTS.display_regular,
    fontSize: 12,
    color: '#888',
  },
  manageNote: {
    fontFamily: FONTS.display_regular,
    fontSize: 11,
    color: '#888',
    lineHeight: 16,
    marginTop: 2,
  },
});

export default StoragePlanCard;
