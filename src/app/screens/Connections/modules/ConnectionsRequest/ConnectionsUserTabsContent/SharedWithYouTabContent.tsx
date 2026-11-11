import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import colors, { getColorWithOpacity } from '../../../../../../utils/colors';
import CustomListItemCard from '../../../../../../components/CustomCards/CustomListItemCard';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ListItem, YoursConnectionTabPropTypes } from './ConnectionsUserTabsContent.types';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../../hooks/useSubscriptionGate';
import { makeSharedWithYouStyles } from './SharedWithYouTabContent.styles';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSharedBusiness } from '../../../../../../redux/slices/sharingSlice';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const SharedWithYouTabContent = ({
  loading,
  connectionUserId,
  data,
}: YoursConnectionTabPropTypes): React.ReactElement => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors, isBusinessRole } = useUserRole();
  const styles = useMemo(() => makeSharedWithYouStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const isBusiness = isBusinessRole();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const { currentConnection } = useSelector((state: any) => state.connection_slice);
  const { user_data } = useSelector((state: any) => state.user_auth);
  const { selectedSharedBusiness } = useSelector((state: any) => state.sharing_slice)

  const isCurrentUserReceiver = user_data?.id === currentConnection?.receiveruserid;

  const businessList: any[] = isCurrentUserReceiver
    ? (currentConnection?.senderbusinesses ?? [])
    : (currentConnection?.receiverbusinesses ?? []);

  const handleItemPress = useCallback((item: ListItem): void => {
    checkSubscription(() => {
      const ownerId =
        currentConnection?.senderuserid === user_data?.id
          ? currentConnection?.receiveruserid
          : currentConnection?.senderuserid;

      navigation.navigate(item.routekey, {
        connectionTabSource: 'shared_with_you',
        ownerId: ownerId || connectionUserId,
        accessLevel: item.accesslevel,
        accessType: item.accesstype,
      });
    }, isBusiness ? 'business' : 'personal');
  }, [navigation, currentConnection, user_data?.id, connectionUserId, checkSubscription, isBusiness]);

  useEffect(() => {
    if (isBusiness && businessList.length > 0) {
      const match = selectedSharedBusiness
        ? businessList.find((b: any) => b.id === selectedSharedBusiness.id)
        : undefined;

      const toSelect = match || businessList[0];
      setSelectedBusiness(toSelect);
      if (!match) {
        dispatch(setSelectedSharedBusiness(toSelect));
      }
    }
  }, [isBusiness, businessList.length, dispatch]);

  const isRealText = (val: any): boolean => {
    const text = String(val ?? '').trim();
    return !!text && !/^\d+$/.test(text);
  };

  const buildSubtitle = (biz: any): string => {
    const parts: string[] = [];

    if (isRealText(biz?.entitytypelabel)) {
      parts.push(String(biz.entitytypelabel).trim());
    } else if (isRealText(biz?.entitytype)) {
      parts.push(
        String(biz.entitytype)
          .split('_')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
      );
    }

    if (isRealText(biz?.statelabel)) {
      parts.push(String(biz.statelabel).trim());
    } else if (isRealText(biz?.stateofformation)) {
      parts.push(String(biz.stateofformation).trim());
    }

    return parts.length ? parts.join(' - ') : '-';
  };

  const handleSelectBusiness = useCallback((business: any) => {
    setSelectedBusiness(business);
    dispatch(setSelectedSharedBusiness(business));
    setDropdownOpen(false);
  }, [dispatch]);

  const renderBusinessSelector = (): React.ReactElement | null => {
    if (!isBusiness) {
      return null
    };

    if (businessList?.length === 0) {
      return null;
    };

    const initial = selectedBusiness?.businessname?.charAt(0)?.toUpperCase() ?? '?';
    const hasMultiple = businessList.length > 1;

    return (
      <View style={styles.selectorWrapper}>
        <TouchableOpacity
          style={styles.selectedCard}
          onPress={() => hasMultiple && setDropdownOpen(prev => !prev)}
          activeOpacity={hasMultiple ? 0.7 : 1}
        >
          <View style={[styles.avatar, { backgroundColor: getColorWithOpacity(themeColors.primary, 0.15) }]}>
            <Text style={[styles.avatarText, { color: themeColors.primary }]}>{initial}</Text>
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {selectedBusiness?.businessname ?? t('emergency_access_tab.select_business')}
            </Text>
            {selectedBusiness && (
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {buildSubtitle(selectedBusiness)}
              </Text>
            )}
          </View>
          <AntDesign
            name={dropdownOpen ? 'up' : 'down'}
            size={16}
            color={colors.gray}
          />
        </TouchableOpacity>

        {dropdownOpen && hasMultiple && (
          <View style={styles.dropdownList}>
            {businessList.map((biz: any, index: number) => {
              const isSelected = selectedBusiness?.id === biz.id;
              const bizInitial = biz.businessname?.charAt(0)?.toUpperCase() ?? '?';
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    index < businessList.length - 1 && styles.dropdownItemBorder,
                    isSelected && { backgroundColor: getColorWithOpacity(themeColors.primary, 0.06) },
                  ]}
                  onPress={() => handleSelectBusiness(biz)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatar, styles.avatarSmall, { backgroundColor: getColorWithOpacity(themeColors.primary, 0.15) }]}>
                    <Text style={[styles.avatarText, styles.avatarTextSmall, { color: themeColors.primary }]}>{bizInitial}</Text>
                  </View>
                  <View style={styles.cardTextContainer}>
                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]} numberOfLines={1}>
                      {biz.businessname}
                    </Text>
                    <Text style={styles.dropdownItemSubtitle} numberOfLines={1}>
                      {buildSubtitle(biz)}
                    </Text>
                  </View>
                  {isSelected && <Text style={[styles.checkmark, { color: themeColors.primary }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderSection = (data: ListItem[]): React.ReactElement => (
    <View style={styles.section}>
      <View style={styles.listContainer}>
        {data?.map((item: any) => (
          <View key={item.id} style={styles.itemWrapper}>
            <CustomListItemCard
              item={item}
              onPress={() => handleItemPress(item)}
            />
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.emptyStateContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    )
  }

  if (!loading && (!data || data.length === 0)) {
    return (
      <>
        <View style={styles.container}>
          {isBusiness && renderBusinessSelector()}
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <AntDesign name="exclamation" size={32} color={colors.gray || '#888'} />
            </View>
            <Text style={styles.emptyText}>
              {t('yours_connection_tab.empty_shared_subtitle')}
            </Text>
          </View>
        </View>
        {GateModal}
      </>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {isBusiness && renderBusinessSelector()}
        {renderSection(data as ListItem[])}
      </View>
      {GateModal}
    </>
  );
};

export default SharedWithYouTabContent;
