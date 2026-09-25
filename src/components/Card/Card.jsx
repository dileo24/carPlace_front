import React from "react";
import "./Card.css";
import { Link } from "react-router-dom";
import SpeedIcon from "@mui/icons-material/Speed";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { formatearLista } from "../../data/filters";

export default function Card({ auto, currentPage }) {
	const API_URL = import.meta.env.VITE_API_URL;
	const imageUrl = auto.img[0]?.startsWith("http") ? auto.img[0] : `${API_URL}/files/${auto.img[0]}`;

	const GearShiftIcon = ({ fontSize = 20 }) => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={fontSize}
			height={fontSize}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<line x1="12" y1="22" x2="12" y2="8" />
			<circle cx="12" cy="6" r="2" />
			<line x1="5" y1="12" x2="19" y2="12" />
			<line x1="5" y1="12" x2="5" y2="8" />
			<line x1="12" y1="12" x2="12" y2="8" />
			<line x1="19" y1="12" x2="19" y2="8" />
			<line x1="5" y1="12" x2="5" y2="16" />
			<line x1="19" y1="12" x2="19" y2="16" />
		</svg>
	);

	// Guarda en qué página y qué tan scrolleado estaba el catálogo antes de
	// entrar al detalle, para que "Volver al catálogo" lo deje exactamente
	// donde estaba (sessionStorage: solo dura esta pestaña/sesión, se limpia
	// solo al volver — ver Catalogo.jsx).
	const handleClick = () => {
		try {
			sessionStorage.setItem("catalogoRestore", JSON.stringify({ page: currentPage, scrollY: window.scrollY }));
		} catch (_) {}
	};

	// "0" explícito en km (no vacío/null, que es lo que queda cuando no se
	// cargó el dato) es tan confiable como la categoría "0km" para esto.
	const es0km = auto.categorias?.some((c) => c.categ === "0km") || auto.km === "0";

	return (
		<Link to={`/catalogo/${auto.id}`} className="card-link" onClick={handleClick}>
			<div className="card-tutu">
				{auto.oferta && <div className="badge-oferta">OFERTA</div>}
				{auto.destacar && (
					<div className="badge-highlight">
						<AutoAwesomeIcon />
						<span className="badge-tooltip">Auto destacado</span>
					</div>
				)}
				<div className="card-img-wrapper">
					<img src={imageUrl} alt={auto.modelo} loading="lazy" decoding="async" />
					{es0km && <div className="badge-0km">0KM</div>}
					{es0km && <div className="badge-tasa-cero">¡Tasa cero!</div>}
				</div>
				<div className="card-content">
					<div className="card-header">
						<span className="marca" translate="no">
							{auto.marca}
						</span>
						<h3 translate="no">{auto.modelo}</h3>
						<span className="anio">{auto.anio}</span>
					</div>
					<div className="features" translate="no">
						<div>
							<SpeedIcon /> {auto.km} km
						</div>
						<div>
							<GearShiftIcon fontSize={20} />
							<span className="features__valor" title={formatearLista(auto.transmision)}>
								{formatearLista(auto.transmision)}
							</span>
						</div>
						<div>
							<LocalGasStationIcon />
							<span className="features__valor" title={formatearLista(auto.combustible)}>
								{formatearLista(auto.combustible)}
							</span>
						</div>
					</div>
					<div className="price" translate="no">
						{!auto.precio ? (
							<span className="new">Consultar precio</span>
						) : auto.oferta ? (
							<>
								<span className="old">
									<span className="currency">{auto.moneda}</span> {auto.precio}
								</span>
								<span className="new">
									<span className="currency">{auto.moneda}</span> {auto.precio_oferta}
								</span>
							</>
						) : (
							<span className="new">
								<span className="currency">{auto.moneda}</span> {auto.precio}
							</span>
						)}
						{auto.oferta_reventa && auto.precio_info_mes_actual && (
							<span className="precio-info">
								Info auto: <b>AR$ {Number(String(auto.precio_info_mes_actual).replace(/\./g, "")).toLocaleString("es-AR")}</b>
							</span>
						)}
					</div>
					<button className="btn-detail">Ver detalles</button>
				</div>
			</div>
		</Link>
	);
}
