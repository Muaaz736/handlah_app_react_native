const queues = new Map<number, Promise<unknown>>();

// Keeps per-role PUT /theme calls in trigger order so an older one can't land after a newer one.
export const enqueueThemeSync = (role: number, task: () => Promise<void>): Promise<void> => {
  const prev = queues.get(role) ?? Promise.resolve();
  const next = prev.then(task, task);
  queues.set(role, next);
  return next;
};
