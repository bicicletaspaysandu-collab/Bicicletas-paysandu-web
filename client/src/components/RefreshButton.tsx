"use client";

import { useState } from "react";

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  label?: string;
  className?: string;
}

/**
 * Interactive Refresh Button with smooth hover spin, click feedback scale effect,
 * loading spinner state, and Web Audio API click sound feedback.
 */
export default function RefreshButton({
  onRefresh,
  label = "Actualizar",
  className = "",
}: RefreshButtonProps) {
  const [loading, setLoading] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  const playClickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5 note
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio playback ignored if restricted by browser policy
    }
  };

  const handleClick = async () => {
    if (loading) return;
    playClickSound();
    setLoading(true);
    setJustUpdated(false);

    try {
      await Promise.resolve(onRefresh());
    } finally {
      setTimeout(() => {
        setLoading(false);
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 2000);
      }, 400);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`group inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-stone-50 hover:text-blue-600 hover:shadow-md active:scale-95 disabled:opacity-75 ${className}`}
      title="Actualizar datos en tiempo real"
    >
      <svg
        className={`h-4 w-4 text-blue-600 transition-transform duration-500 ease-out group-hover:rotate-180 ${
          loading ? "animate-spin" : ""
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2.2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span>{justUpdated ? "¡Actualizado!" : label}</span>
      {justUpdated && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-ping" />
      )}
    </button>
  );
}
