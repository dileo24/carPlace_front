import React, { useState, useEffect, useRef } from "react";
import "./VentasMonthNav.css";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MESES_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const START_YEAR = 2024;

export default function VentasMonthNav({ ventas = [], mesActual, onMesChange }) {
	const today = new Date();
	const END_YEAR = today.getFullYear();
	const END_MONTH = today.getMonth();

	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [dropdownYear, setDropdownYear] = useState(mesActual.year);
	const dropdownRef = useRef(null);

	const isCurrentMonth = mesActual.year === END_YEAR && mesActual.month === END_MONTH;

	const isPrevDisabled = mesActual.year === START_YEAR && mesActual.month === 0;
	const isNextDisabled = isCurrentMonth;

	// Meses que tienen al menos una venta
	const monthsWithData = new Set(
		ventas
			.filter((v) => v.fechaVenta)
			.map((v) => {
				const [y, m] = v.fechaVenta.split("-");
				return `${y}-${m}`;
			}),
	);

	function navigate(dir) {
		let m = mesActual.month + dir;
		let y = mesActual.year;
		if (m < 0) {
			m = 11;
			y--;
		}
		if (m > 11) {
			m = 0;
			y++;
		}
		if (y < START_YEAR) return;
		if (y > END_YEAR || (y === END_YEAR && m > END_MONTH)) return;
		onMesChange({ year: y, month: m });
	}

	function selectMonth(year, month) {
		onMesChange({ year, month });
		setDropdownOpen(false);
	}

	function openDropdown() {
		setDropdownYear(mesActual.year);
		setDropdownOpen(true);
	}

	// Cerrar al hacer click afuera
	useEffect(() => {
		function handleClickOutside(e) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		}
		if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [dropdownOpen]);

	return (
		<div className="ventas-month-nav">
			<button
				className="month-nav__arrow"
				onClick={() => navigate(-1)}
				disabled={isPrevDisabled}
				title="Mes anterior"
				aria-label="Mes anterior"
			>
				&#8249;
			</button>

			<div className="month-nav__center">
				<div className="month-nav__dropdown-wrap" ref={dropdownRef}>
					<button
						className={`month-nav__label${dropdownOpen ? " is-open" : ""}`}
						onClick={() => (dropdownOpen ? setDropdownOpen(false) : openDropdown())}
					>
						{MESES[mesActual.month]} {mesActual.year}
						<span className="month-nav__chevron">▾</span>
					</button>

					{dropdownOpen && (
						<div className="month-nav__dropdown">
							<div className="month-nav__dropdown-title">Ir a un mes</div>

							<div className="month-nav__year-tabs">
								{Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i).map((y) => (
									<button key={y} className={`year-tab${y === dropdownYear ? " active" : ""}`} onClick={() => setDropdownYear(y)}>
										{y}
									</button>
								))}
							</div>

							<div className="month-nav__months-grid">
								{MESES_SHORT.map((label, m) => {
									const isDisabled = dropdownYear > END_YEAR || (dropdownYear === END_YEAR && m > END_MONTH);
									const isActive = dropdownYear === mesActual.year && m === mesActual.month;
									const key = `${dropdownYear}-${String(m + 1).padStart(2, "0")}`;
									const hasData = monthsWithData.has(key);

									return (
										<button
											key={m}
											className={`month-btn${isActive ? " active" : ""}${hasData ? " has-data" : ""}`}
											disabled={isDisabled}
											onClick={() => !isDisabled && selectMonth(dropdownYear, m)}
										>
											{label}
											{hasData && <span className="month-btn__dot" />}
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>

				{isCurrentMonth && <span className="month-nav__today-tag">Actual</span>}
			</div>

			<button
				className="month-nav__arrow"
				onClick={() => navigate(1)}
				disabled={isNextDisabled}
				title="Mes siguiente"
				aria-label="Mes siguiente"
			>
				&#8250;
			</button>
		</div>
	);
}
