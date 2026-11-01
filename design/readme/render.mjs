// node render.mjs page.html out.(gif|png) W H frames.json
// frames.json: [{ "js": "setFrame(...)", "delay": ms }]  (png: first frame only)
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import gifenc from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = gifenc;
const require = createRequire('/home/kyle/node_modules/');
const puppeteer = require('puppeteer-core');
const [html, out, W, H, framesFile] = process.argv.slice(2);
const frames = framesFile ? JSON.parse(readFileSync(framesFile, 'utf8')) : [{ js: '', delay: 0 }];
const browser = await puppeteer.launch({ executablePath: '/home/kyle/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: +W, height: +H, deviceScaleFactor: 1 });
await page.goto('file://' + html, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
if (out.endsWith('.png')) { if (frames[0].js) await page.evaluate(frames[0].js); await page.screenshot({ path: out }); await browser.close(); process.exit(0); }
const gif = GIFEncoder();
for (const f of frames) {
  if (f.js) await page.evaluate(f.js);
  await new Promise(r => setTimeout(r, 30));
  const png = PNG.sync.read(Buffer.from(await page.screenshot({ type: 'png' })));
  const rgba = new Uint8ClampedArray(png.data.buffer);
  const palette = quantize(rgba, 256);
  gif.writeFrame(applyPalette(rgba, palette), png.width, png.height, { palette, delay: f.delay });
}
gif.finish();
writeFileSync(out, gif.bytes());
await browser.close();
console.log(out, frames.length, 'frames');
