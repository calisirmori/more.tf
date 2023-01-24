/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tf2orange': '#F08149',
        'grayscale-9': '#0F1012',
        'grayscale-8': '#15171A',
        'grayscale-7': '#202225',
        'grayscale-6': '#2C2E30',
        'grayscale-5': '#36383A',
        'grayscale-4': '#424346',
        'grayscale-3': '#595A5C',
        'grayscale-2': '#6F7072',
        'grayscale-1': '#9B9C9D',
        'grayscale-0': '#CFCFCF',
      }
    },
    fontFamily: {
        cantarell: ['Cantarell', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        quicksand: ['Quicksand', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        robotomono: ['Roboto Mono', 'monospace'],
        ubuntu: ['Ubuntu', 'sans-serif']
    }
  },
  plugins: [],
}
