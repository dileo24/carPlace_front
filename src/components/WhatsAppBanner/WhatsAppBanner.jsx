import React, { useEffect, useRef } from "react";
import "./WhatsAppBanner.css";
import celuDesktop from "../../assets/celu_desktop.webp";
import celuMobile from "../../assets/celu_mobile.webp";

const WA_NUMBER = "5493512147804";
const WA_MESSAGE = encodeURIComponent("¡Hola! Estuve en la web de sportquatro y quiero consultar...");

const WaIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" className="wa-icon">
		<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
	</svg>
);

const features = [
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="#1a7a3f" strokeWidth="2.5" strokeLinecap="round">
				<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
			</svg>
		),
		title: "Respuesta inmediata",
		sub: "Atención rápida y directa.",
		subDesktop: "Te respondemos al instante, sin esperas ni formularios.",
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="#1a7a3f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
				<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
				<polyline points="9 12 11 14 15 10" />
			</svg>
		),
		title: "Asesoramiento experto",
		sub: "Te guiamos en cada paso.",
		subDesktop: "Conocemos cada vehículo y opción de financiación.",
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="#1a7a3f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
				<rect x="1" y="3" width="15" height="13" rx="2" />
				<path d="M16 8h4l3 4v4h-7V8z" />
				<circle cx="5.5" cy="18.5" r="2.5" />
				<circle cx="18.5" cy="18.5" r="2.5" />
			</svg>
		),
		title: "Opciones a tu medida",
		sub: "Encontramos lo que buscás.",
		subDesktop: "Usados, financiados o al contado. ¡Lo que busques!",
	},
];

export default function WhatsAppBanner() {
	const cardRef = useRef(null);

	useEffect(() => {
		const card = cardRef.current;
		if (!card) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					card.classList.add("is-visible");
					observer.disconnect();
				}
			},
			{ threshold: 0.2 },
		);

		observer.observe(card);
		return () => observer.disconnect();
	}, []);

	return (
		<section className="wa-section">
			<div className="wa-card" ref={cardRef}>
				{/* ── Body row ── */}
				<div className="wa-body-row">
					<div className="wa-text wa-anim-left">
						<p className="wa-label">Asesoramiento personalizado</p>
						<h2 className="wa-title">
							Estamos para ayudarte por <em>WhatsApp</em>
						</h2>
						<div className="wa-divider" />
						<p className="wa-desc">
							Consultá por nuestros vehículos, financiación y más.
							<br />
							<strong>Te respondemos de inmediato.</strong>
						</p>
						<ul className="wa-features">
							{features.map((f) => (
								<li key={f.title} className="wa-feat">
									<div className="wa-feat-icon">{f.icon}</div>
									<div>
										<div className="wa-feat-title">{f.title}</div>
										<div className="wa-feat-sub">
											<span className="wa-feat-sub--mobile">{f.sub}</span>
											<span className="wa-feat-sub--desktop">{f.subDesktop}</span>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>

					{/* Celular DESKTOP — dentro del body row */}
					<div className="wa-phone-col wa-anim-right">
						<img src={celuDesktop} alt="Chat WhatsApp SportQuatro" className="wa-phone-img" />
					</div>
				</div>

				{/* ── Footer oscuro ── */}
				<div className="wa-footer wa-footer-anim">
					<div className="wa-footer-left">
						<div className="wa-footer-icon">
							<WaIcon />
						</div>
						<p className="wa-footer-main">Hablá con un asesor</p>
					</div>

					<a href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`} target="_blank" rel="noopener noreferrer" className="wa-cta-btn">
						Escribinos
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="wa-chevron"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</a>

					{/* Celular MOBILE: absolute dentro del footer, sube hacia arriba */}
					<img src={celuMobile} alt="" aria-hidden="true" className="wa-phone-mobile wa-anim-right" />
				</div>
			</div>
		</section>
	);
}
