export default async function audit(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForSelector('.feature-section');
  const results = [];
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    results.push(await page.evaluate(() => ({
      width: innerWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
      features: [...document.querySelectorAll('.feature-section')].map(el => {
        const content = el.querySelector('.feature-section__content').getBoundingClientRect();
        const visual = el.querySelector('.feature-section__visual').getBoundingClientRect();
        return {
          id: el.parentElement.id, rows: getComputedStyle(el).gridTemplateRows,
          content: { x: content.x, y: content.y, width: content.width, height: content.height },
          visual: { x: visual.x, y: visual.y, width: visual.width, height: visual.height }
        };
      })
    })));
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('#ai-matching').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'landing-audit-desktop.png' });
  return results;
}
