/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd2ff',
          300: '#8eb4ff',
          400: '#598bff',
          500: '#3366ff',
          600: '#1f4fed',
          700: '#1a3fd4',
          800: '#1c38ab',
          900: '#1d3587',
          950: '#152055',
        },
        surface: {
          light: '#ffffff',
          'light-subtle': '#f8fafc',
          'light-muted': '#f1f5f9',
          dark: '#0f1117',
          'dark-subtle': '#161922',
          'dark-muted': '#1c2030',
          'dark-border': '#252a3a',
        },
      },
      boxShadow: {
        'sm-soft': '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'md-soft': '0 4px 12px -2px rgb(0 0 0 / 0.08)',
        'lg-soft': '0 12px 32px -8px rgb(0 0 0 / 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
