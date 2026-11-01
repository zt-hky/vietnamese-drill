import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { lintPair, reverseHints, lookup, route, resolvePacks, index, loadPack, domainIds } from './glossary.mjs';
import { writeFileSync } from 'node:fs';
import { checkSurface, specLines, surfaceIds, getSurface, graphemes } from './surfaces.mjs';
import { fileURLToPath } from 'node:url';

// CLI + library: check (lint), lookup (glossary slice), route (pick domain packs), packs (list), build-index.
// Read-only except build-index; no network, no dependencies, no automatic rewrites.
const MAX = 200000;
const tokens = text => [...text.matchAll(/\{\{\s*([\w.]+)\s*\}\}|\$\{\s*([\w.]+)\s*\}|\{([\w.]+)\}|%(?:\d+\$)?[sdif]/g)].map(m => m[1] ? `mustache:${m[1]}` : m[2] ? `template:${m[2]}` : m[3] ? `brace:${m[3]}` : m[0]).sort();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function flatten(value, path = [], out = new Map()) {
  if (typeof value === 'string') out.set(JSON.stringify(path), value);
  else if (Array.isArray(value)) value.forEach((v, i) => flatten(v, [...path, i], out));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) flatten(v, [...path, k], out);
  else out.set(JSON.stringify(path), value);
  return out;
}
const TONE_PAIRS = [['hóa', 'hoá'], ['hòa', 'hoà'], ['hủy', 'huỷ'], ['xóa', 'xoá'], ['thủy', 'thuỷ'], ['tùy', 'tuỳ'], ['tòa', 'toà']];
const SEV = { error: 0, warning: 1, info: 2 };

