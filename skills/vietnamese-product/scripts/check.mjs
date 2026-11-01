import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { loadGlossary, lintPair, reverseHints, lookup } from './glossary.mjs';

// Read-only lint: no network, no dependencies, no automatic rewrites. Reads only the bundled glossary
// and, in the CLI, an optional project glossary file you pass with --glossary.
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
  const { text, sourceText, mode = 'text', limit = 30, projectGlossary, glossary = true } = input;
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
  const G = glossary ? loadGlossary(projectGlossary) : null;
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
  return { status, findings: findings.slice(0, limit), total: findings.length, truncated: findings.length > limit, semanticReview: 'not-run', coverage: 'NFC, selected invisible characters, JSON leaves/types, simple named placeholders and printf, style/locale hints, tone-mark mix, UI glossary (avoid-forms when sourceText is given; GLOSSARY_MISS is info only); NOT ICU/HTML/Markdown parser or fluency assessment' };
}

export function lookupRequest(input) {
  const strings = Array.isArray(input?.strings) ? input.strings : input?.src ? [{ id: '1', src: input.src }] : [];
  if (!strings.length || strings.length > 2000 || strings.some(s => typeof (s.src ?? s.text) !== 'string')) throw new Error('strings must be 1..2000 items of {id, src}');
  return lookup(strings, loadGlossary(input.projectGlossary), { notes: input.notes !== false, perId: !!input.perId, max: input.max ?? 80, header: input.header !== false });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    const cmd = args[0] && !args[0].startsWith('-') ? args.shift() : 'check';
    const gi = args.indexOf('--glossary');
    const projectGlossary = gi >= 0 ? readFileSync(args[gi + 1], 'utf8') : undefined;
    let data = '';
    for await (const chunk of process.stdin) { data += chunk; if (data.length > 1300000) throw new Error('Request too large'); }
    const req = JSON.parse(data);
    if (projectGlossary) req.projectGlossary = projectGlossary;
    if (cmd === 'lookup') {
      const r = lookupRequest(req);
      console.log(args.includes('--json') ? JSON.stringify(r) : r.text);
    } else if (cmd === 'check') {
      const result = check(req);
      console.log(JSON.stringify(result));
      process.exitCode = result.status === 'error' ? 1 : 0;
    } else throw new Error(`unknown command ${cmd}; use check or lookup`);
  } catch (e) { console.error(JSON.stringify({ status: 'error', message: e.message })); process.exitCode = 2; }
}
