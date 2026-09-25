import React, { useEffect, useState, useRef } from "react";
import "./VendeTuAuto.css";

// ── Iconos SVG inline ──
const IconKey = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="M21 2l-9.6 9.6"/>
    <path d="M15.5 7.5l3 3L22 7l-3-3"/>
  </svg>
);
const IconCamera = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const IconUsers = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconFile = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconCheck = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconPerson = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconDollar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const pasos = [
  { icon: <IconKey />,    label: "TRAÉS\nTU AUTO" },
  { icon: <IconCamera />, label: "LO LAVAMOS\nY PUBLICAMOS" },
  { icon: <IconUsers />,  label: "LO MOSTRAMOS\nA INTERESADOS" },
  { icon: <IconFile />,   label: "NOS ENCARGAMOS\nDE LA GESTORÍA" },
  { icon: <IconCheck />,  label: "VENDÉS SEGURO\nY AL MEJOR PRECIO" },
];

const trustItems = [
  { icon: <IconShield />, text: "Transparencia en cada paso" },
  { icon: <IconPerson />, text: "Atención personalizada" },
  { icon: <IconDollar />, text: "Pago inmediato" },
  { icon: <IconStar />,   text: "Experiencia que respalda" },
];

// Hook: dispara animaciones al entrar en viewport
function useScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll(".anim-ready");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const anim = el.dataset.anim || "anim-fade-up";
            el.classList.add(anim);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function VendeTuAuto() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    marca: "",
    modelo: "",
    año: "",
    kilometros: "",
    transmision: "",
    detalles: "",
  });

  const formRef = useRef(null);
  useScrollReveal();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToForm = (e) => {
    e.preventDefault();
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "kilometros") {
      const raw = value.replace(/\./g, "");
      if (raw === "" || /^\d+$/.test(raw)) {
        const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setFormData((prev) => ({ ...prev, [name]: formatted }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/compramos-tu-auto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setFormData({ nombre: "", email: "", telefono: "", transmision: "", marca: "", modelo: "", año: "", kilometros: "", detalles: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vt-container">

      {/* ══════════ HERO ══════════ */}
      <section className="vt-hero">
        <div className="vt-hero-lines" />

        <div className="vt-hero-inner">
          <div className="vt-hero-text">
            <span
              className="vt-overline anim-ready"
              data-anim="anim-slide-right"
            >
              <span className="vt-overline-bar" />
              CONSIGNÁ TU AUTO
            </span>

            <h1
              className="vt-hero-h1 anim-ready anim-d1"
              data-anim="anim-fade-up"
            >
              Vendé <br />
              <span className="vt-red">sin complicaciones</span>
            </h1>

            {/* Botón modificado: "COTIZÁ TU AUTO ↓" */}
            <a
              href="#form"
              className="vt-hero-btn anim-ready anim-d2"
              data-anim="anim-fade-up"
              onClick={scrollToForm}
            >
              <span className="vt-hero-btn-arrow">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                </svg>
              </span>
              COTIZÁ TU AUTO
            </a>
          </div>

          {/* Video — columna más ancha */}
          <div
            className="vt-video-wrap anim-ready anim-d1"
            data-anim="anim-slide-left"
          >
            <div className="vt-video-inner">
              <div className="vt-video-play">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
              <div className="vt-video-bar">
                <div className="vt-video-progress" />
                <div className="vt-video-dot" />
              </div>
              <span className="vt-video-time">0:18 / 1:00</span>
              <div className="vt-video-expand">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ PASOS ══════════ */}
      <section className="vt-steps">
        <h2
          className="vt-steps-title anim-ready"
          data-anim="anim-fade-up"
        >
          NOS OCUPAMOS DE <span className="vt-red">TODO</span>
        </h2>
        <div className="vt-steps-bar" />

        <div className="vt-steps-grid">
          {pasos.map((p, i) => (
            <div
              className={`vt-step-card anim-ready anim-d${i + 1}`}
              data-anim="anim-fade-up"
              key={i}
            >
              <div className="vt-step-icon">{p.icon}</div>
              <p className="vt-step-label">
                {p.label.split("\n").map((l, j) => <span key={j}>{l}<br /></span>)}
              </p>
            </div>
          ))}
        </div>
      </section>

     {/* ══════════ TRUST ══════════ */}
<section className="vt-trust">
  <div className="vt-trust-card anim-ready" data-anim="anim-scale-in">
    <div className="vt-trust-bg" />
    <div className="vt-trust-inner">

      <div className="vt-trust-left anim-ready" data-anim="anim-slide-right">
        <h3 className="vt-trust-h3">
          Tu tranquilidad<br />
          es nuestra <span className="vt-red">prioridad</span>
        </h3>
        <div className="vt-trust-bar" />
        <p className="vt-trust-p">
          En SportQuatro Automotores trabajamos para que vender tu auto
          en consignación sea un proceso simple, seguro y transparente.
        </p>
        <p className="vt-trust-p">
          Nos ocupamos de cada etapa, desde la evaluación inicial hasta
          la venta final, logrando la mejor exposición para tu vehículo y
          el mejor resultado.
        </p>
        <p className="vt-trust-p">
          Trabajamos con honestidad y compromiso, brindándote
          atención personalizada y manteniéndote informado en
          cada etapa del proceso.
        </p>
        <p className="vt-trust-p vt-trust-highlight">
          Tu auto está en manos de <strong>profesionales.</strong>
        </p>
      </div>

      <div className="vt-trust-right">
        {trustItems.map((item, i) => (
          <div
            key={i}
            className={`vt-trust-item anim-ready anim-d${i + 1}`}
            data-anim="anim-slide-left"
          >
            <div className="vt-trust-icon-wrap">{item.icon}</div>
            <span className="vt-trust-item-text">{item.text}</span>
          </div>
        ))}
      </div>

    </div>
  </div>
</section>

      {/* ══════════ FORMULARIO ══════════ */}
      <section className="vt-form-section" id="form" ref={formRef}>
        <div className="vt-form-bg" />
        <div className="vt-form-inner">

          <div
            className="vt-form-text anim-ready"
            data-anim="anim-slide-right"
          >
            <h2 className="vt-form-h2">
              COTIZÁ TU AUTO<br />
              <span className="vt-red">AHORA</span>
            </h2>
            <div className="vt-form-bar" />
            <p className="vt-form-sub">
              Completá el formulario y te respondemos a la brevedad.
            </p>
          </div>

          <form
            className="vt-form anim-ready anim-d1"
            data-anim="anim-fade-up"
            onSubmit={handleSubmit}
          >
            <div className="vt-form-row">
              <input className="vt-input" name="marca"      placeholder="Marca"       value={formData.marca}      onChange={handleChange} required />
              <input className="vt-input" name="modelo"     placeholder="Modelo"      value={formData.modelo}     onChange={handleChange} required />
            </div>
            <div className="vt-form-row">
              <input className="vt-input" name="año"        placeholder="Año"         value={formData.año}        onChange={handleChange} required />
              <input className="vt-input" name="kilometros" placeholder="Kilometraje" value={formData.kilometros} onChange={handleChange} required />
            </div>
            <div className="vt-form-row">
              <input className="vt-input" name="nombre"     placeholder="Nombre"      value={formData.nombre}     onChange={handleChange} required />
              <input className="vt-input" name="telefono"   placeholder="Teléfono"    value={formData.telefono}   onChange={handleChange} required />
            </div>
            <div className="vt-form-row">
              <input className="vt-input" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              <input className="vt-input" name="transmision"   placeholder="Transmisión"    value={formData.transmision}   onChange={handleChange} required />
            </div>
<textarea
  className="vt-input vt-input-full"
  name="detalles"
  placeholder="Detalles adicionales (opcional)"
  value={formData.detalles}
  onChange={handleChange}
  rows={3}
  style={{ resize: "vertical", minHeight: "80px" }}
/>
            <button className="vt-submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "ENVIANDO..." : "ENVIAR SOLICITUD"}
              {!isSubmitting && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
          </form>

        </div>
      </section>

    </div>
  );
}