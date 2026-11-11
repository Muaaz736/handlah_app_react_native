import React, { useEffect, useMemo } from 'react'
import { makeSharedWithMeStyles } from './SharedWithMe.styles';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ListRenderItem,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { isIOS, getInitials } from '../../utils/helpers'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthHeader } from '../common'
import ProfileAvatar from '../common/ProfileAvatar'
import colors, { getColorWithOpacity } from '../../utils/colors'
import { useDispatch, useSelector } from 'react-redux'
import { getSharedByUsers } from '../../redux/services/sharingService'
import { useUserRole } from '../../hooks/useUserRole'
import { useSelectedBusiness } from '../../hooks/useSelectedBusiness'
import { ASYNC_STATUS } from '../../config/constants'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { AppDispatch } from '../../types/store.types'

interface SharedUser {
    ownerid: number
    username: string
    firstname: string
    lastname: string
    accesslevel: string
    accesstype: string
    routekey: string
    profilepicture?: string | null
}

const SharedWithMe = () => {
    const navigation = useNavigation<any>()
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'
    const route = useRoute<any>();
    const dispatch = useDispatch<AppDispatch>();
    const { module } = route.params || {};

    const { themeColors, isBusinessRole } = useUserRole();
    const styles = useMemo(() => makeSharedWithMeStyles(themeColors), [themeColors]);
    const { selectedBusinessId } = useSelectedBusiness();

    const { get_shared_by_users_status, get_shared_by_users_data } = useSelector((state: any) => state.sharing_slice);

    const isLoading = get_shared_by_users_status === ASYNC_STATUS.LOADING;
    const users: SharedUser[] = get_shared_by_users_data?.users ?? [];

    useEffect(() => {
        if (isBusinessRole() && selectedBusinessId) {
            dispatch(getSharedByUsers({ module, businessId: selectedBusinessId }));
        } else {
            dispatch(getSharedByUsers({ module }));
        }
    }, [module, selectedBusinessId])

    const renderItem: ListRenderItem<SharedUser> = ({ item }) => {
        const fullName = `${item.firstname} ${item.lastname}`.trim()
        const initials = getInitials(fullName || item.username)

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.card, { backgroundColor: colors.white }]}
                onPress={() =>
                    navigation.navigate(item.routekey, {
                        ownerId: item.ownerid,
                        accessLevel: item.accesslevel,
                        accessType: item.accesstype,
                        connectionTabSource: "shared_with_you"
                    })
                }
            >
                {/* Avatar */}
                <ProfileAvatar
                    imageId={item.profilepicture}
                    name={fullName || item.username}
                    size={56}
                    style={{ backgroundColor: themeColors.secondary, marginRight: 12 }}
                />

                {/* Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={1}>
                            {fullName || item.username}
                        </Text>
                        <View style={[styles.accessBadge, { backgroundColor: getColorWithOpacity(themeColors.darkGreen ?? themeColors.primary, 0.5) }]}>
                            <Text style={styles.accessBadgeText}>{item.accesslevel}</Text>
                        </View>
                    </View>
                    <Text style={styles.username} numberOfLines={1}>
                        @{item.username}
                    </Text>
                </View>

                {/* Chevron */}
                <Ionicons
                    name={isRTL ? 'chevron-back' : 'chevron-forward'}
                    size={22}
                    color={colors.black}
                />
            </TouchableOpacity>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <AuthHeader
                title={t('common.shared_with_me_title')}
                onBackPress={() => navigation.goBack()}
                containerStyle={{ paddingHorizontal: 16, marginBottom: 0, paddingTop: isIOS ? 0 : 20 }}
                backButtonStyle={{ marginBottom: 0 }}
                titleStyle={{
                    marginBottom: 0,
                    marginTop: 20,
                    textAlign: 'left',
                }}
            />

            {isLoading ? (
                <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 32 }} />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => String(item.ownerid)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: themeColors.secondary }]}>
                                {t('common.no_shared_users')}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    )
}

export default SharedWithMe
