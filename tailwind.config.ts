import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: "#0B0E11",
          900: "#12161B",
          800: "#1B2027",
          700: "#262C35",
          600: "#3A4250",
        },
        paper: "#F3F1EC",
        flag: {
          red: "#E10600",
          amber: "#F5A623",
        },
        signal: {
          green: "#2FBF71",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "3px",
      },
    },
  },
  plugins: [],
};
export default config;
