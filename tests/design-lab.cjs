// Independent interactive prototype smoke test, not a test of production HomeCraft.
const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(pathToFileURL(path.resolve(__dirname, '../docs/design-lab/demo/index.html')).href);
      assert.equal(await page.title(), 'HomeCraft Kitchen OS • Laboratorium projektu');
      assert(await page.getByRole('heading', { name: /Twoja kuchnia/ }).isVisible());
      // Dashboard and three sections are functional, not inert screenshots.
      await page.getByRole('navigation').getByRole('button', { name: /Plan/ }).click();
      await page.getByRole('region', { name: 'Plan gotowania' }).waitFor();
      const prev = await page.locator('#serveTime').textContent();
      await page.locator('#servePlus').click();
      assert.notEqual(await page.locator('#serveTime').textContent(), prev);
      await page.locator('#serveMinus').click();
      assert.equal(await page.locator('#serveTime').textContent(), prev);
      await page.getByRole('navigation').getByRole('button', { name: /Przygotuj/ }).click();
      assert(await page.locator('#ingredients input[type=checkbox]').count() === 5);
      const start = await page.locator('#ingredientProgress').textContent();
      await page.locator('#ingredients input[type=checkbox]').first().check();
      assert.notEqual(await page.locator('#ingredientProgress').textContent(), start);
      await page.locator('#nextStep').click();
      assert.match(await page.locator('#stepBadge').textContent(), /KROK 2/);
      await page.locator('#startDemoTimer').click();
      assert.equal(await page.locator('#airTime').textContent(), '15:00');
      await page.locator('[data-timer=air]').click();
      assert.equal(await page.locator('[data-timer=air]').textContent(), '▶');
      await page.getByRole('navigation').getByRole('button', { name: /Moduły/ }).click();
      assert(await page.getByText('37 dań', { exact: false }).isVisible());
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert(!overflow, 'horizontal overflow at '+width+'px');
      assert.deepEqual(errors, [], 'browser runtime errors');
      await page.close();
    }
    console.log('PASS: isolated Kitchen OS demo interactions at 320px and 390px');
  } finally { await browser.close(); }
})().catch(err => { console.error(err); process.exitCode = 1; });