export function check(input) {
  if (!input || typeof input.text !== 'string' || input.text.length > MAX) throw new Error('text must be a string of at most 200000 UTF-16 units');
  const { text, sourceText, mode = 'text', limit = 30, projectGlossary, glossary = true, domains } = input;
  if (!['text', 'json'].includes(mode)) throw new Error('mode must be text or json');
  if (sourceText !== undefined && (typeof sourceText !== 'string' || sourceText.length > MAX)) throw new Error('invalid sourceText');
  if (projectGlossary !== undefined && (typeof projectGlossary !== 'string' || projectGlossary.length > MAX)) throw new Error('invalid projectGlossary');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('limit must be 1..100');
  const findings = [];
  const add = (code, severity, path, message) => findings.push({ code, severity, path, message });
  let target, source;
  try {
    target = mode === 'json' ? flatten(JSON.parse(text)) : new Map([['$', text]]);
    source = sourceText === undefined ? undefined : mode === 'json' ? flatten(JSON.parse(sourceText)) : new Map([['$', sourceText]]);
  } catch (e) { return { status: 'error', findings: [{ code: 'JSON', severity: 'error', path: '$', message: e.message }], total: 1, truncated: false, semanticReview: 'not-run' }; }
  const srcTexts = source ? [...source.values()].filter(v => typeof v === 'string') : [];
  const R = glossary ? resolvePacks({ texts: srcTexts, domains, auto: !!source, project: projectGlossary, ext: false }) : null;
  const G = R?.packs;
  if (source) {
    for (const key of source.keys()) if (!target.has(key)) add('MISSING_KEY', 'error', key, 'Missing source leaf');
    for (const key of target.keys()) if (!source.has(key)) add('EXTRA_KEY', 'error', key, 'Unexpected target leaf');
  }
  for (const [path, value] of target) {
    const original = source?.get(path);
    if (source?.has(path) && (typeof value !== typeof original || (typeof value !== 'string' && !same(value, original)))) add('VALUE_CONTRACT', 'error', path, 'Non-string value or value type changed');
    if (typeof value !== 'string') continue;
    if (value !== value.normalize('NFC')) add('NFC', 'warning', path, 'Use NFC; no changes applied');
    if (/[\uFFFD\u200B\uFEFF]/u.test(value)) add('INVISIBLE', 'warning', path, 'Replacement or invisible character; inspect context');
    const complex = s => /\{\s*[^{}\s,]+\s*,/u.test(s);
    if (complex(value) || (typeof original === 'string' && complex(original))) {
      add('ICU_UNCHECKED', 'warning', path, 'Complex ICU: validate variables, branches and syntax with project compiler; regex check skipped');
    } else if (typeof original === 'string' && !same(tokens(original), tokens(value))) add('PLACEHOLDER', 'error', path, 'Supported placeholder names/types/counts differ from source');
    // Review hints only (Microsoft vi-VN style guide); code examples/quotes may be legitimate.
    const prose = value.replace(/```[\s\S]*?```|`[^`\n]*`/gu, 'x').replace(/\{\{[^{}]*\}\}|\{[^{}]*\}|https?:\/\/\S+/gu, 'x').replace(/<[^>\n]+>/gu, '');
    if (/cam kết (?:các )?thay đổi|triển khai (?:đến|lên) sản xuất/iu.test(value)) add('CALQUE', 'warning', path, 'Possible literal translation of commit/production; inspect software context');
    if (/\S\s+[.,!?;:](?=\s|$)/u.test(prose)) add('PUNCT_SPACE', 'warning', path, 'Space before . , ! ? ; : (vi-VN: none); ignore if intentional French-style/code');
    if (/,\s*(?:và|hoặc)\s/iu.test(prose)) add('COMMA_BEFORE_CONJ', 'warning', path, 'No comma before và/hoặc in vi-VN (no Oxford comma)');
    if (/\d\s+%/u.test(prose)) add('PERCENT_SPACE', 'warning', path, 'No space between number and %');
    if (/\b[\p{L}]+ (?:thất bại|không thành công)\b/iu.test(prose)) add('FAILED_PHRASE', 'warning', path, 'Prefer "Không … được" / "Không … thể" over "… thất bại" for UI errors');
    if (/\b(?:Vui lòng|Hãy)\s+(?:xin\s+)?vui lòng\b|\bxin vui lòng\b/iu.test(prose)) add('POLITE_DOUBLE', 'warning', path, 'Redundant politeness marker');
    if (/(?:^|[.!?]\s)(?:[A-ZÀ-Ỹ][\p{Ll}]+ ){2,}[A-ZÀ-Ỹ][\p{Ll}]+(?:\s|$)/u.test(prose) && !/[.!?]\s+[A-ZÀ-Ỹ]/u.test(prose)) add('TITLE_CASE', 'warning', path, 'UI strings use sentence case in vi-VN (only first word capitalized, plus proper nouns)');
    if (/\b(?:0?[1-9]|1[0-2])\/(?:1[3-9]|2\d|3[01])\/\d{4}\b/u.test(prose)) add('DATE_US_ORDER', 'warning', path, 'Looks like month/day/year; vi-VN uses day/month/year');
    if (/\b\d{1,2}(?::\d{2})?\s?(?:AM|PM)\b/iu.test(prose)) add('TIME_AMPM', 'warning', path, 'Use 24-hour time or a day-part word ("9 giờ tối"), not AM/PM; prefer Intl for formatting');
    if (/\btệp\b/iu.test(prose) && /\btập tin\b/iu.test(prose)) add('TERM_MIX', 'warning', path, 'Both "tệp" and "tập tin" used; pick one per product');
    if (/\b(?:quý khách|quý vị)\b/iu.test(prose) && /\bbạn\b/iu.test(prose)) add('ADDRESS_MIX', 'warning', path, 'Mixed address terms (bạn vs quý khách/quý vị) in one string; follow the product rule');
    if (G) {
      const origText = typeof original === 'string' ? original : undefined;
      const res = origText !== undefined ? lintPair(origText, prose, G) : reverseHints(prose, G);
      for (const r of res) add(r.code, r.severity, path, r.message);
    }
  }
  const all = [...target.values()].filter(v => typeof v === 'string').join('\n');
  for (const [a, b] of TONE_PAIRS) {
    if (new RegExp(`(?<![\\p{L}])${a}(?![\\p{L}])`, 'iu').test(all) && new RegExp(`(?<![\\p{L}])${b}(?![\\p{L}])`, 'iu').test(all)) add('TONE_MIX', 'warning', '$', `Both "${a}" and "${b}" used; keep one tone-mark style per product`);
  }
  findings.sort((x, y) => SEV[x.severity] - SEV[y.severity]);
  const status = findings.some(f => f.severity === 'error') ? 'error' : findings.some(f => f.severity === 'warning') ? 'warning' : 'clean';
  return { status, findings: findings.slice(0, limit), total: findings.length, truncated: findings.length > limit, domains: R?.domains ?? [], semanticReview: 'not-run', coverage: 'NFC, selected invisible characters, JSON leaves/types, simple named placeholders and printf, style/locale hints, tone-mark mix, UI glossary (avoid-forms when sourceText is given; GLOSSARY_MISS is info only); NOT ICU/HTML/Markdown parser or fluency assessment' };
}

export const TEXT_HINT = 'Text mode: lengths and UI-surface rules were NOT checked. For UI strings call check with {"items":[{id,src,tgt,ctx:{surface,max,near,standalone}}]}.';

export function lookupRequest(input) {
  const strings = Array.isArray(input?.strings) ? input.strings : Array.isArray(input?.items) ? input.items : input?.src ? [{ id: '1', src: input.src }] : [];
  if (!strings.length || strings.length > 2000 || strings.some(s => typeof (s.src ?? s.text) !== 'string')) throw new Error('strings must be 1..2000 items of {id, src, ctx?}');
  const r = lookup(strings, { domains: input.domains, auto: input.auto !== false, project: input.projectGlossary, notes: input.notes !== false, perId: !!input.perId, max: input.max ?? 60, maxExt: input.maxExt ?? 12, header: input.header !== false, ext: input.ext !== false });
  // Surface specs only for surfaces present in the batch (a few lines), so length/context rules travel with the terms.
  const used = strings.map(s => s.ctx?.surface).filter(Boolean);
  if (used.length) { const lines = specLines(used); r.surfaces = lines; r.text = (r.text ? r.text + '\n' : '') + `# surfaces (GENERIC default lengths in characters. A limit stated by the project (README, design system, spec) wins: pass it as ctx.max when checking)\n${lines.join('\n')}`; }
  return r;
}

// Batch check of {id, src, tgt, ctx}: glossary + style + placeholder lint per item, plus surface rules (length, punctuation, context).
export function checkItems(input) {
  const items = input.items;
  if (!Array.isArray(items) || !items.length || items.length > 2000) throw new Error('items must be 1..2000 of {id, src, tgt, ctx?}');
  const domains = input.domains ?? (route(items.map(i => i.src ?? '').filter(Boolean)).selected);
  const findings = [];
  for (const it of items) {
    if (typeof it.tgt !== 'string') { findings.push({ code: 'MISSING_TGT', severity: 'error', path: it.id, message: 'tgt missing' }); continue; }
    const r = check({ text: it.tgt, sourceText: typeof it.src === 'string' ? it.src : undefined, domains: domains.length ? domains : ['none'], projectGlossary: input.projectGlossary, limit: 100 });
    for (const f of r.findings) findings.push({ ...f, path: it.id });
    try { for (const f of checkSurface(it.tgt, it.ctx)) findings.push({ ...f, path: it.id }); } catch (e) { findings.push({ code: 'SURFACE', severity: 'error', path: it.id, message: e.message }); }
  }
  const SEVR = { error: 0, warning: 1, info: 2 };
  findings.sort((a, b) => SEVR[a.severity] - SEVR[b.severity]);
  const limit = input.limit ?? 60;
  const status = findings.some(f => f.severity === 'error') ? 'error' : findings.some(f => f.severity === 'warning') ? 'warning' : 'clean';
  // Defaults are generic; a project limit is usually tighter. Say so up front so a "clean" status is not read as "fits the design".
  const defaulted = items.filter(i => i.ctx?.surface && !i.ctx?.max).map(i => i.id);
  const hint = defaulted.length ? `NOT verified against the project's limits: ${defaulted.length} item(s) used GENERIC surface defaults (no ctx.max): ${defaulted.slice(0, 8).join(', ')}${defaulted.length > 8 ? ', …' : ''}. Read README* and design/spec docs for stated limits (e.g. "max 16 characters"), pass them as ctx.max and re-run before reporting the strings as fitting.` : undefined;
  return { status, ...(hint && { hint }), domains, findings: findings.slice(0, limit), total: findings.length, truncated: findings.length > limit, lengths: Object.fromEntries(items.filter(i => typeof i.tgt === 'string').map(i => [i.id, graphemes(i.tgt.trim())])) };
}

export function buildIndex() {
  const domains = domainIds().map(id => {
    const p = loadPack(id);
    const cats = {}; for (const e of p.entries) cats[e.cat] = (cats[e.cat] || 0) + 1;
    return { id, terms: p.entries.length, cats: Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 6).map(c => c[0]) };
  });
  const out = { version: 2, core: loadPack('core').entries.length, uiExt: loadPack('ui-ext').entries.length, domains };
  out.total = out.core + out.uiExt + domains.reduce((a, d) => a + d.terms, 0);
  writeFileSync(fileURLToPath(new URL('../glossary/index.json', import.meta.url)), JSON.stringify(out, null, 1) + '\n');
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const HELP = 'usage: node vi.mjs <check|lookup|route|packs|surfaces|build-index> [--domains a,b] [--glossary project.tsv] [--json] < request.json';
  try {
    const args = process.argv.slice(2);
    const cmd = args[0] && !args[0].startsWith('-') ? args.shift() : 'check';
    const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
    if (cmd === 'packs') { const ix = index(); console.log(args.includes('--json') ? JSON.stringify(ix) : `core ${ix.core ?? '?'} · ui-ext ${ix.uiExt ?? '?'} · total ${ix.total ?? '?'}\n` + ix.domains.map(d => `${d.id} (${d.terms ?? '?'}): ${(d.cats || []).join(', ')}`).join('\n')); process.exit(0); }
    if (cmd === 'surfaces') { const ids = surfaceIds(); console.log(args.includes('--full') ? specLines(ids).join('\n') : ids.map(id => { const x = getSurface(id); return `${id} ≤${x.max ?? '-'}${x.hard ? ` (hard ${x.hard})` : ''}`; }).join(' · ')); process.exit(0); }
    if (cmd === 'build-index') { console.log(JSON.stringify(buildIndex())); process.exit(0); }
    if (cmd === 'help' || args.includes('--help')) { console.log(HELP); process.exit(0); }
    const projectGlossary = opt('--glossary') ? readFileSync(opt('--glossary'), 'utf8') : undefined;
    const domains = opt('--domains') ? opt('--domains').split(',').map(s => s.trim()).filter(Boolean) : undefined;
    let data = '';
    for await (const chunk of process.stdin) { data += chunk; if (data.length > 1300000) throw new Error('Request too large'); }
    const req = JSON.parse(data);
    if (projectGlossary) req.projectGlossary = projectGlossary;
    if (domains) req.domains = domains;
    if (cmd === 'lookup') {
      const r = lookupRequest(req);
      console.log(args.includes('--json') ? JSON.stringify(r) : (r.text || '(no glossary terms matched)'));
    } else if (cmd === 'route') {
      const strings = Array.isArray(req.strings) ? req.strings.map(s => s.src ?? s.text ?? '') : [req.text ?? req.src ?? ''];
      console.log(JSON.stringify(route(strings)));
    } else if (cmd === 'check') {
      const result = Array.isArray(req.items) ? checkItems(req) : { ...check(req), hint: TEXT_HINT };
      console.log(JSON.stringify(result));
      process.exitCode = result.status === 'error' ? 1 : 0;
    } else throw new Error(`unknown command ${cmd}; ${HELP}`);
  } catch (e) { console.error(JSON.stringify({ status: 'error', message: e.message })); process.exitCode = 2; }
}
