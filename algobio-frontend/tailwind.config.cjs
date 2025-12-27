// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Le content est bon, il doit rester
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  theme: {
    // La propriété 'container' est essentielle pour le design responsive Shadcn
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // AJOUTEZ CETTE SECTION pour que Tailwind reconnaisse vos variables de thème
      colors: {
        // Couleurs de base
        border: "var(--color-border)",
        input: "var(--color-input)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",

        // Couleurs sémantiques
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
        // ... (ajoutez toutes les autres couleurs que vous utilisez, ex: accent, muted, destructive)
      },
      // Configuration des bordures arrondies
      borderRadius: {
        lg: `var(--radius-lg)`, // Vous aviez défini --radius-lg
        md: `var(--radius-md)`,
        sm: "calc(var(--radius-lg) - 2px)", // Utiliser la variable principale pour les dérivés
      },
      // Configuration des animations (si vous utilisez 'tw-animate')
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // La configuration `plugins` est généralement vide si vous ne codez pas vos propres plugins
  plugins: [require("tailwindcss-animate")], // Assurez-vous d'avoir installé ce plugin si vous utilisez tw-animate-css
};