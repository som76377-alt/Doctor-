import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PaperMesh, type PaperHandle } from "paperlab";
import { toPng } from "html-to-image";
import * as THREE from "three";

type PageSnapshot = {
  left: string;
  right: string;
  width: number;
  height: number;
};

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function stripIdsAndControls(root: HTMLElement) {
  root.removeAttribute("id");
  root.setAttribute("aria-hidden", "true");
  root.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  root.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach((node) => {
    node.setAttribute("tabindex", "-1");
  });
  root.querySelectorAll("script, iframe, video, audio, form").forEach((node) => node.remove());
}

async function createPageSnapshot(): Promise<PageSnapshot> {
  const hero = document.querySelector<HTMLElement>(".page-shell > .hero");
  const approach = document.querySelector<HTMLElement>(".page-shell > .approach");
  if (!hero || !approach) throw new Error("The two top-page sections were not found.");

  const width = Math.max(320, document.documentElement.clientWidth);
  const source = document.createElement("div");
  source.className = "page-shell paper-capture-source";
  Object.assign(source.style, {
    position: "fixed",
    left: "-100000px",
    top: "0",
    width: `${width}px`,
    overflow: "hidden",
    background: "#efeee9",
    pointerEvents: "none",
    zIndex: "-1",
  });

  const heroCopy = hero.cloneNode(true) as HTMLElement;
  const approachCopy = approach.cloneNode(true) as HTMLElement;
  stripIdsAndControls(heroCopy);
  stripIdsAndControls(approachCopy);
  source.append(heroCopy, approachCopy);
  document.body.appendChild(source);

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const png = await toPng(source, {
      width,
      height: Math.max(1, source.scrollHeight),
      pixelRatio: 1,
      backgroundColor: "#efeee9",
      cacheBust: true,
    });
    const image = new Image();
    image.decoding = "async";
    image.src = png;
    if (typeof image.decode === "function") await image.decode();
    else await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not decode the captured page."));
    });

    const canvasWidth = image.naturalWidth;
    const canvasHeight = image.naturalHeight;
    const split = Math.floor(canvasWidth / 2);
    const makeHalf = (sx: number, sw: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = canvasHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas texture generation is unavailable.");
      context.drawImage(image, sx, 0, sw, canvasHeight, 0, 0, sw, canvasHeight);
      return canvas.toDataURL("image/png");
    };

    return {
      left: makeHalf(0, split),
      right: makeHalf(split, canvasWidth - split),
      width: canvasWidth,
      height: canvasHeight,
    };
  } finally {
    source.remove();
  }
}

function CameraAndInvalidateBridge({
  onInvalidate,
}: {
  onInvalidate: (invalidate: (() => void) | null) => void;
}) {
  const { camera, size, invalidate } = useThree();

  useEffect(() => {
    const view = camera as THREE.OrthographicCamera;
    view.left = -0.5;
    view.right = 0.5;
    const viewHeight = size.height / Math.max(1, size.width);
    view.top = viewHeight / 2;
    view.bottom = -viewHeight / 2;
    view.position.set(0, 0, 10);
    view.lookAt(0, 0, 0);
    view.updateProjectionMatrix();
    onInvalidate(invalidate);
    invalidate();
    return () => onInvalidate(null);
  }, [camera, size.width, size.height, invalidate, onInvalidate]);

  return null;
}

