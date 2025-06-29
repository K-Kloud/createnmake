
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Futuristic color palette
        background: "#0F0F1A", // Deep night blue
        foreground: "#FFFFFF", // High contrast white
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.05)", // Glass layer
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "rgba(15, 15, 26, 0.9)", // Dark with transparency
          foreground: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#00E6A0", // Futuristic mint green
          hover: "#00B383", // Darker hover version
          foreground: "#0F0F1A", // Dark text on green bg
        },
        secondary: {
          DEFAULT: "rgba(255, 255, 255, 0.1)", // Glass secondary
          foreground: "#C0C0C0", // Subtle grey
        },
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          foreground: "#C0C0C0",
        },
        accent: {
          DEFAULT: "#00FFFF", // Electric cyan
          foreground: "#0F0F1A",
        },
        destructive: {
          DEFAULT: "#FF5C5C", // Neon red-orange
          foreground: "#FFFFFF",
        },
        border: "rgba(255, 255, 255, 0.1)",
        input: "rgba(255, 255, 255, 0.05)",
        ring: "#00FFFF", // Electric cyan for focus rings
        // Custom futuristic colors
        neon: {
          cyan: "#00FFFF",
          purple: "#9D00FF",
          green: "#00E6A0",
          red: "#FF5C5C",
        },
        glass: "rgba(255, 255, 255, 0.05)",
      },
      fontFamily: {
        // Futuristic typography
        'orbitron': ['Orbitron', 'monospace'], // Headings
        'rajdhani': ['Rajdhani', 'sans-serif'], // Subheadings
        'inter': ['Inter', 'sans-serif'], // Body text
        'monoton': ['Monoton', 'cursive'], // Accent/Hero text
        'audiowide': ['Audiowide', 'cursive'], // Alternative accent
        sans: ['Inter', 'system-ui', 'sans-serif'], // Default
      },
      fontSize: {
        'hero': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 255, 255, 0.5)',
        'neon-green': '0 0 20px rgba(0, 230, 160, 0.5)',
        'neon-purple': '0 0 20px rgba(157, 0, 255, 0.5)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px #00FFFF, 0 0 10px #00FFFF" },
          "50%": { boxShadow: "0 0 20px #00FFFF, 0 0 30px #00FFFF" },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
