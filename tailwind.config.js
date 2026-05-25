/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#165DFF', 50: '#E8F0FF', 100: '#C5D7FF', 200: '#9DBFFF', 300: '#75A6FF', 400: '#4D8DFF', 500: '#165DFF', 600: '#124AD1', 700: '#0E38A3', 800: '#0A2675', 900: '#061447' },
        accent: { DEFAULT: '#FF8C00', light: '#FFA940', dark: '#D47400' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { 'card': '12px' },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
