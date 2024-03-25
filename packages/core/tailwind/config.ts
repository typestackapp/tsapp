import {Config} from 'tailwindcss'

export const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./next/app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    extend: {
      textColor: {
        skin: {
          base: 'var(--color-txt-base)',
          muted: 'var(--color-txt-muted)',
          // inverted: 'var(--color-text-inverted)',
        }
      }
    }
  },
  plugins: [],
}

module.exports = config