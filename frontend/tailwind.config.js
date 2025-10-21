/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f0f13',
          800: '#1a1a20',
          700: '#25252d',
          600: '#30303d',
          500: '#3c3c4d',
          400: '#4d4d5f',
          300: '#5f5f73',
          200: '#727287',
          100: '#85859b',
        },
        primary: {
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}