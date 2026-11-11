import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiHandle } from '../../config/apiHandle';
import { API_ENDPOINTS, TYPE_CONSTANTS } from '../../config/constants';
import { extractApiError } from '../../utils/helpers';


export type InsightFamily = 'absence' | 'completeness' | 'linkage' | 'staleness';

export interface InsightDto {
  code: string;
  /** Dismiss/snooze key — "{code}:{entityid}" or bare code. Never reconstruct; pass through verbatim. */
  id: string;
  family: InsightFamily;
  module: string;
  title: string;
  message: string;
  priority: number;
  entitytype: string;
  entityid: number | null;
  routekey: string;
  targetfield: string | null;
  actiontext: string;
  icon: string;
  /** True total records the rule fired on — not the number of cards returned (capped at 3/rule). */
  affectedcount: number;
  cansnooze: boolean;
}

export interface InsightGroupDto {
  module: string;
  routekey: string;
  count: number;
  insights: InsightDto[];
}

export interface InsightsSummaryDto {
  totalopen: number;
  healthscore: number;
  resolvedlast30days: number;
  highprioritycount: number;
}

export interface InsightsResponseDto {
  summary: InsightsSummaryDto;
  groups: InsightGroupDto[];
}

export interface InsightsSpaceParams {
  spaceType: 'Personal' | 'Business';
  businessId?: number | null;
}

export interface GetInsightsParams extends InsightsSpaceParams {
  /** Exact, case-insensitive match against the Module field. Omit for all modules. */
  module?: string | null;
}

const buildSpaceQuery = (
  params: InsightsSpaceParams,
  extra?: Record<string, string | undefined>,
): string => {
  const q: string[] = [`spaceType=${params.spaceType ?? 'Personal'}`];
  if (params.businessId) q.push(`businessId=${params.businessId}`);
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        q.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
  }
  return q.join('&');
};

// GET /insights — grouped, rolled-up, open feed.
export const getInsightsAsync = createAsyncThunk<InsightsResponseDto, GetInsightsParams>(
  TYPE_CONSTANTS.GET_INSIGHTS_ASYNC,
  async (params, { rejectWithValue }) => {
    try {
      const qs = buildSpaceQuery(params, { module: params.module ?? undefined });
      const response = await apiHandle.get(`${API_ENDPOINTS.INSIGHTS.GET}?${qs}`);
      return response.data as InsightsResponseDto;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to load insights. Please try again.'));
    }
  },
);

// GET /insights/summary — standalone header-badge numbers.
export const getInsightsSummaryAsync = createAsyncThunk<InsightsSummaryDto, InsightsSpaceParams>(
  TYPE_CONSTANTS.GET_INSIGHTS_SUMMARY_ASYNC,
  async (params, { rejectWithValue }) => {
    try {
      const qs = buildSpaceQuery(params);
      const response = await apiHandle.get(`${API_ENDPOINTS.INSIGHTS.SUMMARY}?${qs}`);
      return response.data as InsightsSummaryDto;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to load insight summary. Please try again.'));
    }
  },
);

export const dismissInsightAsync = createAsyncThunk<boolean, { insightId: string }>(
  TYPE_CONSTANTS.DISMISS_INSIGHT_ASYNC,
  async ({ insightId }, { rejectWithValue }) => {
    try {
      const response = await apiHandle.post(API_ENDPOINTS.INSIGHTS.DISMISS, { insightId });
      return response.data === true;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to dismiss insight. Please try again.'));
    }
  },
);

// POST /insights/snooze — same bare-bool / no-op-on-false contract as dismiss.
export const snoozeInsightAsync = createAsyncThunk<boolean, { insightId: string; until: string }>(
  TYPE_CONSTANTS.SNOOZE_INSIGHT_ASYNC,
  async ({ insightId, until }, { rejectWithValue }) => {
    try {
      const response = await apiHandle.post(API_ENDPOINTS.INSIGHTS.SNOOZE, { insightId, until });
      return response.data === true;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to snooze insight. Please try again.'));
    }
  },
);

export const undismissInsightAsync = createAsyncThunk<boolean, { insightId: string }>(
  TYPE_CONSTANTS.UNDISMISS_INSIGHT_ASYNC,
  async ({ insightId }, { rejectWithValue }) => {
    try {
      const response = await apiHandle.delete(
        `${API_ENDPOINTS.INSIGHTS.UNDISMISS}/${encodeURIComponent(insightId)}`,
      );
      return response.data === true;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, 'Failed to undo. Please try again.'));
    }
  },
);
