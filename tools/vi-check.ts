import { check } from '../skills/vietnamese-product/scripts/check.mjs';

export default (pi) => ({
  name: 'vi_check',
  label: 'Vietnamese contract check',
  description: 'Offline read-only Vietnamese mechanical lint. Checks NFC, JSON leaves/types, simple placeholders; flags complex ICU for project compiler. No fluency score or provider call.',
  parameters: pi.zod.object({
    text: pi.zod.string().describe('Target text or serialized JSON, max 200000 UTF-16 units'),
    sourceText: pi.zod.string().optional().describe('Optional source in same format; compares JSON leaves/types and simple placeholders'),
    mode: pi.zod.enum(['text', 'json']).optional(),
    limit: pi.zod.number().int().min(1).max(100).optional(),
  }),
  async execute(_id, params, _update, _ctx, signal) {
    if (signal?.aborted) throw new Error('Cancelled');
    const result = check(params);
    return { content: [{ type: 'text', text: JSON.stringify(result) }], details: result };
  },
});
