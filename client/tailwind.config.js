/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F5F0EA',
          300: '#EFE7DC',
          400: '#E4D7C5',
        },
        plum: {
          50: '#F9F5FA',
          100: '#F1E5F3',
          200: '#E1C7E5',
          300: '#C79BD0',
          400: '#A468B0',
          500: '#7E3E8C',
          600: '#642E70',
          700: '#4D2156',
          800: '#381640',
          900: '#260D2C',
          950: '#18071C',
        },
        lavender: {
          50: '#FAF7FF',
          100: '#F3EDFF',
          200: '#E7DCFF',
          300: '#D5C1FE',
          400: '#B99BFC',
          500: '#9B71F8',
          600: '#824DF0',
          700: '#6C36DC',
          800: '#5A2CB7',
          900: '#4A2594',
        },
        coral: {
          50: '#FFF5F5',
          100: '#FFE8E8',
          200: '#FFD3D3',
          300: '#FEB1B1',
          400: '#FC8080',
          500: '#F55757',
          600: '#E23838',
          700: '#BE2727',
          800: '#9C2424',
          900: '#812424',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 24px -2px rgba(56, 22, 64, 0.06), 0 2px 8px -1px rgba(56, 22, 64, 0.04)',
        'soft-lg': '0 12px 36px -4px rgba(56, 22, 64, 0.1), 0 4px 12px -2px rgba(56, 22, 64, 0.05)',
        'glow': '0 0 25px -5px rgba(155, 113, 248, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
