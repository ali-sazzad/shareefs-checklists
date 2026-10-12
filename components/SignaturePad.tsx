"use client";

import { useEffect, useRef, useState } from "react";

type Props = { value: string; onChange: (dataUrl: string) => void; label: string };

export function SignaturePad({ value, onChange, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const c = ref.current!;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a1a";
  }, [open]);

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = ref.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    dirty.current = true;
    const ctx = ref.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const up = () => {
    drawing.current = false;
  };

  const clear = () => {
    const c = ref.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    dirty.current = false;
  };

  const save = () => {
    if (dirty.current) onChange(ref.current!.toDataURL("image/png"));
    dirty.current = false;
    setOpen(false);
  };

  return (
    <>
      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={`${label} signature`} className="h-14 rounded border border-line bg-white px-2" />
          <button type="button" onClick={() => onChange("")} className="min-h-11 px-3 text-base font-semibold text-brand underline">
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="min-h-12 w-full rounded-xl border-2 border-dashed border-line bg-white px-4 text-lg font-semibold text-muted active:bg-paper"
        >
          ✍ Tap to sign
        </button>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-label={`${label} signature`} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="rise w-full max-w-lg rounded-t-3xl bg-card p-4 sm:rounded-3xl">
            <p className="mb-2 text-lg font-bold">{label} – sign below</p>
            <canvas
              ref={ref}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              className="h-52 w-full touch-none rounded-xl border-2 border-line bg-white"
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button type="button" onClick={clear} className="min-h-12 rounded-xl border border-line bg-white font-semibold">
                Clear
              </button>
              <button type="button" onClick={() => setOpen(false)} className="min-h-12 rounded-xl border border-line bg-white font-semibold">
                Cancel
              </button>
              <button type="button" onClick={save} className="min-h-12 rounded-xl bg-teal font-bold text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
