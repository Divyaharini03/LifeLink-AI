/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#0EA5E9", // Medical Blue
                secondary: "#22D3EE", // Cyan
                accent: "#F43F5E", // Emergency Red
                dark: "#0F172A", // Slate 900
                light: "#F8FAFC", // Slate 50
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
