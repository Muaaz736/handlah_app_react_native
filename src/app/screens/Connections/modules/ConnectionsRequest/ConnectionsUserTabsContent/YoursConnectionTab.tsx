import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import colors, { getColorWithOpacity } from '../../../../../../utils/colors';
import { ICONS } from '../../../../../../utils/Images';
import { CustomEditPermissionAccessModal } from '../../../../../../components/common';
import CustomListItemCard from '../../../../../../components/CustomCards/CustomListItemCard';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { makeYoursConnectionStyles } from './YoursConnectionTab.styles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ListItem, YoursConnectionTabPropTypes } from './ConnectionsUserTabsContent.types';
import { useDispatch, useSelector } from 'react-redux';
import { getConnectionbyIdAsync } from '../../../../../../redux/services/connectionService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { sharingSyncService } from '../../../../../../redux/services/sharingService';
import { resetShareSyncStatus } from '../../../../../../redux/slices/sharingSlice';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import { setSelectedBusinessId } from '../../../../../../redux/slices/businessSlice';
import { AppDispatch } from '../../../../../../types/store.types';
import { RoleTheme } from '../../../../../../types/roleManager.types';

const YoursConnectionTab = ({
  loading,
  connectionUserId,
  data,
}: YoursConnectionTabPropTypes): React.ReactElement => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors, isBusinessRole, userRole } = useUserRole();
  const styles = useMemo(() => makeYoursConnectionStyles(themeColors as RoleTheme), [themeColors]);
  const isBusiness = isBusinessRole();
  const { selectedBusinessId } = useSelectedBusiness();
  const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);

  const { share_sync_status } = useSelector((state: any) => state.sharing_slice);
  const { currentConnection, currentConnectionUserId } = useSelector((state: any) => state.connection_slice);
  const { user_data } = useSelector((state: any) => state.user_auth);

  const isCurrentUserReceiver = user_data?.id === currentConnection?.receiveruserid;

  const businessList: any[] = isCurrentUserReceiver
    ? (currentConnection?.receiverbusinesses ?? [])
    : (currentConnection?.senderbusinesses ?? []);

  const sharedWithUserId =
    currentConnection?.senderuserid === user_data?.id
      ? currentConnection?.receiveruserid
      : currentConnection?.senderuserid;

  const updateLoading = share_sync_status === ASYNC_STATUS.LOADING;

  const handleSavePermissions = useCallback((permissions: { view: boolean; edit: boolean }): void => {
    if (!selectedItem || !connectionUserId) return;

    const accessLevel = permissions.edit ? 'write' : 'read';

    const payload: {
      resourceType: any;
      users: {
        sharedWithUserId: number;
        accessLevel: string;
      }[];
      resourceId?: any;
      businessId?: any;
    } = {
      resourceType: selectedItem.modulename,
      users: [
        {
          sharedWithUserId: connectionUserId,
          accessLevel,
        }
      ]
    };

    if (selectedItem.accesstype === 'Entity') {
      payload.resourceId = selectedItem.resourceid;
    }

    if (isBusinessRole()) {
      payload.businessId = selectedBusinessId;
    }

    dispatch(sharingSyncService(payload))
  }, [selectedItem, connectionUserId, selectedBusinessId]);


  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.SUCCEEDED) {
      setPermissionModalVisible(false);
      dispatch(getConnectionbyIdAsync({ userId: currentConnectionUserId, targetAccountType: isBusiness ? 'Business' : 'Personal' }));
      dispatch(resetShareSyncStatus());
    }
  }, [share_sync_status, currentConnectionUserId]);


  const handleEditPermission = useCallback((item: ListItem): void => {
    setSelectedItem(item);
    setPermissionModalVisible(true);
  }, []);

  const handleItemPress = useCallback((item: ListItem): void => {
    (navigation as any).navigate(item.routekey, {
      connectionTabSource: 'yours',
      sharedWithUserId: sharedWithUserId || connectionUserId,
      accessLevel: item.accesslevel,
      accessType: item.accesstype,
    });
  }, [navigation, currentConnection, user_data?.id, connectionUserId]);

  // Set first business as default once businessList is available
  useEffect(() => {
    if (isBusiness && businessList.length > 0) {
      const match = businessList.find((biz: any) => biz.id === selectedBusinessId);
      const toSelect = match || businessList[0];
      setSelectedBusiness(toSelect);
      if (!match && toSelect) {
        dispatch(setSelectedBusinessId(toSelect.id));
      }
    }
  }, [isBusiness, businessList.length, selectedBusinessId]);


  const renderSection = (items: ListItem[]): React.ReactElement => (
    <View style={styles.section}>
      <View style={styles.listContainer}>
        {items?.map((item: any) => (
          <View key={item.modulename} style={styles.itemWrapper}>
            <CustomListItemCard
              item={item}
              onPress={() => handleItemPress(item)}
              rightIcon={
                <TouchableOpacity onPress={() => handleEditPermission(item)}>
                  <Image
                    source={ICONS.EDIT_ICON}
                    style={[styles.editIcon, { tintColor: themeColors.secondary }]}
                  />
                </TouchableOpacity>
              }
            />
          </View>
        ))}
      </View>
    </View>
  );

  // Real text only — never a raw entitytype/stateofformation id.
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
    dispatch(setSelectedBusinessId(business.id));
    setDropdownOpen(false);
  }, [dispatch]);

  const renderBusinessSelector = (): React.ReactElement | null => {
    if (!isBusinessRole()) return null;

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

  if (loading) {
    return (
      <View style={styles.emptyStateContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (!loading && data?.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyIconCircle}>
          <AntDesign name="exclamation" size={32} color={colors.gray || '#888'} />
        </View>
        <Text style={styles.emptyText}>
          {t('yours_connection_tab.empty_yours_subtitle')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isBusiness && renderBusinessSelector()}
      {renderSection(data as ListItem[])}

      <CustomEditPermissionAccessModal
        visible={permissionModalVisible}
        onClose={() => setPermissionModalVisible(false)}
        onSave={handleSavePermissions}
        loading={updateLoading}
        itemTitle={selectedItem?.displayname || selectedItem?.modulename}
        accessLevel={selectedItem?.accesslevel}
        accessType={selectedItem?.accesstype}
      />
    </View>
  );
};

export default YoursConnectionTab;
