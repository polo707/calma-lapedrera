"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SCENES, DEEP_WASH, CINE_CHAPTERS } from "./scenes";
import { useCine } from "./scroll";
import { Fog } from "./Fog";

/**
 * Escenario fijo: pila de escenas (z0), lavado de color (z2), WebGL (z3),
 * viñeta (z4), grano (z5) y bruma en degradés radiales.
 * Rendimiento: solo la primera escena se descarga al entrar; las demás se montan cuando el
 * visitante se acerca a su capítulo. La capa de profundidad existe solo en escritorio.
 */
export function Stage() {
  const { active } = useCine();
  const sceneIndex = Math.min(active, SCENES.length - 1);
  const wash = active >= SCENES.length ? DEEP_WASH : SCENES[sceneIndex].wash;
  const onStage = active < CINE_CHAPTERS;

  const [reach, setReach] = useState(0); // última escena montada
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    setReach((r) => Math.max(r, Math.min(SCENES.length - 1, active + 1)));
  }, [active]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 821px) and (pointer: fine)");
    const t = window.setTimeout(() => {
      setDesktop(mq.matches);
      setReach((r) => Math.max(r, 1)); // después de la carga, precargamos la siguiente escena
    }, 2500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={`stage${onStage ? "" : " is-covered"}`} aria-hidden="true">
      <div className="stage__scenes">
        {SCENES.map((s, i) => (
          <div
            key={i}
            className={`scene-layer${i === sceneIndex ? " is-active" : ""}`}
            data-scene={i}
            style={{ "--pos": s.pos[0], "--pos-md": s.pos[1], "--pos-sm": s.pos[2] } as React.CSSProperties}
          >
            {i <= reach && (
              <div className="base">
                <Image
                  src={s.img}
                  alt=""
                  fill
                  priority={i === 0}
                  fetchPriority={i === 0 ? "high" : "low"}
                  placeholder={i === 0 ? "blur" : "empty"}
                  sizes="100vw"
                  quality={i === 0 ? 65 : 70}
                />
              </div>
            )}
            {s.depth && desktop && i <= reach && (
              <div className="depth">
                <Image src={s.img} alt="" fill sizes="60vw" quality={45} fetchPriority="low" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="stage__wash" style={{ opacity: wash }} />
      {desktop && <Fog running={onStage} />}
      <div className="stage__mist stage__mist--a" />
      <div className="stage__mist stage__mist--b" />
      <div className="stage__vignette" />
      <div className="stage__grain" />
    </div>
  );
}
