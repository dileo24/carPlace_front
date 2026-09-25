import React from "react";
import { motion } from "framer-motion";
import img1Nosotros from "../../assets/img1_nosotros.webp";
import "./HeroNosotros.css";

const stats = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="2" />
        <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      </svg>
    ),
    num: "+70",
    label: "VEHÍCULOS",
    sub: "EN STOCK",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    num: "+500",
    label: "VENTAS",
    sub: "ANUALES",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    num: null,
    label: "CONFIANZA, CALIDAD",
    sub: "Y RESPALDO",
    extra: "Nos eligen, nos recomiendan.",
  },
];

export default function HeroNosotros() {
  return (
    <div className="hno-root">
      {/* ── HERO FULL-BLEED ── */}
      <div className="hno-hero">
        {/* Imagen de fondo full width */}
        <img src={img1Nosotros} alt="SportQuatro local" className="hno-bg-img" />

        {/* Overlay degradado izquierda→transparente */}
        <div className="hno-overlay" />

        {/* Acento rojo triangular esquina superior derecha */}
        <div className="hno-accent-top" />

        {/* Acento rojo triangular esquina inferior derecha */}
        <div className="hno-accent-bottom" />

        {/* Contenido de texto */}
        <div className="hno-content">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hno-overline-row">
              <span className="hno-overline-bar" />
              <span className="hno-overline-label">QUIÉNES SOMOS</span>
            </div>

            <h1 className="hno-heading">
              SOMOS MÁS QUE<br />
              <span className="hno-heading--red">AUTOMOTORES</span>
            </h1>

            <div className="hno-underline" />

            <p className="hno-body">
              SportQuatro nació a principios del año 2000 como un emprendimiento pequeño, personal y secundario. Con el paso del tiempo, gracias al trabajo constante y la confianza de quienes nos eligen, fue creciendo hasta convertirse en lo que es hoy.
            </p>
            <p className="hno-body">
              Ese crecimiento fue construido paso a paso, con compromiso, constancia y una visión clara: hacer las cosas bien, priorizando siempre la calidad en cada detalle y el valor de cada relación.
            </p>

            <a
              href="#contacto"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hno-cta"
            >
              CONOCÉ MÁS SOBRE NOSOTROS
              <span className="hno-cta-circle">›</span>
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}