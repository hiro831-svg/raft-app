/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Craftsman palette – warm dark brown base with gold accents
        brand: {
          50:  '#FFF8F0',
          100: '#FFE8CC',
          200: '#FFCC99',
          300: '#FFAA55',
          400: '#F08020',
          500: '#C05A00',  // primary CTA
          600: '#8C3D00',
          700: '#5C2500',
          800: '#3A1500',
          900: '#1A0A00',  // deep background
        },
        gold: {
          300: '#FFD966',
          400: '#FFC107',
          500: '#D4A017',  // artisan gold accent
          600: '#A67C00',
        },
        neutral: {
          50:  '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        success: '#16A34A',
        warning: '#CA8A04',
        error:   '#DC2626',
      },
      fontFamily: {
        sans:  ['System'],
        serif: ['Georgia'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
