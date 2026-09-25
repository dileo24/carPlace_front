import { PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";

// PointerSensor cubre mouse/pen con un umbral de distancia para no pisar el click.
// TouchSensor usa un delay (mantener presionado) para no chocar con el scroll del contenedor.
export function useDragSensors() {
	return useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
	);
}
