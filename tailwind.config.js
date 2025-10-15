/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // Menggunakan preferensi dark mode dari browser
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#019f63',
          dark: '#019f63',
          light: '#019f63',
        },
        // Dark Mode Colors
        'gray-900': '#111827', // Background dark
        'gray-800': '#1F2937', // Surface dark
        'gray-700': '#374151', // Border dark
        // Light Mode Colors  
        'surface': '#F8F9FA',
        // Status Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
    },
  },
  plugins: [],
}