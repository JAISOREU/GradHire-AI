import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Button } from './Button';
import { coverScale, clampCenter, sourceRect } from '../lib/imageCrop';
import type { Size, Point } from '../lib/imageCrop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type Kind = 'avatar' | 'banner';

type Props = {
  open: boolean;
  file: File | null;
  kind: Kind;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

const OUT: Record<Kind, Size> = {
  avatar: { width: 512, height: 512 },
  banner: { width: 1600, height: 500 },
};

const ASPECT: Record<Kind, number> = {
  avatar: 1,
  banner: 16 / 5,
};

export const ImageCropDialog = ({ open, file, kind, onCancel, onConfirm }: Props) => {
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [image, setImage] = useState<{ el: HTMLImageElement; url: string; width: number; height: number } | null>(null);
  const [stage, setStage] = useState<Size | null>(null);
  const [zoom, setZoom] = useState(0);
  const [center, setCenter] = useState<Point>({ x: 0, y: 0 });

  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragging = useRef(false);
  const last = useRef<Point>({ x: 0, y: 0 });

  const aspect = ASPECT[kind];

  /* ---- load image ---- */
  useEffect(() => {
    if (!open || !file) {
      setImage((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return null;
      });
      setError('');
      setApplying(false);
      return;
    }
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => setImage({ el, url, width: el.naturalWidth, height: el.naturalHeight });
    el.onerror = () => {
      setError('Could not load the selected file. Please choose a different image.');
      URL.revokeObjectURL(url);
    };
    el.src = url;
    return () => {
      el.onload = null;
      el.onerror = null;
      URL.revokeObjectURL(url);
    };
  }, [open, file]);

  /* ---- measure stage ---- */
  useEffect(() => {
    if (!open || !stageRef.current) return;
    const measure = () => {
      const r = stageRef.current?.getBoundingClientRect();
      if (r && r.width > 0) setStage({ width: r.width, height: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [open]);

  /* ---- reset center/zoom ---- */
  useEffect(() => {
    if (open && image && stage) {
      const s = coverScale({ width: image.width, height: image.height }, stage);
      setZoom(s);
      setCenter({ x: stage.width / 2, y: stage.height / 2 });
      setError('');
      setApplying(false);
    }
  }, [open, image?.url, stage?.width, stage?.height]);

  /* ---- pan ---- */
  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (error || !stage || !image) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    },
    [error, stage, image],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!dragging.current || !stage || !image) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      setCenter((prev) => clampCenter({ x: prev.x + dx, y: prev.y + dy }, { width: image.width, height: image.height }, zoom, stage));
    },
    [stage, image, zoom],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  /* ---- zoom ---- */
  const minZoom = stage && image ? coverScale({ width: image.width, height: image.height }, stage) : 0;
  const maxZoom = Math.max(minZoom, minZoom * 4);

  const setZoomCentered = useCallback(
    (next: number) => {
      if (!stage || !image) return;
      const ratio = next / zoom;
      setCenter((prev) => clampCenter({ x: prev.x * ratio, y: prev.y * ratio }, { width: image.width, height: image.height }, next, stage));
      setZoom(next);
    },
    [stage, image, zoom],
  );

  /* ---- apply ---- */
  const apply = useCallback(() => {
    if (!image || !stage || !imgRef.current) return;
    setApplying(true);
    const rect = sourceRect({ width: image.width, height: image.height }, zoom, center, stage);
    const out = OUT[kind];
    const canvas = document.createElement('canvas');
    canvas.width = out.width;
    canvas.height = out.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Image processing is not supported by your browser.');
      setApplying(false);
      return;
    }
    try {
      ctx.drawImage(image.el, rect.x, rect.y, rect.width, rect.height, 0, 0, out.width, out.height);
      canvas.toBlob(
        (b) => {
          setApplying(false);
          if (b) {
            onCancel();
            onConfirm(b);
          } else {
            setError('Failed to process the image. Please try a different file.');
          }
        },
        'image/webp',
        0.92,
      );
    } catch {
      setError('Failed to process the image. Please try a different file.');
      setApplying(false);
    }
  }, [image, stage, zoom, center, kind, onConfirm]);

  /* ---- render ---- */
  const displayWidth = image && zoom ? image.width * zoom : 0;
  const displayHeight = image && zoom ? image.height * zoom : 0;
  const left = center.x - displayWidth / 2;
  const top = center.y - displayHeight / 2;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="image-crop__dialog max-w-[560px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle>{kind === 'avatar' ? 'Crop your profile photo' : 'Crop your banner'}</DialogTitle>
          <DialogDescription>Drag to reposition and adjust the zoom to frame the image.</DialogDescription>
        </DialogHeader>

        <div
          ref={stageRef}
          className="image-crop__stage mx-6 relative select-none touch-none rounded-lg overflow-hidden bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary"
          style={{ aspectRatio: `${aspect}` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="img"
          aria-label="Crop area"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onCancel();
          }}
        >
          {stage && image && (
            <img
              ref={imgRef}
              src={image.url}
              alt=""
              draggable={false}
              className="pointer-events-none absolute top-0 left-0 origin-top-left max-w-none"
              style={{ width: displayWidth, height: displayHeight, transform: `translate3d(${left}px, ${top}px, 0)` }}
            />
          )}
        </div>

        {error && <p className="mx-6 mt-3 text-sm text-danger">{error}</p>}

        {stage && image && (
          <div className="image-crop__controls mx-6 mt-3 flex items-center gap-3">
            <button
              type="button"
              aria-label="Zoom out"
              className="image-crop__zoom-btn rounded-md bg-surface-muted px-2 py-1 text-sm"
              onClick={() => setZoomCentered(Math.max(minZoom, zoom - minZoom * 0.15))}
            >
              −
            </button>
            <input
              type="range"
              className="image-crop__range w-full accent-primary"
              min={minZoom}
              max={maxZoom}
              step={minZoom * 0.02}
              value={zoom}
              aria-label="Zoom scale"
              onChange={(e) => setZoomCentered(Math.max(minZoom, Number(e.target.value)))}
            />
            <button
              type="button"
              aria-label="Zoom in"
              className="image-crop__zoom-btn rounded-md bg-surface-muted px-2 py-1 text-sm"
              onClick={() => setZoomCentered(Math.min(maxZoom, zoom + minZoom * 0.15))}
            >
              +
            </button>
          </div>
        )}

        <DialogFooter className="p-6 pt-4">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" disabled={!image || applying || !!error} onClick={apply}>
            {applying ? 'Applying…' : 'Apply crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};