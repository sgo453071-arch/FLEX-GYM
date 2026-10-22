# Flex Gym — website

A static site with 7 pages, plus a photo credits page. No framework or backend.
Plain HTML, CSS and JS, built for phones first. Black glassmorphic theme (hot red + neon violet glow), Barlow Condensed headings, floating glass tab bar on phones, about 220 KB on first load.

## Pages
- `index.html`: tap-to-build goal sentence, live doors countdown, zones, first-month planner, reviews
- `floor.html`: tappable floor map of the six zones, with a supplement picker
- `plans.html`: barbell plan builder (length + add-ons → live price → WhatsApp)
- `coaches.html`: head coach, flip cards for the team
- `results.html`: before/after drag sliders, swipeable review cards
- `check.html`: 4-step body check (BMI, calories, protein, water) that ends in a booking
- `visit.html`: address, contact, map (loads on tap), countdown, timings

## Preview
```
node serve.js
```
Then open http://localhost:5500.

## Editing
- **Phone, WhatsApp, email, map pin, opening hours:** change `SITE` at the top of `assets/js/main.js`.
- **Plan prices:** change `PRICES` in `assets/js/main.js` (and the add-on labels in `plans.html`).
- **Header, tab bar, footer and icons:** edit the files in `partials/`, then run `node build.js` to copy them into every page.
- **Photos:** real Flex Gym photos live in `assets/img/` (storefront, outdoor session, Sagar, logo), taken from their Google Maps listing and previous site. The hero and other photos are Unsplash photos listed on `credits.html`.
- **Speed rule:** only the top bar and tab bar use real blur on phones; cards fake the glass with gradients. Keep it that way.

## Before launch (needs client input)
- Real membership prices and offers.
- More real gym photos (equipment close-ups, members training) and a short video.
- Sagar's story, experience and certifications.
- Other coaches' names, photos and hours.
- 3–5 member before/after photos, with written permission (currently marked "Sample photo").
- 3–5 verbatim Google reviews with names (the cards are paraphrased highlights for now).
- Supplement list, brands and prices.
- Instagram / Facebook / YouTube links (footer, currently `#`).
- Final domain. Canonical URLs, `robots.txt` and `sitemap.xml` use flexgym.in for now.
- A higher-resolution logo file (the current one is 333 px wide from the old site).
