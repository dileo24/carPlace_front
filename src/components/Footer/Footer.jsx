import React, { useEffect, useRef } from "react";
import imgLogo from "../../assets/carPlace_logo.png";
import "./Footer.css";

export default function Footer() {
  const innerRef = useRef(null);

  useEffect(() => {
    const blocks = innerRef.current?.querySelectorAll(".footer-anim");
    if (!blocks) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            blocks.forEach((block, i) => {
              setTimeout(() => block.classList.add("is-visible"), i * 100);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-inner" ref={innerRef}>

        {/* Logo + marca */}
        <div className="footer-brand footer-anim">
          <img src={imgLogo} alt="Car Place" />
          <p>Tu próximo auto, nuestra prioridad.</p>
        </div>

        {/* Links */}
        <div className="footer-links footer-anim">
          <a href="/">Inicio</a>
          <a href="/catalogo">Vehículos</a>
          <a href="/nosotros">Nosotros</a>
          <a href="/compramos">Vendé tu auto</a>
        </div>

        {/* Contacto */}
        <div className="footer-contact footer-anim">
          <p className="contactoP">Contacto</p>
          <a href="https://wa.me/5493512147804?text=Hola%2C+vengo+desde+la+web" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a href="mailto:sportquatro.automotores@gmail.com">
            sportquatro.automotores@gmail.com
          </a>
          <p>Tel: 3513207804</p>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Car Place — Desarrollado por{" "}
        <a href="https://www.linkedin.com/in/joaquindileo/" target="_blank" rel="noreferrer">
          Joaquín Di Leo
        </a>
      </div>
    </footer>
  );
}