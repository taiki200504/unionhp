/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: '#066ff2', // Updated blue color
        secondary: '#3B82F6', // 青色
        accent: '#ec4faf', // Updated pink accent
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '1rem',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #066ff2 0%, #ec4faf 100%)',
      },
    },
  },
  plugins: [],
} 