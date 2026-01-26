"use client";

import React from "react";
import Button from "./ui/button";

export default function PromoSection({ onApplyFilter }) {


  return (
    <section className="relative pt-0 pb-8 lg:pt-0 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Removed gap and reduced margins for tighter alignment */}
        <div className="grid items-center gap-0 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-0">
            <div className="mb-0">
              <h1 className="font-heading font-bold text-3xl md:text-4xl text-center lg:text-left">
                Ofertas
              </h1>
              <p className="text-muted-foreground text-base text-center lg:text-left">
                Hasta un 50% de descuento en artículos seleccionados. Oferta por tiempo limitado.
              </p>
            </div>

            <div className="flex justify-center lg:justify-start">
              <Button
                size="md"
                className="bg-[#BF1919] text-white"
                onClick={onApplyFilter}
              >
                VER
              </Button>
            </div>
          </div>

          {/* Right Side - Images */}
          <div className="relative hidden min-h-[150px] lg:flex justify-center items-center gap-0">
            <figure className="aspect-square w-28 h-28 rotate-16 transform overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:rotate-3">
              <img
                src="https://storage.googleapis.com/imagenesjerseyclub/bayern-munich-2026-local.webp"
                alt="Camiseta Bayern Munich 2026"
                className="h-full w-full object-cover"
              />
            </figure>
            <figure className="aspect-square w-28 h-28 -rotate-16 transform overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:-rotate-3">
              <img
                src="https://storage.googleapis.com/imagenesjerseyclub/argentina-2026-local.webp"
                alt="Camiseta Argentina 2026"
                className="h-full w-full object-cover"
              />
            </figure>
            <figure className="aspect-square w-28 h-28 -rotate-16 transform overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:-rotate-3">
              <img
                src="https://storage.googleapis.com/imagenesjerseyclub/barcelona-2026-local.webp"
                alt="Camiseta Barcelona 2026"
                className="h-full w-full object-cover"
              />
            </figure>
            <figure className="aspect-square w-28 h-28 rotate-16 transform overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:rotate-3">
              <img
                src="https://storage.googleapis.com/imagenesjerseyclub/argentina-1999-visitante-retro.webp"
                alt="Camiseta Argentina 1999 Retro"
                className="h-full w-full object-cover"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}