import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        barn: {
          50: "#fff7ed",
          400: "#fb923c",
          500: "#f97316",
          700: "#b45309",
          900: "#451a03"
        },
        night: "#0d1117",
        hay: "#f8d36c",
        neon: "#35f2c7"
      },
      boxShadow: {
        glow: "0 0 40px rgba(53, 242, 199, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
