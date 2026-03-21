import type { Config } from "tailwindcss";

export default {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 25px rgba(251, 146, 60, 0.45)",
      },
      colors: {
        pitch: {
          900: "#331a0f",
          800: "#4f2e17",
          700: "#7f4b1f",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

