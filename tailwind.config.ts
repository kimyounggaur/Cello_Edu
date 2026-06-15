import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans KR"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif KR"', 'serif'],
      },
      colors: {
        ebony: '#1b1712',
        ivory: '#f4ecd8',
        brass: '#c9a24b',
      },
    },
  },
  plugins: [],
} satisfies Config;
