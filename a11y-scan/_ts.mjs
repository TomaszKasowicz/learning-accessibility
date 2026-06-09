import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.goto('http://localhost:4300/pointer-size', { waitUntil: 'networkidle' });

const override = process.env.CSS_OVERRIDE;
if (override) {
  await page.addStyleTag({ content: `.small-button { ${override} }` });
  console.log(`>>> override: .small-button { ${override} }`);
}

// Raw geometry of every button + their centers/gaps
const geo = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  return btns.map(b => {
    const r = b.getBoundingClientRect();
    return {
      label: b.className || 'normal',
      x: +r.x.toFixed(1), y: +r.y.toFixed(1),
      w: +r.width.toFixed(1), h: +r.height.toFixed(1),
      cx: +(r.x + r.width / 2).toFixed(1), cy: +(r.y + r.height / 2).toFixed(1),
    };
  });
});
console.log('--- geometry ---');
for (const g of geo) console.log(JSON.stringify(g));

const results = await new AxeBuilder({ page })
  .options({ runOnly: { type: 'rule', values: ['target-size'] }, rules: { 'target-size': { enabled: true } } })
  .analyze();

function dump(bucket, label) {
  const rule = bucket.find(r => r.id === 'target-size');
  if (!rule) return;
  for (const n of rule.nodes) {
    if (!n.target.join(' ').includes('small-button')) continue;
    console.log(`--- small-button in ${label} ---`);
    for (const c of [...n.any, ...n.all, ...n.none]) {
      console.log(`  check ${c.id}: ${JSON.stringify(c.data)}`);
      if (c.relatedNodes?.length) console.log(`    related: ${c.relatedNodes.map(r => r.target).join(', ')}`);
    }
  }
}
dump(results.violations, 'VIOLATIONS');
dump(results.passes, 'PASSES');

await browser.close();
