import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 天青色系
        celadon: {
          50: "#f0f7f4",
          100: "#d9ede6",
          200: "#b4dbd0",
          300: "#7ec1b2",
          400: "#4fa191",
          500: "#338678",
          600: "#276b60",
          700: "#22574e",
          800: "#1e4640",
          900: "#1b3b36",
        },
        // 水墨灰
        ink: {
          50: "#f5f5f7",
          100: "#e8e8ec",
          200: "#d1d1d8",
          300: "#a8a8b5",
          400: "#6e6e82",
          500: "#4a4a5a",
          600: "#3a3a48",
          700: "#2d2d38",
          800: "#1e1e26",
          900: "#12121a",
        },
        // 朱砂红（动爻标注）
        cinnabar: {
          400: "#e05c4e",
          500: "#c94535",
          600: "#a8362a",
        },
        // 金色（铜钱）
        brass: {
          300: "#e8d4a0",
          400: "#d4b86a",
          500: "#b89440",
          600: "#9a7520",
        },
      },
      fontFamily: {
        serif: ["Source Han Serif CN", "Noto Serif SC", "Georgia", "serif"],
        sans: ["Source Han Sans CN", "Noto Sans SC", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "texture-paper": "url('/textures/paper.svg')",
        "gradient-ink": "radial-gradient(ellipse at top, #1e1e26 0%, #12121a 100%)",
      },
      animation: {
        "shake": "shake 0.5s ease-in-out",
        "coin-flip": "coinFlip 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "brush-reveal": "brushReveal 1s ease-out forwards",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "20%": { transform: "translateX(-8px) rotate(-3deg)" },
          "40%": { transform: "translateX(8px) rotate(3deg)" },
          "60%": { transform: "translateX(-6px) rotate(-2deg)" },
          "80%": { transform: "translateX(6px) rotate(2deg)" },
        },
        coinFlip: {
          "0%": { transform: "rotateY(0deg) scale(1)" },
          "50%": { transform: "rotateY(90deg) scale(0.8)" },
          "100%": { transform: "rotateY(0deg) scale(1)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(51,134,120,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(51,134,120,0.6)" },
        },
        brushReveal: {
          "0%": { clipPath: "inset(0 100% 0 0)" },
          "100%": { clipPath: "inset(0 0% 0 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
