/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Poppins', 'system-ui', 'sans-serif'],
            },
            typography: {
                DEFAULT: {
                    css: {
                        color: '#1F2937',
                        maxWidth: 'none',
                        h1: {
                            fontFamily: 'Poppins, system-ui, sans-serif',
                            fontWeight: '700',
                            fontSize: '2.25rem',
                        },
                        h2: {
                            fontFamily: 'Poppins, system-ui, sans-serif',
                            fontWeight: '600',
                            fontSize: '1.875rem',
                        },
                        h3: {
                            fontFamily: 'Poppins, system-ui, sans-serif',
                            fontWeight: '600',
                            fontSize: '1.5rem',
                        },
                        table: {
                            width: '100%',
                            borderCollapse: 'separate',
                            borderSpacing: 0,
                            marginTop: '2em',
                            marginBottom: '2em',
                            lineHeight: '1.5',
                            fontSize: '0.875rem',
                        },
                        'thead th': {
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: '600',
                            color: '#111827',
                            backgroundColor: '#F9FAFB',
                            padding: '0.75rem 1rem',
                            borderBottom: '2px solid #E5E7EB',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                        },
                        'tbody td': {
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid #E5E7EB',
                            color: '#4B5563',
                            fontSize: '0.875rem',
                        },
                        'tbody tr': {
                            backgroundColor: '#FFFFFF',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                backgroundColor: '#F9FAFB',
                            },
                        },
                        'tbody tr:last-child td': {
                            borderBottom: 'none',
                        },
                        a: {
                            color: '#4F46E5',
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline',
                            },

                        },
                        strong: {
                            fontWeight: '600',
                            color: '#111827',
                        },
                        hr: {
                            borderColor: '#E5E7EB',
                            marginTop: '2em',
                            marginBottom: '2em',
                        },
                        pre: {
                            backgroundColor: '#F9FAFB',
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            fontSize: '0.875rem',
                        },
                        code: {
                            backgroundColor: '#F3F4F6',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                        },
                    },
                },
            },
            screens: {
                'xs': '475px',
                // ... other custom breakpoints if needed
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
