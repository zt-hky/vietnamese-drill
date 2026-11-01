// Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { check, checkItems, lookupRequest } from '../skills/vietnamese/scripts/vi.mjs';

const codes = x => check(x).findings.map(f => f.code);
const itemCodes = (items, id) => checkItems({ items }).findings.filter(f => f.path === id).map(f => f.code);

test('placeholder and JSON contracts are errors', () => {
  assert.equal(check({ text: 'Xin chào {user}', sourceText: 'Hello {name}' }).status, 'error');
  assert.equal(check({ text: '{}', sourceText: '{"x":"Hello"}', mode: 'json' }).findings[0].code, 'MISSING_KEY');
});

test('avoid forms: core and auto-routed industry pack', () => {
  assert.ok(codes({ text: 'Học thêm', sourceText: 'Learn more' }).includes('GLOSSARY_AVOID'));
  assert.ok(codes({ text: 'Gửi tiền cho bạn bè', sourceText: 'Send money to friends' }).includes('GLOSSARY_AVOID'));
  assert.ok(!codes({ text: 'Gửi tiền cho bạn bè', sourceText: 'Send money to friends', domains: ['none'] }).includes('GLOSSARY_AVOID'));
});

test('matching does not invent terms', () => {
  assert.ok(!lookupRequest({ strings: [{ id: '1', src: 'Delete this card' }] }).text.includes('ô tô'), '"card" must not match "car"');
  assert.ok(!lookupRequest({ strings: [{ id: '1', src: 'Pay {biller} now' }] }).text.includes('biller'), 'placeholders are not terms');
});

test('conflicting senses are both shown, never silently overridden', () => {
  const ext = lookupRequest({ strings: [{ id: '1', src: 'Edit profile' }], domains: ['none'] }).text;
  assert.ok(ext.includes('Hồ sơ') && ext.includes('cấu hình'));
  assert.ok(lookupRequest({ strings: [{ id: '1', src: 'Open profile' }], domains: ['dev'] }).text.includes('Hồ sơ'));
});

test('generic UI strings are not routed to an industry pack', () => {
  const r = lookupRequest({ strings: ['Save changes', 'Cancel', 'Settings', 'Sign out'].map((src, i) => ({ id: String(i), src })) });
  assert.deepEqual(r.domains, []);
});

test('surface rules: length, punctuation, redundancy, SMS', () => {
  assert.ok(itemCodes([{ id: 'b', src: 'Save', tgt: 'Lưu.', ctx: { surface: 'button' } }], 'b').includes('END_PUNCT'));
  assert.ok(itemCodes([{ id: 'd', src: 'Delete', tgt: 'Xóa tệp này', ctx: { surface: 'dialog_button', near: 'Xóa tệp này?' } }], 'd').includes('REDUNDANT_CONTEXT'));
  assert.ok(itemCodes([{ id: 's', src: 'x', tgt: 'Mã OTP của bạn là 123456. Mã hết hạn sau 5 phút. Không chia sẻ mã này với bất kỳ ai.', ctx: { surface: 'sms' } }], 's').includes('SMS_SEGMENTS'));
  const m = checkItems({ items: [{ id: 'm', src: 'Top up', tgt: 'Nạp tiền vào ví ngay bây giờ', ctx: { surface: 'button', max: 12 } }] }).findings.find(f => f.code === 'LENGTH_OVER');
  assert.equal(m?.severity, 'error', 'ctx.max is a hard requirement');
  assert.ok(itemCodes([{ id: 't', src: 'x', tgt: 'a'.repeat(31), ctx: { surface: 'store_title' } }], 't').includes('LENGTH_HARD'));
});

test('lookup carries the spec of surfaces used in the batch', () => {
  assert.ok(lookupRequest({ items: [{ id: '1', src: 'Save', ctx: { surface: 'button' } }] }).text.includes('# surfaces'));
});
