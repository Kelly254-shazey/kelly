/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pink-rose': '#F78FB3',
        'royal-blue': '#1877F2',
        'lavender': '#C7A0E4',
        'charcoal': '#333333',
      },
      fontFamily: {
        'sans': ['Poppins', 'Nunito', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-romantic': 'linear-gradient(135deg, #F78FB3 0%, #C7A0E4 50%, #1877F2 100%)',
      }
    },
  },
  plugins: [],
}