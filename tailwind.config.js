/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0f1e3d',
          900: '#0a1730',
          800: '#0f1e3d',
          700: '#162752',
          600: '#243a73',
        },
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcd9ff',
          300: '#8ec1ff',
          400: '#5a9eff',
          500: '#3380ff',
          600: '#1f63f0',
          700: '#1a4fd0',
          800: '#1b44a8',
          900: '#1c3b86',
        },
        accent: {
          400: '#34d6e6',
          500: '#16b8cf',
          600: '#0e94aa',
        },
        success: {
          500: '#16a34a',
          600: '#15803d',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,30,61,0.04), 0 6px 24px rgba(15,30,61,0.06)',
        pop: '0 10px 40px rgba(15,30,61,0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
