import Tooltip from "../Tooltip/Tooltip";
import { ESTADO_LABEL, BADGE_TOOLTIP, origenKey } from "../../../../constants/crm";
import { ORIGEN_ICON } from "../../../../constants/crmIcons";
import "./ConsultaBadges.css";

/**
 * Badge de estado de la consulta.
 * @param {string}  estado       Clave del estado (nuevo, calificado, etc.)
 * @param {boolean} withTooltip  Mostrar tooltip explicativo al hacer hover
 */
export function EstadoBadge({ estado, withTooltip = false }) {
  const badge = (
    <span className={`cq-badge cq-badge--${estado}`}>
      {ESTADO_LABEL[estado]}
    </span>
  );
  return withTooltip
    ? <Tooltip text={BADGE_TOOLTIP.estado}>{badge}</Tooltip>
    : badge;
}

/**
 * Chip de canal de origen con ícono y color por plataforma.
 * @param {string}  origen       Nombre del canal (WhatsApp, Web, etc.)
 * @param {boolean} withTooltip  Mostrar tooltip explicativo al hacer hover
 */
export function OrigenChip({ origen, withTooltip = false }) {
  const chip = (
    <span className={`cq-origen cq-origen--${origenKey(origen)}`}>
      {ORIGEN_ICON[origen]}
      {origen}
    </span>
  );
  return withTooltip
    ? <Tooltip text={BADGE_TOOLTIP.origen}>{chip}</Tooltip>
    : chip;
}