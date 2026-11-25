"use client";

import Image from "next/image";
import { SCENES, DEEP_WASH, CINE_CHAPTERS } from "./scenes";
import { useCine } from "./scroll";
import { Fog } from "./Fog";

/**
 * Escenario fijo: pila de escenas (z0), lavado de color (z2), WebGL (z3),
 * viñeta (z4), grano (z5) y bruma en degradés radiales.
 */
export function Stage() {
  const { active } = useCine();
  const sceneIndex = Math.min(active, SCENES.length - 1);
  const wash = active >= SCENES.length ? DEEP_WASH : SCENES[sceneIndex].wash;
  const onStage = active < CINE_CHAPTERS;

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
            <div className="base">
              <Image src={s.img} alt="" fill priority={i === 0} loading={i === 0 ? undefined : "eager"} placeholder="blur" sizes="100vw" quality={78} />
            </div>
            {s.depth && (
              <div className="depth">
                <Image src={s.img} alt="" fill loading="eager" sizes="100vw" quality={70} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="stage__wash" style={{ opacity: wash }} />
      <Fog running={onStage} />
      <div className="stage__mist stage__mist--a" />
      <div className="stage__mist stage__mist--b" />
      <div className="stage__vignette" />
      <div className="stage__grain" />
    </div>
  );
}
