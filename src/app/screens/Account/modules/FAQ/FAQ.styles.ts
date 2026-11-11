import { StyleSheet } from "react-native";
import { RoleTheme } from "../../../../../types/roleManager.types";
import FONTS from "../../../../../utils/fonts";
import colors from "../../../../../utils/colors";

export const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  headerContainer: { marginBottom: 10, paddingTop: 20 },
  headerTitle: { fontSize: 24 },
  scrollContent: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.display_regular,
    color: colors.gray,
  },
  categoryBlock: { marginBottom: 8 },
  categoryLabel: {
    fontSize: 13,
    fontFamily: FONTS.display_semi_bold,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.display_semi_bold,
    lineHeight: 20,
  },
  answerContainer: {
    marginTop: 12,
  },
});

export const makeMarkdownStyles = (theme: RoleTheme) =>
  StyleSheet.create({
    body: {
      fontSize: 14,
      fontFamily: FONTS.display_regular,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 8,
    },
    heading1: {
      fontSize: 18,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginBottom: 6,
    },
    heading2: {
      fontSize: 16,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginBottom: 6,
    },
    heading3: {
      fontSize: 15,
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
      marginBottom: 6,
    },
    strong: {
      fontFamily: FONTS.display_semi_bold,
      color: theme.textPrimary,
    },
    bullet_list: {
      marginBottom: 8,
    },
    ordered_list: {
      marginBottom: 8,
    },
    list_item: {
      marginBottom: 4,
    },
    link: {
      color: theme.primary,
      textDecorationLine: 'underline',
    },
  });