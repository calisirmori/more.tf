/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Defining 53 column grid
        '53': 'repeat(53, minmax(0, 1fr))',
      },
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
        'warmscale-9':'#0A0909',
        'warmscale-85':'#0F0E0D',
        'warmscale-82':'#0C0B0A',
        'warmscale-8':'#141312',
        'warmscale-7':'#1F1D1B',
        'warmscale-6':'#292624',
        'warmscale-5':'#34302D',
        'warmscale-4':'#3F3A36',
        'warmscale-3':'#49433F',
        'warmscale-2':'#544D48',
        'warmscale-1':'#5E5751',
        'warmscale-0':'#69615A',
        'lightscale-9':'#736A64',
        'lightscale-8':'#7E746D',
        'lightscale-7':'#887E76',
        'lightscale-6':'#918880',
        'lightscale-5':'#A49B95',
        'lightscale-4':'#B6AFAA',
        'lightscale-3':'#C8C3BF',
        'lightscale-2':'#DAD7D4',
        'lightscale-1':'#ECEBE9',
        'lightscale-0':'#F5F5F4',
        'tf-orange':'#F08149',
        'tf-orange-dark':'#A35832',
        'tf-red':'#BD3B3B',
        'tf-red-dark':'#802828',
        'tf-red-dark2':'#4A1B1B',
        'tf-blue':'#395C78',
        'tf-blue-dark':'#273E51',
        'tf-blue-dark2':'#1B2731',
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
