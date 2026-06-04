import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#080b10",
          900: "#0d121a",
          850: "#111824",
          800: "#151d2a",
          700: "#202b3a"
        },
        accent: {
          mint: "#52f0b7",
          cyan: "#3dd6f5",
          gold: "#f5c451",
          red: "#ff6b6b"
        }
      },
      boxShadow: {
        terminal: "0 18px 80px rgba(0, 0, 0, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
