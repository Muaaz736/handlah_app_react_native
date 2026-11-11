import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader } from '../../../../../components/common';
import { getSupportTicketsAsync, SupportTicketDto } from '../../../../../redux/services/supportService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { AppDispatch } from '../../../../../types/store.types';
import { useUserRole } from '../../../../../hooks/useUserRole';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import { RoleTheme } from '../../../../../types/roleManager.types';

const STATUS_LABELS: Record<number, string> = {
  1: 'Open',
  2: 'In Progress',
  3: 'Resolved',
  4: 'Closed',
  5: 'Reopened',
};

const STATUS_COLORS: Record<number, string> = {
  1: '#F59E0B',
  2: '#3B82F6',
  3: '#10B981',
  4: '#6B7280',
  5: '#8B5CF6',
};

const HelpSupport: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const styles = useMemo(
    () => makeStyles(themeColors as RoleTheme),
    [themeColors]
  );

  const { tickets, tickets_status } = useSelector((state: any) => state.support_slice);

  useFocusEffect(
    useCallback(() => {
      dispatch(getSupportTicketsAsync());
    }, [dispatch]),
  );

  const isLoading = tickets_status === ASYNC_STATUS.LOADING;

  const handleTicketPress = (ticket: SupportTicketDto) => {
    navigation.navigate('TicketDetail', { ticketId: ticket.id });
  };

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <View style={styles.container}>
        <AuthHeader
          title="Help & Support"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          containerStyle={styles.headerContainer}
          titleStyle={styles.headerTitle}
          backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        />

        {/* Submit new ticket button */}
        <TouchableOpacity
          style={[styles.newTicketBtn, { backgroundColor: themeColors.primary }]}
          onPress={() => navigation.navigate('SubmitTicket')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="plus" size={18} color={colors.white} />
          <Text style={styles.newTicketText}>New Support Request</Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.center}>
            <MaterialCommunityIcons
              name="headset"
              size={52}
              color={colors.border ?? '#E5E7EB'}
            />
            <Text style={styles.emptyTitle}>No Support Requests Yet</Text>
            <Text style={styles.emptySubtitle}>
              Submit a request and our team will get back to you.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {(tickets as SupportTicketDto[]).map(ticket => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.card}
                onPress={() => handleTicketPress(ticket)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.subject} numberOfLines={1}>
                    {ticket.subject}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: STATUS_COLORS[ticket.status] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: STATUS_COLORS[ticket.status] },
                      ]}
                    >
                      {STATUS_LABELS[ticket.status] ?? 'Unknown'}
                    </Text>
                  </View>
                </View>
                {ticket.categoryName && (
                  <Text style={styles.category}>{ticket.categoryName}</Text>
                )}
                <View style={styles.cardBottom}>
                  <Text style={styles.date}>
                    {new Date(ticket.createdat).toLocaleDateString()}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={themeColors.textPrimary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default HelpSupport;

const makeStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 16,
    },

    headerContainer: {
      marginBottom: 10,
      paddingTop: 20,
    },

    headerTitle: {
      fontSize: 24,
    },

    newTicketBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 13,
      borderRadius: 12,
      marginBottom: 20,
    },

    newTicketText: {
      fontSize: 15,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
    },

    scrollContent: {
      paddingBottom: 40,
    },

    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },

    emptyTitle: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      textAlign: 'center',
    },

    emptySubtitle: {
      marginTop: 8,
      fontSize: 13,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },

    card: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      backgroundColor: theme.surface,
    },

    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
      gap: 8,
    },

    subject: {
      flex: 1,
      fontSize: 14,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
    },

    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },

    badgeText: {
      fontSize: 11,
      fontFamily: FONTS.display_semi_bold,
    },

    category: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      marginBottom: 8,
    },

    cardBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },

    date: {
      fontSize: 12,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
    },
  });
