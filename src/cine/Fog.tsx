"use client";

import { useEffect, useRef } from "react";

/**
 * Capa WebGL (Three.js): niebla de partículas suaves que deriva lentamente.
 * Se carga dinámicamente, se pausa con la pestaña oculta o fuera de los capítulos
 * cinemáticos, y no se monta con prefers-reduced-motion.
 */
export function Fog({ running }: { running: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const runRef = useRef(running);
  runRef.current = running;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
      } catch {
        return; // sin WebGL: el resto del escenario sigue igual
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 2;

      // textura de bruma: degradé radial dibujado en un canvas
      const tc = document.createElement("canvas");
      tc.width = tc.height = 128;
      const g = tc.getContext("2d")!;
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(245,240,228,0.42)");
      grad.addColorStop(0.45, "rgba(245,240,228,0.18)");
      grad.addColorStop(1, "rgba(245,240,228,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(tc);

      const mobile = window.innerWidth < 820;
      const COUNT = mobile ? 70 : 140;
      const positions = new Float32Array(COUNT * 3);
      const speeds = new Float32Array(COUNT);
      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = Math.random() * 2.4 - 1.2;
        positions[i * 3 + 1] = Math.random() * 2.2 - 1.3;
        positions[i * 3 + 2] = 0;
        speeds[i] = 0.004 + Math.random() * 0.012;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        map: tex,
        size: mobile ? 180 : 260,
        sizeAttenuation: false,
        transparent: true,
        depthWrite: false,
        opacity: 0.2,
      });
      const points = new THREE.Points(geo, mat);
      scene.add(points);

      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        const a = w / h;
        camera.left = -a;
        camera.right = a;
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      let raf = 0;
      let last = performance.now();
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        if (!runRef.current || document.hidden) {
          last = now;
          return;
        }
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const pos = geo.attributes.position as InstanceType<typeof THREE.BufferAttribute>;
        for (let i = 0; i < COUNT; i++) {
          let x = pos.getX(i) + speeds[i] * dt * 6;
          const yv = pos.getY(i) + Math.sin(now * 0.0002 + i) * 0.0004;
          if (x > 1.4 * (window.innerWidth / window.innerHeight)) x = -1.4 * (window.innerWidth / window.innerHeight);
          pos.setXY(i, x, yv);
        }
        pos.needsUpdate = true;
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        geo.dispose();
        mat.dispose();
        tex.dispose();
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={ref} className="stage__webgl" aria-hidden="true" />;
}
