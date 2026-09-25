import { useEffect } from "react";
import { Button, Box } from "@mui/material";

const Pagination = ({ totalPages, currentPage, setCurrentPage }) => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);

    if (totalPages <= 1) return null;
	
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				mt: 4,
				gap: "8px",
			}}
		>
			<Button
				onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
				disabled={currentPage === 1}
				sx={{
					minWidth: "40px",
					backgroundColor: "transparent",
					color: "#bd0101",
					fontWeight: "bold",
					"&:hover": { backgroundColor: "#bd01012b" },
				}}
			>
				{"«"}
			</Button>

			{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
				<Button
					key={page}
					onClick={() => setCurrentPage(page)}
					disabled={page === currentPage}
					sx={{
						minWidth: "40px",
						borderRadius: "8px",
						backgroundColor: page === currentPage ? "#bd0101" : "transparent",
						color: page === currentPage ? "#c7c7c7 !important" : "#bd0101",

						fontWeight: page === currentPage ? "bold" : "normal",
						border: "1px solidrgb(156, 0, 0)",
						"&:hover": {
							backgroundColor: page === currentPage ? "#8b0000" : "#bd01012b",
						},
					}}
				>
					{page}
				</Button>
			))}

			<Button
				onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
				disabled={currentPage === totalPages}
				sx={{
					minWidth: "40px",
					backgroundColor: "transparent",
					color: "#bd0101",
					fontWeight: "bold",
					"&:hover": { backgroundColor: "#bd01012b" },
				}}
			>
				{"»"}
			</Button>
		</Box>
	);
};

export default Pagination;
