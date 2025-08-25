/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'gradient-shift': 'gradient-shift 15s ease-in-out infinite',
        'shimmer': 'shimmer 3s infinite',
        'text-glow': 'text-glow 3s ease-in-out infinite alternate',
        'fade-in-up': 'fade-in-up 1s ease-out',
        'modal-slide-in': 'modal-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'shimmer': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        'text-glow': {
          'from': { filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))' },
          'to': { filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.6))' },
        },
        'fade-in-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'modal-slide-in': {
          'from': {
            opacity: '0',
            transform: 'translate(-50%, -50%) scale(0.8)',
          },
          'to': {
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
