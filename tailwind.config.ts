import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        barn: {
          50: "#fbe9d8",
          400: "#d4712f",
          500: "#c85a24",
          700: "#a8431a",
          900: "#5f2810"
        },
        // charcoal dark backdrop
        night: {
          DEFAULT: "#202427",
          900: "#1a1d20",
          800: "#202427",
          700: "#23262a",
          600: "#2c3034",
          500: "#363a3f",
          400: "#454a50"
        },
        // card / row surface
        card: "#2c3034",
        // gold for credits
        hay: "#e4a94a",
        // copper hover
        copper: "#d4712f",
        // legacy alias
        neon: "#c85a24",
        // cream text
        cream: "#f6ecd6",
        // distressed cream surfaces (now-playing card)
        parchment: "#f2e3c4"
      },
      fontFamily: {
        display: ["var(--font-anton)", "var(--font-oswald)", "Impact", "Arial Narrow", "sans-serif"],
        ui: ["var(--font-oswald)", "Impact", "Arial Narrow", "sans-serif"]
      },
      boxShadow: {
        // hard retro stacked shadow on buttons
        btn: "0 4px 0 rgba(95,40,16,0.85)",
        "btn-sm": "0 2px 0 rgba(95,40,16,0.85)",
        // card drop shadows
        sm: "0 2px 6px rgba(0,0,0,0.35)",
        md: "0 8px 22px rgba(0,0,0,0.40)",
        lg: "0 18px 42px rgba(0,0,0,0.48)",
        // legacy
        glow: "0 0 40px rgba(200, 97, 26, 0.18), 0 0 80px rgba(200, 97, 26, 0.06)",
        bevel: "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.5)",
        "bevel-sm": "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.4)"
      }
    }
  },
  plugins: []
};

export default config;
