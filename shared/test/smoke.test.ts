import { describe, expect, it } from 'vitest';

describe('shared smoke', () => {
  it('zod is available', async () => {
    const { z } = await import('zod');
    expect(typeof z.object).toBe('function');
  });
});
