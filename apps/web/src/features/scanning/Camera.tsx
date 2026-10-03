import { uiText } from "../../shared/i18n";
import { useEffect, useRef, useState } from "react";
import { Camera as CameraIcon } from "lucide-react";
import type { IScannerControls } from "@zxing/browser";
import { es } from "../../shared/i18n";
import { Button } from "../../shared/ui";
export function Camera({
  onDetected,
  paused,
}: {
  onDetected: (value: string) => void;
  paused: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls>();
  const callback = useRef(onDetected);
  callback.current = onDetected;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [active, setActive] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let last = "";
    let at = 0;
    void import("@zxing/browser")
      .then(async ({ BrowserQRCodeReader }) => {
        const reader = new BrowserQRCodeReader();
        const scanner = await reader.decodeFromConstraints(
          { video: { facingMode: "environment" }, audio: false },
          video.current!,
          (result) => {
            if (cancelled || pausedRef.current || !result) return;
            const text = result.getText();
            if (text === last && Date.now() - at < 1500) return;
            last = text;
            at = Date.now();
            callback.current(text);
          },
        );
        if (cancelled) scanner.stop();
        else controls.current = scanner;
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setActive(false);
        }
      });
    return () => {
      cancelled = true;
      controls.current?.stop();
      controls.current = undefined;
    };
  }, [active]);
  return (
    <>
      <div className={`camera-frame ${active ? "camera-active" : ""}`}>
        <video ref={video} muted playsInline aria-label={uiText.camera1} />
        {!active && (
          <div className="camera-placeholder">
            <CameraIcon size={43} />
            <p>{es.staffPage.cameraHint}</p>
          </div>
        )}
        <div className="camera-guide" aria-hidden="true" />
      </div>
      {error && (
        <p role="alert" className="form-error">
          {es.staffPage.cameraError}
        </p>
      )}
      <Button
        className="w-full"
        variant="secondary"
        onClick={() => {
          setError(false);
          setActive(!active);
        }}
      >
        <CameraIcon size={17} />
        {active ? es.staffPage.stopCamera : es.staffPage.startCamera}
      </Button>
    </>
  );
}
