// components/CRM/Calendario/CalendarioGrid/CalendarioGrid.jsx
import React, { useState } from "react";
import { Popover } from "@mui/material";
import "./CalendarioGrid.css";
import CitaCard from "../CitaCard/CitaCard";
import { buildCalendarDays, toDateStr, isPasadoSinFinalizar } from "../../../../constants/crmCalendario";

const DIAS_SEMANA_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DIAS_SEMANA_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_CITAS_VISIBLES = 4;

export default function CalendarioGrid({ year, month, citas, onCitaClick, onDiaClick }) {
	const today = toDateStr(new Date());
	const days = buildCalendarDays(year, month);
	const [diaExpandido, setDiaExpandido] = useState(null); // { anchorEl, dateStr } | null

	const abrirResumenDia = (e, dateStr) => {
		e.stopPropagation();
		setDiaExpandido({ anchorEl: e.currentTarget, dateStr });
	};
	const cerrarResumenDia = () => setDiaExpandido(null);
	const citasDiaExpandido = diaExpandido ? citas.filter((c) => c.fecha === diaExpandido.dateStr) : [];

	return (
		<div className="cal-grid">
			{/* Encabezados días */}
			<div className="cal-grid__header">
				{DIAS_SEMANA_SHORT.map((d, i) => (
					<div key={d} className="cal-grid__day-label">
						<span className="cal-grid__day-label--full">{DIAS_SEMANA_FULL[i]}</span>
						<span className="cal-grid__day-label--short">{d}</span>
					</div>
				))}
			</div>

			{/* Celdas */}
			<div className="cal-grid__body">
				{days.map(({ date, isCurrentMonth }, idx) => {
					const dateStr = toDateStr(date);
					const isToday = dateStr === today;
					const citasDelDia = citas.filter((c) => c.fecha === dateStr);
					const tienePendientesVencidos = citasDelDia.some(isPasadoSinFinalizar);

					return (
						<div
							key={dateStr + idx}
							className={[
								"cal-grid__cell",
								!isCurrentMonth ? "cal-grid__cell--out" : "",
								isToday ? "cal-grid__cell--today" : "",
								tienePendientesVencidos ? "cal-grid__cell--alerta" : "",
							]
								.filter(Boolean)
								.join(" ")}
							onClick={() => {
								if (isCurrentMonth && onDiaClick) onDiaClick(dateStr);
							}}
						>
							<div className="cal-grid__cell-top">
								<span className="cal-grid__cell-num">{date.getDate()}</span>
								{tienePendientesVencidos && <span className="cal-grid__cell-alerta-dot" title="Tiene eventos sin finalizar" />}
							</div>

							<div className="cal-grid__cell-citas" onClick={(e) => e.stopPropagation()}>
								{citasDelDia.length > MAX_CITAS_VISIBLES ? (
									<button className="cal-grid__resumen-btn" onClick={(e) => abrirResumenDia(e, dateStr)}>
										Mostrar {citasDelDia.length} eventos
									</button>
								) : (
									citasDelDia.map((cita, ci) => (
										<CitaCard key={cita.id} cita={cita} onClick={onCitaClick} animDelay={ci * 40} vencido={isPasadoSinFinalizar(cita)} />
									))
								)}
							</div>
						</div>
					);
				})}
			</div>

			<Popover
				open={Boolean(diaExpandido)}
				anchorEl={diaExpandido?.anchorEl}
				onClose={cerrarResumenDia}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				transformOrigin={{ vertical: "top", horizontal: "left" }}
				PaperProps={{ className: "cal-grid__resumen-popover" }}
			>
				<div className="cal-grid__resumen-lista">
					{citasDiaExpandido.map((cita, ci) => (
						<CitaCard
							key={cita.id}
							cita={cita}
							onClick={(c) => {
								cerrarResumenDia();
								onCitaClick(c);
							}}
							animDelay={ci * 30}
							vencido={isPasadoSinFinalizar(cita)}
						/>
					))}
				</div>
			</Popover>
		</div>
	);
}
