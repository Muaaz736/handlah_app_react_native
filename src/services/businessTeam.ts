import { apiHandle } from '../config/apiHandle';
import { API_ENDPOINTS } from '../config/constants';

/**
 * Who runs a business (its primary owner and Owner/Admins) and the approval votes on changes to them.
 * Same API and rules as the website's Team & approvals page.
 */

export type TeamRole = 'owner' | 'owner_admin' | 'standard';
export type ApprovalAction = 'add_member' | 'set_role' | 'remove_member' | 'transfer_owner';
export type ApprovalStatus = 'pending' | 'applied' | 'declined' | 'expired' | 'cancelled';

export interface TeamMember {
  userId: number;
  name: string | null;
  userName: string | null;
  role: TeamRole;
  /** Invited, not accepted yet. */
  pending: boolean;
  connectionId: number | null;
}

export interface ApprovalVoter {
  userId: number;
  name: string | null;
  decision: 'approved' | 'declined' | null;
}

export interface ApprovalRequest {
  id: number;
  businessId: number;
  businessName: string | null;
  action: ApprovalAction;
  requestedByUserId: number;
  requestedByName: string | null;
  targetUserId: number;
  targetName: string | null;
  role: 'owner_admin' | 'standard' | null;
  status: ApprovalStatus;
  createdAt: string;
  expiresAt: string;
  voters: ApprovalVoter[];
  canVote: boolean;
  canCancel: boolean;
}

export interface BusinessTeam {
  businessId: number;
  businessName: string | null;
  ownerUserId: number;
  myRole: 'owner' | 'owner_admin';
  members: TeamMember[];
  requests: ApprovalRequest[];
}

export interface TeamActionResult {
  ok: boolean;
  /** Done straight away (no approvals needed). */
  applied: boolean;
  request: ApprovalRequest | null;
  error: string | null;
}

export interface FoundUser {
  id: number;
  userName: string;
  fullName: string;
}

/** The API lowercases property names; read either spelling. */
const get = (o: any, key: string): any => {
  if (!o || typeof o !== 'object') return undefined;
  if (key in o) return o[key];
  const k = Object.keys(o).find(x => x.toLowerCase() === key.toLowerCase());
  return k ? o[k] : undefined;
};
const str = (v: any): string | null => (v == null || v === '' ? null : String(v));
const num = (v: any): number => Number(v ?? 0) || 0;

const toVoter = (v: any): ApprovalVoter => ({
  userId: num(get(v, 'userId')),
  name: str(get(v, 'name')),
  decision: (str(get(v, 'decision')) as ApprovalVoter['decision']) ?? null,
});

const toRequest = (r: any): ApprovalRequest => ({
  id: num(get(r, 'id')),
  businessId: num(get(r, 'businessId')),
  businessName: str(get(r, 'businessName')),
  action: String(get(r, 'action') ?? '') as ApprovalAction,
  requestedByUserId: num(get(r, 'requestedByUserId')),
  requestedByName: str(get(r, 'requestedByName')),
  targetUserId: num(get(r, 'targetUserId')),
  targetName: str(get(r, 'targetName')),
  role: (str(get(r, 'role')) as ApprovalRequest['role']) ?? null,
  status: String(get(r, 'status') ?? 'pending') as ApprovalStatus,
  createdAt: String(get(r, 'createdAt') ?? ''),
  expiresAt: String(get(r, 'expiresAt') ?? ''),
  voters: ((get(r, 'voters') as any[]) ?? []).map(toVoter),
  canVote: Boolean(get(r, 'canVote')),
  canCancel: Boolean(get(r, 'canCancel')),
});

const toMember = (m: any): TeamMember => ({
  userId: num(get(m, 'userId')),
  name: str(get(m, 'name')),
  userName: str(get(m, 'userName')),
  role: String(get(m, 'role') ?? 'standard') as TeamRole,
  pending: Boolean(get(m, 'pending')),
  connectionId: get(m, 'connectionId') == null ? null : num(get(m, 'connectionId')),
});

const toResult = (d: any): TeamActionResult => ({
  ok: Boolean(get(d, 'ok')),
  applied: Boolean(get(d, 'applied')),
  request: get(d, 'request') ? toRequest(get(d, 'request')) : null,
  error: str(get(d, 'error')) ?? str(get(d, 'message')),
});

const errorOf = (e: any): string | null => {
  const data = e?.response?.data;
  return (data && (str(get(data, 'message')) ?? str(get(data, 'error')))) || null;
};

const E = API_ENDPOINTS.BUSINESS_TEAM;

const businessTeam = {
  /** Null when I don't run this business (or it's gone). */
  async getTeam(businessId: number): Promise<BusinessTeam | null> {
    try {
      const { data } = await apiHandle.get(`${E.BUSINESSES}/${businessId}/team`);
      return {
        businessId: num(get(data, 'businessId')),
        businessName: str(get(data, 'businessName')),
        ownerUserId: num(get(data, 'ownerUserId')),
        myRole: (str(get(data, 'myRole')) ?? 'owner_admin') as BusinessTeam['myRole'],
        members: ((get(data, 'members') as any[]) ?? []).map(toMember),
        requests: ((get(data, 'requests') as any[]) ?? []).map(toRequest),
      };
    } catch {
      return null;
    }
  },

  async request(
    businessId: number,
    body: { action: ApprovalAction; targetUserId: number; role?: 'owner_admin' | 'standard' },
  ): Promise<TeamActionResult> {
    try {
      const { data } = await apiHandle.post(`${E.BUSINESSES}/${businessId}/approval-requests`, body);
      return toResult(data);
    } catch (e) {
      return { ok: false, applied: false, request: null, error: errorOf(e) };
    }
  },

  async vote(requestId: number, approve: boolean): Promise<TeamActionResult> {
    try {
      const { data } = await apiHandle.post(`${E.APPROVALS}/${requestId}/vote`, { approve });
      return toResult(data);
    } catch (e) {
      return { ok: false, applied: false, request: null, error: errorOf(e) };
    }
  },

  async cancel(requestId: number): Promise<TeamActionResult> {
    try {
      const { data } = await apiHandle.post(`${E.APPROVALS}/${requestId}/cancel`, {});
      return toResult(data);
    } catch (e) {
      return { ok: false, applied: false, request: null, error: errorOf(e) };
    }
  },

  /** NCHRG people to add, by name or username. */
  async searchUsers(search: string): Promise<FoundUser[]> {
    try {
      const { data } = await apiHandle.get(API_ENDPOINTS.CONNECTIONS.GET_HANDLAH_USERS, {
        params: { search, page: 1, pageSize: 8, targetAccountType: 'Business' },
      });
      return ((get(data, 'users') as any[]) ?? []).map(u => ({
        id: num(get(u, 'id')),
        userName: String(get(u, 'username') ?? get(u, 'userName') ?? ''),
        fullName: String(get(u, 'fullname') ?? get(u, 'fullName') ?? ''),
      }));
    } catch {
      return [];
    }
  },
};

export default businessTeam;
