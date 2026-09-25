import React, { useEffect, useState, useRef } from "react";
import { CircularProgress, Box } from "@mui/material";
import { getAutosRelacionados } from "../../services/autos.service";
import Card from "../Card/Card";
import "./CardsRelacionados.css";

export default function CardsRelacionados({ categorias, idAutoActual }) {
  const [relacionados, setRelacionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    // Solo fetch cuando categorias llega con datos reales
    if (!categorias || categorias.length === 0) return;

    let cancelled = false;
    setLoading(true);

    getAutosRelacionados(categorias)
      .then((response) => {
        if (cancelled) return;
        setRelacionados(response.filter((a) => a.id !== idAutoActual));
      })
      .catch((err) => {
        console.error("Error al obtener autos relacionados:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [categorias, idAutoActual]);

  // No mostrar nada mientras categorias no llegó todavía
  if (!categorias || categorias.length === 0) return null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={160}>
        <CircularProgress size={36} sx={{ color: "#cc0000" }} />
      </Box>
    );
  }

  if (!relacionados.length) return null;

  const maxPos = Math.max(0, relacionados.length - 4);

  const prev = () => setPos((p) => Math.max(0, p - 1));
  const next = () => setPos((p) => Math.min(maxPos, p + 1));

  return (
    <div className="cr-section">
      <div className="cr-header">
        <div className="cr-title-group">
          <span className="cr-overline">También te puede interesar</span>
          <h3 className="cr-title">Vehículos relacionados</h3>
        </div>
        {relacionados.length > 4 && (
          <div className="cr-nav">
            <button className="cr-nav-btn" onClick={prev} disabled={pos === 0}>‹</button>
            <button className="cr-nav-btn" onClick={next} disabled={pos >= maxPos}>›</button>
          </div>
        )}
      </div>

      <div className="cr-track-outer">
        <div
          className="cr-track"
          ref={trackRef}
          style={{
            transform: `translateX(calc(-${pos} * (var(--cr-card-w) + var(--cr-gap))))`,
          }}
        >
          {relacionados.map((auto) => (
            <div className="cr-card-wrapper" key={auto.id}>
              <Card auto={auto} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}