// Vietnamese glossary engine: packs, inverted index, deterministic domain routing, compact lookup, lint.
// No dependencies, no network. Reads only files under ../glossary (plus project TSV text passed in by the caller).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('../glossary/', import.meta.url));
const L = '\\p{L}\\p{N}';
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const WORD = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;
const TIER_RANK = { project: 0, domain: 1, core: 2, ext: 3 };

// Old-style tone placement (hoà, thuỷ) -> traditional (hòa, thủy) so both compare equal.
const TONE = [['oà', 'òa'], ['oá', 'óa'], ['oả', 'ỏa'], ['oã', 'õa'], ['oạ', 'ọa'], ['uý', 'úy'], ['uỳ', 'ùy'], ['uỷ', 'ủy'], ['uỹ', 'ũy'], ['uỵ', 'ụy']];
export function norm(s) {
  s = s.normalize('NFC').toLowerCase();
  for (const [a, b] of TONE) s = s.split(a).join(b);
  return s;
}
export const wordRe = (phrase, flags = 'iu') => new RegExp(`(?<![${L}])${esc(phrase)}(?![${L}])`, flags);
const has = (hay, needle) => wordRe(needle).test(hay);
const split = v => (v || '').split(';').map(x => x.trim()).filter(Boolean);
const firstTok = a => (a.match(WORD) || [''])[0].toLowerCase();
const variants = t => {
  const v = new Set([t]);
  for (const [re, r] of [[/ies$/, 'y'], [/ied$/, 'y'], [/es$/, ''], [/s$/, ''], [/ed$/, ''], [/ed$/, 'e'], [/ing$/, ''], [/ing$/, 'e']]) if (re.test(t)) v.add(t.replace(re, r));
  return v;
};

export function parseTsv(text, pack, tier) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#') || line.startsWith('en\t')) continue;
    const [en = '', vi = '', alt = '', avoid = '', cat = '', match = 'w', src = '', note = ''] = line.split('\t');
    const aliases = split(en).map(a => a.toLowerCase());
    if (!aliases.length || !vi.trim()) continue;
    rows.push({ pack, tier, aliases, vi: vi.trim(), alt: split(alt), avoid: split(avoid), cat: cat.trim(), exact: match.trim() === 'x', src: src.trim(), note: note.trim() });
  }
  return rows;
}

class Pack {
  constructor(id, tier, entries) {
    this.id = id; this.tier = tier; this.entries = entries; this.byFirst = new Map();
    for (const e of entries) for (const a of e.aliases) {
      const body = esc(a).replace(/\\? \\\* /g, '(?:\\s+[^\\s.,;:!?]+){0,3}\\s+');
      const item = { e, a, words: a.split(/\s+/).filter(w => w !== '*').length, re: new RegExp(`(?<![${L}])${body}(?:s|es|ed|ing)?(?![${L}])`, 'iu'), exactRe: new RegExp(`^${body}(?:s|es|ed|ing)?$`, 'iu') };
      const k = firstTok(a);
      if (!this.byFirst.has(k)) this.byFirst.set(k, []);
      this.byFirst.get(k).push(item);
    }
  }
}

const cache = new Map();
function packFile(id) {
  if (id === 'core') return [`${DIR}core.tsv`, 'core'];
  if (id === 'ui-ext') return [`${DIR}ui-ext.tsv`, 'ext'];
  return [`${DIR}domains/${id}.tsv`, 'domain'];
}
export function loadPack(id) {
  if (cache.has(id)) return cache.get(id);
  const [file, tier] = packFile(id);
  if (!existsSync(file)) throw new Error(`unknown pack "${id}"; known: ${domainIds().join(', ')}`);
  const p = new Pack(id, tier, parseTsv(readFileSync(file, 'utf8'), id, tier));
  cache.set(id, p);
  return p;
}
export function projectPack(text) { return new Pack('project', 'project', parseTsv(text, 'project', 'project')); }

let idx;
export function index() {
  if (idx) return idx;
  const f = `${DIR}index.json`;
  idx = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : { domains: readdirSync(`${DIR}domains`).filter(n => n.endsWith('.tsv')).map(n => ({ id: n.slice(0, -4) })) };
  return idx;
}
export const domainIds = () => index().domains.map(d => d.id);

