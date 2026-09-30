import React from "react";
import "./CuentasFilters.css";

const AMBITOS = [
	{ id: "todos", label: "Todos" },
	{ id: "internos", label: "Internos" },
	{ id: "empresa", label: "Empresa" },
];
const TIPOS = [
	{ id: "todos", label: "Todos" },
	{ id: "deudas", label: "Deudas" },
	{ id: "prestamos", label: "Préstamos" },
];
const ESTADOS = [
	{ id: "pendientes", label: "Pendientes" },
	{ id: "saldadas", label: "Saldadas" },
	{ id: "todas", label: "Todas" },
];

const Select = ({ label, value, onChange, options }) => (
	<div className="cuentas-filters__group">
		<span className="cuentas-filters__label">{label}</span>
		<select className="cuentas-filters__select" value={value} onChange={(e) => onChange(e.target.value)}>
			{options.map((o) => (
				<option key={o.id} value={o.id}>
					{o.label}
				</option>
			))}
		</select>
	</div>
);

const CuentasFilters = ({ ambito, tipo, estado, onAmbito, onTipo, onEstado }) => (
	<div className="cuentas-filters">
		<Select label="Ámbito" value={ambito} onChange={onAmbito} options={AMBITOS} />
		<Select label="Tipo de cuenta" value={tipo} onChange={onTipo} options={TIPOS} />
		<Select label="Estado" value={estado} onChange={onEstado} options={ESTADOS} />
	</div>
);

export default CuentasFilters;
