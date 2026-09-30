import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import "./Wpp.css";

export default function Wpp() {
	const [showBubble, setShowBubble] = useState(false);

	useEffect(() => {
		const alreadySeen = localStorage.getItem("wppBubbleSeen");
		if (!alreadySeen) {
			// Pequeño delay para que aparezca suave al cargar la página
			const timer = setTimeout(() => setShowBubble(true), 1500);
			return () => clearTimeout(timer);
		}
	}, []);

	const closeBubble = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setShowBubble(false);
		localStorage.setItem("wppBubbleSeen", "true");
	};

	return (
		<div className="wpp-wrapper">
			{showBubble && (
				<div className="wpp-bubble">
					<button className="wpp-bubble-close" onClick={closeBubble}>
						×
					</button>
					<span>¿Alguna duda? <strong>Escribinos</strong></span>
				</div>
			)}
			<a
				href="https://api.whatsapp.com/send?phone=5493512147804&text=Hola!%20Estuve%20en%20la%20web%20de%20Car%20Place%2C%20quisiera%20realizar%20una%20consulta."
				target="_blank"
				rel="noopener noreferrer"
				className="float"
			>
				<FontAwesomeIcon icon={faWhatsapp} size="2x" />
			</a>
		</div>
	);
}