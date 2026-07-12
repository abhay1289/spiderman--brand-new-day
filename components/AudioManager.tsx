"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Persistent audio singleton (survives React strict-mode re-mounts) ──
let audioCtx: AudioContext | null = null;
let gainNode: GainNode | null = null;
let sourceNode: AudioBufferSourceNode | null = null;
let audioBuffer: AudioBuffer | null = null;
let globalPlaying = false;
let globalLoaded = false;

// Fallback HTML Audio for browsers where Web Audio has issues
let fallbackAudio: HTMLAudioElement | null = null;
let usingFallback = false;

const TARGET_VOL = 0.35;

async function loadAudio() {
  if (globalLoaded) return;
  globalLoaded = true;
  try {
    audioCtx = new AudioContext();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(audioCtx.destination);

    const res = await fetch("/Spiderman Theme Song.mp3");
    const buf = await res.arrayBuffer();
    audioBuffer = await audioCtx.decodeAudioData(buf);
  } catch {
    // Web Audio failed, prepare HTML Audio fallback
    globalLoaded = false;
    usingFallback = true;
    fallbackAudio = new Audio("/Spiderman Theme Song.mp3");
    fallbackAudio.loop = true;
    fallbackAudio.volume = 0;
    fallbackAudio.preload = "auto";
  }
}

function startPlayback() {
  if (globalPlaying) return;

  if (usingFallback && fallbackAudio) {
    globalPlaying = true;
    fallbackAudio.volume = 0;
    fallbackAudio.play().then(() => {
      let vol = 0;
      const interval = setInterval(() => {
        vol = Math.min(vol + 0.01, TARGET_VOL);
        fallbackAudio!.volume = vol;
        if (vol >= TARGET_VOL) clearInterval(interval);
      }, 30);
    }).catch(() => { globalPlaying = false; });
    return;
  }

  if (!audioCtx || !audioBuffer || !gainNode) return;

  // Resume suspended AudioContext (browser autoplay policy)
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }

  globalPlaying = true;
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(TARGET_VOL, audioCtx.currentTime + 2);

  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.loop = true;
  sourceNode.connect(gainNode);
  sourceNode.start(0);
}

function tryAutoplay() {
  if (globalPlaying) return;
  if (usingFallback && fallbackAudio) {
    startPlayback();
    return;
  }
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") {
    audioCtx.resume().then(() => startPlayback()).catch(() => {});
  } else {
    startPlayback();
  }
}

export default function AudioManager() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Start loading audio buffer immediately
    loadAudio().then(() => {
      // Try autoplay right away
      tryAutoplay();
    });

    // On any user gesture, try to start audio
    const onGesture = () => {
      if (!globalPlaying) {
        if (!globalLoaded) {
          loadAudio().then(() => tryAutoplay());
        } else {
          tryAutoplay();
        }
      }
    };

    // These are ALL valid "user activation" events for autoplay policy
    const events = ["mousedown", "pointerdown", "touchstart", "keydown", "click"];
    events.forEach((e) => window.addEventListener(e, onGesture, { capture: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, onGesture, { capture: true }));
    };
  }, []);

  const toggleMute = useCallback(() => {
    // If never started, start on button click
    if (!globalPlaying) {
      tryAutoplay();
      return;
    }

    if (usingFallback && fallbackAudio) {
      if (muted) {
        fallbackAudio.play().then(() => {
          let vol = 0;
          const fi = setInterval(() => {
            vol = Math.min(vol + 0.015, TARGET_VOL);
            fallbackAudio!.volume = vol;
            if (vol >= TARGET_VOL) clearInterval(fi);
          }, 30);
        }).catch(() => {});
      } else {
        let vol = fallbackAudio.volume;
        const fo = setInterval(() => {
          vol = Math.max(vol - 0.02, 0);
          fallbackAudio!.volume = vol;
          if (vol <= 0) { clearInterval(fo); fallbackAudio!.pause(); }
        }, 30);
      }
      setMuted(!muted);
      return;
    }

    if (!audioCtx || !gainNode) return;

    if (muted) {
      audioCtx.resume();
      gainNode.gain.linearRampToValueAtTime(TARGET_VOL, audioCtx.currentTime + 0.5);
    } else {
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    }
    setMuted(!muted);
  }, [muted]);

  return (
    <button
      data-no-web
      onClick={toggleMute}
      className="fixed bottom-6 right-6 z-[100] w-10 h-10 rounded-full flex items-center justify-center glass transition-all duration-500 hover:scale-110 active:scale-90"
      aria-label={muted ? "Enable sound" : "Mute sound"}
      style={{ border: "1px solid var(--accent-20)" }}
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-40)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-60)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
        </svg>
      )}
    </button>
  );
}
