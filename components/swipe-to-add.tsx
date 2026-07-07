"use client";

import { useRef, useState } from "react";

const THRESHOLD = 80;

export function SwipeToAdd({
  onAdd,
  disabled = false,
  children
}: {
  onAdd: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const startX = useRef(0);
  const [dx, setDx] = useState(0);
  const [triggered, setTriggered] = useState(false);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (disabled || triggered) return;
    const delta = Math.max(0, e.touches[0].clientX - startX.current);
    setDx(Math.min(delta, THRESHOLD * 1.6));
  }

  function onTouchEnd() {
    if (disabled || triggered) return;
    if (dx >= THRESHOLD) {
      setTriggered(true);
      navigator.vibrate?.(40);
      onAdd();
      setTimeout(() => { setTriggered(false); setDx(0); }, 700);
    } else {
      setDx(0);
    }
  }

  const progress = Math.min(dx / THRESHOLD, 1);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Reveal layer */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 flex items-center justify-center rounded-2xl bg-barn-500"
        style={{ width: Math.max(dx + 16, 0), opacity: progress > 0.1 ? 1 : 0 }}
      >
        <span
          className="font-display text-3xl font-bold text-cream select-none"
          style={{
            fontFamily: "var(--font-anton, 'Impact', sans-serif)",
            opacity: progress,
            transform: `scale(${0.6 + 0.4 * progress})`
          }}
        >
          {triggered ? "✓" : "+"}
        </span>
      </div>

      {/* Row content */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${triggered ? 0 : dx}px)`,
          transition: (dx === 0 || triggered)
            ? "transform 0.28s cubic-bezier(0.22,1,0.36,1), opacity 0.2s"
            : "none",
          opacity: triggered ? 0.6 : 1
        }}
      >
        {children}
      </div>
    </div>
  );
}
