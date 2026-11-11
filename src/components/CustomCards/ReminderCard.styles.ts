import { StyleSheet } from 'react-native';
import colors from '../../utils/colors';
import FONTS from '../../utils/fonts';
import type { RoleTheme } from '../../types/roleManager.types';

export const makeReminderCardStyles = (theme: RoleTheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  completedCard: {
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  simpleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  simpleCardLeft: {
    flex: 1,
    gap: 4,
  },
  upcomingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  cardDetails: {
    gap: 6,
    marginBottom: 16,
    textAlign: 'left',
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    textAlign: 'left',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    fontFamily: FONTS.display_medium,
    color: theme.surface,
    textAlign: 'left',
  },
  daysInfo: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    textAlign: 'left',
  },
  pastDueInfo: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textPrimary,
    textAlign: 'left',
  },
  actionButton: {
    marginVertical: 0,
    paddingVertical: 10,
  },
  completedContent: {
    flex: 1,
    gap: 4,
  },
  completedDate: {
    fontSize: 13,
    fontFamily: FONTS.display_regular,
    color: theme.textSecondary,
    textAlign: 'left',
  },
  completedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 12,
  },
  completedBadgeText: {
    fontSize: 15,
    fontFamily: FONTS.display_medium,
    color: theme.textPrimary,
    textAlign: 'center',
    marginBottom: 5,
  },
});
