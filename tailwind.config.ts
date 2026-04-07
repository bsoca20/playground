import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#c71f37",
          dark: "#090b10",
          ash: "#f3f4f6",
          smoke: "#a1a1aa"
        }
      },
      boxShadow: {
        panel: "0 20px 60px rgba(8, 11, 19, 0.10)",
        cinematic: "0 24px 80px rgba(0, 0, 0, 0.45)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
