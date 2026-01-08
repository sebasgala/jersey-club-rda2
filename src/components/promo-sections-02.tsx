"use client";

import MarqueeEffect from "../examples/motion/components/marquee-effect/01/marquee-effect";
import Button from "../components/ui/button";
import { useNavigate } from "react-router-dom";

const images = [
	{
		image: "/assets/images/boca-jr-1995-local-retro.webp",
		alt: "Boca Jr 1995 Local RETRO"
	},
	{
		image: "/assets/images/argentina-1999-visitante-retro.webp",
		alt: "Argentina 1999 Visitante RETRO"
	},
	{
		image: "/assets/images/barcelona-2026-local.webp",
		alt: "Barcelona 2026 Local"
	},
	{
		image: "/assets/images/manchester-united-2025-away.webp",
		alt: "Manchester United 2025 Away"
	},
	{
		image: "/assets/images/real-madrid-2015-tercera-retro.webp",
		alt: "Real Madrid 2015 Tercera RETRO"
	},
	{
		image: "/assets/images/psg-2025-tercera-.webp",
		alt: "PSG 2025 Tercera"
	},
];

export default function Testimonials() {
	const navigate = useNavigate();

	const handleBuyCollectionClick = () => {
		navigate("/futbol?coleccion=2026");
	};

	return (
		<section className="py-0">
			<div className="mx-auto max-w-5xl px-4">
				<div className="grid items-center lg:grid-cols-2">
					<header className="relative z-10 mx-auto mb-0 max-w-xl text-center lg:mb-0 lg:text-start">
						<h3 className="font-heading mb-0 text-4xl text-balance md:text-5xl">
							Los nuevos estilos de verano llegaron
						</h3>
						<p className="text-muted-foreground text-balance lg:text-lg">
							Este año mundialista viste con estilo en tus vacaciones!
						</p>
						<Button
							size="lg"
							className="mt-2"
							style={{ backgroundColor: "#BF1919", color: "#FFFFFF" }}
							onClick={handleBuyCollectionClick}
						>
							Comprar colección
						</Button>
					</header>
					<div className="relative w-full grid h-32 grid-cols-2 gap-4 overflow-hidden mask-t-from-80% mask-r-from-10% mask-b-from-80% mask-l-from-10% lg:static lg:h-auto lg:mask-r-from-70% lg:mask-l-from-70%">
						{[
							{
								reverse: false,
							},
							{
								reverse: true,
							},
						].map((mq, i) => (
							<MarqueeEffect
								key={i}
								gap={12}
								direction="vertical"
								reverse={mq.reverse}
								speed={30}
								speedOnHover={1}
							>
								{images
									.slice(i * 3, (i + 1) * 3)
									.map((image, i) => (
										<figure key={i}>
											<img
												src={image.image}
												alt={image.alt}
												className="aspect-square object-cover"
											/>
										</figure>
									))}
							</MarqueeEffect>
						))}
					</div>
				</div>

			</div>
		</section>
	);
}