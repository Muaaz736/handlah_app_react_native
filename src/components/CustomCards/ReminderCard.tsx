import React, { useMemo } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import PrimaryButton from '../common/PrimaryButton';
import colors, { getColorWithOpacity } from '../../utils/colors';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUserRole } from '../../hooks/useUserRole';
import type {
  ReminderCardProps,
} from '../../app/screens/Reminders/Reminders.types';
import { makeReminderCardStyles } from './ReminderCard.styles';
import { RoleTheme } from '../../types/roleManager.types';

const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onPress,
  onMarkAsCompleted,
}) => {
  const {
    status,
    title,
    date,
    dueDate,
    frequency,
    notes,
    daysInfo,
    completedDate,
    madeByUser,
  } = reminder;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeReminderCardStyles(themeColors as RoleTheme), [themeColors]);

  const handlePress = (): void => {
    if (onPress) {
      onPress();
    }
  };

  const handleMarkAsCompleted = (): void => {
    if (onMarkAsCompleted) {
      onMarkAsCompleted();
    }
  };

  // Render different card layouts based on status
  const renderCardContent = (): React.ReactElement => {
    switch (status) {
      case 'due_today':
        return renderDueTodayCard();
      case 'upcoming':
        return renderUpcomingCard();
      case 'past_due':
        return renderPastDueCard();
      case 'completed':
        return renderCompletedCard();
      default:
        return renderDueTodayCard();
    }
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  }

  const renderDueTodayCard = (): React.ReactElement => {
    const isDetailedCard = dueDate && frequency && notes;

    if (isDetailedCard) {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{truncateText(title as string, 30)}</Text>

            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{date || ''}</Text>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <Text style={styles.detailLabel}>
              {t('common.due_date')}: <Text style={styles.detailValue}>{dueDate}</Text>
            </Text>
            <Text style={styles.detailLabel}>
              {t('common.frequency')}: <Text style={styles.detailValue}>{frequency}</Text>
            </Text>
            <Text style={styles.detailLabel}>
              {t('common.notes')}: <Text style={styles.detailValue}>{notes}</Text>
            </Text>
          </View>
          <PrimaryButton
            title={t('common.mark_as_completed')}
            onPress={handleMarkAsCompleted}
            variant="primary"
            buttonStyle={styles.actionButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.simpleCardHeader}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.upcomingRight}>
            <Text style={styles.cardTitle}>{title}</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{date}</Text>
            </View>
          </View>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={24}
            color={colors.black}
          />
        </TouchableOpacity>
        <PrimaryButton
          title={t('common.mark_as_completed')}
          onPress={handleMarkAsCompleted}
          variant="primary"
          buttonStyle={styles.actionButton}
        />
      </View>
    );
  };

  const renderUpcomingCard = (): React.ReactElement => {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.card}
      >
        <View style={styles.upcomingRight}>
          <View style={styles.upcomingRight}>
            <Text style={styles.cardTitle}>{truncateText(title as string, 30)}</Text>

            <View
              style={[
                styles.dateBadge,
                {
                  backgroundColor: getColorWithOpacity(
                    themeColors.darkGreen,
                    0.5,
                  ),
                },
              ]}
            >
              <Text style={[styles.dateText, { color: colors.black }]}>
                {date}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handlePress}>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={24}
              color={colors.black}
            />
          </TouchableOpacity>
        </View>

        {daysInfo && <Text style={styles.pastDueInfo}>{daysInfo}</Text>}
      </TouchableOpacity>
    );
  };

  const renderPastDueCard = (): React.ReactElement => {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.card}
      >
        <View style={styles.upcomingRight}>
          <View style={styles.upcomingRight}>
            <Text style={styles.cardTitle}>{truncateText(title as string, 30)}</Text>

            <View
              style={[
                styles.dateBadge,
                {
                  backgroundColor: getColorWithOpacity(
                    themeColors.darkGreen,
                    0.5,
                  ),
                },
              ]}
            >
              <Text style={[styles.dateText, { color: colors.black }]}>
                {date}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handlePress}>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={24}
              color={colors.black}
            />
          </TouchableOpacity>
        </View>

        {daysInfo && <Text style={styles.pastDueInfo}>{daysInfo}</Text>}
      </TouchableOpacity>
    );
  };

  const renderCompletedCard = (): React.ReactElement => {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.completedCard,
            { backgroundColor: getColorWithOpacity(themeColors.darkGreen, 0.5) },
          ]}
        >
          <View style={[styles.card, { marginBottom: 5 }]}>
            <View style={styles.completedContent}>
              <Text style={styles.cardTitle}>{truncateText(title as string, 40)}</Text>
              {completedDate && (
                <Text style={styles.completedDate}>{completedDate}</Text>
              )}
            </View>
          </View>

          <Text style={styles.completedBadgeText}>Completed</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return renderCardContent();
};

export default ReminderCard;
