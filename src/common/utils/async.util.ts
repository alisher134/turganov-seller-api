/**
 * Executes an async mapper function over an array of items with a concurrency limit.
 * Returns results in the exact same order as input items.
 */
export async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  if (items.length === 0) return [];
  const limit = Math.max(1, concurrency);
  const results: PromiseSettledResult<R>[] = new Array<PromiseSettledResult<R>>(
    items.length,
  );
  let currentIndex = 0;

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (currentIndex < items.length) {
        const index = currentIndex++;
        try {
          const value = await fn(items[index], index);
          results[index] = { status: 'fulfilled', value };
        } catch (reason: unknown) {
          results[index] = { status: 'rejected', reason };
        }
      }
    },
  );

  await Promise.all(workers);
  return results;
}
