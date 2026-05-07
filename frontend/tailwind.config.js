export default {
  content: [
    "./index.html",
    "./src*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-hover)',
        },
        border: {
          DEFAULT: 'var(--border)',
          glow: 'var(--border-glow)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          glow: 'var(--accent-glow)',
          cyan: 'var(--accent-cyan)',
          green: 'var(--accent-green)',
          yellow: 'var(--accent-yellow)',
          red: 'var(--accent-red)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          code: 'var(--text-code)',
        }
      },
      animation: {
        'spin-slow': 'spin 1s linear infinite',
        'pulse-slow': 'pulse-custom 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 150ms ease-out forwards',
        'slide-up': 'slideUp 150ms ease-out forwards',
        'slide-in-right': 'slideInRight 200ms ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        'pulse-custom': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: 0, transform: 'translateX(20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      }
    },
  },
  plugins: [],
}
