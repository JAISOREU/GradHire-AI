import { describe, it, expect } from 'vitest';
import { cropSizeForAspect, coverScale, clampCenter, sourceRect, clamp } from './imageCrop';

describe('imageCrop geometry', () => {
  describe('cropSizeForAspect', () => {
    it('fits portrait container for a square aspect', () => {
      const size = cropSizeForAspect({ width: 480, height: 360 }, 1);
      expect(size.width).toBe(360);
      expect(size.height).toBe(360);
    });

    it('fits landscape container for a 16:5 aspect', () => {
      const size = cropSizeForAspect({ width: 100, height: 100 }, 16 / 5);
      expect(size.width).toBe(100);
      expect(size.height).toBe(31);
      expect(size.width / size.height).toBeCloseTo(16 / 5, 1);
    });

    it('falls back to full container for a non-positive aspect', () => {
      expect(cropSizeForAspect({ width: 200, height: 100 }, 0)).toEqual({ width: 200, height: 100 });
    });
  });

  describe('coverScale', () => {
    it('returns scale so image covers viewport both axes', () => {
      const scale = coverScale({ width: 100, height: 50 }, { width: 200, height: 200 });
      expect(scale).toBe(4); // width needs 2x, height needs 4x
    });
  });

  describe('clampCenter', () => {
    it('keeps the image covering the viewport when offsets push to edges', () => {
      const image = { width: 100, height: 50 };
      const viewport = { width: 100, height: 100 };
      const scale = 2; // displayed 200x100; center x range [0,100], y range [50,50]
      const clamped = clampCenter({ x: 9999, y: -9999 }, image, scale, viewport);
      expect(clamped.x).toBe(100);
      expect(clamped.y).toBe(50);
    });

    it('clamps an out-of-range center to the boundary', () => {
      const clamped = clampCenter({ x: 25, y: -25 }, { width: 100, height: 50 }, 5, { width: 300, height: 200 });
      expect(clamped.x).toBe(50);
      expect(clamped.y).toBe(75);
    });

    it('locks the center at the viewport center on the axis the image exactly covers', () => {
      // banner geometry: image 600x400, viewport 462x144.375 -> cover scale 0.77 makes
      // displayWidth === viewport.width, so dragging must NOT move the image on x.
      const viewport = { width: 462, height: 144.375 };
      const image = { width: 600, height: 400 };
      const scale = coverScale(image, viewport);
      const c = clampCenter({ x: 9999, y: -60 }, image, scale, viewport);
      expect(c.x).toBeCloseTo(viewport.width / 2, 5);
      expect(c.x).not.toBe(0);
    });
  });

  describe('sourceRect', () => {
    it('maps the visible viewport back to natural pixel coordinates', () => {
      const image = { width: 2000, height: 1000 };
      const viewport = { width: 400, height: 125 };
      const scale = coverScale(image, viewport); // max(400/2000, 125/1000) = 0.2
      const center = { x: viewport.width / 2, y: viewport.height / 2 };
      const rect = sourceRect(image, scale, center, viewport);
      expect(rect.width).toBeCloseTo(400 / 0.2, 0);
      expect(rect.height).toBeCloseTo(125 / 0.2, 0);
      // centered: left/top empty margins equal on both sides
      expect(rect.x).toBeCloseTo((image.width - rect.width) / 2, 0);
      expect(rect.y).toBeCloseTo((image.height - rect.height) / 2, 0);
    });

    it('clamps the rect inside the image bounds', () => {
      const image = { width: 100, height: 50 };
      const viewport = { width: 400, height: 125 };
      const scale = coverScale(image, viewport); // max(4, 2.5) = 4
      const rect = sourceRect(image, scale, { x: 0, y: 0 }, viewport);
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(image.width + 0.001);
      expect(rect.y + rect.height).toBeLessThanOrEqual(image.height + 0.001);
    });
  });

  describe('clamp', () => {
    it('bounds values within an inverted range to the min', () => {
      expect(clamp(5, 10, 3)).toBe(10);
      expect(clamp(-5, 1, 5)).toBe(1);
    });
  });
});