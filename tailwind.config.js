/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{pug,js}'],
  theme: {
    extend: {}
  },
  plugins: [require('tailwind-scrollbar')]
}
