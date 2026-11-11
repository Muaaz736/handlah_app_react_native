import {
  accessFromEntitlements,
  accessFromServerPlan,
  canAccess,
  mergeAccess,
} from '../src/services/purchases/accessPolicy';

describe('accessPolicy', () => {
  it('premium_personal opens Personal only', () => {
    const access = accessFromEntitlements(['premium_personal']);
    expect(canAccess(access, 'personal')).toBe(true);
    expect(canAccess(access, 'business')).toBe(false);
  });

  it('premium_business opens Personal and Business', () => {
    const access = accessFromEntitlements(['premium_business']);
    expect(canAccess(access, 'personal')).toBe(true);
    expect(canAccess(access, 'business')).toBe(true);
  });

  it('no or unknown entitlements open nothing', () => {
    expect(accessFromEntitlements([])).toEqual({ personal: false, business: false });
    expect(accessFromEntitlements(['something_else'])).toEqual({ personal: false, business: false });
  });

  it('reads the backend plan', () => {
    expect(accessFromServerPlan({ plantype: 'PremiumPersonalYearly', hassubscription: true }))
      .toEqual({ personal: true, business: false });
    expect(accessFromServerPlan({ plantype: 'PremiumBusinessMonthly', hassubscription: true }))
      .toEqual({ personal: true, business: true });
    expect(accessFromServerPlan({ plantype: 'Bypass', hassubscription: false }))
      .toEqual({ personal: true, business: true });
    expect(accessFromServerPlan({ plantype: 'PremiumBusinessMonthly', hassubscription: false }))
      .toEqual({ personal: false, business: false });
    expect(accessFromServerPlan(null)).toEqual({ personal: false, business: false });
  });

  it('an unknown active plan still opens Personal but not Business', () => {
    expect(accessFromServerPlan({ plantype: 'SomethingNew', hassubscription: true }))
      .toEqual({ personal: true, business: false });
  });

  it('either source granting Business is enough', () => {
    const merged = mergeAccess(
      accessFromEntitlements(['premium_personal']),
      accessFromServerPlan({ plantype: 'PremiumBusinessYearly', hassubscription: true }),
    );
    expect(merged).toEqual({ personal: true, business: true });
  });
});
