import React from 'react';

import CategoryNavRow from '../components/CategoryNavRow';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import Novedades from '../components/Novedades';
import Otono2025 from '../components/Otono2025';
import UltimasUnidades from '../components/UltimasUnidades';
import Footer from '../components/Footer';


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen pt-[70px]">
      <CategoryNavRow />

      {/* Hero Section - Full Width Banner with top spacing */}
      <div className="mt-0">
        <Hero />
      </div>

      <main className="flex-grow container mx-auto px-4 pb-12">

        <FeaturedCategories />
        <Novedades />
        <Otono2025 />
        <UltimasUnidades />
      </main>
      <Footer />
    </div>
  );
}
