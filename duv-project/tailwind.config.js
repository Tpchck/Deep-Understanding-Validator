/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",],
  theme: {
    extend: {
      colors:{
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))"}
    },
  },
  plugins: [],
}

