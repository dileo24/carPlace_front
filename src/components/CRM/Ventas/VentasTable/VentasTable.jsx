import React, { useState } from "react";
import "./VentasTable.css";

function formatFecha(iso) {
	if (!iso) return "—";
	const [y, m, d] = iso.split("-");
	return `${d}/${m}/${y}`;
}

function formatMonto(n) {
	if (n === null || n === undefined) return null;
	return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const PROPIETARIO_LABELS = {
	socio: "Socio",
	compartido: "Compartido 50/50",
};

function GananciaCell({ venta }) {
	if (venta.ganancia == null) return <span className="ventas-td__solo-lectura">—</span>;
	const esCompartido = venta.propietarioAuto === "compartido";
	const detalle = Array.isArray(venta.gastosDetalle) ? venta.gastosDetalle : [];
	const titulo = detalle.length
		? `Gastos: ${detalle.map((g) => `${g.texto}${g.precio ? ` ($${formatMonto(g.precio)})` : ""}`).join(", ")}`
		: undefined;
	return (
		<div title={titulo}>
			<span>{formatMonto(venta.ganancia)}</span>
			{esCompartido && (
				<div className="ventas-td__ganancia-split">c/u: {formatMonto(Math.round(venta.ganancia / 2))}</div>
			)}
		</div>
	);
}

const COLUMNAS = [
	{ label: "Nombre y apellido" },
	{ label: "Teléfono" },
	{ label: "Vehículo vendido" },
	{ label: "Fecha" },
	{ label: "Auto recibido" },
	{ label: "Precio" },
	{ label: "Ganancia" },
	{ label: "" },
];

const VentaFila = React.memo(function VentaFila({ venta, idx, onEditar, onEliminar, esSupervisor }) {
	const [confirmando, setConfirmando] = useState(false);

	return (
		<tr style={{ animationDelay: `${idx * 0.03}s` }}>
			<td className="ventas-td__nombre">
				{venta.nombre} {venta.apellido}
			</td>
			<td>{venta.telefono}</td>
			<td className="ventas-td__vehiculo" title={venta.vehiculoVendido}>
				{venta.vehiculoVendido}
			</td>
			<td>{formatFecha(venta.fechaVenta)}</td>
			<td className="ventas-td__auto-recibido" title={venta.autoRecibido || ""}>
				{venta.autoRecibido || "—"}
			</td>
			<td>{venta.precioVendido ? `${venta.moneda || "ARS"} ${venta.precioVendido}` : "—"}</td>
			<td>
				<GananciaCell venta={venta} />
				{venta.propietarioAuto && venta.propietarioAuto !== "agencia" && (
					<div className="ventas-td__propietario">{PROPIETARIO_LABELS[venta.propietarioAuto]}</div>
				)}
			</td>
			<td>
				{esSupervisor ? (
					<span className="ventas-td__solo-lectura">—</span>
				) : confirmando ? (
					<div className="ventas-row-actions" style={{ opacity: 1 }}>
						<button
							className="ventas-row-btn ventas-row-btn--delete"
							onClick={(e) => {
								e.stopPropagation();
								onEliminar(venta.id);
							}}
						>
							Confirmar
						</button>
						<button
							className="ventas-row-btn"
							onClick={(e) => {
								e.stopPropagation();
								setConfirmando(false);
							}}
						>
							No
						</button>
					</div>
				) : (
					<div className="ventas-row-actions">
						<button
							className="ventas-row-btn"
							onClick={(e) => {
								e.stopPropagation();
								onEditar(venta);
							}}
						>
							Editar
						</button>
						<button
							className="ventas-row-btn ventas-row-btn--delete"
							onClick={(e) => {
								e.stopPropagation();
								setConfirmando(true);
							}}
						>
							Eliminar
						</button>
					</div>
				)}
			</td>
		</tr>
	);
});

export default function VentasTable({ ventas, onEditar, onEliminar, esSupervisor }) {
	if (ventas.length === 0) {
		return (
			<div className="ventas-table-wrapper">
				<div className="ventas-empty">Sin resultados</div>
			</div>
		);
	}

	return (
		<div className="ventas-table-wrapper">
			<table className="ventas-table">
				<colgroup>
					{COLUMNAS.map((_, i) => (
						<col key={i} />
					))}
				</colgroup>
				<thead>
					<tr>
						{COLUMNAS.map((col, i) => (
							<th key={i}>{col.label}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{ventas.map((venta, idx) => (
						<VentaFila key={venta.id} venta={venta} idx={idx} onEditar={onEditar} onEliminar={onEliminar} esSupervisor={esSupervisor} />
					))}
				</tbody>
			</table>
		</div>
	);
}
