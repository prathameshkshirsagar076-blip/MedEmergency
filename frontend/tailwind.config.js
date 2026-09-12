/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F5F7',
          dark: '#000000',
          'dark-secondary': '#161617',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1D1D1F',
        },
        ink: {
          DEFAULT: '#1D1D1F',
          dark: '#F5F5F7',
        },
        muted: {
          DEFAULT: '#6E6E73',
          dark: '#86868B',
        },
        accent: {
          DEFAULT: '#0071E3',
          hover: '#0077ED',
          dark: '#2997FF',
        },
        emergency: {
          DEFAULT: '#FF3B30',
          hover: '#E03228',
          dark: '#FF453A',
        },
        success: {
          DEFAULT: '#34C759',
          hover: '#2EAF4E',
          dark: '#30D158',
        },
        divider: {
          DEFAULT: '#D2D2D7',
          dark: '#333336',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          'system-ui',
          'sans-serif',
        ],
      },
      letterSpacing: {
        'tight-heading': '-0.025em',
        'tight-hero': '-0.035em',
      },
      borderRadius: {
        DEFAULT: '10px',
        'apple-sm': '12px',
        'apple': '18px',
        'apple-lg': '22px',
        'apple-pill': '9999px',
      },
      boxShadow: {
        'apple-subtle': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'apple-card': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'apple-modal': '0 20px 40px rgba(0, 0, 0, 0.12)',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.28, 0.11, 0.32, 1)',
      },
      animation: {
        'pulse-apple': 'pulseApple 3s cubic-bezier(0.28, 0.11, 0.32, 1) infinite',
        'fade-in': 'fadeIn 250ms cubic-bezier(0.28, 0.11, 0.32, 1) forwards',
        'scale-in': 'scaleIn 250ms cubic-bezier(0.28, 0.11, 0.32, 1) forwards',
        'check-draw': 'checkDraw 500ms cubic-bezier(0.28, 0.11, 0.32, 1) forwards',
      },
      keyframes: {
        pulseApple: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '50%': { opacity: '0.35' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        checkDraw: {
          '0%': { strokeDashoffset: '50' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
};
