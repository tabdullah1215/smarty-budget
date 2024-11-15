/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",  // This tells Tailwind to look for classes in all .js and .jsx files in src/
    "./public/index.html"    // This includes your index.html file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

