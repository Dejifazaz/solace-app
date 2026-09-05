/* Solace — shared Tailwind CDN theme config. Load after the Tailwind CDN <script>.
   Ramp is HSL-derived from the logo's sage green (~hsl(124 7% 57%)), holding
   hue/saturation constant and varying only lightness, with a touch more
   saturation at the light/dark extremes so the ramp doesn't flatten into gray. */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "hsl(124, 14%, 96%)",
          100: "hsl(124, 12%, 91%)",
          200: "hsl(124, 10%, 82%)",
          300: "hsl(124, 9%, 71%)",
          400: "hsl(124, 8%, 64%)",
          500: "hsl(124, 7%, 57%)",
          600: "hsl(124, 9%, 46%)",
          700: "hsl(124, 11%, 36%)",
          800: "hsl(124, 13%, 26%)",
          900: "hsl(124, 15%, 16%)",
        },
        ink: {
          DEFAULT: "hsl(150, 6%, 8%)",
          50: "hsl(150, 10%, 97%)",
          100: "hsl(150, 8%, 92%)",
          400: "hsl(150, 5%, 40%)",
          600: "hsl(150, 6%, 22%)",
          700: "hsl(150, 7%, 15%)",
          800: "hsl(150, 7%, 11%)",
          900: "hsl(150, 8%, 6%)",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,14,11,0.05), 0 6px 16px rgba(10,14,11,0.07)",
        "card-lg": "0 4px 10px rgba(10,14,11,0.06), 0 12px 28px rgba(10,14,11,0.10)",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
};
