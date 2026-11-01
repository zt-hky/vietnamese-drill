import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SERVER = new URL('../mcp/server.mjs', import.meta.url).pathname;

// Spawns the real server; send() resolves with the response for that id (or the next line when id is null).
function client() {
  const p = spawn(process.execPath, [SERVER], { stdio: ['pipe', 'pipe', 'inherit'] });
  const pending = new Map();
  const unsolicited = [];
  createInterface({ input: p.stdout }).on('line', l => {
    const m = JSON.parse(l);
    const w = pending.get(m.id);
    if (w) { pending.delete(m.id); w(m); } else unsolicited.push(m);
  });
  let n = 0;
  return {
    unsolicited,
    request: (method, params) => new Promise(res => { const id = ++n; pending.set(id, res); p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'); }),
    notify: (method, params) => p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n'),
    raw: s => p.stdin.write(s + '\n'),
    close: () => p.kill(),
  };
}
const call = (c, name, args) => c.request('tools/call', { name, arguments: args });
const body = r => JSON.parse(r.result.content[0].text);

test('handshake echoes a supported protocol version, falls back for unknown', async () => {
  const c = client();
  try {
    const ok = await c.request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '0' } });
    assert.equal(ok.result.protocolVersion, '2025-06-18');
    assert.equal(ok.result.serverInfo.name, 'vietnamese-drill');
    assert.ok(ok.result.capabilities.tools);
    const odd = await c.request('initialize', { protocolVersion: '1999-01-01' });
    assert.equal(odd.result.protocolVersion, '2025-11-25');
  } finally { c.close(); }
});

test('tools/list exposes vi_lookup and vi_check as read-only with object schemas', async () => {
  const c = client();
  try {
    const { result } = await c.request('tools/list');
    assert.deepEqual(result.tools.map(t => t.name).sort(), ['vi_check', 'vi_lookup']);
    for (const t of result.tools) {
      assert.equal(t.inputSchema.type, 'object');
      assert.equal(t.annotations.readOnlyHint, true);
    }
  } finally { c.close(); }
});

test('vi_lookup returns industry terms with avoid-forms and the surface spec; vi_check flags surface punctuation', async () => {
  const c = client();
  try {
    const l = await call(c, 'vi_lookup', { strings: [{ id: '1', src: 'Send money to friends', ctx: { surface: 'button' } }] });
    const text = l.result.content[0].text;
    assert.match(text, /send money = chuyển tiền/);
    assert.match(text, /avoid: gửi tiền/);
    assert.match(text, /# surfaces/);
    const k = await call(c, 'vi_check', { items: [{ id: 'b', src: 'Save', tgt: 'Lưu.', ctx: { surface: 'button' } }] });
    assert.ok(body(k).findings.some(f => f.code === 'END_PUNCT' && f.path === 'b'));
  } finally { c.close(); }
});

test('vi_check text mode carries the hint that lengths were not checked; bad input is a tool error, not a protocol error', async () => {
  const c = client();
  try {
    const t = await call(c, 'vi_check', { text: 'Xin chào', sourceText: 'Hello' });
    assert.match(body(t).hint, /NOT checked/);
    const bad = await call(c, 'vi_check', {});
    assert.equal(bad.result.isError, true);
    assert.equal(bad.error, undefined);
  } finally { c.close(); }
});

test('glossaryFile is read server-side; its project term and avoid-form reach lookup and check; missing file is a tool error', async () => {
  const tsv = join(mkdtempSync(join(tmpdir(), 'vi-mcp-')), 'g.tsv');
  writeFileSync(tsv, 'en\tvi\talt\tavoid\tcat\tmatch\tsrc\tnote\nZorbulator\tMáy Zorb\t\tbộ zorbu\tapp\tw\tE\t\n');
  const c = client();
  try {
    const miss = await call(c, 'vi_lookup', { strings: [{ id: '1', src: 'Open the Zorbulator' }], glossaryFile: join(tmpdir(), 'does-not-exist.tsv') });
    assert.equal(miss.result.isError, true);
    const ok = await call(c, 'vi_lookup', { strings: [{ id: '1', src: 'Open the Zorbulator' }], glossaryFile: tsv });
    assert.match(ok.result.content[0].text, /# project\nzorbulator = Máy Zorb \| avoid: bộ zorbu/);
    const k = await call(c, 'vi_check', { items: [{ id: '1', src: 'Open the Zorbulator', tgt: 'Mở bộ zorbu' }], glossaryFile: tsv });
    assert.ok(body(k).findings.some(f => /zorbu/i.test(f.message)));
  } finally { c.close(); }
});

test('unknown tool/method return JSON-RPC errors; notifications and responses get no reply; garbage gets a parse error', async () => {
  const c = client();
  try {
    assert.equal((await call(c, 'nope', {})).error.code, -32602);
    assert.equal((await c.request('bogus')).error.code, -32601);
    c.notify('notifications/initialized');
    c.notify('bogus/notification');
    c.raw(JSON.stringify({ jsonrpc: '2.0', id: 99, result: {} }));
    c.raw('not json');
    const ping = await c.request('ping');
    assert.deepEqual(ping.result, {});
    assert.equal(c.unsolicited.length, 1);
    assert.equal(c.unsolicited[0].error.code, -32700);
  } finally { c.close(); }
});
