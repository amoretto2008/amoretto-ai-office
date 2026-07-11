import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        amoretto: {
          navy: "#14213D",
          wine: "#6B1E3A",
          gold: "#B9975B",
          ivory: "#F8F3EA",
          ink: "#2F2A25",
        },
      },
    },
  },
  plugins: [],
};

export default config;
