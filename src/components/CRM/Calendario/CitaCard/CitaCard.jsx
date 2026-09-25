// components/CRM/Calendario/CitaCard/CitaCard.jsx
import React from "react";
import "./CitaCard.css";
import { TIPO_COLORS } from "../../../../constants/crmCalendario";

export default function CitaCard({ cita, onClick, animDelay = 0, vencido = false }) {
	// Si el usuario responsable tiene un color asignado (ej. el socio), prevalece
	// sobre el color por tipo de evento — así se distingue de un vistazo de quién es.
	const color = cita.usuarioColor || TIPO_COLORS[cita.tipo] || "#94a3b8";

	return (
		<button
			className={[
        "cita-card",
        vencido ? "cita-card--vencido" : "",
        cita.estado === "realizada" ? "cita-card--realizada" : "",
        cita.estado === "cancelada" ? "cita-card--cancelada" : "",
    ].filter(Boolean).join(" ")}
			onClick={() => onClick(cita)}
			style={{
				"--cita-color": color,
				animationDelay: `${animDelay}ms`,
			}}
			title={`${cita.horaInicio} — ${cita.titulo}${vencido ? " · Sin finalizar" : ""}`}
		>
			<span className="cita-card__dot" />
			<span className="cita-card__hora">{cita.horaInicio}</span>
			<span className="cita-card__nombre">{cita.titulo}</span>
			{vencido && <span className="cita-card__vencido-icon">!</span>}
		</button>
	);
}
