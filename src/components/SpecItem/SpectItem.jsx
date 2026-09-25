import React, { useEffect } from "react";
import { Box, Typography, TextField, useTheme } from "@mui/material";

const SpecItem = ({ icon, label, value, isEditing, onChange, fieldKey, inputRef, isFocused }) => {
	const theme = useTheme();

	useEffect(() => {
		if (isEditing && isFocused && inputRef && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing, isFocused, inputRef]);

	return (
		<Box display="flex" flexDirection="column" alignItems="center" gap={1} mb={2}>
			<Box display="flex" alignItems="center" gap={1}>
				<Box sx={{ display: "flex", alignItems: "center" }}>{icon}</Box>
				<Typography variant="body1" component="span" fontWeight="medium">
					{label}:
				</Typography>
			</Box>
			{isEditing ? (
				<TextField
					inputRef={inputRef}
					value={value}
					onChange={(e) => onChange(e, fieldKey)}
					fullWidth
					size="small"
					sx={{ textAlign: "center" }}
				/>
			) : (
				<Typography variant="body1" component="span" color="text.secondary" textAlign="center">
					{value}
				</Typography>
			)}
		</Box>
	);
};

export default SpecItem;
