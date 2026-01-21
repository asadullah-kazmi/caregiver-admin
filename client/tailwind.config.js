/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Neutral Earth Tone Palette
        'primary': '#9A8C84', // Muted Grey-Brown
        'primary-light': '#C2BAB1', // Cool Grey-Beige
        'primary-dark': '#776E67', // Dark Grey-Brown
        // Accent Colors
        'accent': '#D6BF99', // Warm Tan
        'error': '#E74C3C', // Error Red
        // Background Colors
        'background-light': '#F0E5D5', // Cream Beige
        'surface-white': '#FFFFFF', // Surface White
        'secondary-container': '#E8DDCD', // Light Warm Tan
        // Text Colors
        'text-primary': '#776E67', // Dark Grey-Brown
        'text-secondary': '#9A8C84', // Muted Grey-Brown
        // Legacy support (for backward compatibility during migration)
        'primary-blue': '#9A8C84',
        'primary-blue-light': '#C2BAB1',
        'accent-orange': '#D6BF99',
        'accent-green': '#9A8C84',
      },
      borderRadius: {
        'card': '16px',
        'input': '12px',
        'chip': '20px',
        'dialog': '20px',
      },
      fontSize: {
        'display-lg': '32px',
        'display-md': '28px',
        'display-sm': '24px',
        'headline-lg': '22px',
        'headline-md': '20px',
        'headline-sm': '18px',
        'body-lg': '18px',
        'body-md': '16px',
        'body-sm': '14px',
      },
      spacing: {
        'button-h': '40px',
        'button-v': '20px',
        'input-h': '24px',
        'input-v': '20px',
      },
    },
  },
  plugins: [],
}
