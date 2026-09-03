/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Peacock & Gold" palette — deep teal ink, warm ivory, antique gold
        ink: {
          950: "#061412", // page base
          900: "#0A1D1A", // elevated panels
          850: "#0D231F", // section alt
          800: "#102822", // cards
          700: "#17352D", // hover / raised
        },
        ivory: {
          DEFAULT: "#F2EFE6",
          muted: "rgba(242, 239, 230, 0.62)",
          faint: "rgba(242, 239, 230, 0.38)",
        },
        // Antique gold — primary accent (token name kept for compatibility)
        saffron: {
          DEFAULT: "#D4A843",
          bright: "#E5BE5C",
          deep: "#A67E2B",
          50: "#FBF7EA",
          100: "#F5ECCB",
          200: "#EDDCA0",
          300: "#E5BE5C",
          400: "#D4A843",
          500: "#C29532",
          600: "#A67E2B",
          700: "#856322",
          800: "#62491A",
          900: "#403011",
        },
        // Jade — secondary cool tone (used sparingly)
        horizon: {
          DEFAULT: "#2E8B74",
          bright: "#3FA98E",
          deep: "#1F5F4F",
        },
        // Kept for compatibility with existing pages during migration
        primary: {
          DEFAULT: "#D4A843",
          50: "#FBF7EA",
          100: "#F5ECCB",
          200: "#EDDCA0",
          300: "#E5BE5C",
          400: "#D4A843",
          500: "#C29532",
          600: "#A67E2B",
          700: "#856322",
          800: "#62491A",
          900: "#403011",
        },
        accent: {
          DEFAULT: "#2E8B74",
          50: "#EDF7F4",
          100: "#D3EDE5",
          200: "#A8DCCC",
          300: "#74C3AD",
          400: "#4AA98F",
          500: "#2E8B74",
          600: "#23705D",
          700: "#1B5648",
          800: "#133D33",
          900: "#0C2620",
        },
        success: {
          DEFAULT: "#4CAF7D",
          50: "#EDF7F2",
          100: "#D3EDE0",
          200: "#A8DBC2",
          300: "#7CC8A3",
          400: "#4CAF7D",
          500: "#3B9367",
          600: "#2E7351",
          700: "#22553C",
          800: "#173928",
          900: "#0D2016",
        },
        warm: {
          DEFAULT: "#D4A843",
          50: "#FBF7EA",
          100: "#F5ECCB",
          200: "#EDDCA0",
          300: "#E5BE5C",
          400: "#D4A843",
          500: "#C29532",
          600: "#A67E2B",
          700: "#856322",
          800: "#62491A",
        },
        error: "#E05252",
        /* Emergency red. Deliberately the only warm-cool break in Peacock &
           Gold, and reserved for things that are actually urgent — the SOS
           beacon, emergency numbers, destructive actions. Kept as one token so
           red means one thing rather than appearing in a dozen shades. */
        danger: {
          DEFAULT: "#E05252",
          bright: "#F0706F",
          deep: "#8E2C2C",
          900: "#4A1717",
          950: "#2A0F0F",
        },
        warning: "#D4A843",
      },

      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Schibsted Grotesk", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        data: ["Space Grotesk", "JetBrains Mono", "monospace"],
        mono: ["Space Grotesk", "JetBrains Mono", "monospace"],
        // Legacy aliases still referenced by inner pages
        heritage: ["Fraunces", "Georgia", "serif"],
        cinzel: ["Fraunces", "Georgia", "serif"],
      },

      letterSpacing: {
        eyebrow: "0.32em",
      },

      backgroundImage: {
        "gradient-travel": "linear-gradient(135deg, #D4A843 0%, #A67E2B 100%)",
        "gradient-subtle": "linear-gradient(180deg, rgba(212, 168, 67, 0.06) 0%, rgba(46, 139, 116, 0.05) 100%)",
        "gradient-dark": "linear-gradient(180deg, #0A1D1A 0%, #061412 100%)",
      },

      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-down": "slideDown 0.6s ease-out",
        "scale-in": "scaleIn 0.5s ease-out",
        "bounce-slow": "bounceSlow 3s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "route-dash": "routeDash 24s linear infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        routeDash: {
          "0%": { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "-240" },
        },
      },

      spacing: {
        /* Tailwind's half-steps stop at 3.5, so p-4.5 in the emergency
           directory generated no rule at all and those cards rendered with
           zero padding — every number pill and badge sat flush on the border.
           Naming it here is what the markup already assumed. */
        4.5: "1.125rem",
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },

      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
        md: "0 4px 10px -2px rgba(0, 0, 0, 0.35)",
        lg: "0 12px 24px -6px rgba(0, 0, 0, 0.45)",
        xl: "0 20px 40px -8px rgba(0, 0, 0, 0.5)",
        "2xl": "0 32px 64px -16px rgba(0, 0, 0, 0.55)",
        card: "0 8px 24px rgba(0, 0, 0, 0.35)",
        "card-hover": "0 20px 48px rgba(0, 0, 0, 0.5)",
        glow: "0 0 24px rgba(212, 168, 67, 0.35)",
      },
    },
  },

  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};
