/**
 * Finance account types (the BankAccountType dropdown) each carry a category in the option's `stype`:
 * Asset or Liability. The Finance screen totals balances by it for its Assets / Liabilities / Net Worth
 * breakdown (same rules as the web app). Types without a category yet are read from their name
 * (credit card, loan, mortgage, line of credit… are liabilities) and otherwise count as assets.
 */
export type AccountCategory = 'Asset' | 'Liability';

export interface AccountTypeOption {
  label: string;
  /** The option id, as a string (what accounts store in `type`). */
  value: string;
  /** The option's own value text (older accounts may store this). */
  optionValue?: string | null;
  stype?: string | null;
}

const LIABILITY_WORDS = ['credit card', 'charge card', 'loan', 'mortgage', 'line of credit', 'heloc', 'pay later', 'debt', 'overdraft'];

export function categoryFromName(name: string | null | undefined): AccountCategory {
  const n = (name ?? '').toLowerCase();
  return LIABILITY_WORDS.some(w => n.includes(w)) ? 'Liability' : 'Asset';
}

export function optionAccountCategory(option: AccountTypeOption | undefined): AccountCategory {
  const s = option?.stype?.trim().toLowerCase();
  if (s === 'liability') return 'Liability';
  if (s === 'asset') return 'Asset';
  return categoryFromName(option?.label ?? option?.optionValue);
}

/** The option an account's stored type points at (accounts store the option id; older ones its label or value). */
export function findAccountTypeOption(options: AccountTypeOption[] | null | undefined, stored: unknown): AccountTypeOption | undefined {
  if (stored == null || stored === '' || !options?.length) return undefined;
  const s = String(stored).trim();
  const lower = s.toLowerCase();
  return (
    options.find(o => String(o.value) === s) ??
    options.find(o => o.label?.toLowerCase() === lower) ??
    options.find(o => o.optionValue?.toLowerCase() === lower)
  );
}

/** An account as the API returns it (lowercase fields). */
export interface AccountLike {
  type?: string | number | null;
  typelabel?: string | null;
  typeother?: string | null;
  currentbalance?: number | string | null;
}

export function accountCategory(options: AccountTypeOption[] | null | undefined, account: AccountLike): AccountCategory {
  const option = findAccountTypeOption(options, account.type) ?? findAccountTypeOption(options, account.typelabel);
  return option ? optionAccountCategory(option) : categoryFromName(account.typelabel || String(account.type ?? ''));
}

export function accountTypeName(options: AccountTypeOption[] | null | undefined, account: AccountLike): string {
  const option = findAccountTypeOption(options, account.type) ?? findAccountTypeOption(options, account.typelabel);
  const label = option?.label || account.typelabel || '';
  return label.toLowerCase() === 'other' && account.typeother ? account.typeother : label;
}

/** Account type options with assets first, then liabilities (each group keeps the API's order). */
export function sortAccountTypeOptions<T extends AccountTypeOption>(options: T[] | null | undefined): T[] {
  const list = options ?? [];
  return [
    ...list.filter(o => optionAccountCategory(o) === 'Asset'),
    ...list.filter(o => optionAccountCategory(o) === 'Liability'),
  ];
}

export interface NetWorthLine {
  category: AccountCategory;
  type: string;
  total: number;
  count: number;
}

export interface NetWorthSummaryData {
  assets: number;
  liabilities: number;
  netWorth: number;
  lines: NetWorthLine[];
}

/**
 * Assets, liabilities and net worth from the accounts' balances. A liability's balance is what's owed,
 * whichever sign it was entered with; assets count as entered (an overdrawn account lowers them).
 */
export function summarizeAccounts(options: AccountTypeOption[] | null | undefined, accounts: AccountLike[]): NetWorthSummaryData {
  const byKey = new Map<string, NetWorthLine>();
  let assets = 0;
  let liabilities = 0;
  for (const a of accounts) {
    const category = accountCategory(options, a);
    const raw = Number(a.currentbalance ?? 0) || 0;
    const amount = category === 'Liability' ? Math.abs(raw) : raw;
    if (category === 'Liability') liabilities += amount;
    else assets += amount;
    const type = accountTypeName(options, a) || '—';
    const key = `${category}|${type.toLowerCase()}`;
    const line = byKey.get(key) ?? { category, type, total: 0, count: 0 };
    line.total += amount;
    line.count += 1;
    byKey.set(key, line);
  }
  const lines = [...byKey.values()].sort((x, y) => y.total - x.total || x.type.localeCompare(y.type));
  return { assets, liabilities, netWorth: assets - liabilities, lines };
}

export function formatMoney(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const [whole, cents] = abs.toFixed(2).split('.');
  return `${sign}$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${cents}`;
}
