import { cp, rm } from 'node:fs/promises';
// GitHub Pages already serves main / (root). Commit the generated output there
// so deployment keeps working without changing the repository's Pages settings.
await rm('assets', { recursive: true, force: true });
for (const path of ['index.html', 'assets', 'icon.png', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest', 'sw.js']) {
 await cp(`dist/${path}`, path, { recursive: true });
}
