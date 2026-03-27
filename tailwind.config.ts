import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#080B12",
        obsidian: "#0D1117",
        carbon: "#141820",
        graphite: "#1E2330",
        ivory: "#F5F0E8",
        mist: "#A8A8B3",
        fog: "#6B6B7A",
        gold: {
          400: "#D4AF37",
          500: "#B8960C",
          600: "#9A7D0A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
