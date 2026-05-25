export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Poppins', 'Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        primary: '#073B5C',
        'primary-dark': '#052A42',
        secondary: '#18AEEA',
        'cyan-soft': '#EAF8FF',
        bg: '#F6FBFF',
        surface: '#FFFFFF',
        border: '#CDEEFF',
        text: '#073B5C',
        muted: '#64748B',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626'
      },
      boxShadow: {
        subtle: '0 8px 24px rgba(7, 59, 92, 0.06)',
        soft: '0 18px 45px rgba(7, 59, 92, 0.10)'
      }
    }
  },
  plugins: []
}
