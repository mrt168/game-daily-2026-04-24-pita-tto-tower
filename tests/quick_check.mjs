import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 800, height: 600 } });
const page = await ctx.newPage();
const errors = [];
const pageErrs = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => pageErrs.push(e.message));
try {
  await page.goto('http://localhost:8099', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2500);
  const hasCanvas = await page.evaluate(() => !!document.querySelector('canvas'));
  console.log('CANVAS:', hasCanvas);
  for (let i = 0; i < 8; i++) {
    await page.click('canvas', { position: { x: 400, y: 300 } });
    await page.waitForTimeout(700);
  }
  console.log('console errors:', errors.length);
  errors.forEach(e => console.log('  CE:', e.slice(0, 200)));
  console.log('page errors:', pageErrs.length);
  pageErrs.forEach(e => console.log('  PE:', e.slice(0, 300)));
} finally {
  await browser.close();
}
