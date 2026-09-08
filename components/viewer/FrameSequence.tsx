"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { ViewerView } from "@/config/viewer";

export type FrameSequenceHandle = {
  drawFrame: (src: string) => void;
};

type Props = {
  imageMap: Map<string, HTMLImageElement>;
  view: ViewerView;
  src: string;
};

export const FrameSequence = forwardRef<FrameSequenceHandle, Props>(function FrameSequence({ imageMap, view, src }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentSrcRef = useRef(src);

  useImperativeHandle(ref, () => ({
    drawFrame(nextSrc: string) {
      currentSrcRef.current = nextSrc;
      drawCurrentFrame(canvasRef.current, imageMap.get(nextSrc));
    },
  }), [imageMap]);

  useEffect(() => {
    currentSrcRef.current = src;
    drawCurrentFrame(canvasRef.current, imageMap.get(src));
  }, [imageMap, src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    function draw() {
      drawCurrentFrame(canvas, imageMap.get(currentSrcRef.current));
    }

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    window.addEventListener("resize", draw);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [imageMap]);

  return <canvas ref={canvasRef} className="building-image is-active" role="img" aria-label={view.alt} />;
});

function drawCurrentFrame(canvas: HTMLCanvasElement | null, image: HTMLImageElement | undefined) {
  if (!canvas || !image) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const canvasRatio = width / height;
  const drawHeight = imageRatio > canvasRatio ? height : width / imageRatio;
  const drawWidth = imageRatio > canvasRatio ? height * imageRatio : width;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}
