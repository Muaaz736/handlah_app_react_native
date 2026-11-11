import React, { useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import colors from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import { isIOS } from '../../../utils/helpers';
import { getEditHistoryAsync } from '../../../redux/services/authService';
import { setEditHistoryStatus } from '../../../redux/slices/authSlice';
import { ASYNC_STATUS } from '../../../config/constants';
import { RootStackParamList } from '../../../types/RootStackParamList.types';
import { AuthHeader } from '../../../components/common';
import { makeEditHistoryListStyles } from './EditHistoryList.styles';
import { AppDispatch } from '../../../types/store.types';
import { RoleTheme } from '../../../types/roleManager.types';

const { width } = Dimensions.get('window');

type EditHistoryListRouteProp = RouteProp<RootStackParamList, 'EditHistoryList'>;
type EditHistoryListNavProp = NativeStackNavigationProp<RootStackParamList, 'EditHistoryList'>;

const EditHistoryList: React.FC = () => {
    const navigation = useNavigation<EditHistoryListNavProp>();
    const route = useRoute<EditHistoryListRouteProp>();
    const { entityType, entityId, title } = route.params;
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeEditHistoryListStyles(themeColors as RoleTheme), [themeColors]);
    const dispatch = useDispatch<AppDispatch>();

    const { edit_history_status, edit_history_data } = useSelector(
        (state: any) => state.user_auth,
    );
    const isLoading = edit_history_status === ASYNC_STATUS.LOADING;

    useEffect(() => {
        dispatch(getEditHistoryAsync({ entityType, entityId }));
        return () => {
            dispatch(setEditHistoryStatus());
        };
    }, [dispatch, entityType, entityId]);

    const formatDate = useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            const day = date.getDate();
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
            ];
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

            const getOrdinal = (n: number) => {
                const s = ['th', 'st', 'nd', 'rd'];
                const v = n % 100;
                return n + (s[(v - 20) % 10] || s[v] || s[0]);
            };

            return `${getOrdinal(day)} ${month} ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
        } catch {
            return dateString;
        }
    }, []);

    const EXCLUDED_FIELDS = React.useMemo(() => new Set([
        'Id',
        'UserId',
        'RealEstateId',
        'VehicleId',
        'BusinessId',
        // 'PlannedPayments',
        'IsDeleted',
    ]), []);

    const getFilteredChangeCount = useCallback((item: any) => {
        const fields: string[] = item.changedfields || [];
        if (fields.length === 0) return item.changeCount || 0;
        const oldVals = item.oldvalues || {};
        const newVals = item.newvalues || {};
        return fields.filter((field: string) => {
            if (EXCLUDED_FIELDS.has(field)) return false;
            if (field === 'UploadAttachments') {
                const oldVal = oldVals[field];
                const newVal = newVals[field];
                const isEmpty = (v: any) => v === null || v === undefined || v === '' || v === '[]' || v === '""';
                if (isEmpty(oldVal) && isEmpty(newVal)) return false;
            }
            return true;
        }).length;
    }, [EXCLUDED_FIELDS]);

    const historyEntries = Array.isArray(edit_history_data?.edithistory)
        ? edit_history_data.edithistory
        : Array.isArray(edit_history_data) ? edit_history_data : [];

    const renderHistoryItem = useCallback(({ item, index }: { item: any; index: number }) => {
        const userName = item.username || item.userName || item.user?.name || t('edit_history.unknown_user');
        const changeCount = getFilteredChangeCount(item);
        const dateStr = item.createdat || item.createdAt || item.date || '';

        return (
            <TouchableOpacity
                style={[styles.historyItem, index === 0 && styles.firstItem]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('EditHistoryDetail', { historyEntry: item })}
            >
                <View style={styles.historyItemContent}>
                    <Text style={styles.dateText}>{formatDate(dateStr)}</Text>
                    <View style={styles.userRow}>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.separator}> - </Text>
                        <Text style={[styles.changeCount, { color: themeColors.primary }]}>
                            {changeCount} {changeCount === 1 ? t('edit_history.change') : t('edit_history.changes')}
                        </Text>
                    </View>
                </View>
                <Entypo
                    name={isRTL ? 'chevron-left' : 'chevron-right'}
                    size={20}
                    color={colors.gray}
                />
            </TouchableOpacity>
        );
    }, [formatDate, getFilteredChangeCount, isRTL, navigation, t, themeColors.primary]);

    const renderSeparator = useCallback(() => (
        <View style={styles.separator_line} />
    ), []);

    return (
        <View
            style={styles.gradient}
        >
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <AuthHeader
                    title={title}
                    subtitle={t('edit_history.view_history')}
                    onBackPress={() => navigation.goBack()}
                    showBackButton={true}
                    containerStyle={styles.header}
                    titleStyle={styles.headerTitle}
                    subtitleStyle={styles.headerSubtitle}
                    backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
                />

                {/* Content */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={themeColors.primary} />
                        <Text style={styles.loadingText}>{t('common.loading')}</Text>
                    </View>
                ) : historyEntries.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="history" size={64} color={colors.lightGray} />
                        <Text style={styles.emptyText}>{t('edit_history.no_history')}</Text>
                    </View>
                ) : (
                    <FlatList
                        data={historyEntries}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        renderItem={renderHistoryItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </View>
    );
};


export default EditHistoryList;
