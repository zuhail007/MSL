import type { Config } from "tailwindcss";

export default {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 25px rgba(34, 197, 94, 0.35)",
      },
      colors: {
        pitch: {
          900: "#052e2b",
          800: "#064b43",
          700: "#0a6a58",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

