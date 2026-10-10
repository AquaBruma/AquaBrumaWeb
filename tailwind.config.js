/** Configuración de Tailwind (v3). Para regenerar el diseño: ver "Cómo regenerar tailwind.css" en el README. */
module.exports = {
  content: ['./index.html', './catalogo-data.js', './cookies.js', './i18n.js'],
  theme: {
    extend: {
      colors: {
        // Estos colores cambian con el tema (variables --c-* en el <style> de index.html)
        ink:   'rgb(var(--c-ink) / <alpha-value>)',
        ink2:  'rgb(var(--c-ink2) / <alpha-value>)',
        ink3:  'rgb(var(--c-ink3) / <alpha-value>)',
        sky:   'rgb(var(--c-sky) / <alpha-value>)',
        mist:  'rgb(var(--c-mist) / <alpha-value>)',
        cream: 'rgb(var(--c-cream) / <alpha-value>)',
        ocean: '#0e5586',
        sand:  '#c9baa3',
      },
      fontFamily: {
        sans: ['"Figtree"', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '.24em',
      },
    },
  },
};
