import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./FinanciacionBanner.css";

import hsbcLogo from "../../assets/bancos/hsbc_logo.webp";
import colLogo from "../../assets/bancos/col_logo.png";
import svLogo from "../../assets/bancos/sv_logo.webp";
import delSolLogo from "../../assets/bancos/banco_del_sol.webp";
import nacionLogo from "../../assets/bancos/banco_nacion.png";
import autoImg from "../../assets/auto_sinFondo.webp";

const BANCOS = [
	{ logo: hsbcLogo, name: "HSBC" },
	{ logo: svLogo, name: "SV" },
	{ logo: colLogo, name: "Banco Córdoba" },
	/* { logo: delSolLogo, name: "Banco del Sol" }, */
	{ logo: nacionLogo, name: "Banco Nación" },
];

const WA_NUMBER = "5493512147804";
const WA_MESSAGE = encodeURIComponent("¡Hola! Estuve en la web y quiero consultar...");

export default function FinanciacionBanner() {
	const navigate = useNavigate();
	const bannerRef = useRef(null);

	useEffect(() => {
		const el = bannerRef.current;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					el.classList.add("animate");
					observer.unobserve(el);
				}
			},
			{
				threshold: 0.4,
			},
		);

		if (el) observer.observe(el);

		return () => observer.disconnect();
	}, []);

	return (
		<div className="fi-banner" ref={bannerRef}>
			<div className="fi-banner-inner">
				{/* ── Texto izquierda ── */}
				<div className="fi-text-side">
					<p className="fi-overline">Financiación a tu medida</p>

					<h2 className="fi-title">
						Llevate tu auto
						<br />
						<span>hoy mismo</span>
					</h2>

					<p className="fi-body">
						Contamos con distintas opciones para que puedas llevarte tu próximo auto sin vueltas. Trabajamos con los mejores bancos y las
						mejores tasas, adaptándonos a lo que necesitás. Encontrá la mejor opción según tu presupuesto.
					</p>

					{/* Logos bancos pill */}
					{/* Logos bancos - tarjetas */}
					<div className="fi-bancos-grid">
						{BANCOS.map((banco, i) => (
							<div className="fi-banco-card" key={i}>
								<img src={banco.logo} alt={banco.name} className="fi-banco-card-logo" />
							</div>
						))}
						<div className="fi-banco-card">
							<span className="fi-banco-mas-card">y más!</span>
						</div>
					</div>

					{/* Botones */}
					<div className="fi-actions">
						<button className="fi-btn fi-btn--primary" onClick={() => navigate("/catalogo")}>
							Catálogo
						</button>
						<a
							href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
							target="_blank"
							rel="noopener noreferrer"
							className="fi-btn fi-btn--outline"
						>
							Contactanos por otra financiación
						</a>
					</div>
				</div>

				{/* ── Auto derecha sobresaliendo ── */}
				<div className="fi-visual-side">
					<img src={autoImg} alt="Auto financiado" className="fi-car-img" />
				</div>
			</div>
		</div>
	);
}
