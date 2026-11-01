#!/usr/bin/env node
// Vietnamese Drill MCP server (stdio, JSON-RPC 2.0, newline-delimited). Zero dependencies.
// Wraps skills/vietnamese/scripts/vi.mjs: offline, read-only, no network. Tools: vi_lookup, vi_check.
import { createInterface } from 'node:readline';
import { readFileSync } from 'node:fs';
import { check, checkItems, lookupRequest, TEXT_HINT } from '../skills/vietnamese/scripts/vi.mjs';
import { domainIds } from '../skills/vietnamese/scripts/glossary.mjs';
import { surfaceIds } from '../skills/vietnamese/scripts/surfaces.mjs';

const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const PROTOCOLS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const MAX_FILE = 2_000_000;

const INSTRUCTIONS = [
  'Vietnamese Drill: offline glossary lookup + checker for Vietnamese software text.',
  'Before writing Vietnamese UI/product strings call vi_lookup (returns only the matching glossary lines and UI-slot limits); never write fixed UI terms from memory.',
  'After writing call vi_check with items [{id, src, tgt, ctx}] and fix every error; text mode does not check lengths.',
].join(' ');

// Surface and pack ids are listed once (in vi_lookup); vi_check refers to them to keep the always-on schema small.
const ctxSchema = full => ({
  type: 'object',
  description: 'Where the string is shown. Context on screen means shorten; standalone means minimum complete message.',
  properties: {
    surface: { type: 'string', description: full ? `UI slot id. One of: ${surfaceIds().join(', ')}` : 'UI slot id, as in vi_lookup' },
    max: { type: 'integer', minimum: 1, description: 'Character limit the project states for this slot (README, design system, spec). Always pass it when stated: surface defaults are generic and usually looser' },
    near: { anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }], description: 'Text already visible next to the string (dialog title, field label)' },
    standalone: { type: 'boolean', description: 'Seen without other context (push, SMS, background toast)' },
  },
  additionalProperties: false,
});
const domainsSchema = full => ({ type: 'array', items: { type: 'string' }, description: full ? `Industry packs to force: ${domainIds().join(', ')}. ["none"] = core only. Omit to auto-route from the strings.` : 'Industry packs to force, as in vi_lookup. Omit to auto-route.' });
const glossarySchema = {
  projectGlossary: { type: 'string', description: 'Project glossary as TSV text (columns of glossary/project.template.tsv). Beats bundled entries.' },
  glossaryFile: { type: 'string', description: 'Absolute path to a project glossary TSV on this machine; use instead of pasting the text.' },
};

const TOOLS = [
  {
    name: 'vi_lookup',
    title: 'Vietnamese glossary lookup',
    description: 'Return only the glossary lines relevant to the given English strings (core UI terms + auto-routed industry packs, with avoid-forms) plus the length and punctuation spec of every UI surface used. Use instead of reading glossary files. Offline.',
    inputSchema: {
      type: 'object',
      properties: {
        strings: { type: 'array', minItems: 1, maxItems: 500, items: { type: 'object', properties: { id: { type: 'string' }, src: { type: 'string' }, ctx: ctxSchema(true) }, required: ['id', 'src'], additionalProperties: false } },
        domains: domainsSchema(true),
        ...glossarySchema,
        notes: { type: 'boolean', description: 'Include sense notes for ambiguous terms (default true)' },
      },
      required: ['strings'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'vi_check',
    title: 'Vietnamese lint',
    description: 'Offline Vietnamese lint. For UI strings use items mode [{id, src, tgt, ctx}]: glossary avoid-forms, placeholders, style, per-surface length, punctuation, redundancy and next-step checks (only items mode checks lengths). Text mode: whole string or serialized JSON resource file against sourceText. Reports findings; never rewrites. A clean result is not a fluency judgement.',
    inputSchema: {
      type: 'object',
      properties: {
        items: { type: 'array', minItems: 1, maxItems: 2000, items: { type: 'object', properties: { id: { type: 'string' }, src: { type: 'string' }, tgt: { type: 'string' }, ctx: ctxSchema(false) }, required: ['id', 'tgt'], additionalProperties: false } },
        text: { type: 'string', description: 'Target text or serialized JSON (text mode)' },
        sourceText: { type: 'string', description: 'Source text or JSON to compare (text mode)' },
        mode: { type: 'string', enum: ['text', 'json'] },
        domains: domainsSchema(false),
        ...glossarySchema,
        limit: { type: 'integer', minimum: 1, maximum: 2000, description: 'Max findings returned (default 60)' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
];

function withGlossary(args) {
  const { glossaryFile, ...rest } = args ?? {};
  if (typeof glossaryFile === 'string' && glossaryFile) {
    const buf = readFileSync(glossaryFile);
    if (buf.length > MAX_FILE) throw new Error(`glossaryFile larger than ${MAX_FILE} bytes`);
    rest.projectGlossary = buf.toString('utf8');
  }
  return rest;
}

const HANDLERS = {
  vi_lookup(args) {
    const r = lookupRequest(withGlossary(args));
    return { content: [{ type: 'text', text: r.text || '(no glossary terms matched)' }] };
  },
  vi_check(args) {
    const a = withGlossary(args);
    if (!Array.isArray(a.items) && typeof a.text !== 'string') throw new Error('give items [{id, src, tgt, ctx}] or text');
    const result = Array.isArray(a.items) ? checkItems(a) : { ...check(a), hint: TEXT_HINT };
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  },
};

function handle(msg) {
  const { method, params } = msg;
  switch (method) {
    case 'initialize': {
      const want = params?.protocolVersion;
      return {
        protocolVersion: PROTOCOLS.includes(want) ? want : PROTOCOLS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'vietnamese-drill', title: 'Vietnamese Drill', version: VERSION },
        instructions: INSTRUCTIONS,
      };
    }
    case 'ping': return {};
    case 'tools/list': return { tools: TOOLS };
    case 'tools/call': {
      const fn = HANDLERS[params?.name];
      if (!fn) throw Object.assign(new Error(`Unknown tool: ${params?.name}`), { rpc: -32602 });
      try { return fn(params.arguments ?? {}); }
      catch (e) { return { isError: true, content: [{ type: 'text', text: String(e?.message ?? e) }] }; }
    }
    default:
      throw Object.assign(new Error(`Method not found: ${method}`), { rpc: -32601 });
  }
}

const send = obj => process.stdout.write(JSON.stringify(obj) + '\n');

function onLine(line) {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
  if (!msg || typeof msg !== 'object' || Array.isArray(msg) || typeof msg.method !== 'string') {
    // Responses to server requests are not expected; ignore. Anything else is invalid.
    if (msg && typeof msg === 'object' && !Array.isArray(msg) && 'id' in msg && !('method' in msg)) return;
    return send({ jsonrpc: '2.0', id: msg?.id ?? null, error: { code: -32600, message: 'Invalid Request' } });
  }
  const isNotification = !('id' in msg);
  try {
    const result = handle(msg);
    if (!isNotification) send({ jsonrpc: '2.0', id: msg.id, result });
  } catch (e) {
    if (!isNotification) send({ jsonrpc: '2.0', id: msg.id, error: { code: e.rpc ?? -32603, message: e.message } });
    // Unknown notifications (notifications/initialized, notifications/cancelled, ...) are ignored by spec.
  }
}

createInterface({ input: process.stdin, crlfDelay: Infinity }).on('line', onLine);
