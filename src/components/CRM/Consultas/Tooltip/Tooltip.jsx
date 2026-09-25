import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Tooltip.css";

/**
 * Tooltip que se renderiza en un portal (body) para evitar
 * problemas de posicionamiento causados por overflow o transform en padres.
 */
export default function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords]   = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  function updateCoords() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top:  rect.top + window.scrollY - 8,   // encima del elemento
      left: rect.left + window.scrollX + rect.width / 2,       // centro horizontal
    });
  }

  function handleEnter() {
    updateCoords();
    setVisible(true);
  }

  // En touch no hay hover: un tap muestra/oculta el tooltip.
  function handleToggle(e) {
    e.stopPropagation();
    updateCoords();
    setVisible((v) => !v);
  }

  useEffect(() => {
    if (!visible) return;
    function handleOutside(e) {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) setVisible(false);
    }
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, [visible]);

  return (
    <>
      <span
        ref={triggerRef}
        className="cq-tooltip-wrap"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setVisible(false)}
        onClick={handleToggle}
      >
        {children}
      </span>

      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.span
              className="cq-tooltip cq-tooltip--portal"
              style={{
                top: coords.top,
                left: coords.left,
                translateX: "-50%",
                translateY: "-100%",
              }}
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.12 }}
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}