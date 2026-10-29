# tomaspetera.cz

Portfolio grafického designéra Tomáše Petery: https://tomaspetera.cz

Statický web v HTML, CSS a JavaScriptu bez knihoven a bez sestavování, hostovaný na GitHub Pages.

## Struktura

- `index.html`, `en.html`: úvodní stránka v češtině a angličtině
- `prace.html`, `work-en.html`: portfolio
- `dekuji.html`, `thanks-en.html`: stránka po odeslání poptávky
- `soukromi.html`, `privacy-en.html`: zásady zpracování osobních údajů
- `404.html`, `404-en.html`: stránka pro neexistující adresy
- `linkedin.html`, `linkedin-en.html`: vstupní adresy pro odkazy z LinkedInu
- `assets/css/style.css`: vzhled
- `assets/js/`: chování stránek, kvíz, ověření e-mailu ve formuláři a měření návštěvnosti
- `assets/fonts/`, `assets/img/`, `assets/dotaznik/`: písma, obrázky a dotazník ke stažení

## Technické poznámky

- Poptávkový formulář posílá data na vlastní endpoint (Cloudflare Worker) a před odesláním ověřuje e-mail kódem.
- Návštěvnost měří Umami Cloud bez cookies a bez osobních údajů.
- Odkazy na CSS a JS mají v adrese číslo verze (`?v=`), aby se po aktualizaci nenačetla stará verze z cache.

© Tomáš Petera
