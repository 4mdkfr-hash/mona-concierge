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
        // Côte d'Azur light marine palette
        void: "#F0F4F8",       // primary page background (soft blue-grey)
        obsidian: "#FFFFFF",   // white surface
        carbon: "#FFFFFF",     // card background
        graphite: "#DDE4EB",   // border / divider
        ivory: "#0F2B3C",      // primary text (dark navy)
        mist: "#5B8FA8",       // secondary text (sea blue)
        fog: "#8AABBC",        // muted text (lighter sea blue)
        navy: "#0F2B3C",       // sidebar / dark accent
        // Monaco gold — Côte d'Azur variant
        gold: {
          400: "#C4A35A",
          500: "#B0924E",
          600: "#9C8044",
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
