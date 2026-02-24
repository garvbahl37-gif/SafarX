/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ocean: {
                    DEFAULT: '#0066FF',
                    light: '#3d8bff',
                    dark: '#0052cc',
                },
                teal: {
                    DEFAULT: '#00E5FF',
                    light: '#6effff',
                },
                violet: {
                    DEFAULT: '#8B5CF6',
                    light: '#a78bfa',
                },
                coral: {
                    DEFAULT: '#FF6B6B',
                    light: '#ff9999',
                },
                gold: {
                    DEFAULT: '#FFD700',
                    light: '#ffe44d',
                },
                emerald: {
                    DEFAULT: '#10B981',
                },
                rose: {
                    DEFAULT: '#F472B6',
                },
                slate: {
                    950: '#020617',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Cal Sans', 'Satoshi', 'Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite',
                'gradient': 'gradient-shift 8s ease infinite',
                'spin-slow': 'spin 20s linear infinite',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow-ocean': '0 0 40px rgba(0, 102, 255, 0.3)',
                'glow-teal': '0 0 40px rgba(0, 229, 255, 0.3)',
                'glow-violet': '0 0 40px rgba(139, 92, 246, 0.3)',
            },
        },
    },
    plugins: [],
}