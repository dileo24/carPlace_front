import React, { useEffect, useRef } from "react";
import "./Sucursales.css";

import localBg from "../../assets/img2_nosotros.webp";

const SUCURSALES = [
	{
		nombre: "Local principal",
		direccion: "Av. Emilio Caraffa 2247",
		ciudad: "Córdoba Capital",
		horario: "Lun a Vie: 9:30 a 13:00 · 16:00 a 20:00\nSáb: 9:30 a 13:00",
		mapUrl:
			"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.908228088407!2d-64.2093766!3d-31.389093900000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x943298ee50eff00d%3A0xcecfc8516d6af07c!2sSportquatro%20Automotores!5e0!3m2!1ses-419!2sar!4v1780075663437!5m2!1ses-419!2sar",
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
				<div key={i} className="suc-hero" style={{ backgroundImage: `url(${localBg})` }}>
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

						{/* Mapa derecha */}
						<div className="suc-map-card suc-anim">
							<iframe
								title={s.nombre}
								src={s.mapUrl}
								width="100%"
								height="100%"
								style={{ border: 0 }}
								allowFullScreen=""
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
