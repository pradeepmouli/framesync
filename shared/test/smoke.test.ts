import { describe, it, expect } from 'vitest';

describe('shared smoke', () => {
  it('zod is available', async () => {
    const { z } = await import('zod');
    expect(typeof z.object).toBe('function');
  });
});
