/**
 * Shapes returned by the API for the daily brief, life events and the Money Finder (household and
 * smart Cancel included). The backend serializes property names in lowercase. Kept in step with the
 * web app's types.
 */
import type { InsightDto } from '../../../redux/services/insightsService';


// ---- Money Finder ----
// Shapes returned by the API. The backend serializes property names in lowercase.

export type PaymentCategory = 'subscription' | 'utility' | 'loan' | 'insurance' | 'warranty' | 'planned-payment';

export interface UpcomingPaymentDto {
  key: string;
  label: string;
  category: PaymentCategory | string;
  amount: number;
  duedate: string;
  entitytype: string;
  entityid: number;
  isestimate: boolean;
}

export type MoneyFindingType =
  | 'overlap'
  | 'price-increase'
  | 'trial-ending'
  | 'renewal'
  | 'cancelled-still-billing'
  | 'warranty-ending'
  | 'loan-payoff';

export type MoneyFindingSeverity = 'high' | 'medium' | 'low';

export interface LoanPayoffDto {
  extramonthly: number;
  monthsremaining: number;
  monthswithextra: number;
  monthssaved: number;
  interestsaved: number;
}

export interface MoneyFindingDto {
  key: string;
  type: MoneyFindingType | string;
  title: string;
  message: string;
  annualamount: number | null;
  severity: MoneyFindingSeverity | string;
  entitytype: string;
  entityid: number;
  relatedids: number[];
  website: string | null;
  actiondate: string | null;
  loanpayoff: LoanPayoffDto | null;
}

export interface FixedCostCategoryDto {
  category: 'subscriptions' | 'utilities' | 'loans' | 'insurance' | 'warranties' | string;
  monthly: number;
  count: number;
}

export type MoneyFinderStatus = 'saved' | 'kept' | 'dismissed' | 'snoozed';

export interface MoneyFinderHistoryDto {
  key: string;
  type: string;
  label: string | null;
  status: MoneyFinderStatus | string;
  savedannualamount: number | null;
  date: string;
}

export interface MoneyFinderSummaryDto {
  savedthisyear: number;
  potentialannual: number;
  fixedmonthly: number;
  next30daystotal: number;
  opencount: number;
}

export interface MoneyFinderResultDto {
  summary: MoneyFinderSummaryDto;
  findings: MoneyFindingDto[];
  fixedcosts: FixedCostCategoryDto[];
  upcoming: UpcomingPaymentDto[];
  history: MoneyFinderHistoryDto[];
}

// ---------------------------------------------------------------------------------------------
// Household Money Finder and smart Cancel (JSON names are lowercase)
// ---------------------------------------------------------------------------------------------

export interface HouseholdMemberDto {
  userid: number;
  /** 'You', the member's first name. */
  displayname: string;
  role: 'owner' | 'member';
  isyou: boolean;
  joinedat: string;
}

export interface HouseholdPendingInviteDto {
  id: number;
  label: string | null;
  expiresat: string;
  invitedby: string;
}

export interface MyHouseholdDto {
  id: number;
  name: string;
  myrole: 'owner' | 'member';
  showmysubscriptionnames: boolean;
  members: HouseholdMemberDto[];
  pendinginvites: HouseholdPendingInviteDto[];
  maxmembers: number;
}

export interface HouseholdInviteCreatedDto {
  id: number;
  token: string;
  expiresat: string;
}

export type HouseholdInviteStatus = 'valid' | 'expired' | 'used' | 'revoked' | 'already-member' | 'in-another-household';

export interface HouseholdInvitePreviewDto {
  status: HouseholdInviteStatus;
  householdname: string | null;
  invitedby: string | null;
  membercount: number;
}

export interface HouseholdPlanDto {
  ref: number;
  isyou: boolean;
  /** 'You', a first name, or 'A household member'. */
  displayname: string;
  subscriptionname: string | null;
  /** Only for your own plans. */
  subscriptionid: number | null;
  iskeeper: boolean;
}

export interface HouseholdFindingDto {
  key: string;
  servicekey: string;
  servicename: string;
  plancount: number;
  membercount: number;
  title: string;
  message: string;
  annualsavings: number | null;
  savingsisestimate: boolean;
  familyplanname: string | null;
  plans: HouseholdPlanDto[];
  haskeeper: boolean;
  youarekeeper: boolean;
  youshouldcancel: boolean;
}

export interface HouseholdMoneyFinderDto {
  inhousehold: boolean;
  householdname: string | null;
  membercount: number;
  pendinginvitecount: number;
  potentialannual: number;
  findings: HouseholdFindingDto[];
}

export interface SubscriptionCancelLinkDto {
  subscriptionid: number;
  subscriptionname: string;
  url: string | null;
  domain: string | null;
  source: 'catalog' | 'saved' | 'none';
}

