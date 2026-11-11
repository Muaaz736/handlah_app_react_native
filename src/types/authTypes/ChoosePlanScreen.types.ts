/**
 * Choose Plan Screen Types
 */

/**
 * Plan type enum
 */
export type PlanType = 'free' | 'premium';

/**
 * Component state interface
 */
export interface ChoosePlanScreenState {
  selectedPlan: PlanType;
  loading: boolean;
}

/**
 * Feature list type
 */
export type FeatureList = string[];