export default function PaperTurnCanvas() {
  const [snapshot, setSnapshot] = useState<PageSnapshot | null>(null);
  const leftRef = useRef<PaperHandle>(null);
  const rightRef = useRef<PaperHandle>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<PageSnapshot | null>(null);
  const sheetEndRef = useRef(1);
  const captureVersionRef = useRef(0);
  snapshotRef.current = snapshot;

  const receiveInvalidate = useCallback((invalidate: (() => void) | null) => {
    invalidateRef.current = invalidate;
  }, []);

  useEffect(() => {
    let disposed = false;
    let resizeTimer = 0;

    const capture = async () => {
      const version = ++captureVersionRef.current;
      try {
        const result = await createPageSnapshot();
        if (disposed || version !== captureVersionRef.current) return;
        const width = Math.max(1, document.documentElement.clientWidth);
        const hero = document.querySelector<HTMLElement>(".page-shell > .hero");
        const approach = document.querySelector<HTMLElement>(".page-shell > .approach");
        sheetEndRef.current = hero && approach
          ? Math.max(1, approach.getBoundingClientRect().bottom + window.scrollY)
          : Math.max(1, result.height * width / result.width);
        setSnapshot(result);
        hostRef.current?.closest<HTMLElement>(".injection-stage")?.removeAttribute("data-paper-error");
      } catch (error) {
        console.error("Paperlab page-turn capture failed; leaving the ordinary page usable.", error);
        hostRef.current?.closest<HTMLElement>(".injection-stage")?.setAttribute("data-paper-error", "capture");
      }
    };

    void capture();
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => void capture(), 220);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      disposed = true;
      captureVersionRef.current += 1;
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!snapshot) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewportWidth = Math.max(1, document.documentElement.clientWidth);
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const end = Math.max(1, sheetEndRef.current);
      const progress = smoothstep(scrollY / end);
      const pageHeight = snapshotRef.current
        ? snapshotRef.current.height / Math.max(1, snapshotRef.current.width)
        : 1.4;
      const viewHeight = viewportHeight / viewportWidth;
      const pageCenterY = viewHeight / 2 - pageHeight / 2 - scrollY / viewportWidth;

      const leftGroup = leftRef.current?.mesh?.parent;
      const rightGroup = rightRef.current?.mesh?.parent;
      if (leftGroup) leftGroup.position.set(-0.25, pageCenterY, 0);
      if (rightGroup) rightGroup.position.set(0.25, pageCenterY, 0);
      leftRef.current?.set("progress", progress);
      rightRef.current?.set("progress", progress);

      const syringeY = 18 + progress * Math.max(0, viewportHeight - 168);
      const tearHeight = Math.min(viewportHeight, syringeY + 150);
      const stage = hostRef.current?.closest<HTMLElement>(".injection-stage");
      if (stage) {
        stage.style.setProperty("--injection-y", `${syringeY.toFixed(1)}px`);
        stage.style.setProperty("--tear-bottom", `${Math.max(0, viewportHeight - tearHeight).toFixed(1)}px`);
        stage.classList.toggle("is-active", scrollY > 12 && scrollY < end - 1);
      }
      invalidateRef.current?.();
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [snapshot]);

  const pageHeight = snapshot ? snapshot.height / Math.max(1, snapshot.width) : 1.4;

  return (
    <div ref={hostRef} className="paper-turn-window" aria-hidden="true">
      {snapshot && (
        <Canvas
          orthographic
          frameloop="demand"
          shadows={false}
          dpr={[1, 1.25]}
          camera={{ position: [0, 0, 10], left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: 0.1, far: 100 }}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "transparent" }}
        >
          <CameraAndInvalidateBridge onInvalidate={receiveInvalidate} />
          <ambientLight intensity={1.1} />
          <directionalLight position={[1.5, 2, 6]} intensity={1.35} />
          <PaperMesh
            ref={leftRef}
            position={[-0.25, 0, 0]}
            sheet={{ width: 0.5, height: pageHeight }}
            stock="printer"
            content={{ type: "image", src: snapshot.left, alt: "Clinic homepage printed on paper", fit: "cover", back: { type: "blank" } }}
            behavior={{ type: "flip", progress: 0, spine: "left", radius: 0.34 }}
            surface={{ grain: 0.16, creaseLines: { angle: 90, positions: [0.48, 0.52], strength: 0.22 } }}
            reducedMotion={false}
          />
          <PaperMesh
            ref={rightRef}
            position={[0.25, 0, 0]}
            sheet={{ width: 0.5, height: pageHeight }}
            stock="printer"
            content={{ type: "image", src: snapshot.right, alt: "Clinic homepage printed on paper", fit: "cover", back: { type: "blank" } }}
            behavior={{ type: "flip", progress: 0, spine: "right", radius: 0.34 }}
            surface={{ grain: 0.16, creaseLines: { angle: 90, positions: [0.48, 0.52], strength: 0.22 } }}
            reducedMotion={false}
          />
        </Canvas>
      )}
    </div>
  );
}
