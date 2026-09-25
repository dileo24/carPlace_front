import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFiltros } from "../../context/FiltrosContext";
import "./TipologiaGrid.css";
import oportunidades from "../../assets/oportunidades.webp";
import hatchback from "../../assets/autos/hatchback.webp";
import sedan from "../../assets/autos/sedan.webp";
import utilitarios from "../../assets/autos/utilitario.webp";
import pickup from "../../assets/autos/pickup.webp";
import suv from "../../assets/autos/suv.webp";

const TIPOLOGIAS = [
  { nombre: "Oportunidades", filtro: { oferta: true },      color: "#ac0101de", foto: oportunidades },
  { nombre: "SUV",           filtro: { categoria: "SUV" },    color: "#222",      foto: suv          },
  { nombre: "Sedán",         filtro: { categoria: "Sedán" },    color: "#333",      foto: sedan        },
  { nombre: "Hatchback",     filtro: { categoria: "Hatchback" },    color: "#1b2838",   foto: hatchback    },
  { nombre: "Pick Up",       filtro: { categoria: "Pick Up" },    color: "#2d1515",   foto: pickup       },
  { nombre: "Utilitarios",   filtro: { categoria: "Utilitarios" },    color: "#1a2a1a",   foto: utilitarios  },
];

export default function TipologiaGrid() {
  const navigate   = useNavigate();
  const { setFiltros } = useFiltros();
  const gridRef    = useRef(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll(".tipologia-card");
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Disparar stagger: cada card con delay incremental según su índice
            cards.forEach((card, i) => {
              setTimeout(() => card.classList.add("is-visible"), i * 80);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  const handleClick = (tipologia) => {
    setFiltros((prev) => ({ ...prev, ...tipologia.filtro }));
    navigate("/catalogo");
  };

  return (
    <div className="tipologia-grid" ref={gridRef}>
      {TIPOLOGIAS.map((tip, i) => (
        <button
          key={tip.nombre}
          className={`tipologia-card ${i === 0 ? "tipologia-card--featured" : ""}`}
          onClick={() => handleClick(tip)}
        >
          {/* Imagen separada para poder hacer zoom independiente del card */}
          {tip.foto && (
            <div
              className="tipologia-bg"
              style={{ backgroundImage: `url(${tip.foto})` }}
            />
          )}

          {/* Overlay oscuro */}
          <div className="tipologia-overlay" />

          {/* Contenido */}
          <div className="tipologia-content">
            <span className="tipologia-nombre" translate="no">{tip.nombre}</span>
          </div>
        </button>
      ))}
    </div>
  );
}