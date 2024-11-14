const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ['./src/**/*.html', './src/**/*.vue', './src/**/*.tsx', './src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#272f48',
          900: '#20172E',
          800: '#211C37',
          700: '#222340',
          600: '#272f48',
          500: '#435061',
          400: '#60707A',
          300: '#7C8E92',
          200: '#99AAAB',
          100: '#B6C3C1',
          50: '#D3DBD8',
        },
      },
      spacing: {
        17: '4.25rem',
        30: '7.5rem',
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        code: '0.8125rem',
      },
      maxWidth: {
        '3/4': '75%',
      },
      scale: {
        '-1': '-1',
      },
    },
  },
  variants: {
    backgroundColor: ['disabled'],
    borderColor: ['disabled'],
    cursor: ['disabled'],
    textColor: ['disabled'],
    backgroundOpacity: ['disabled'],
  },
  plugins: [],
};
