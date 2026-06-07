/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // 品牌色板：炭黑基调 + 电光蓝/赛博青点缀 + 金属银
        carbon: {
          DEFAULT: '#0A0A0B',
          900: '#0A0A0B',
          800: '#121214',
          700: '#1A1A1D',
          600: '#232327',
          500: '#2E2E33'
        },
        electric: {
          DEFAULT: '#2DE2FF',
          50: '#E6FBFF',
          100: '#CCF7FF',
          200: '#A3F0FF',
          300: '#79E8FF',
          400: '#5BEBFF',
          500: '#2DE2FF',
          600: '#00B8D9',
          700: '#0090AD'
        },
        cyber: {
          DEFAULT: '#7C5CFF',
          300: '#B7A6FF',
          400: '#9B82FF',
          500: '#7C5CFF',
          600: '#5C3DEB'
        },
        metalsilver: '#C8CCD4'
      },
      fontFamily: {
        sans: ['Inter', '"Source Han Sans SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Source Han Sans SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        widest2: '0.2em'
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(45,226,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,226,255,0.06) 1px, transparent 1px)',
        'hero-glow': 'radial-gradient(60% 60% at 50% 40%, rgba(45,226,255,0.16) 0%, rgba(124,92,255,0.08) 35%, rgba(10,10,11,0) 70%)',
        'neon-gradient': 'linear-gradient(120deg, #2DE2FF 0%, #7C5CFF 50%, #FF5CA8 100%)'
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite'
      }
    }
  },
  plugins: []
}
