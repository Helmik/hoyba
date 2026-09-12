import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "rgb(var(--color-primary) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
          canvas: "rgb(var(--color-canvas) / <alpha-value>)",
          surface: "rgb(var(--color-surface) / <alpha-value>)",
          border: "rgb(var(--color-border) / <alpha-value>)",
          whatsapp: "rgb(var(--color-whatsapp) / <alpha-value>)",
          // Aliases semánticos requeridos por especificación
          chukum: "rgb(var(--color-canvas) / <alpha-value>)",
          jungle: "rgb(var(--color-primary) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["var(--font-family-display)", "sans-serif"],
        body: ["var(--font-family-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;