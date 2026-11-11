import i18n from 'i18next';

/**
 * Expense types (the UtilityType dropdown, shown as "Expense Type") each carry a category in the option's `stype`
 * (Utility, Housing, Tax, Service, Transportation…). The picker lists them under their category, searchable by
 * type or category, in the same order as the web app.
 */
export interface ExpenseTypeOption {
  label: string;
  value: string;
  stype?: string | null;
  sortOrder?: number | null;
}

export const UTILITY_SUBTYPE = 'Utility';

/** Category order for the picker. Categories an admin adds that aren't listed come after these; "Other" is last. */
export const EXPENSE_CATEGORY_ORDER = [
  'Utility', 'Housing', 'Tax', 'Service', 'Transportation', 'Health', 'Family & Education',
  'Pets', 'Financial', 'Business', 'Personal', 'Giving', 'Bill',
];

/** An option without a category yet counts as a Utility (that's what every type was before categories). */
export function optionSubtype(option: ExpenseTypeOption | undefined): string {
  const s = option?.stype?.trim();
  return s ? s : UTILITY_SUBTYPE;
}

export function expenseCategoryLabel(category: string): string {
  return i18n.t(`utilities.subtypes.${category}`, { defaultValue: category });
}

/** The options sorted by category, each with its category as `group` (CustomDropDown shows the headings). */
export function groupedExpenseTypeOptions<T extends ExpenseTypeOption>(options: T[] | null | undefined): (T & { group: string })[] {
  const rank = (category: string) => {
    if (category.toLowerCase() === 'other') return Number.MAX_SAFE_INTEGER;
    const i = EXPENSE_CATEGORY_ORDER.findIndex(c => c.toLowerCase() === category.toLowerCase());
    return i === -1 ? EXPENSE_CATEGORY_ORDER.length : i;
  };
  return (options ?? [])
    .map(o => ({ o, category: optionSubtype(o) }))
    .sort(
      (a, b) =>
        rank(a.category) - rank(b.category) ||
        a.category.localeCompare(b.category) ||
        (a.o.sortOrder ?? 0) - (b.o.sortOrder ?? 0) ||
        a.o.label.localeCompare(b.o.label),
    )
    .map(({ o, category }) => ({ ...o, group: expenseCategoryLabel(category) }));
}
