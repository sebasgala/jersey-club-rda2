import React from "react";
import { Link } from "react-router-dom";

export default function SeasonalOfferBanner() {
  return (
    <section className="mb-6 rounded-2xl border border-gray-200 bg-gradient-to-r from-orange-50 to-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            ¡Ofertas de Temporada!
          </h2>
          <p className="mt-1 text-gray-600">
            Hasta <span className="font-semibold text-orange-600">35%</span> de descuento en camisetas retro.
          </p>
        </div>

        <Link
          to="/ofertas"
          className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Ver ofertas
          <span className="ml-2" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
