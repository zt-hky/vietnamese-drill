import { check, checkItems, lookupRequest, TEXT_HINT } from '../skills/vietnamese/scripts/vi.mjs';

export default (pi) => {
  const z = pi.zod;
  const ctx = z.object({
    surface: z.string().optional().describe('UI slot id: button, dialog_button, field_error, toast, push_title, push_body, sms, empty_body, store_title… (vi.mjs surfaces)'),
    max: z.number().int().positive().optional().describe('Real character limit for this slot; overrides the surface default'),
    near: z.union([z.string(), z.array(z.string())]).optional().describe('Text already visible next to the string (dialog title, field label…)'),
    standalone: z.boolean().optional().describe('Seen without other context (push, SMS, background toast)'),
    screen: z.string().optional(),
    action: z.string().optional(),
  }).optional();
  return [
    {
      name: 'vi_check',
      label: 'Vietnamese check',
      description: 'Offline Vietnamese lint. Use items mode for UI strings (only it checks lengths/surfaces). items mode [{id,src,tgt,ctx}]: glossary avoid-forms (core + routed industry packs), placeholders, style, and per-surface length/punctuation/redundancy/next-step checks. text mode: whole string or JSON resource file vs sourceText. No network.',
      parameters: z.object({
        items: z.array(z.object({ id: z.string(), src: z.string().optional(), tgt: z.string(), ctx })).max(2000).optional(),
        text: z.string().optional().describe('Target text or serialized JSON (text mode)'),
        sourceText: z.string().optional(),
        mode: z.enum(['text', 'json']).optional(),
        domains: z.array(z.string()).optional().describe('Industry packs; omitted = auto-route'),
        projectGlossary: z.string().optional().describe('Project glossary TSV text; beats bundled entries'),
        limit: z.number().int().min(1).max(2000).optional(),
      }),
      async execute(_id, params, _update, _ctx, signal) {
        if (signal?.aborted) throw new Error('Cancelled');
        if (!params.items && typeof params.text !== 'string') throw new Error('give items or text');
        const result = params.items ? checkItems(params) : { ...check(params), hint: TEXT_HINT };
        return { content: [{ type: 'text', text: JSON.stringify(result) }], details: result };
      },
    },
    {
      name: 'vi_lookup',
      label: 'Vietnamese glossary lookup',
      description: 'Return only the glossary lines relevant to the given English strings (core + auto-routed or given industry packs), plus specs for any UI surfaces in ctx. Use instead of reading glossary files.',
      parameters: z.object({
        strings: z.array(z.object({ id: z.string(), src: z.string(), ctx })).min(1).max(500),
        domains: z.array(z.string()).optional().describe('Force packs, e.g. ["fintech"]; ["none"] = core only; omitted = auto-route'),
        projectGlossary: z.string().optional(),
        notes: z.boolean().optional(),
      }),
      async execute(_id, params, _update, _ctx, signal) {
        if (signal?.aborted) throw new Error('Cancelled');
        const r = lookupRequest(params);
        return { content: [{ type: 'text', text: r.text || '(no glossary terms matched)' }], details: { count: r.count, domains: r.domains, surfaces: r.surfaces?.length ?? 0 } };
      },
    },
  ];
};
