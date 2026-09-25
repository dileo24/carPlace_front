import React from "react";
import "./MetricCard.css";

const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const IconTrendDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
  </svg>
);

export default function MetricCard({ label, valor, variacion, tendencia, icon, delay = 0 }) {
  return (
    <div className="metric-card" style={{ animationDelay: `${delay}s` }}>
      <div className="metric-card__icon">{icon}</div>
      <div className="metric-card__body">
        <span className="metric-card__label">{label}</span>
        <span className="metric-card__value">{valor}</span>
      </div>
      <div className={`metric-card__badge metric-card__badge--${tendencia}`}>
        {tendencia === "up" ? <IconTrendUp /> : <IconTrendDown />}
        {tendencia === "up" ? "+" : ""}{variacion}%
      </div>
    </div>
  );
}