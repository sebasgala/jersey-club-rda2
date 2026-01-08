/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  safelist: [
    "animate-marquee-x",
    "animate-marquee-y",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 1s ease-in-out",
        "slide-up": "slideUp 0.5s ease-in-out",

        // ✅ marquee (usa CSS var --duration)
        "marquee-x": "marqueeX var(--duration, 30s) linear infinite",
        "marquee-y": "marqueeY var(--duration, 30s) linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },

        // ✅ se mueve -50% porque hay 2 copias del contenido
        marqueeX: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeY: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