// ---- Life events ----
// Shapes returned by the API. The backend serializes property names in lowercase.

export type LifeEventPhase = 'before' | 'during' | 'after';
export type LifeEventStatus = 'active' | 'completed' | 'archived';
export type LifeEventStepStatus = 'open' | 'done' | 'skipped';

export interface LifeEventFieldDto {
  key: string;
  label: string;
  /** text | address | vehicle */
  type: string;
  required: boolean;
}

export interface LifeEventTemplateDto {
  key: string;
  title: string;
  description: string;
  icon: string;
  datelabel: string;
  fields: LifeEventFieldDto[];
}

export interface LifeEventStepDto {
  id: number;
  phase: LifeEventPhase | string;
  sortorder: number;
  title: string;
  description: string | null;
  module: string | null;
  entitytype: string | null;
  entityid: number | null;
  actionurl: string | null;
  duedate: string | null;
  status: LifeEventStepStatus | string;
  iscustom: boolean;
  completedat: string | null;
}

export interface LifeEventNextStepDto {
  id: number;
  title: string;
  duedate: string | null;
}

export interface LifeEventSummaryDto {
  id: number;
  templatekey: string;
  title: string;
  status: LifeEventStatus | string;
  eventdate: string | null;
  totalsteps: number;
  donesteps: number;
  skippedsteps: number;
  nextstep: LifeEventNextStepDto | null;
  createdat: string;
}

export interface LifeEventDetailDto {
  id: number;
  templatekey: string;
  title: string;
  status: LifeEventStatus | string;
  eventdate: string | null;
  details: Record<string, string>;
  steps: LifeEventStepDto[];
  createdat: string;
  completedat: string | null;
}

export interface LifeEventSuggestionDto {
  key: string;
  templatekey: string;
  title: string;
  reason: string;
  detectedat: string;
}

export interface LifeEventsOverviewDto {
  events: LifeEventSummaryDto[];
  suggestions: LifeEventSuggestionDto[];
}

export interface StartLifeEventPayload {
  templateKey: string;
  title?: string;
  eventDate?: string | null;
  details?: Record<string, string>;
}

export interface UpdateLifeEventPayload {
  title?: string;
  eventDate?: string | null;
  clearEventDate?: boolean;
  status?: LifeEventStatus;
}

export interface UpdateLifeEventStepPayload {
  status?: LifeEventStepStatus;
  title?: string;
  dueDate?: string | null;
  clearDueDate?: boolean;
}

export interface AddLifeEventStepPayload {
  title: string;
  phase: LifeEventPhase;
  dueDate?: string | null;
  description?: string;
}

// ---- Daily brief ----
// Shapes returned by the API. The backend serializes property names in lowercase.

export type BriefTodayKind = 'reminder' | 'event' | 'payment' | 'life-event-step';

export interface BriefTodayItemDto {
  id: string;
  kind: BriefTodayKind | string;
  title: string;
  subtitle: string | null;
  time: string | null;
  isdone: boolean;
  cancomplete: boolean;
  /** Legacy reminder id, or an occurrence id when seriesid is set (new engine). */
  reminderid: number | null;
  seriesid: number | null;
  entitytype: string | null;
  entityid: number | null;
  lifeeventid: number | null;
  stepid: number | null;
  amount: number | null;
}

export interface BriefMoneyOutDto {
  total: number;
  count: number;
  from: string;
  to: string;
  items: UpcomingPaymentDto[];
}

export interface BriefCountdownDto {
  key: string;
  kind: 'passport' | 'driver-license' | 'license-certification' | 'insurance' | 'warranty' | string;
  title: string;
  context: string | null;
  daysleft: number;
  date: string;
  severity: 'critical' | 'warning' | 'info' | string;
  entitytype: string;
  entityid: number;
}

export interface BriefChangeDto {
  kind: 'shared-with-you' | 'price-increase' | 'life-event' | string;
  title: string;
  detail: string | null;
  date: string;
  entitytype: string | null;
  entityid: number | null;
  owneruserid: number | null;
}

export interface BriefLifeEventDto {
  id: number;
  title: string;
  donesteps: number;
  totalsteps: number;
  nextstep: LifeEventNextStepDto | null;
}

export interface BriefPreferencesDto {
  pushenabled: boolean;
  /** 'HH:mm', the user's local time */
  deliverytime: string;
  weeklysummary: boolean;
}

export interface DailyBriefDto {
  date: string;
  firstname: string | null;
  healthscore: number;
  today: BriefTodayItemDto[];
  moneyout: BriefMoneyOutDto;
  countdowns: BriefCountdownDto[];
  changes: BriefChangeDto[];
  quicktask: InsightDto | null;
  lifeevent: BriefLifeEventDto | null;
  preferences: BriefPreferencesDto;
  isquietday: boolean;
}
