# Portfolio

Personal site for my CV, in English and French. Plain HTML + CSS + a little JS, no build step.

- `index.html`: the content in English.
- `i18n.js`: the French translation, under the same `data-i18n` keys as the HTML. Change both together.
- `main.js`: language detection and switch, theme switch.
- `styles.css`: design (colors live in `:root` at the top).
- `assets/`: photo, CVs and project images (`projects/`).

## Language

The page picks the language in this order: `?lang=fr` or `?lang=en` in the URL, the visitor's
last choice, then the browser language (French if the browser is in French, English otherwise).
Use `https://juanca632.github.io/?lang=fr` on the French CV and `?lang=en` on the English one.

The "Download CV" button points to `assets/cv-fr.pdf` in both languages. When there is an
English CV, save it as `assets/cv-en.pdf` and change `hero.cvHref` in `index.html` (`href`).

## Preview locally

Open `index.html` in the browser, or run `python3 -m http.server` and go to http://localhost:8000.

## Publish on GitHub Pages (free)

1. Create a repo named `Juanca632.github.io` on GitHub.
2. Push this folder to it.
3. The site goes live at https://juanca632.github.io (Settings → Pages if it does not show up).
