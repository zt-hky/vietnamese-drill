import { check, lookupRequest } from '../skills/vietnamese-product/scripts/check.mjs';

export default (pi) => [
  {
    name: 'vi_check',
    label: 'Vietnamese contract check',
    description: 'Offline read-only Vietnamese lint: NFC, JSON leaves/types, placeholders, tone-mark mix, style hints, and UI-glossary avoid-forms when sourceText is given. No fluency score, no network.',
    parameters: pi.zod.object({
      text: pi.zod.string().describe('Target text or serialized JSON, max 200000 UTF-16 units'),
      sourceText: pi.zod.string().optional().describe('Optional English source in the same format; enables placeholder and glossary checks'),
      mode: pi.zod.enum(['text', 'json']).optional(),
      projectGlossary: pi.zod.string().optional().describe('Optional project glossary as TSV text (same columns as the bundled one); beats bundled entries'),
      limit: pi.zod.number().int().min(1).max(100).optional(),
    }),
    async execute(_id, params, _update, _ctx, signal) {
      if (signal?.aborted) throw new Error('Cancelled');
      const result = check(params);
      return { content: [{ type: 'text', text: JSON.stringify(result) }], details: result };
    },
  },
  {
    name: 'vi_lookup',
    label: 'Vietnamese UI glossary lookup',
    description: 'Return only the glossary lines (term = Vietnamese | alt | avoid | note) relevant to the given English UI strings. Use instead of reading the glossary file.',
    parameters: pi.zod.object({
      strings: pi.zod.array(pi.zod.object({ id: pi.zod.string(), src: pi.zod.string() })).min(1).max(500),
      projectGlossary: pi.zod.string().optional(),
      notes: pi.zod.boolean().optional(),
    }),
    async execute(_id, params, _update, _ctx, signal) {
      if (signal?.aborted) throw new Error('Cancelled');
      const r = lookupRequest(params);
      return { content: [{ type: 'text', text: r.text || '(no glossary terms matched)' }], details: { count: r.count } };
    },
  },
];
