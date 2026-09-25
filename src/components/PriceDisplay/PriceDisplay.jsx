import React from "react";
import { Box } from "@mui/material";

export default function PriceDisplay({ moneda, precio, precioOferta, precioContado, oferta }) {
    if (!precio) {
        return (
            <Box
                sx={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    mb: 2,
                    textAlign: "center",
                }}
            >
                Consultar precio
            </Box>
        );
    }

    return (
        <>
            <Box
                sx={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    mb: 2,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Box
                    component="span"
                    sx={{
                        fontSize: oferta ? "1.25rem" : "1.5rem",
                        color: oferta ? "grey.600" : "inherit",
                        textDecoration: oferta ? "line-through" : "none",
                        opacity: oferta ? 0.7 : 1,
                    }}
                >
                    {moneda} {precio}
                </Box>

                {oferta && (
                    <Box component="span" sx={{ color: "red", fontSize: "1.5rem", fontWeight: "bold", mb: 1 }}>
                        {moneda} {precioOferta}
                    </Box>
                )}
            </Box>

            {precioContado && (
                <Box
                    sx={{
                        fontSize: "1rem",
                        color: "text.secondary",
                        textAlign: "center",
                        mb: 2,
                        mt: -1,
                    }}
                >
                    Precio contado: {precioContado}
                </Box>
            )}
        </>
    );
}
