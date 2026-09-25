import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getEstadoMercadoLibre, getAuthUrlMercadoLibre, desconectarMercadoLibre } from "../../../services/mercadolibre.service";
import "./Integraciones.css";

const Integraciones = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [estado, setEstado] = useState(null);
	const [loading, setLoading] = useState(true);
	const [conectando, setConectando] = useState(false);
	const [desconectando, setDesconectando] = useState(false);
	const [aviso, setAviso] = useState(null); // { tipo: "ok" | "error", texto }

	const fetchEstado = useCallback(async () => {
		setLoading(true);
		try {
			const data = await getEstadoMercadoLibre();
			setEstado(data?.resp || { conectado: false });
		} catch {
			setEstado({ conectado: false });
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchEstado();
	}, [fetchEstado]);

	// Al volver del callback de ML, la URL trae ?ml=conectado|error — lo leemos
	// una vez para mostrar el aviso correspondiente y limpiamos el query param.
	useEffect(() => {
		const ml = searchParams.get("ml");
		if (!ml) return;

		if (ml === "conectado") {
			setAviso({ tipo: "ok", texto: "¡Cuenta de MercadoLibre conectada correctamente!" });
			fetchEstado();
		} else if (ml === "error") {
			setAviso({ tipo: "error", texto: "No se pudo conectar la cuenta de MercadoLibre. Intentá de nuevo." });
		}

		const next = new URLSearchParams(searchParams);
		next.delete("ml");
		setSearchParams(next, { replace: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleDesconectar = async () => {
		if (!window.confirm("¿Desconectar la cuenta de MercadoLibre? Vas a tener que volver a autorizarla para conectar otra.")) return;
		setDesconectando(true);
		try {
			await desconectarMercadoLibre();
			setAviso({ tipo: "ok", texto: "Cuenta de MercadoLibre desconectada." });
			fetchEstado();
		} catch {
			setAviso({ tipo: "error", texto: "No se pudo desconectar la cuenta." });
		} finally {
			setDesconectando(false);
		}
	};

	const handleConectar = async () => {
		setConectando(true);
		try {
			const data = await getAuthUrlMercadoLibre();
			if (data?.resp?.url) {
				window.location.href = data.resp.url;
				return;
			}
			setAviso({ tipo: "error", texto: "No se pudo generar el link de conexión con MercadoLibre." });
		} catch {
			setAviso({ tipo: "error", texto: "No se pudo generar el link de conexión con MercadoLibre." });
		} finally {
			setConectando(false);
		}
	};

	return (
		<div className="integraciones-view">
			<header className="integraciones-header">
				<h1 className="integraciones-header__title">Integraciones</h1>
			</header>

			<div className="integraciones-content">
				{aviso && (
					<div className={`integraciones-aviso integraciones-aviso--${aviso.tipo}`}>
						{aviso.texto}
					</div>
				)}

				<div className="integraciones-card">
					<div className="integraciones-card__info">
						<div className="integraciones-card__logo integraciones-card__logo--ml">ML</div>
						<div>
							<p className="integraciones-card__nombre">MercadoLibre</p>
							<p className="integraciones-card__descripcion">Publicá y gestioná el stock de vehículos directo desde la cuenta vendedora conectada.</p>
						</div>
					</div>

					<div className="integraciones-card__estado">
						{loading ? (
							<span className="integraciones-card__estado-texto">Consultando estado…</span>
						) : estado?.conectado ? (
							<>
								<div className="integraciones-card__estado-conectado">
									<span className="integraciones-card__dot integraciones-card__dot--ok" />
									Conectado como <strong>{estado.nickname || estado.mlUserId}</strong>
								</div>
								<button className="integraciones-btn integraciones-btn--secundario" onClick={handleConectar} disabled={conectando || desconectando}>
									{conectando ? "Redirigiendo…" : "Reconectar"}
								</button>
								<button className="integraciones-btn integraciones-btn--peligro" onClick={handleDesconectar} disabled={conectando || desconectando}>
									{desconectando ? "Desconectando…" : "Desconectar"}
								</button>
							</>
						) : (
							<>
								<div className="integraciones-card__estado-conectado">
									<span className="integraciones-card__dot integraciones-card__dot--off" />
									Sin conectar
								</div>
								<button className="integraciones-btn integraciones-btn--primario" onClick={handleConectar} disabled={conectando}>
									{conectando ? "Redirigiendo…" : "Conectar con MercadoLibre"}
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Integraciones;
