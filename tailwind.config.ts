import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      colors: {
        cream: { 50: "#FDFBF7", 100: "#FAF6EF", 200: "#F4ECDE", 300: "#E8DDC9" },
        forest: { 700: "#3D5E50", 800: "#2C4A3E", 900: "#1F362C" },
        clay: { 400: "#D67960", 500: "#C8553D", 600: "#A8412C" },
        sand: { 400: "#B8AC95", 500: "#9C8F76" },
        ink: { 900: "#1A1614", 700: "#3D362F" },
        border: "hsl(35 20% 85%)",
        background: "#FAF6EF",
        foreground: "#1A1614",
        primary: { DEFAULT: "#2C4A3E", foreground: "#FAF6EF" },
        accent: { DEFAULT: "#C8553D", foreground: "#FAF6EF" },
        muted: { DEFAULT: "#E8DDC9", foreground: "#3D362F" },
        ring: "#2C4A3E",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "fade-up": "fade-up 0.6s ease-out forwards" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
