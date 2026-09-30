import React, { useEffect, useRef } from "react";
import "./Sucursales.css";

import fachada from "../../assets/sucursal_carplace.webp";

// TODO: la dirección y el link de Google Maps siguen siendo los de Sportquatro (clon).
// Reemplazar por la dirección real de Car Place cuando se tenga.
const SUCURSALES = [
	{
		nombre: "Local principal",
		direccion: "Av. Emilio Caraffa 2247",
		ciudad: "Córdoba Capital",
		horario: "Lun a Vie: 9:30 a 13:00 · 16:00 a 20:00\nSáb: 9:30 a 13:00",
		mapsLink: "https://maps.app.goo.gl/oir1AdmuN38tEz8V8",
	},
];

function PinIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className="suc-pin">
			<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
		</svg>
	);
}

export default function Sucursales() {
	const innerRef = useRef(null);

	useEffect(() => {
		const blocks = innerRef.current?.querySelectorAll(".suc-anim");
		if (!blocks) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						blocks.forEach((block, i) => {
							setTimeout(() => block.classList.add("is-visible"), i * 120);
						});
						observer.disconnect();
					}
				});
			},
			{ threshold: 0.2 },
		);

		observer.observe(innerRef.current);
		return () => observer.disconnect();
	}, []);

	return (
		<div className="suc-section">
			{SUCURSALES.map((s, i) => (
				<div key={i} className="suc-hero">
					<div className="suc-overlay" />

					<div className="suc-inner" ref={innerRef}>
						{/* Texto izquierda */}
						<div className="suc-left suc-anim">
							<h2 className="suc-title">Nuestra sucursal</h2>

							<div className="suc-loc">
								<div className="suc-loc-icon">
									<PinIcon />
								</div>
								<div className="suc-loc-text">
									<span className="suc-loc-dir">
										{s.direccion.toUpperCase()}, {s.ciudad.toUpperCase()}
									</span>
								</div>
							</div>

							<a href={s.mapsLink} target="_blank" rel="noopener noreferrer" className="suc-btn">
								Cómo llegar ↗
							</a>
						</div>

						{/* Imagen derecha */}
						<div className="suc-map-card suc-anim">
							<img src={fachada} alt="Fachada del local de Car Place" className="suc-map-img" loading="lazy" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
