// UI surface specs (where a string is shown) and context-aware checks: length, punctuation, SMS segments,
// redundancy with on-screen context, missing next step. No dependencies, no network.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { norm, wordRe } from './glossary.mjs';

const FILE = fileURLToPath(new URL('../glossary/surfaces.tsv', import.meta.url));
let cache;
export function surfaces() {
  if (cache) return cache;
  cache = new Map();
  const lines = readFileSync(FILE, 'utf8').split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#'));
  const head = lines.shift().split('\t');
  for (const l of lines) {
    const r = Object.fromEntries(l.split('\t').map((v, i) => [head[i], v.trim()]));
    const s = { ...r, max: Number(r.max) || null, hard: Number(r.hard) || null, lines: Number(r.lines) || 1, aliases: (r.aliases || '').split(';').map(a => a.trim().toLowerCase()).filter(Boolean) };
    cache.set(s.id, s);
    for (const a of s.aliases) if (!cache.has(a)) cache.set(a, s);
  }
  return cache;
}
export const surfaceIds = () => [...new Set([...surfaces().values()].map(s => s.id))];
export function getSurface(id) {
  if (!id) return null;
  const s = surfaces().get(String(id).toLowerCase().trim().replace(/[\s-]+/g, '_')) || surfaces().get(String(id).toLowerCase().trim());
  if (!s) throw new Error(`unknown surface "${id}"; known: ${surfaceIds().join(', ')}`);
  return s;
}

const seg = new Intl.Segmenter('vi', { granularity: 'grapheme' });
export const graphemes = s => [...seg.segment(s)].length;
const GSM = /^[A-Za-z0-9 @£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\[~\]|€]*$/;
export function smsSegments(s) {
  const n = graphemes(s), gsm = GSM.test(s);
  const single = gsm ? 160 : 70, multi = gsm ? 153 : 67;
  return { encoding: gsm ? 'GSM-7' : 'UCS-2', chars: n, segments: n <= single ? 1 : Math.ceil(n / multi), perSegment: n <= single ? single : multi };
}

// Words that signal a next step in Vietnamese UI copy.
const NEXT = /(?<![\p{L}])(thử lại|kiểm tra|liên hệ|cập nhật|chọn|nhập|mở|bật|tắt|đăng nhập|xác minh|xác nhận|nạp|tải lại|làm mới|khởi động lại|chờ|bấm|nhấn|vào|truy cập|đổi|thay|thêm|xem|gửi|hãy|vui lòng)(?![\p{L}])/iu;
const NEXT_SURFACES = new Set(['banner_error', 'push_body', 'empty_body', 'field_error']);

// Compact spec lines for the surfaces used in a batch (token-cheap).
export function specLines(ids) {
  const out = [];
  for (const id of [...new Set(ids.filter(Boolean))]) {
    const s = getSurface(id);
    const lim = [s.max ? `≤${s.max}` : '', s.hard ? `hard ${s.hard}` : '', `${s.lines} line${s.lines > 1 ? 's' : ''}`, s.end === 'none' ? 'no end punct' : s.end === 'period' ? 'end with period' : ''].filter(Boolean).join(', ');
    out.push(`${s.id} (${lim}): ${s.pattern}. If on-screen context: ${s.omit_when}. Standalone minimum: ${s.minimum}.${s.ok ? ` e.g. "${s.ok}"` : ''}`);
  }
  return out;
}

// Checks for one item {tgt, ctx:{surface, max, near, standalone}}.
export function checkSurface(tgt, ctx = {}) {
  const out = [];
  if (!ctx.surface) return out;
  const s = getSurface(ctx.surface);
  const text = tgt.trim(), n = graphemes(text);
  const max = Number(ctx.max) || s.max, hard = s.hard;
  if (hard && n > hard) out.push({ code: 'LENGTH_HARD', severity: 'error', message: `${n} chars > platform limit ${hard} for ${s.id}` });
  else if (max && n > max) out.push({ code: 'LENGTH_OVER', severity: ctx.max ? 'error' : 'warning', message: `${n} chars > ${ctx.max ? 'required' : 'recommended'} ${max} for ${s.id}; ${s.omit_when !== '—' ? `shorten: ${s.omit_when}` : 'shorten wording'}` });
  if (s.id === 'sms') { const m = smsSegments(text); if (m.segments > 1) out.push({ code: 'SMS_SEGMENTS', severity: 'warning', message: `${m.encoding}, ${m.chars} chars = ${m.segments} SMS segments (${m.perSegment}/segment); Vietnamese diacritics force UCS-2` }); }
  if (s.lines === 1 && /\n/.test(text)) out.push({ code: 'LINES', severity: 'warning', message: `${s.id} is single-line` });
  const last = text.slice(-1);
  if (s.end === 'none' && /[.。]$/.test(text) && !/\.\.\.$|…$/.test(text)) out.push({ code: 'END_PUNCT', severity: 'warning', message: `${s.id}: no trailing period` });
  if (s.end === 'period' && !/[.?!…:]$/.test(last)) out.push({ code: 'END_PUNCT', severity: 'warning', message: `${s.id}: end the sentence with a period` });
  const near = [].concat(ctx.near || []).filter(x => typeof x === 'string' && x.trim().length >= 3);
  if (near.length && s.omit_when && s.omit_when !== '—') {
    const t = norm(text);
    for (const x of near) { const k = norm(x.trim().replace(/[?.!:]+$/, '')); if (k && wordRe(k).test(t)) out.push({ code: 'REDUNDANT_CONTEXT', severity: 'info', message: `"${x}" is already visible; ${s.omit_when}` }); }
  }
  if ((NEXT_SURFACES.has(s.id) || (ctx.standalone && ['toast', 'push_body', 'banner_error', 'inapp_notification'].includes(s.id))) && /không|lỗi|thất bại|hết hạn|chưa/iu.test(text) && !NEXT.test(text)) {
    out.push({ code: 'NO_NEXT_STEP', severity: 'info', message: `${s.id}: failure without a next step; add what the user can do (${s.minimum})` });
  }
  return out;
}
