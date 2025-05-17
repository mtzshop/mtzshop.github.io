module.exports = {
  content: [
    "./src/**/*.{html,css,js,ts,jsx,tsx}", 
    "./*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
            serifcustom: 'Lora',
            inter: 'Manrope',
            strike: 'Protest Strike'
      },
      colors: {
        'malachite': {
            '50': '#e7ffe4',
            '100': '#c9ffc5',
            '200': '#97ff92',
            '300': '#56ff53',
            '400': '#20fb23',
            '500': '#00de07',
            '600': '#00b50b',
            '700': '#02890b',
            '800': '#086c10',
            '900': '#0c5b13',
            '950': '#003306',
        },
      },
    },
  },
  plugins: [],
}