import React, { useState, useCallback, useMemo } from 'react';
import { View, Text } from 'react-native';
import ProfileAvatar from '../common/ProfileAvatar';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../types/store.types';
import { useUserRole } from '../../hooks/useUserRole';
import { makeSharedWithMeSectionStyles } from './SharedWithMeSection.styles';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { RoleTheme } from '../../types/roleManager.types';
import { darkenColor } from '../../utils/roleManager';
import { getColorWithOpacity } from '../../utils/colors';

const SkeletonCard = ({ styles }: any) => (
    <View style={styles.skeletonCard}>
        <View style={styles.skeletonCardHeader}>
            <View style={styles.skeletonCardTitle} />
            <View style={styles.skeletonIconsRow}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonIcon} />
            </View>
        </View>
        <View style={styles.skeletonCardBody}>
            <View>
                <View style={styles.skeletonLabel} />
                <View style={styles.skeletonDate} />
            </View>
            <View style={styles.skeletonBadge} />
        </View>
    </View>
);

const SkeletonSection = ({ styles }: { styles: any }) => (
    <View style={styles.wrapper}>
        <View style={styles.skeletonSectionTitle} />
        {[1, 2].map(i => (
            <View key={i} style={styles.skeletonOwnerBlock}>
                <View style={styles.skeletonOwnerName} />
                <SkeletonCard styles={styles} />
                <SkeletonCard styles={styles} />
            </View>
        ))}
    </View>
);

export interface SharedWithMeOwner {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    profilepicture: string | null;
}

interface SharedWithMeGroup {
    owner: SharedWithMeOwner;
    data: any[];
}

interface SharedWithMeSectionProps {
    thunkAction: () => any;
    renderItem: (item: any, owner: SharedWithMeOwner) => React.ReactNode;
    sectionTitle?: string;
}

const SharedWithMeSection: React.FC<SharedWithMeSectionProps> = ({
    thunkAction,
    renderItem,
    sectionTitle,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeSharedWithMeSectionStyles(themeColors as RoleTheme), [themeColors]);
    const { t } = useTranslation();

    const [groups, setGroups] = useState<SharedWithMeGroup[]>([]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'error'>('idle');

    const fetchData = useCallback(async () => {
        setStatus('loading');
        try {
            const result = await dispatch(thunkAction()).unwrap();
            setGroups(Array.isArray(result) ? result : []);
            setStatus('succeeded');
        } catch {
            setStatus('error');
        }
    }, [dispatch, thunkAction]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    if (status === 'idle' || status === 'loading') {
        return <SkeletonSection styles={styles} />;
    }

    if (status === 'error' || groups.length === 0) {
        return null;
    }

    return (
        <View style={styles.wrapper}>
            <Text style={[styles.sectionTitle, { color: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.9) : themeColors.secondary }]}>
                {sectionTitle ?? (t('common.shared_with_me_title'))}
            </Text>

            {groups.map((group) => {
                const ownerName = `${group.owner.firstname} ${group.owner.lastname}`.trim();
                return (
                    <View
                        key={group.owner.id}
                        style={[styles.ownerBlock, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.5) : getColorWithOpacity(themeColors.primary, 0.12) }]}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <ProfileAvatar imageId={group.owner.profilepicture} name={ownerName} size={32} />
                            <Text style={[styles.ownerName, { marginBottom: 0, flex: 1 }]}>{ownerName}</Text>
                        </View>
                        {group.data.map((item: any) => (
                            <React.Fragment key={item.id}>
                                {renderItem(item, group.owner)}
                            </React.Fragment>
                        ))}
                    </View>
                );
            })}
        </View>
    );
};

export default SharedWithMeSection;
