import React, { useState } from "react";
import "./RangeSlider.css";

/**
 * RangeSlider — slider doble de min/max
 *
 * Props:
 *   min        número mínimo absoluto
 *   max        número máximo absoluto
 *   valueMin   valor actual del extremo inferior  (string o number)
 *   valueMax   valor actual del extremo superior  (string o number)
 *   onChange   ({ min, max }) => void  — se llama solo al SOLTAR el thumb
 *   prefix     símbolo delante del input (ej. "$", "km")
 *   step       paso del slider (default 1)
 *   format     función para mostrar el número en el input
 *   parse      función para leer el string del input
 */
export default function RangeSlider({
	min = 0,
	max = 100,
	valueMin,
	valueMax,
	onChange,
	prefix = "",
	step = 1,
	format = (v) => (v != null ? v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""),
	parse = (s) => Number(String(s).replace(/\./g, "").replace(/[^\d]/g, "")) || 0,
}) {
	const toNum = (v, fallback) => (v !== "" && v !== undefined && v !== null ? Number(v) : fallback);

	const committedMin = toNum(valueMin, min);
	const committedMax = toNum(valueMax, max);

	const [localMin, setLocalMin] = useState(committedMin);
	const [localMax, setLocalMax] = useState(committedMax);

	// Estados de string para los inputs de texto — independientes del slider
	const [inputMin, setInputMin] = useState(format(committedMin));
	const [inputMax, setInputMax] = useState(format(committedMax));

	const commitTimer = React.useRef(null);

	React.useEffect(() => {
		setLocalMin(committedMin);
		setInputMin(format(committedMin));
	}, [committedMin]);
	React.useEffect(() => {
		setLocalMax(committedMax);
		setInputMax(format(committedMax));
	}, [committedMax]);

	const pct = (v) => ((v - min) / (max - min)) * 100;

	// Slider: actualiza local Y el input de texto mientras arrastrás (para que
	// el número se vea en vivo), el commit al padre (onChange) recién al soltar.
	const handleMinSlider = (e) => {
		const v = Math.min(Number(e.target.value), localMax - step);
		setLocalMin(v);
		setInputMin(format(v));
	};
	const handleMaxSlider = (e) => {
		const v = Math.max(Number(e.target.value), localMin + step);
		setLocalMax(v);
		setInputMax(format(v));
	};

	const commitSlider = () => {
		setInputMin(format(localMin));
		setInputMax(format(localMax));
		onChange({ min: localMin, max: localMax });
	};

	// Input de texto: deja escribir libremente, commit con debounce al blur
	const handleMinInput = (e) => {
		const raw = e.target.value.replace(/\./g, "");
		if (/^\d*$/.test(raw)) {
			setInputMin(raw.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
		}
	};

	const handleMaxInput = (e) => {
		const raw = e.target.value.replace(/\./g, "");
		if (/^\d*$/.test(raw)) {
			setInputMax(raw.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
		}
	};

	const commitMinInput = () => {
		const parsed = Math.min(Math.max(parse(inputMin), min), localMax - step);
		setLocalMin(parsed);
		setInputMin(format(parsed));
		clearTimeout(commitTimer.current);
		commitTimer.current = setTimeout(() => onChange({ min: parsed, max: localMax }), 600);
	};

	const commitMaxInput = () => {
		const parsed = Math.max(Math.min(parse(inputMax), max), localMin + step);
		setLocalMax(parsed);
		setInputMax(format(parsed));
		clearTimeout(commitTimer.current);
		commitTimer.current = setTimeout(() => onChange({ min: localMin, max: parsed }), 600);
	};

	return (
		<div className="rs-wrapper">
			<div className="rs-track-container">
				<div className="rs-track" />
				<div className="rs-range" style={{ left: `${pct(localMin)}%`, right: `${100 - pct(localMax)}%` }} />
				<input
					type="range"
					className="rs-input"
					min={min}
					max={max}
					step={step}
					value={localMin}
					onChange={handleMinSlider}
					onMouseUp={commitSlider}
					onTouchEnd={commitSlider}
				/>
				<input
					type="range"
					className="rs-input"
					min={min}
					max={max}
					step={step}
					value={localMax}
					onChange={handleMaxSlider}
					onMouseUp={commitSlider}
					onTouchEnd={commitSlider}
				/>
			</div>

			<div className="rs-inputs-row">
				<div className="rs-field">
					{prefix && <span className="rs-field-prefix">{prefix}</span>}
					<input type="text" inputMode="numeric" value={inputMin} onChange={handleMinInput} onBlur={commitMinInput} />
				</div>
				<div className="rs-field">
					{prefix && <span className="rs-field-prefix">{prefix}</span>}
					<input type="text" inputMode="numeric" value={inputMax} onChange={handleMaxInput} onBlur={commitMaxInput} />
				</div>
			</div>
		</div>
	);
}
