import { runWithConcurrency } from './async.util';

describe('async.util', () => {
  describe('runWithConcurrency', () => {
    it('should return empty array for empty items', async () => {
      const results = await runWithConcurrency([], 3, (x) =>
        Promise.resolve(x),
      );
      expect(results).toEqual([]);
    });

    it('should process all items preserving original order', async () => {
      const items = [10, 20, 30, 40, 50];
      const results = await runWithConcurrency(items, 2, (x) =>
        Promise.resolve(x * 2),
      );

      expect(results).toHaveLength(5);
      expect(
        results.map((r) => (r.status === 'fulfilled' ? r.value : null)),
      ).toEqual([20, 40, 60, 80, 100]);
    });

    it('should handle errors without stopping other items', async () => {
      const items = [1, 2, 3, 4];
      const results = await runWithConcurrency(items, 2, (x) => {
        if (x === 2) return Promise.reject(new Error('Boom'));
        return Promise.resolve(x);
      });

      expect(results[0]).toEqual({ status: 'fulfilled', value: 1 });
      expect(results[1].status).toBe('rejected');
      expect(results[2]).toEqual({ status: 'fulfilled', value: 3 });
      expect(results[3]).toEqual({ status: 'fulfilled', value: 4 });
    });

    it('should never exceed the maximum concurrency limit', async () => {
      const concurrency = 3;
      let activeCount = 0;
      let maxActive = 0;

      const items = Array.from({ length: 15 }, (_, i) => i);
      await runWithConcurrency(items, concurrency, async () => {
        activeCount++;
        maxActive = Math.max(maxActive, activeCount);
        await new Promise((resolve) => setTimeout(resolve, 10));
        activeCount--;
      });

      expect(maxActive).toBeLessThanOrEqual(concurrency);
    });
  });
});
