"use client";

import { type PointerEvent, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { PanoramaConfig } from "@/config/viewer";

type Props = {
  panorama: PanoramaConfig;
  onClose: () => void;
};

const MIN_FOV = 30;
const MAX_FOV = 100;
const DEFAULT_FOV = 80;

const VERTEX_SHADER = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D tex;
uniform vec2 res;
uniform float yaw;
uniform float pitch;
uniform float tanHalfFov;
const float PI = 3.14159265359;
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - res) / res.y * tanHalfFov;
  vec3 d = normalize(vec3(p.x, p.y, -1.0));
  float cp = cos(pitch), sp = sin(pitch);
  d = vec3(d.x, d.y * cp - d.z * sp, d.y * sp + d.z * cp);
  float cy = cos(yaw), sy = sin(yaw);
  d = vec3(d.x * cy + d.z * sy, d.y, -d.x * sy + d.z * cy);
  float u = atan(d.x, -d.z) / (2.0 * PI) + 0.5;
  float v = asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5;
  gl_FragColor = vec4(texture2D(tex, vec2(u, v)).rgb, 1.0);
}
`;

export function PanoramaModal({ panorama, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const viewRef = useRef({ yaw: 0, pitch: 0, fov: DEFAULT_FOV, autoRotate: true });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<number | null>(null);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      setStatus("error");
      return;
    }

    let alive = true;
    let frame = 0;
    const view = viewRef.current;
    view.yaw = 0;
    view.pitch = 0;
    view.fov = DEFAULT_FOV;
    view.autoRotate = true;

    const program = createProgram(gl);
    if (!program) {
      setStatus("error");
      return;
    }

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      res: gl.getUniformLocation(program, "res"),
      yaw: gl.getUniformLocation(program, "yaw"),
      pitch: gl.getUniformLocation(program, "pitch"),
      tanHalfFov: gl.getUniformLocation(program, "tanHalfFov"),
    };

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let textureReady = false;
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!alive) {
        return;
      }

      const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, fitToTextureSize(image, maxSize));
      textureReady = true;
      setStatus("ready");
    };
    image.onerror = () => alive && setStatus("error");
    image.src = panorama.image;

    function resize() {
      if (!canvas) {
        return;
      }
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }

    function render() {
      if (!alive || !gl) {
        return;
      }

      resize();
      if (textureReady) {
        if (view.autoRotate) {
          view.yaw += 0.0012;
        }
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.uniform2f(uniforms.res, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.uniform1f(uniforms.yaw, view.yaw);
        gl.uniform1f(uniforms.pitch, view.pitch);
        gl.uniform1f(uniforms.tanHalfFov, Math.tan((view.fov * Math.PI) / 360));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      frame = window.requestAnimationFrame(render);
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault();
      view.autoRotate = false;
      view.fov = clamp(view.fov + event.deltaY * 0.05, MIN_FOV, MAX_FOV);
    }

    canvas.addEventListener("wheel", onWheel, { passive: false });
    frame = window.requestAnimationFrame(render);

    return () => {
      alive = false;
      window.cancelAnimationFrame(frame);
      canvas.removeEventListener("wheel", onWheel);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [panorama.image]);

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    viewRef.current.autoRotate = false;
    pinchRef.current = pointersRef.current.size === 2 ? pointerDistance(pointersRef.current) : null;
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const pointers = pointersRef.current;
    const previous = pointers.get(event.pointerId);
    if (!previous) {
      return;
    }

    const view = viewRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 2) {
      const distance = pointerDistance(pointers);
      if (pinchRef.current) {
        view.fov = clamp(view.fov * (pinchRef.current / distance), MIN_FOV, MAX_FOV);
      }
      pinchRef.current = distance;
      return;
    }

    const height = event.currentTarget.clientHeight || 1;
    const radiansPerPixel = (view.fov * Math.PI) / 180 / height;
    view.yaw -= (event.clientX - previous.x) * radiansPerPixel;
    view.pitch = clamp(view.pitch + (event.clientY - previous.y) * radiansPerPixel, -1.45, 1.45);
  }

  function handlePointerEnd(event: PointerEvent<HTMLCanvasElement>) {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <>
      <button className="detail-backdrop" type="button" aria-label="Zatvori 360 prikaz" onClick={onClose} />
      <div className="pano-modal" role="dialog" aria-modal="true" aria-label={`360 prikaz: ${panorama.title}`}>
        <div className="pano-head">
          <div>
            <p className="panel-kicker">360°</p>
            <h2 className="panel-title">{panorama.title}</h2>
          </div>
          <button className="icon-button close-button" type="button" onClick={onClose} aria-label="Zatvori 360 prikaz">
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="pano-stage">
          <canvas
            ref={canvasRef}
            className="pano-canvas"
            onPointerCancel={handlePointerEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
          />
          {status === "loading" ? <div className="pano-message" role="status">Ucitavanje 360 prikaza...</div> : null}
          {status === "error" ? <div className="pano-message" role="alert">360 prikaz nije dostupan.</div> : null}
        </div>
      </div>
    </>
  );
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();

  if (!vertex || !fragment || !program) {
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function fitToTextureSize(image: HTMLImageElement, maxSize: number): TexImageSource {
  if (image.naturalWidth <= maxSize && image.naturalHeight <= maxSize) {
    return image;
  }

  const scale = maxSize / Math.max(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(image.naturalWidth * scale);
  canvas.height = Math.floor(image.naturalHeight * scale);
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function pointerDistance(pointers: Map<number, { x: number; y: number }>) {
  const [a, b] = Array.from(pointers.values());
  return Math.hypot(a.x - b.x, a.y - b.y) || 1;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
