import { chromium } from "playwright";
import { mkdir } from "fs/promises";

await mkdir("screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 800, height: 600 } });

const page = await context.newPage();
await page.goto("http://localhost:8099", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: "screenshots/01-title.png" });
console.log("01-title saved");

// Menu -> tutorial
await page.click('canvas', { position: { x: 400, y: 400 } });
await page.waitForTimeout(1200);
await page.screenshot({ path: "screenshots/02-tutorial-1.png" });
console.log("02 saved");

await page.click('canvas', { position: { x: 400, y: 300 } });
await page.waitForTimeout(900);
await page.screenshot({ path: "screenshots/03-tutorial-2.png" });
console.log("03 saved");

await page.click('canvas', { position: { x: 400, y: 300 } });
await page.waitForTimeout(900);
await page.click('canvas', { position: { x: 400, y: 300 } });
await page.waitForTimeout(900);
await page.click('canvas', { position: { x: 400, y: 300 } });
await page.waitForTimeout(1500);
await page.screenshot({ path: "screenshots/04-gameplay-start.png" });
console.log("04 saved");

// Play a bit
for (let i = 0; i < 6; i++) {
  await page.click('canvas', { position: { x: 400, y: 300 } });
  await page.waitForTimeout(700);
}
await page.screenshot({ path: "screenshots/05-gameplay-mid.png" });
console.log("05 saved");

// Let it fail eventually
for (let i = 0; i < 10; i++) {
  await page.click('canvas', { position: { x: 400 + (i % 3 - 1) * 120, y: 300 } });
  await page.waitForTimeout(600);
}
await page.waitForTimeout(1000);
await page.screenshot({ path: "screenshots/06-gameover.png" });
console.log("06 saved");

await browser.close();
console.log("DONE");
