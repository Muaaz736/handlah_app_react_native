import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from '../../../../../components/ScreenWrapper/ScreenWrapper';
import { AuthHeader } from '../../../../../components/common';
import { getFaqsAsync } from '../../../../../redux/services/faqsService';
import { FaqDto } from '../../../../../redux/services/faqsService';
import { ASYNC_STATUS } from '../../../../../config/constants';
import { AppDispatch } from '../../../../../types/store.types';
import { useUserRole } from '../../../../../hooks/useUserRole';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Markdown from 'react-native-markdown-display';
import colors from '../../../../../utils/colors';
import FONTS from '../../../../../utils/fonts';
import { RoleTheme } from '../../../../../types/roleManager.types';
import { makeMarkdownStyles, styles } from './FAQ.styles';


const htmlToMarkdown = (html: string): string => {
  if (!html) return '';
  let s = html.replace(/\r\n?/g, '\n');

  // Headings
  s = s.replace(/<h1[^>]*>(.*?)<\/h1>/gis, '\n# $1\n');
  s = s.replace(/<h2[^>]*>(.*?)<\/h2>/gis, '\n## $1\n');
  s = s.replace(/<h3[^>]*>(.*?)<\/h3>/gis, '\n### $1\n');
  s = s.replace(/<h4[^>]*>(.*?)<\/h4>/gis, '\n#### $1\n');
  s = s.replace(/<h5[^>]*>(.*?)<\/h5>/gis, '\n##### $1\n');
  s = s.replace(/<h6[^>]*>(.*?)<\/h6>/gis, '\n###### $1\n');

  // Inline emphasis
  s = s.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gis, '**$2**');
  s = s.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gis, '*$2*');

  // Links
  s = s.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gis, '[$2]($1)');

  // Lists
  s = s.replace(/<li[^>]*>(.*?)<\/li>/gis, '- $1\n');
  s = s.replace(/<\/?(ul|ol)[^>]*>/gi, '\n');

  // Line breaks & paragraphs
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/p>/gi, '\n\n');
  s = s.replace(/<p[^>]*>/gi, '');

  // Strip any remaining tags
  s = s.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Collapse excess blank lines
  return s.replace(/\n{3,}/g, '\n\n').trim();
};

const FAQ: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { themeColors } = useUserRole();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { faqs, faqs_status } = useSelector((state: any) => state.faqs_slice);

  useFocusEffect(
    useCallback(() => {
      dispatch(getFaqsAsync());
    }, [dispatch]),
  );

  const isLoading = faqs_status === ASYNC_STATUS.LOADING;

  const toggle = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Group by category
  const grouped: Record<string, FaqDto[]> = {};
  (faqs as FaqDto[]).forEach(faq => {
    const cat = faq.category ?? 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(faq);
  });

  const markdownStyles = useMemo(
    () => makeMarkdownStyles(themeColors as RoleTheme),
    [themeColors]
  );

  return (
    <ScreenWrapper scrollable={false} showShadow={false}>
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <AuthHeader
          title="FAQs"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          containerStyle={styles.headerContainer}
          titleStyle={styles.headerTitle}
          backButtonIconStyle={{ tintColor: themeColors.textPrimary }}
        />

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        ) : faqs.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No FAQs available at the moment.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(grouped).map(([category, items]) => (
              <View key={category} style={styles.categoryBlock}>
                {category !== 'General' && (
                  <Text style={[styles.categoryLabel, { color: themeColors.primary }]}>
                    {category}
                  </Text>
                )}
                {items.map(faq => (
                  <TouchableOpacity
                    key={faq.id}
                    activeOpacity={0.8}
                    style={[styles.card, { borderColor: themeColors.border, backgroundColor: themeColors.surface }]}
                    onPress={() => toggle(faq.id)}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={[styles.question, { color: themeColors.textPrimary }]}>{faq.question}</Text>
                      <Ionicons
                        name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={themeColors.primary}
                      />
                    </View>
                    {expandedId === faq.id && (
                      <View style={styles.answerContainer}>
                        <Markdown style={markdownStyles}>
                          {htmlToMarkdown(faq.answer)}
                        </Markdown>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default FAQ;