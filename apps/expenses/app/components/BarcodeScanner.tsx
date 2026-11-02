"use client";

/**
 * Scans barcodes (EAN-13 / EAN-8 / UPC) with the phone's back camera, in a
 * modal. Uses the browser's `BarcodeDetector` where it exists (Chrome
 * Android), else ZXing (Safari iPhone) — loaded only when the scanner opens.
 * `continuous` keeps scanning (one call per new code) until closed.
 */

import { useEffect, useRef, useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import { Button } from "./Button";
import { fill } from "./common";

export type ScannerTexts = {
  title: string;
  continuousTitle: string;
  hint: string;
  noCamera: string;
  /** `{n}` codes scanned so far. */
  scanned: string;
  done: string;
};

const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];

/** The same code seen again within this delay is the same scan. */
const REPEAT_MS = 2500;

type Detector = {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
};

export function BarcodeScanner({
  continuous = false,
  onDetect,
  onClose,
  t,
}: {
  continuous?: boolean;
  onDetect: (code: string) => void;
  onClose: () => void;
  t: ScannerTexts;
}) {
  // The preview mounts inside the modal's portal: track when it's there.
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [count, setCount] = useState(0);
  const [last, setLast] = useState<string | null>(null);
  // The latest callbacks, without restarting the camera on every render.
  const handlers = useRef({ onDetect, onClose, continuous });
  useEffect(() => {
    handlers.current = { onDetect, onClose, continuous };
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!mounted || !video) return;
    let stopped = false;
    let stream: MediaStream | null = null;
    let stopZxing: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const seen = { code: "", at: 0 };

    const found = (code: string) => {
      const now = Date.now();
      if (stopped || (code === seen.code && now - seen.at < REPEAT_MS)) return;
      seen.code = code;
      seen.at = now;
      navigator.vibrate?.(60);
      setLast(code);
      setCount((n) => n + 1);
      handlers.current.onDetect(code);
      if (!handlers.current.continuous) handlers.current.onClose();
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (stopped) return;
        const Native = (
          window as unknown as {
            BarcodeDetector?: {
              new (o: { formats: string[] }): Detector;
              getSupportedFormats?: () => Promise<string[]>;
            };
          }
        ).BarcodeDetector;
        const supported = Native
          ? await Native.getSupportedFormats?.().catch(() => [])
          : [];
        if (Native && supported?.includes("ean_13")) {
          video.srcObject = stream;
          await video.play();
          const detector = new Native({
            formats: FORMATS.filter((f) => supported.includes(f)),
          });
          const tick = async () => {
            if (stopped) return;
            try {
              const [hit] = await detector.detect(video);
              if (hit?.rawValue) found(hit.rawValue);
            } catch {
              // A frame that isn't ready yet — try the next one.
            }
            timer = setTimeout(tick, 200);
          };
          void tick();
        } else {
          const [
            { BrowserMultiFormatReader },
            { BarcodeFormat, DecodeHintType },
          ] = await Promise.all([
            import("@zxing/browser"),
            import("@zxing/library"),
          ]);
          const hints = new Map([
            [
              DecodeHintType.POSSIBLE_FORMATS,
              [
                BarcodeFormat.EAN_13,
                BarcodeFormat.EAN_8,
                BarcodeFormat.UPC_A,
                BarcodeFormat.UPC_E,
              ],
            ],
          ]);
          const reader = new BrowserMultiFormatReader(hints);
          const controls = await reader.decodeFromStream(
            stream,
            video,
            (result) => {
              if (result) found(result.getText());
            },
          );
          if (stopped) controls.stop();
          else stopZxing = () => controls.stop();
        }
      } catch (e) {
        console.error(e);
        if (!stopped) setError(true);
      }
    })();

    return () => {
      stopped = true;
      clearTimeout(timer);
      stopZxing?.();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [mounted]);

  return (
    <SimpleModal
      isOpen
      onClose={onClose}
      title={continuous ? t.continuousTitle : t.title}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <span className="num text-sm text-muted">
            {continuous && fill(t.scanned, { n: count })}
            {continuous && last && ` · ${last}`}
          </span>
          <Button variant="primary" onClick={onClose}>
            {t.done}
          </Button>
        </div>
      }
    >
      {error ? (
        <p className="text-sm text-danger">{t.noCamera}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* The camera preview (not a control). */}
          <video
            ref={(el) => {
              videoRef.current = el;
              setMounted(Boolean(el));
            }}
            muted
            playsInline
            className="aspect-[4/3] w-full rounded-lg bg-black object-cover"
          />
          <p className="text-xs text-muted">{t.hint}</p>
        </div>
      )}
    </SimpleModal>
  );
}
