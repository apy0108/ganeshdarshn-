import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        card: "var(--card-bg)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-bg": "var(--accent-bg)",
        green: {
          DEFAULT: "var(--green)",
          bg: "var(--green-bg)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          bg: "var(--amber-bg)",
        },
        red: {
          DEFAULT: "var(--red)",
          bg: "var(--red-bg)",
        },
        grey: {
          DEFAULT: "var(--grey)",
          bg: "var(--grey-bg)",
        },
      },
      fontFamily: {
        sans: ["var(--font-baloo)", "sans-serif"],
        baloo: ["var(--font-baloo)", "sans-serif"],
        marathi: ["var(--font-noto-devanagari)", "sans-serif"],
      },
      borderRadius: {
        "card": "20px",
        "pill": "100px",
      },
    },
  },
  plugins: [],
};

export default config;
