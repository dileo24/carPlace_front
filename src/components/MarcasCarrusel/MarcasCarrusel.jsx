import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFiltros } from "../../context/FiltrosContext";
import { getMarcas } from "../../services/autos.service";
import { useMarcas } from "../../hooks/useMarcas";
import "./MarcasCarrusel.css";

export default function MarcasCarrusel() {
	const navigate = useNavigate();
	const { setFiltros } = useFiltros();
	const [isMobile, setIsMobile] = useState(false);
	const [marcasDisponibles, setMarcasDisponibles] = useState([]);
	const { marcas: marcasCatalogo } = useMarcas();

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth <= 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		if (!marcasCatalogo.length) return;
		getMarcas()
			.then((marcasDB) => {
				const marcasDBNorm = marcasDB.map((m) => m.toLowerCase());

				// Sin foto todavía no se muestra en el carrusel público (el admin
				// las va subiendo desde el módulo de Marcas) — evita ícono roto.
				const filtradas = marcasCatalogo
					.filter((m) => m.fotoUrl && marcasDBNorm.includes(m.nombre.toLowerCase()))
					.map((m) => ({ value: m.nombre, label: m.nombre, logo: m.fotoUrl }));

				setMarcasDisponibles(filtradas);
			})
			.catch(console.error);
	}, [marcasCatalogo]);

	const handleMarcaClick = (marcaValue) => {
		setFiltros((prev) => ({ ...prev, marca: marcaValue }));
		navigate("/catalogo");
	};

	const marcasRender = [...marcasDisponibles, ...marcasDisponibles];

	return (
		<div className="marcas-carrusel-outer">
			<div className={`marcas-carrusel-track ${isMobile ? "manual" : "auto"}`}>
				{marcasRender.map((marca, i) => (
					<button key={i} className="marca-chip" onClick={() => handleMarcaClick(marca.value)} title={marca.label}>
						<img src={marca.logo} alt={marca.label} className="marca-logo" />
					</button>
				))}
			</div>
		</div>
	);
}
