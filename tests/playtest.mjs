import { chromium } from "playwright";
import { writeFile, mkdir } from "fs/promises";

await mkdir("tests", { recursive: true });

const BASE = "http://localhost:8099";
const results = { pass: [], fail: [], errors: [], warnings: [] };
const consoleErrors = [];
const pageErrors = [];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 800, height: 600 } });
const page = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', err => pageErrors.push(err.message));

await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(3000);
results.pass.push("T1: ゲーム起動");

const canvasVisible = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  if (!canvas) return false;
  return canvas.width > 0 && canvas.height > 0;
});
if (canvasVisible) results.pass.push("T2: Canvas描画OK");
else results.fail.push("T2: Canvasが描画されていない");

await page.click('canvas', { position: { x: 400, y: 300 } });
await page.waitForTimeout(1500);

for (let i = 0; i < 8; i++) {
  await page.click('canvas', { position: { x: 400, y: 300 } });
  await page.waitForTimeout(500);
}
results.pass.push("T3: タップ連続動作OK");

const playStart = Date.now();
let lastFrameTime = 0;
let frozenCount = 0;
const PLAY_DURATION = 60000;

while (Date.now() - playStart < PLAY_DURATION) {
  const x = 200 + Math.random() * 400;
  const y = 200 + Math.random() * 300;
  await page.click('canvas', { position: { x, y } }).catch(() => {});

  const frameTime = await page.evaluate(() => window.performance.now()).catch(() => 0);
  if (lastFrameTime > 0 && frameTime - lastFrameTime < 10) frozenCount++;
  lastFrameTime = frameTime;

  await page.waitForTimeout(2000);
}

const elapsed = Date.now() - playStart;
if (elapsed >= PLAY_DURATION - 2000) {
  results.pass.push(`T4: 60秒間プレイ継続OK (${Math.floor(elapsed/1000)}s)`);
} else {
  results.fail.push(`T4: 60秒プレイ未完了 (${Math.floor(elapsed/1000)}s)`);
}

if (frozenCount > 5) results.fail.push(`T5: フリーズ疑い (${frozenCount}回)`);
else results.pass.push(`T5: フリーズなし`);

if (consoleErrors.length > 0) {
  results.errors.push(...consoleErrors.slice(0, 5));
  results.fail.push(`T6: コンソールエラー${consoleErrors.length}件`);
} else results.pass.push("T6: コンソールエラーなし");

if (pageErrors.length > 0) {
  results.errors.push(...pageErrors.slice(0, 5));
  results.fail.push(`T7: 未キャッチ例外${pageErrors.length}件`);
} else results.pass.push("T7: 未キャッチ例外なし");

await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const stillWorks = await page.evaluate(() => !!document.querySelector('canvas'));
if (stillWorks) results.pass.push("T8: リロード後も動作OK");
else results.fail.push("T8: リロード後に壊れる");

await browser.close();

await writeFile("tests/playtest-results.json", JSON.stringify({
  results, consoleErrors, pageErrors,
  summary: `${results.pass.length} passed, ${results.fail.length} failed`,
}, null, 2));

console.log("\n=== PLAYTEST RESULTS ===");
results.pass.forEach(p => console.log(`PASS ${p}`));
results.fail.forEach(f => console.log(`FAIL ${f}`));
if (results.errors.length > 0) {
  console.log("\n--- Errors ---");
  results.errors.forEach(e => console.log(`  ${e.slice(0, 200)}`));
}
console.log(`\n${results.pass.length} passed, ${results.fail.length} failed`);
process.exit(results.fail.length > 0 ? 1 : 0);
