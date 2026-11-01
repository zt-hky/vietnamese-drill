// Vietnamese UI glossary: retrieval (token-cheap slices) and source/target linting.
// No dependencies, no network. Reads only the bundled TSV (and optional project TSV text passed by the caller).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BUNDLED = fileURLToPath(new URL('../assets/glossary.vi-ui.tsv', import.meta.url));
const L = '\\p{L}\\p{N}';
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Old-style tone placement (hoà, thuỷ) -> new style (hòa, thủy) so both compare equal.
const TONE = [['oà', 'òa'], ['oá', 'óa'], ['oả', 'ỏa'], ['oã', 'õa'], ['oạ', 'ọa'], ['uý', 'úy'], ['uỳ', 'ùy'], ['uỷ', 'ủy'], ['uỹ', 'ũy'], ['uỵ', 'ụy']];
export function norm(s) {
  s = s.normalize('NFC').toLowerCase();
  for (const [a, b] of TONE) s = s.split(a).join(b);
  return s;
}
const wordRe = (phrase, flags = 'iu') => new RegExp(`(?<![${L}])${esc(phrase)}(?![${L}])`, flags);
const has = (hay, needle) => wordRe(needle).test(hay);
const split = v => (v || '').split(';').map(x => x.trim()).filter(Boolean);

export function parseTsv(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#') || line.startsWith('en\t')) continue;
    const [en = '', vi = '', alt = '', avoid = '', cat = '', match = 'w', src = '', note = ''] = line.split('\t');
    const aliases = split(en).map(a => a.toLowerCase());
    if (!aliases.length || !vi.trim()) continue;
    rows.push({ aliases, vi: vi.trim(), alt: split(alt), avoid: split(avoid), cat: cat.trim(), exact: match.trim() === 'x', src: src.trim(), note: note.trim() });
  }
  return rows;
}

let cache;
export function loadGlossary(projectTsv) {
  cache ??= parseTsv(readFileSync(BUNDLED, 'utf8'));
  let entries = cache;
  if (projectTsv) {
    const proj = parseTsv(projectTsv);
    const keys = new Set(proj.flatMap(e => e.aliases));
    entries = [...proj.map(e => ({ ...e, project: true })), ...cache.filter(e => !e.aliases.some(a => keys.has(a)))];
  }
  const forms = new Set();
  for (const e of entries) { forms.add(norm(e.vi)); e.alt.forEach(a => forms.add(norm(a))); }
  for (const e of entries) {
    // "a * b" = alias with up to 3 words between a and b ("mute * conversation" matches "mute this conversation").
    e.re ??= e.aliases.map(a => ({ a, re: new RegExp(`(?<![${L}])${esc(a).replace(/\\? \\\* /g, '(?:\\s+[^\\s.,;:!?]+){0,3}\\s+')}(?:s|es|ed|d|ing)?(?![${L}])`, 'iu') }));
  }
  return { entries, forms };
}

const stripFrame = s => s.trim().replace(/[&_]/g, '').replace(/^["'“‘(]+|["'”’).:…!?\s]+$/gu, '').toLowerCase();

// Longest-match-first, non-overlapping matches of source text against glossary aliases.
export function matchSource(src, G) {
  if (typeof src !== 'string' || !src) return [];
  const framed = stripFrame(src);
  const hits = [];
  for (const e of G.entries) {
    for (const { a, re } of e.re) {
      if (e.exact) {
        if (new RegExp(`^${esc(a)}(?:s|es|ed|d|ing)?$`, 'iu').test(framed)) hits.push({ e, start: 0, end: src.length, len: src.length + 1 });
      } else {
        const m = re.exec(src);
        if (m) hits.push({ e, start: m.index, end: m.index + m[0].length, len: m[0].length });
      }
    }
  }
  hits.sort((x, y) => y.len - x.len || (x.e.project ? -1 : 1));
  const used = [], out = [], seen = new Set();
  for (const h of hits) {
    if (seen.has(h.e) || used.some(u => h.start < u.end && h.end > u.start)) continue;
    used.push(h); seen.add(h.e); out.push(h.e);
  }
  return out;
}

export function lintPair(src, tgt, G) {
  const out = [];
  const matched = matchSource(src, G);
  const t = norm(tgt);
  const preferred = new Set(matched.flatMap(e => [norm(e.vi), ...e.alt.map(norm)]));
  // Blank out accepted multi-word forms first, so an avoid form that only occurs inside one ("Hủy" in "Hủy thay đổi") is not flagged.
  const masked = [...preferred].sort((a, b) => b.length - a.length).reduce((acc, f) => acc.replace(wordRe(f, 'giu'), ' '.repeat(f.length)), t);
  for (const e of matched) {
    const bad = e.avoid.find(a => !preferred.has(norm(a)) && has(masked, norm(a)));
    if (bad) {
      out.push({ code: 'GLOSSARY_AVOID', severity: 'warning', message: `"${e.aliases[0]}": found "${bad}"; glossary prefers "${e.vi}"${e.note ? ` (${e.note})` : ''}` });
      continue;
    }
    if (![e.vi, ...e.alt].some(f => has(t, norm(f)))) {
      out.push({ code: 'GLOSSARY_MISS', severity: 'info', message: `"${e.aliases[0]}": expected "${e.vi}"${e.alt.length ? ` (or ${e.alt.join(' / ')})` : ''}` });
    }
  }
  return out;
}

// Target-only mode: flag avoid-forms that are never valid preferred forms elsewhere in the glossary.
export function reverseHints(tgt, G) {
  const out = [], t = norm(tgt);
  for (const e of G.entries) {
    for (const a of e.avoid) {
      const an = norm(a);
      if (G.forms.has(an)) continue;
      if (has(t, an)) out.push({ code: 'GLOSSARY_AVOID_TARGET', severity: 'warning', message: `"${a}" is rejected for "${e.aliases[0]}"; glossary prefers "${e.vi}" (check it really translates that term)` });
    }
  }
  return out;
}

// Compact retrieval: only entries relevant to the strings, formatted for an LLM prompt.
export function lookup(strings, G, { notes = true, perId = false, max = 80, header = true } = {}) {
  const per = [], union = new Map();
  for (const s of strings) {
    const m = matchSource(s.src ?? s.text ?? '', G);
    per.push({ id: s.id, keys: m.map(e => e.aliases[0]) });
    for (const e of m) if (!union.has(e)) union.set(e, 1);
  }
  const list = [...union.keys()].slice(0, max);
  const line = e => `${e.aliases[0].replace(/ \* /g, ' … ')} = ${e.vi}` + (e.alt.length ? ` | alt: ${e.alt.join(' / ')}` : '') + (e.avoid.length ? ` | avoid: ${e.avoid.join(' / ')}` : '') + (notes && e.note ? ` | ${e.note}` : '');
  let text = list.map(line).join('\n');
  if (header && list.length) text = 'Fixed terms for these strings (project glossary beats this list). Everything else: natural Vietnamese, not word for word; drop "của bạn" when ownership is obvious.\n' + text;
  if (union.size > max) text += `\n(+${union.size - max} more omitted)`;
  if (perId) text += '\n' + per.map(p => `${p.id}: ${p.keys.join(', ') || '-'}`).join('\n');
  return { count: union.size, text, entries: list.map(e => ({ en: e.aliases[0], vi: e.vi, alt: e.alt, avoid: e.avoid, note: e.note, src: e.src })) };
}

export const stats = G => ({ entries: G.entries.length });