const stripFrame = s => s.trim().replace(/[&_]/g, '').replace(/^["'“‘(]+|["'”’).:…!?\s]+$/gu, '');

// Raw hits of one pack against a source string (uses the first-token index; no full scan).
function packHits(src, pack, framed) {
  const out = [], seen = new Set();
  for (const m of src.matchAll(WORD)) {
    for (const v of variants(m[0].toLowerCase())) {
      for (const it of pack.byFirst.get(v) || []) {
        if (seen.has(it)) continue; seen.add(it);
        if (it.e.exact) { if (it.exactRe.test(framed)) out.push({ ...it, start: 0, end: src.length, len: src.length + 1 }); continue; }
        const r = it.re.exec(src);
        if (r) out.push({ ...it, start: r.index, end: r.index + r[0].length, len: r[0].length });
      }
    }
  }
  return out;
}

// Longest-match-first, non-overlapping; ties broken by pack priority (order of `packs`).
// Placeholders, tags and URLs are data, never terms ("{biller}" must not match "biller").
export const stripCode = s => s.replace(/\{\{[^{}]*\}\}|\$\{[^{}]*\}|\{[^{}]*\}|%(?:\d+\$)?[sdif@]|<[^>\n]+>|https?:\/\/\S+|`[^`\n]*`/gu, ' ');
export function matchSource(src, packs) {
  if (typeof src !== 'string' || !src) return [];
  src = stripCode(src);
  const framed = stripFrame(src), hits = [];
  packs.forEach((p, pri) => { for (const h of packHits(src, p, framed)) hits.push({ ...h, pri }); });
  hits.sort((x, y) => y.len - x.len || x.pri - y.pri);
  const used = [], out = [], seen = new Set();
  for (const h of hits) {
    if (seen.has(h.e)) continue;
    const clash = used.find(u => h.start < u.end && h.end > u.start);
    // Same single word claimed by a domain pack and by core: keep both senses so the model picks by context
    // ("profile" = hồ sơ in UI, cấu hình in dev).
    if (clash && !(h.words === 1 && clash.words === 1 && h.start === clash.start && h.end === clash.end && h.e.tier !== clash.e.tier && [h.e.tier, clash.e.tier].includes('core'))) continue;
    used.push(h); seen.add(h.e); out.push({ e: h.e, alias: h.a, both: !!clash });
  }
  // A shipped ui-ext phrase may carry its source app's sense ("edit profile" = cấu hình in Android settings).
  // If it does not use the core sense of a core word inside it, also show that core entry.
  for (const o of [...out]) {
    if (o.e.tier !== 'ext') continue;
    const sel = used.find(u => u.e === o.e), vi = norm(`${o.e.vi} ${o.e.alt.join(' ')}`);
    for (const h of hits) if (h.e.tier === 'core' && !seen.has(h.e) && h.start >= sel.start && h.end <= sel.end && ![h.e.vi, ...h.e.alt].some(f => wordRe(norm(f)).test(vi))) { seen.add(h.e); out.push({ e: h.e, alias: h.a, both: true }); }
  }
  return out;
}

// Deterministic domain routing: score each domain pack by its matches in the batch (multi-word = 2, single word = 1).
let generic;
const genericAliases = () => generic ??= new Set(['core', 'ui-ext'].flatMap(id => loadPack(id).entries.flatMap(e => e.aliases)));
export function route(texts, { min = texts.length <= 3 ? 1 : 2, ratio = 0.34 } = {}) {
  const core = loadPack('core'), gen = genericAliases();
  const scores = [];
  for (const id of domainIds()) {
    const p = loadPack(id); let s = 0; const terms = new Set();
    // Aliases that are also generic UI phrases (core/ui-ext) are not evidence for a domain.
    for (const t of texts) for (const { e, alias } of matchSource(t, [p, core])) if (e.pack === id && !gen.has(alias)) { s += alias.split(/\s+/).length > 1 ? 2 : 1; terms.add(alias); }
    if (s) scores.push({ id, score: s, terms: [...terms].slice(0, 5) });
  }
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0]?.score ?? 0;
  return { selected: scores.filter(x => x.score >= min && x.score >= best * ratio).slice(0, 3).map(x => x.id), scores: scores.slice(0, 6) };
}

// Resolve the pack list for a request: project > explicit or routed domains > core > ui-ext.
export function resolvePacks({ texts = [], domains, auto = true, project, ext = true } = {}) {
  let picked = [];
  if (Array.isArray(domains) && domains.length) picked = domains.filter(d => d !== 'none');
  else if (auto) picked = route(texts).selected;
  const packs = [];
  if (project) packs.push(projectPack(project));
  for (const d of picked) packs.push(loadPack(d));
  packs.push(loadPack('core'));
  if (ext) packs.push(loadPack('ui-ext'));
  return { packs, domains: picked };
}

const line = (e, notes, alias = e.aliases[0]) => `${alias.replace(/ \* /g, ' … ')} = ${e.vi}` + (e.alt.length ? ` | alt: ${e.alt.join(' / ')}` : '') + (e.avoid.length ? ` | avoid: ${e.avoid.join(' / ')}` : '') + (notes && e.note ? ` | ${e.note}` : '');

// Compact retrieval for an LLM prompt: only entries relevant to the strings, grouped by pack.
export function lookup(strings, opts = {}) {
  const { notes = true, perId = false, max = 60, maxExt = 12, header = true } = opts;
  const texts = strings.map(s => s.src ?? s.text ?? '');
  const { packs, domains } = resolvePacks({ ...opts, texts });
  const per = [], union = new Map();
  for (const [i, s] of strings.entries()) {
    const m = matchSource(texts[i], packs);
    per.push({ id: s.id, keys: m.map(x => x.e.aliases[0]) });
    for (const { e, alias } of m) if (!union.has(e)) union.set(e, alias);
  }
  const all = [...union.keys()].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);
  const main = all.filter(e => e.tier !== 'ext').slice(0, max), extra = all.filter(e => e.tier === 'ext').slice(0, maxExt);
  const groups = new Map();
  for (const e of [...main, ...extra]) { const g = e.tier === 'ext' ? 'ui-ext (Android/Firefox phrasing; may carry a system-settings sense, use only if it fits)' : e.pack; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(line(e, notes && e.tier !== 'ext', union.get(e))); }
  let text = [...groups].map(([g, ls]) => `# ${g}\n${ls.join('\n')}`).join('\n');
  const omitted = all.length - main.length - extra.length;
  if (omitted > 0) text += `\n(+${omitted} more omitted)`;
  if (header && all.length) text = `Packs: ${domains.length ? domains.join(', ') + ', ' : ''}core. Industry and project terms: use them. Core/ui-ext lines: defaults for short labels and buttons; inside a sentence use the idiomatic word for the context (nộp bài, nộp phí, biên bản) and check the note. Never use an avoid form. Write natural Vietnamese, not word for word; keep "bạn/của bạn" when it reads friendlier or clearer, drop it only in short labels or to meet a length limit.\n` + text;
  if (perId) text += '\n' + per.map(p => `${p.id}: ${p.keys.join(', ') || '-'}`).join('\n');
  return { count: all.length, domains, text, entries: [...main, ...extra].map(e => ({ pack: e.pack, en: e.aliases[0], vi: e.vi, alt: e.alt, avoid: e.avoid, note: e.note, src: e.src })) };
}

// Source/target lint against non-ext packs.
export function lintPair(src, tgt, packs) {
  const out = [], lintPacks = packs.filter(p => p.tier !== 'ext');
  const matched = matchSource(src, lintPacks).map(x => x.e);
  const t = norm(tgt);
  const preferred = new Set(matched.flatMap(e => [norm(e.vi), ...e.alt.map(norm)]));
  // Blank out accepted multi-word forms first, so an avoid form that only occurs inside one ("Hủy" in "Hủy thay đổi") is not flagged.
  const masked = [...preferred].sort((a, b) => b.length - a.length).reduce((acc, f) => acc.replace(wordRe(f, 'giu'), ' '.repeat(f.length)), t);
  for (const e of matched) {
    const where = e.pack === 'core' ? '' : ` [${e.pack}]`;
    const bad = e.avoid.find(a => !preferred.has(norm(a)) && has(masked, norm(a)));
    if (bad) { out.push({ code: 'GLOSSARY_AVOID', severity: 'warning', message: `"${e.aliases[0]}"${where}: found "${bad}"; glossary prefers "${e.vi}"${e.note ? ` (${e.note})` : ''}` }); continue; }
    if (![e.vi, ...e.alt].some(f => has(t, norm(f)))) out.push({ code: 'GLOSSARY_MISS', severity: 'info', message: `"${e.aliases[0]}"${where}: expected "${e.vi}"${e.alt.length ? ` (or ${e.alt.join(' / ')})` : ''}` });
  }
  return out;
}

// Target-only: avoid forms of core/selected packs that are never valid preferred forms in those packs.
export function reverseHints(tgt, packs) {
  const lp = packs.filter(p => p.tier !== 'ext'), forms = new Set(), out = [], t = norm(tgt);
  for (const p of lp) for (const e of p.entries) { forms.add(norm(e.vi)); e.alt.forEach(a => forms.add(norm(a))); }
  for (const p of lp) for (const e of p.entries) for (const a of e.avoid) {
    const an = norm(a);
    if (!forms.has(an) && has(t, an)) out.push({ code: 'GLOSSARY_AVOID_TARGET', severity: 'warning', message: `"${a}" is rejected for "${e.aliases[0]}"${p.id === 'core' ? '' : ` [${p.id}]`}; glossary prefers "${e.vi}" (check it really translates that term)` });
  }
  return out;
}
