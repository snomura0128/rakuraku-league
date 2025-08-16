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
        primary: {
          DEFAULT: '#DE483A',
          light: '#FF6B5C',
          dark: '#B73E32',
        },
        secondary: {
          DEFAULT: '#4A90E2',
          light: '#6BA3E8',
          dark: '#3A7BC8',
        },
        accent: {
          green: '#7ED321',
          orange: '#F5A623',
          yellow: '#F8E71C',
        },
        background: {
          primary: '#FEFEFE',
          secondary: '#F8F9FA',
          tertiary: '#F1F3F4',
        },
        text: {
          primary: '#202124',
          secondary: '#5F6368',
          tertiary: '#80868B',
        },
        border: {
          light: '#E8EAED',
          medium: '#DADCE0',
          dark: '#BDC1C6',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Inter', 'Hiragino Sans', 'Yu Gothic', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.25rem',
        'base': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}