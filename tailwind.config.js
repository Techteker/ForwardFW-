/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pri: { DEFAULT: '#75A815', dark: '#4F7A0A' },
        lime: '#89C124',
        mint: '#F1F7E7',
        surface: '#F5F6F8',
        line: '#E8EAEE',
        ink: '#1C1E21',
        slate: '#6B7280',
        gold: '#F3B94F',
        danger: '#D64545',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'] },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(18px)' }, '100%': { opacity: '1', transform: 'none' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: { 'fade-up': 'fade-up .7s cubic-bezier(.2,.7,.2,1) both', float: 'float 7s ease-in-out infinite', shimmer: 'shimmer 2.4s linear infinite', marquee: 'marquee 40s linear infinite' },
      boxShadow: { card: '0 4px 12px rgba(28,30,33,0.06)' },
      borderRadius: { card: '16px', btn: '14px' },
    },
  },
  plugins: [],
};