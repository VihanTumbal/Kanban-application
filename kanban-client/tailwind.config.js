/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#4F46E5", // Primary Indigo Blue
          600: "#4338ca",
          700: "#3730a3",
          800: "#312e81",
          900: "#1e1b4b",
        },
        secondary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10B981", // Secondary Emerald Green
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        background: "#F9FAFB", // Light Gray
        card: "#FFFFFF", // White
        textPrimary: "#111827", // Charcoal
        textSecondary: "#6B7280", // Gray
        // Task status colors
        todo: "#38BDF8", // Sky Blue
        inProgress: "#F59E0B", // Amber
        done: "#84CC16", // Lime Green
        highPriority: "#F43F5E", // Rose Red
      },
    },
  },
  plugins: [],
};
