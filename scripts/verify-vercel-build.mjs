import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
assert.equal(config.framework, 'vite');
assert.equal(config.outputDirectory, 'dist');
assert.match(config.buildCommand, /vite build --base=\//);
assert(!config.buildCommand.includes('scripts/publish.mjs'), 'Vercel must not rewrite GitHub Pages output');

const html = readFileSync('dist/index.html', 'utf8');
assert.match(html, /<div id="root"><\/div>/);
assert(!html.includes('/HomeCraft/assets/'), 'GitHub Pages base leaked to Vercel root build');
const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(x => x[1]);
const css = [...html.matchAll(/<link[^>]*href="([^"]+\.css)"/g)].map(x => x[1]);
assert(scripts.length > 0, 'no JS entrypoint in production HTML');
assert(css.length > 0, 'no CSS entrypoint in production HTML');
for (const url of [...scripts, ...css]) {
  assert(url.startsWith('/assets/'), 'non-root asset path: ' + url);
  assert(existsSync(path.join('dist', url.slice(1))), 'missing built asset: ' + url);
}
for (const file of ['manifest.webmanifest', 'sw.js', 'icon.png', 'icon-192.png', 'icon-512.png']) {
  assert(existsSync(path.join('dist', file)), 'missing PWA asset: ' + file);
}
const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'));
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
console.log('PASS: HomeCraft Vercel build has valid /assets links, app bundle, icons and root PWA files');
