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
        ivory: {
          50: '#FDFCF7',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EAE4DC',
        },
        forest: {
          950: '#0C1B13',
          900: '#14281D',
          800: '#1C3A2B',
          700: '#244D39',
          600: '#2D5E46',
          500: '#3D7B5C',
          400: '#5A9678',
          100: '#E4EFE8',
          50: '#F2F7F4',
        },
        sage: {
          50: '#F4F7F5',
          100: '#E7ECE8',
          200: '#D3DDD5',
          300: '#B6C7BA',
          400: '#94A999',
          500: '#758D7B',
          600: '#5C7162',
        },
        sand: {
          50: '#FAF9F6',
          100: '#F5F3EC',
          200: '#E9E6DC',
          300: '#D9D5C8',
          400: '#A9A494',
          500: '#7A7566',
        },
        status: {
          applied: '#0D9488',
          interview: '#D97706',
          offer: '#16A34A',
          rejected: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(20, 40, 29, 0.04), 0 4px 16px -4px rgba(20, 40, 29, 0.05)',
        'card': '0 1px 3px 0 rgba(20, 40, 29, 0.03), 0 8px 24px -4px rgba(20, 40, 29, 0.06)',
        'card-hover': '0 18px 38px -8px rgba(20, 40, 29, 0.11), 0 4px 14px -2px rgba(20, 40, 29, 0.05)',
        'modal': '0 25px 60px -15px rgba(20, 40, 29, 0.22)',
        'pressed': 'inset 0 2px 4px rgba(20, 40, 29, 0.06)',
        'elevated': '0 10px 30px -5px rgba(28, 58, 43, 0.08), 0 4px 10px -2px rgba(28, 58, 43, 0.04)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-gentle': 'floatGentle 6s ease-in-out infinite',
      },
      keyframes: {
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
