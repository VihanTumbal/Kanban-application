/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        background: "#1E1E2F", // Main app background
        card: "#2A2A3B", // Card/List background
        primary: {
          500: "#6366F1", // Primary buttons, highlights
          600: "#818CF8", // Primary hover
        },
        accent: "#10B981", // Green accent color (was yellow)
        success: "#22C55E", // Success actions
        danger: "#EF4444", // Delete/error
        textPrimary: "#F9FAFB", // Main text
        textSecondary: "#9CA3AF", // Secondary text
        border: "#3F3F46", // Borders/lines
        hover: "#3B3B4F", // Hover background
        scrollTrack: "#2A2A3B", // Scrollbar track
        scrollThumb: "#4B5563", // Scrollbar thumb
        
        // Task status colors (updated for dark theme)
        todo: "#38BDF8", // Sky Blue
        inProgress: "#10B981", // Green (was amber)
        done: "#22C55E", // Success green
        overdue: "#EF4444", // Danger red
      },
    },
  },
  plugins: [],
};
