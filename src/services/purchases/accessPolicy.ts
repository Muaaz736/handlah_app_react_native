/**
 * Which plan opens which part of NCHRG. This is the only place that decides it in the app.
 *
 * The website keeps the same rules in handlah-web-portal/src/lib/subscriptionAccess.ts and the
 * backend in AppSubscriptionStatusBuilder (HasAccess / HasBusinessAccess). Change all three together.
 *
 * | Entitlement / plan  | Personal | Business |
 * | ------------------- | -------- | -------- |
 * | premium_personal    | yes      | paywall  |
 * | premium_business    | yes      | yes      |
 * | admin Bypass        | yes      | yes      |
 */

export type AccessArea = 'personal' | 'business';

export interface PlanAccess {
  personal: boolean;
  business: boolean;
}

export const NO_ACCESS: PlanAccess = { personal: false, business: false };
const FULL_ACCESS: PlanAccess = { personal: true, business: true };
const PERSONAL_ONLY: PlanAccess = { personal: true, business: false };

export const ENTITLEMENT_IDS = {
  personal: 'premium_personal',
  business: 'premium_business',
} as const;

const ENTITLEMENT_ACCESS: Record<string, PlanAccess> = {
  [ENTITLEMENT_IDS.personal]: PERSONAL_ONLY,
  [ENTITLEMENT_IDS.business]: FULL_ACCESS,
};

/** Plan types the backend returns in user.subscription.plantype. */
const PLAN_TYPE_ACCESS: Record<string, PlanAccess> = {
  PremiumPersonalMonthly: PERSONAL_ONLY,
  PremiumPersonalYearly: PERSONAL_ONLY,
  PremiumBusinessMonthly: FULL_ACCESS,
  PremiumBusinessYearly: FULL_ACCESS,
  Bypass: FULL_ACCESS,
};

export const mergeAccess = (a: PlanAccess, b: PlanAccess): PlanAccess => ({
  personal: a.personal || b.personal,
  business: a.business || b.business,
});

export const accessFromEntitlements = (activeEntitlementIds: Iterable<string>): PlanAccess => {
  let access = NO_ACCESS;
  for (const id of activeEntitlementIds) {
    access = mergeAccess(access, ENTITLEMENT_ACCESS[id] ?? NO_ACCESS);
  }
  return access;
};

/**
 * From the backend's user.subscription. An active plan the client does not know yet still
 * opens Personal, so a new plan type never locks a paying user out; Business needs a known plan.
 */
export const accessFromServerPlan = (
  sub: { plantype?: string | null; hassubscription?: boolean | null } | null | undefined,
): PlanAccess => {
  if (!sub) {
    return NO_ACCESS;
  }
  if (sub.plantype === 'Bypass') {
    return FULL_ACCESS;
  }
  if (sub.hassubscription !== true) {
    return NO_ACCESS;
  }
  return PLAN_TYPE_ACCESS[sub.plantype ?? ''] ?? PERSONAL_ONLY;
};

export const canAccess = (access: PlanAccess, area: AccessArea): boolean => access[area];
