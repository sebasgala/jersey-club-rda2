import React from "react";

export default function Hero() {
  return (
    <section className="hero w-full overflow-hidden min-h-[200px] bg-gray-200" id="hero">
      <img
        src="https://storage.googleapis.com/imagenesjerseyclub/1.webp"
        alt="Banner Jersey Club"
        className="w-full h-auto object-cover object-center"
        style={{ width: '100%', display: 'block' }}
      />
    </section>
  );
}
