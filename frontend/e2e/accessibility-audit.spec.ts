import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';
import type { AxeResults, AxeViolation } from 'axe-core';

interface AccessibilityReport {
  violations: any[];
  incomplete: any[];
  passes: any[];
  inapplicable: any[];
}

function formatViolations(violations: any[]): string {
  if (violations.length === 0) return '  No accessibility violations found.';

  return violations
    .map((v) => {
      const nodes = v.nodes
        .map(
          (n: any) =>
            `    - Element: ${n.html.substring(0, 120)}\n      ${n.target}\n      ${n.failure_summary || ''}`,
        )
        .join('\n');
      return `  [${v.impact.toUpperCase()}] ${v.help} (${v.id})\n${nodes}`;
    })
    .join('\n\n');
}

test.describe('Accessibility Audit - Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Full axe-core accessibility audit', async ({ page }) => {
    const results = await page.evaluate(() => {
      (window as any).axe.run({
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      });
    });

    const report: AccessibilityReport = {
      violations: results.violations,
      incomplete: results.incomplete,
      passes: results.passes,
      inapplicable: results.inapplicable,
    };

    test.info().attach('axe-results', {
      body: JSON.stringify(report, null, 2),
      contentType: 'application/json',
    });

    const critical = report.violations.filter((v) => v.impact === 'critical');
    const serious = report.violations.filter((v) => v.impact === 'serious');
    const moderate = report.violations.filter((v) => v.impact === 'moderate');
    const minor = report.violations.filter((v) => v.impact === 'minor');

    console.log('\n=== ACCESIBILITY AUDIT SUMMARY ===');
    console.log(`Total violations: ${report.violations.length}`);
    console.log(`  Critical: ${critical.length}`);
    console.log(`  Serious:  ${serious.length}`);
    console.log(`  Moderate: ${moderate.length}`);
    console.log(`  Minor:    ${minor.length}`);
    console.log(`  Incomplete checks: ${report.incomplete.length}`);
    console.log(`  Passed checks: ${report.passes.length}`);
    console.log(`  Inapplicable checks: ${report.inapplicable.length}`);
    console.log('\n=== VIOLATIONS DETAIL ===');
    console.log(formatViolations(report.violations));
    if (report.incomplete.length > 0) {
      console.log('\n=== INCOMPLETE CHECKS (manual review needed) ===');
      console.log(
        report.incomplete
          .map(
            (i) =>
              `  [${i.impact?.toUpperCase() || 'UNKNOWN'}] ${i.help} (${i.id})\n    ${i.nodes.map((n: any) => n.html.substring(0, 120)).join('\n    ')}`,
          )
          .join('\n\n'),
      );
    }

    // Don't fail the test - we want to see all results
    if (report.violations.length > 0) {
      console.log('\n=== VIOLATIONS BY SEVERITY ===');

      if (critical.length > 0) {
        console.log('\n--- CRITICAL ---');
        console.log(formatViolations(critical));
      }
      if (serious.length > 0) {
        console.log('\n--- SERIOUS ---');
        console.log(formatViolations(serious));
      }
      if (moderate.length > 0) {
        console.log('\n--- MODERATE ---');
        console.log(formatViolations(moderate));
      }
      if (minor.length > 0) {
        console.log('\n--- MINOR ---');
        console.log(formatViolations(minor));
      }

      expect(report.violations, 'Accessibility violations found - see console output for details').toHaveLength(0);
    }
  });

  test('Images have alt text', async ({ page }) => {
    const violations = await page.evaluate(() => {
      const results = (window as any).axe.run({
        runOnly: {
          type: 'rule',
          values: ['image-alt'],
        },
      });
      return results.violations;
    });

    console.log('\n=== IMAGE ALT TEXT CHECK ===');
    console.log(formatViolations(violations));
    expect(violations, 'Images without alt text found').toHaveLength(0);
  });

  test('Buttons have accessible names', async ({ page }) => {
    const violations = await page.evaluate(() => {
      const results = (window as any).axe.run({
        runOnly: {
          type: 'rule',
          values: ['button-name'],
        },
      });
      return results.violations;
    });

    console.log('\n=== BUTTON ACCESSIBLE NAME CHECK ===');
    console.log(formatViolations(violations));
    expect(violations, 'Buttons without accessible names found').toHaveLength(0);
  });

  test('Links have discernible text', async ({ page }) => {
    const violations = await page.evaluate(() => {
      const results = (window as any).axe.run({
        runOnly: {
          type: 'rule',
          values: ['link-name'],
        },
      });
      return results.violations;
    });

    console.log('\n=== LINK DISCERNIBLE TEXT CHECK ===');
    console.log(formatViolations(violations));
    expect(violations, 'Links without discernible text found').toHaveLength(0);
  });

  test('Color contrast is sufficient', async ({ page }) => {
    const violations = await page.evaluate(() => {
      const results = (window as any).axe.run({
        runOnly: {
          type: 'rule',
          values: ['color-contrast'],
        },
      });
      return results.violations;
    });

    console.log('\n=== COLOR CONTRAST CHECK ===');
    console.log(formatViolations(violations));
    expect(violations, 'Color contrast issues found').toHaveLength(0);
  });

  test('Heading hierarchy is correct', async ({ page }) => {
    const violations = await page.evaluate(() => {
      const results = (window as any).axe.run({
        runOnly: {
          type: 'rule',
          values: ['heading-order', 'p-as-heading', 'empty-heading'],
        },
      });
      return results.violations;
    });

    console.log('\n=== HEADING HIERARCHY CHECK ===');
    console.log(formatViolations(violations));
    expect(violations, 'Heading hierarchy issues found').toHaveLength(0);
  });

  test('Form elements have labels', async ({ page }) => {
    const violations = await page.evaluate(() => {
      const results = (window as any).axe.run({
        runOnly: {
          type: 'rule',
          values: ['label', 'aria-label', 'aria-valid-attr-value'],
        },
      });
      return results.violations;
    });

    console.log('\n=== FORM LABEL CHECK ===');
    console.log(formatViolations(violations));
    expect(violations, 'Form elements without labels found').toHaveLength(0);
  });

  test('Theme toggle works correctly', async ({ page }) => {
    const toggleButton = page.locator('.theme-toggle');

    // Check the toggle exists and is visible
    await expect(toggleButton).toBeVisible();

    // Check it has an accessible name
    const ariaLabel = await toggleButton.getAttribute('aria-label');
    console.log(`\nTheme toggle aria-label: "${ariaLabel}"`);
    expect(ariaLabel).toBeTruthy();

    // Check aria-pressed is set
    const ariaPressed = await toggleButton.getAttribute('aria-pressed');
    console.log(`Theme toggle aria-pressed: "${ariaPressed}"`);
    expect(ariaPressed).not.toBeNull();

    // Get the current html class (should reflect theme)
    const htmlElement = page.locator('html');
    let initialClass = await htmlElement.getAttribute('class');
    console.log(`\nInitial html class: "${initialClass}"`);

    // Click the toggle
    await toggleButton.click();
    await page.waitForTimeout(500);

    let afterClickClass = await htmlElement.getAttribute('class');
    console.log(`After first click html class: "${afterClickClass}"`);

    // Click again to toggle back
    await toggleButton.click();
    await page.waitForTimeout(500);

    let afterSecondClickClass = await htmlElement.getAttribute('class');
    console.log(`After second click html class: "${afterSecondClickClass}"`);

    // Verify the aria-label changed
    const ariaLabelAfter = await toggleButton.getAttribute('aria-label');
    console.log(`\nTheme toggle aria-label after toggle: "${ariaLabelAfter}"`);
    expect(ariaLabelAfter).not.toBe(ariaLabel);

    // Check the toggle button has a role or is a button
    const role = await toggleButton.getAttribute('role');
    const tagName = await toggleButton.evaluate((el) => el.tagName.toLowerCase());
    console.log(`\nTheme toggle tag: ${tagName}, role: ${role || 'native button'}`);

    // Run axe on the toggle to ensure no violations
    const themeToggleViolations = await page.evaluate(() => {
      const results = (window as any).axe.run({
        runOnly: {
          type: 'rule',
          values: ['button-name', 'aria-allowed-attr', 'aria-required-attr'],
        },
      });
      return results.violations;
    });

    console.log('\n=== THEME TOGGLE AXE CHECKS ===');
    console.log(formatViolations(themeToggleViolations));
    expect(themeToggleViolations, 'Theme toggle has accessibility violations').toHaveLength(0);
  });

  test('Page has a main landmark and skip link or navigation', async ({ page }) => {
    const violations = await page.evaluate(() => {
      const results = (window as any).axe.run({
        runOnly: {
          type: 'rule',
          values: ['region', 'landmark-one-main', 'bypass-blockable'],
        },
      });
      return results.violations;
    });

    console.log('\n=== LANDMARK CHECK ===');
    console.log(formatViolations(violations));

    // Manual checks
    const mainContent = page.locator('main, [role="main"]');
    const mainCount = await mainContent.count();
    console.log(`\nMain landmarks found: ${mainCount}`);

    const navCount = await page.locator('nav, [role="navigation"]').count();
    console.log(`Navigation landmarks found: ${navCount}`);

    const headingCount = await page.locator('h1, h2, h3, h4, h5, h6').count();
    console.log(`Headings found: ${headingCount}`);

    const h1Count = await page.locator('h1').count();
    console.log(`H1 count: ${h1Count}`);
  });

  test('SVG elements in landing visuals have proper accessibility', async ({ page }) => {
    const svgViolations = await page.evaluate(() => {
      const results = (window as any).axe.run({
        runOnly: {
          type: 'rule',
          values: ['image-alt', 'aria-allowed-attr', 'aria-required-attr', 'svg-namespace'],
        },
      });
      return results.violations;
    });

    console.log('\n=== SVG ACCESSIBILITY CHECK ===');
    console.log(formatViolations(svgViolations));

    // Check SVG aria-hidden patterns
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    console.log(`\nTotal SVG elements: ${svgCount}`);

    let ariaHiddenCount = 0;
    let ariaLabelCount = 0;
    let titleDescCount = 0;
    let unlabeledCount = 0;

    for (let i = 0; i < Math.min(svgCount, 50); i++) {
      const svg = svgElements.nth(i);
      const ariaHidden = await svg.getAttribute('aria-hidden');
      const ariaLabel = await svg.getAttribute('aria-label');
      const role = await svg.getAttribute('role');
      const hasTitle = await svg.locator('title').count() > 0;
      const hasDesc = await svg.locator('desc').count() > 0;

      if (ariaHidden === 'true' || ariaHidden === 'false') {
        if (ariaHidden === 'true') ariaHiddenCount++;
      }
      if (ariaLabel) ariaLabelCount++;
      if (hasTitle || hasDesc) titleDescCount++;
      if (!ariaHidden && !ariaLabel && !role && !hasTitle && !hasDesc) unlabeledCount++;
    }

    console.log(`SVGs with aria-hidden: ${ariaHiddenCount}`);
    console.log(`SVGs with aria-label: ${ariaLabelCount}`);
    console.log(`SVGs with title/desc: ${titleDescCount}`);
    console.log(`Potentially unlabeled SVGs: ${unlabeledCount}`);
  });

  test('All interactive elements are focusable via keyboard', async ({ page }) => {
    // Check for tabindex issues
    const violations = await page.evaluate(() => {
      const results = (window as any).axe.run({
        runOnly: {
          type: 'rule',
          values: ['tabindex', 'focusable-no-name', 'duplicate-id-active'],
        },
      });
      return results.violations;
    });

    console.log('\n=== FOCUSABILITY CHECK ===');
    console.log(formatViolations(violations));

    // Manual check: Tab through the page
    console.log('\n=== KEYBOARD NAVIGATION TRACE ===');
    let tabElements: string[] = [];

    // Press Tab 30 times and record what gets focus
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        return {
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          text: (el as HTMLElement).textContent?.substring(0, 50)?.trim(),
          classes: el.className?.substring(0, 100),
        };
      });

      if (focusedElement) {
        tabElements.push(
          `${focusedElement.tag}${focusedElement.role ? `[role=${focusedElement.role}]` : ''}${focusedElement.ariaLabel ? `[aria-label="${focusedElement.ariaLabel}"]` : ''}${focusedElement.text ? `[text="${focusedElement.text}"]` : ''}`,
        );
      }
    }

    console.log('Elements reached via Tab:');
    tabElements.forEach((el, i) => console.log(`  ${i + 1}. ${el}`));
  });
});
