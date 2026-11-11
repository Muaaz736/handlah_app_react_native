import React from 'react';
import i18n from 'i18next';
import type { RecordLinkRef } from '../../services/recordLinks';
import type { RecordViewTabsProps } from './RecordViewTabs';
import { RecordExpensesTab } from './RecordExpensesTab';

/**
 * Tabs for a vehicle's or personal property item's view pop-up: Details | Expenses | Linked records.
 * `onNavigate` closes the pop-up before another screen opens.
 */
export function recordTabsWithExpenses(
  record: RecordLinkRef | null,
  opts: { canEdit?: boolean; ownerUserId?: number | null; onNavigate?: () => void },
): Omit<RecordViewTabsProps, 'children'> {
  return {
    record,
    canEdit: opts.canEdit,
    ownerUserId: opts.ownerUserId ?? null,
    onNavigate: opts.onNavigate,
    extraTabs: record
      ? [{
          key: 'expenses',
          label: i18n.t('record_expenses.tab'),
          render: () => (
            <RecordExpensesTab record={record} canEdit={opts.canEdit} ownerUserId={opts.ownerUserId} onNavigate={opts.onNavigate} />
          ),
        }]
      : undefined,
  };
}
