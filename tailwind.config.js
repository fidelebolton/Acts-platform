/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Potter's Wheel / KGM design system
        navy: {
          DEFAULT: '#1B2A4A',
          dark: '#13203B',
          light: '#2A3D60',
        },
        gold: {
          DEFAULT: '#C9A84C',
          dark: '#A88A38',
          light: '#E0C26B',
        },
        cream: {
          DEFAULT: '#FDF8F0',
          dark: '#F3EBDB',
          warm: '#F8EDD6',
        },
        parchment: '#F5EBD3',
        ink: '#2A2620',
      },
      fontFamily: {
        heading: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        body: ['Calibri', 'Segoe UI', 'system-ui', 'sans-serif'],
        scripture: ['Cardo', 'Georgia', 'serif'],
      },
      fontSize: {
        'scripture': ['1.0625rem', { lineHeight: '1.75rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
