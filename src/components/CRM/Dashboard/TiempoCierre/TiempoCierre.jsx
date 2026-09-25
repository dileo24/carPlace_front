import React from "react";
import "./TiempoCierre.css";

const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);

/**
 * TiempoCierre — gauge semicircular de tiempo promedio de cierre.
 *
 * Props:
 *   diasPromedio  — número actual (ej. 11)
 *   meta          — objetivo máximo para el arco (ej. 14)
 *   variacion     — días de diferencia vs mes anterior (negativo = mejoró)
 *   contexto      — texto explicativo (ej. "2 días menos que el mes anterior")
 */
export default function TiempoCierre({ diasPromedio, meta, variacion, contexto }) {
  // porcentaje del arco: cuánto del gauge está "usado"
  // si diasPromedio < meta → verde (bien), si supera → rojo
  const pct    = Math.min(diasPromedio / meta, 1);
  const mejoro = variacion <= 0;

  // arco SVG semicircular
  // viewBox 0 0 120 70, semicírculo de radio 50 centrado en (60,60)
  const R       = 50;
  const cx      = 60;
  const cy      = 62;
  const circum  = Math.PI * R;           // longitud del semiarco
  const filled  = circum * pct;
  const empty   = circum - filled;
  const color   = mejoro ? "#22c55e" : "#ef4444";

  return (
    <div className="tiempo-cierre">

      {/* arco SVG */}
      <div className="tiempo-cierre__gauge">
        <svg viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* pista de fondo */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* arco coloreado */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${empty}`}
            style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.4s ease" }}
          />
        </svg>

        {/* número central */}
        <div className="tiempo-cierre__numero">
          <span className="tiempo-cierre__valor">{diasPromedio}</span>
          <span className="tiempo-cierre__unidad">días</span>
        </div>
      </div>

      {/* info debajo */}
      <div className="tiempo-cierre__info">
        <span className="tiempo-cierre__label">Tiempo promedio de cierre</span>
        <div className={`tiempo-cierre__badge ${mejoro ? "tiempo-cierre__badge--bueno" : "tiempo-cierre__badge--malo"}`}>
          <IconTrendUp />
          {contexto}
        </div>
        <span className="tiempo-cierre__meta">Meta: {meta} días o menos</span>
      </div>

    </div>
  );
}