import {
	faWhatsapp,
	faInstagram,
	faFacebook,
	faTiktok,
} from "@fortawesome/free-brands-svg-icons";

export const paperStyles = {
	p: 1,
	height: "100%",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center",
	gap: 1,
	textAlign: "center",
};

export const socialLinks = [
	{
		icon: faWhatsapp,
		color: "#25D366",
		href: "https://api.whatsapp.com/send?phone=&text=Hola!%20Estuve%20en%20la%20web%20de%20Charly%20y%20Joaco%2C%20quisiera%20realizar%20una%20consulta.",
	},
	{
		icon: faInstagram,
		color: "#E1306C",
		href: "",
	},
	{
		icon: faFacebook,
		color: "#4267B2",
		href: "",
	},
	{
		icon: faTiktok,
		color: "#000000",
		href: "",
	},
];

export const linkStyles = {
	display: "inline-block",
	transition: "transform 0.2s ease",
	"&:hover": {
		transform: "translateY(-3px)",
	},
};
