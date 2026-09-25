import React from "react";
import { Typography, Grid, Box } from "@mui/material";
import { motion } from "framer-motion";

import entregaInm from "../../assets/detalle/entregaInm.png";
import finan from "../../assets/detalle/finan.webp";
import recibimos from "../../assets/detalle/recibimos.png";
import gestoria from "../../assets/detalle/gestoria.png";

const MotionBox = motion(Box);

const BENEFICIOS = [
  {
    icon: entregaInm,
    title: "Entrega inmediata",
    desc: "Contamos con unidades disponibles para entrega inmediata.",
  },
  {
    icon: recibimos,
    title: "Recibimos tu usado (Consultar)",
    desc: "Tomamos tu vehículo en parte de pago. Consultá condiciones.",
  },
  {
    icon: finan,
    title: "Financiación a tu medida",
    desc: "Planes de financiación personalizados según tus necesidades.",
  },
  {
    icon: gestoria,
    title: "Gestoría general",
    desc: "Nos encargamos de todos los trámites para que no tengas que preocuparte por nada.",
  },
];

export default function BenefitsCard() {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{
        mt: 4,
        border: "1px solid #e5e5e5",
        borderRadius: 2,
        bgcolor: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 4,
          pt: 3,
          pb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 3,
            bgcolor: "#cc2222",
            borderRadius: 1,
          }}
        />
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            letterSpacing: 2,
            color: "#222",
            fontSize: "0.75rem",
          }}
        >
          SERVICIOS DIFERENCIALES
        </Typography>
      </Box>

      <Grid container sx={{ borderTop: "1px solid #e5e5e5" }}>
        {BENEFICIOS.map((b, i) => (
          <Grid
            item
            xs={12}
            sm={6}
            key={i}
            sx={{
              p: 3,
              display: "flex",
              alignItems: "flex-start",
              gap: 2.5,
              borderRight: i % 2 === 0 ? "1px solid #e5e5e5" : "none",
              borderBottom: i < 2 ? "1px solid #e5e5e5" : "none",
            }}
          >
            {/* Icono */}
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              
                <Box
                  component="img"
                  src={b.icon}
                  alt={b.title}
                  sx={{
                    width: 30,
                    height: 30,
                    objectFit: "contain",
                  }}
                />
            </Box>

            {/* Texto */}
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#111",
                  mb: 0.5,
                }}
              >
                {b.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.82rem",
                  color: "#666",
                  lineHeight: 1.5,
                }}
              >
                {b.desc}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </MotionBox>
  );
}