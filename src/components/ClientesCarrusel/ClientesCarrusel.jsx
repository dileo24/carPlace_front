import React, { useState, useRef, useEffect } from "react";
import "./ClientesCarrusel.css";

// Imágenes
import op1 from "../../assets/opiniones/opinion1.webp";
import op2 from "../../assets/opiniones/opinion2.webp";
import op3 from "../../assets/opiniones/opinion3.webp";
import op4 from "../../assets/opiniones/opinion4.webp";
import op5 from "../../assets/opiniones/opinion5.webp";
import op6 from "../../assets/opiniones/opinion6.webp";
import op7 from "../../assets/opiniones/opinion7.webp";
import op8 from "../../assets/opiniones/opinion8.webp";
import op9 from "../../assets/opiniones/opinion9.webp";
import op10 from "../../assets/opiniones/opinion10.webp";
import op11 from "../../assets/opiniones/opinion11.webp";

const OPINIONES = [op1, op2, op3, op4, op5, op6, op7, op8, op9, op10, op11];

// Cantidad visible REAL
const VISIBLE = 2;

export default function ClientesCarrusel() {
  const trackRef = useRef(null);

  // Array con clones
  const extendedOpiniones = [
    ...OPINIONES.slice(-VISIBLE),
    ...OPINIONES,
    ...OPINIONES.slice(0, VISIBLE),
  ];

  // Arrancamos en el primer elemento real
  const [current, setCurrent] = useState(VISIBLE);

  const next = () => setCurrent((c) => c + 1);
  const prev = () => setCurrent((c) => c - 1);

  // Manejo de loop infinito
  const handleTransitionEnd = () => {
    const track = trackRef.current;
    if (!track) return;

    // Si pasamos el final (clones del inicio)
    if (current >= OPINIONES.length + VISIBLE) {
      track.style.transition = "none";
      setCurrent(VISIBLE);

      requestAnimationFrame(() => {
        track.style.transition = "transform 0.4s ease";
      });
    }

    // Si pasamos el inicio (clones del final)
    if (current < VISIBLE) {
      track.style.transition = "none";
      setCurrent(OPINIONES.length);

      requestAnimationFrame(() => {
        track.style.transition = "transform 0.4s ease";
      });
    }
  };

  // Asegurar transición
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.style.transition = "transform 0.4s ease";
  }, []);

  // Índice real para los dots
  const realIndex =
    (current - VISIBLE + OPINIONES.length) % OPINIONES.length;

  return (
    <div className="cc-wrapper">
      <div className="cc-track-outer">
        <div
          ref={trackRef}
          className="cc-track"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(calc(-${current} * (var(--cc-card-w) + var(--cc-gap))))`,
          }}
        >
          {extendedOpiniones.map((src, i) => (
            <div className="cc-card" key={i}>
              <img
                src={src}
                alt={`Opinión ${i}`}
                className="cc-opinion-img"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controles */}
      <div className="cc-controls">
        <button className="cc-btn" onClick={prev}>
          ‹
        </button>

        <div className="cc-dots">
          {OPINIONES.map((_, i) => (
            <button
              key={i}
              className={`cc-dot ${
                i === realIndex ? "cc-dot--active" : ""
              }`}
              onClick={() => setCurrent(i + VISIBLE)}
              aria-label={`Ir a opinión ${i + 1}`}
            />
          ))}
        </div>

        <button className="cc-btn" onClick={next}>
          ›
        </button>
      </div>
    </div>
  );
}