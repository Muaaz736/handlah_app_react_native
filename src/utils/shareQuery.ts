export interface ShareQueryParams {
  sharedWithUserId?: number;
  ownerId?: number;
}

export const appendShareQueryParams = (url: string, arg?: unknown): string => {
  if (!arg || typeof arg !== 'object') {
    return url;
  }

  const params: string[] = [];
  const sharedWithUserId = (arg as ShareQueryParams).sharedWithUserId;
  const ownerId = (arg as ShareQueryParams).ownerId;

  if (typeof sharedWithUserId === 'number') {
    params.push(`sharedWithUserId=${sharedWithUserId}`);
  }

  if (typeof ownerId === 'number') {
    params.push(`ownerUserId=${ownerId}`);
  }

  if (!params.length) {
    return url;
  }

  return `${url}${url.includes('?') ? '&' : '?'}${params.join('&')}`;
};