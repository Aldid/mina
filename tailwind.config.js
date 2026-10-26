/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mina: {
          50: '#FDFCFB',
          100: '#F9F6F0',
          200: '#F2ECE1',
          300: '#E4D8C5',
          400: '#CDBCA1',
          500: '#B09B7A',
          600: '#8E7958',
          700: '#6E5C41',
          800: '#4D402D',
          900: '#2E251A',
        },
        petal: {
          50: '#FFF5F6',
          100: '#FFE4E8',
          200: '#FECDD6',
          300: '#FDA4B5',
          400: '#FB718D',
          500: '#F43F68',
          600: '#E11D51',
          700: '#BE1242',
        },
        sage: {
          50: '#F4F7F5',
          100: '#E6ECE8',
          200: '#CEDAD2',
          300: '#AEC1B4',
          400: '#8BA594',
          500: '#6B8B75',
          600: '#526D5B',
          700: '#3D5244',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      animation: {
        'scan': 'scan 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
};
