/** Vehicle list order, the same as the website. */

type V = {
  make?: string | null;
  model?: string | null;
  year?: number | string | null;
  nickname?: string | null;
  issold?: boolean;
  istransferred?: boolean;
  solddate?: string | null;
  latesttransfer?: { transferdate?: string | null; isseller?: boolean; fromuserid?: number; touserid?: number } | null;
};

/** The name a vehicle card shows ("Ford 2018 - Work Truck"). */
export const vehicleLabel = (v: V): string =>
  `${v.make ?? ''} ${v.year ?? ''}${v.nickname ? ` - ${v.nickname}` : ''} ${v.model ?? ''}`.trim();

/** When it was sold: the sold date, else the transfer date. */
const soldTime = (v: V): number => {
  const raw = v.solddate || v.latesttransfer?.transferdate;
  const t = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(t) ? t : 0;
};

/** 0 = still mine, 1 = sold not transferred, 2 = sold and transferred. */
export const soldRank = (v: V): number => {
  if (v.issold && v.istransferred) return 2;
  if (v.issold || v.istransferred) return 1;
  const t = v.latesttransfer;
  // A sale waiting on the buyer (not a move between my own personal and business sides).
  if (t?.isseller && t.fromuserid !== t.touserid) return 1;
  return 0;
};

/**
 * Active vehicles A–Z by name; then sold but not transferred; then sold and transferred at the bottom.
 * Each sold group is newest sale first.
 */
export function orderVehicles<T extends V>(list: T[]): T[] {
  return list
    .map(v => ({ v, r: soldRank(v) }))
    .sort((a, b) => {
      if (a.r !== b.r) return a.r - b.r;
      if (a.r === 0) return vehicleLabel(a.v).localeCompare(vehicleLabel(b.v), undefined, { sensitivity: 'base', numeric: true });
      return soldTime(b.v) - soldTime(a.v);
    })
    .map(({ v }) => v);
}
