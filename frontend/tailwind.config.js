/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#050508',
          900: '#09090F',
          850: '#11111A',
          800: '#171126',
          700: '#24143D',
        },
        purple: {
          900: '#3D1B69',
          700: '#6D28D9',
          600: '#8B5CF6',
          400: '#A78BFA',
          100: '#EDE9FE',
        },
        status: {
          worst: '#EF4444',
          average: '#F59E0B',
          good: '#10B981',
          best: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'purple-glow': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'purple-card': '0 10px 30px -10px rgba(23, 17, 38, 0.8)',
      }
    },
  },
  plugins: [],
}
