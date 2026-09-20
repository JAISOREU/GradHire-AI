export type Size = { width: number; height: number };
export type Point = { x: number; y: number };
export type CropRect = { x: number; y: number; width: number; height: number };

export function cropSizeForAspect(container: Size, aspect: number): Size {
  if (!Number.isFinite(aspect) || aspect <= 0) return { ...container };
  let width = container.width;
  let height = width / aspect;
  if (height > container.height) {
    height = container.height;
    width = height * aspect;
  }
  return { width: Math.max(1, Math.floor(width)), height: Math.max(1, Math.floor(height)) };
}

export function coverScale(image: Size, viewport: Size): number {
  return Math.max(viewport.width / image.width, viewport.height / image.height);
}

export function minCoverScale(scale: number, minZoom = 1): number {
  return scale * minZoom;
}

export function clampCenter(center: Point, image: Size, scale: number, viewport: Size): Point {
  const displayWidth = image.width * scale;
  const displayHeight = image.height * scale;
  const minX = viewport.width - displayWidth / 2;
  const maxX = displayWidth / 2;
  const minY = viewport.height - displayHeight / 2;
  const maxY = displayHeight / 2;
  return {
    x: clamp(center.x, minX, maxX),
    y: clamp(center.y, minY, maxY),
  };
}

export function sourceRect(image: Size, scale: number, center: Point, viewport: Size): CropRect {
  const factor = 1 / scale;
  const displayWidth = image.width * scale;
  const displayHeight = image.height * scale;
  const topLeft = {
    x: center.x - displayWidth / 2,
    y: center.y - displayHeight / 2,
  };
  const sx = -topLeft.x * factor;
  const sy = -topLeft.y * factor;
  const sw = viewport.width * factor;
  const sh = viewport.height * factor;

  const maxX = Math.max(0, image.width - sw);
  const maxY = Math.max(0, image.height - sh);
  return {
    x: clamp(sx, 0, maxX),
    y: clamp(sy, 0, maxY),
    width: sw,
    height: sh,
  };
}

export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}