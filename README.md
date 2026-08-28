# tomaspetera.cz

Portfolio grafického designéra Tomáše Petery. Statický web bez databáze a bez redakčního systému, běží zdarma na GitHub Pages.

Web: https://tomaspetera.cz

## Co je kde

Stránky leží v kořeni, všechno ostatní v assets.

index.html — jednostránkovka: hero, o mně, práce, služby, proces, ceník, poptávka

prace.html — portfolio, 13 projektů

dekuji.html — stránka, na kterou se návštěvník dostane po odeslání poptávky

assets/css/style.css — veškerý vzhled webu

assets/js/main.js — animace, filtr portfolia, lightbox, obsluha formuláře

assets/img/ — obrázky projektů. Podsložka ring jsou desky 3D prstence na úvodu, podsložka loga jsou loga klientů.

assets/dotaznik/ — dotazník značky ke stažení

## Tohle nikdy nemaž a nepřesouvej

Každý z těchto souborů drží něco, co se špatně obnovuje. Všechny musí zůstat v kořeni.

CNAME — napojení domény tomaspetera.cz. Bez něj web spadne zpátky na tomaspetera.github.io

BingSiteAuth.xml — ověření vlastnictví u Bingu

seznam-wmt-....txt — ověření vlastnictví u Seznamu

sitemap.xml a robots.txt — odeslané do Googlu i Bingu na těchto adresách

favicon.ico — prohlížeče si ho berou přímo z kořene

og-cover.jpg — náhledový obrázek při sdílení odkazu. LinkedIn a Facebook mají tuhle adresu nacachovanou.

Ze stejného důvodu nepřesouvej ani index.html a prace.html. Google je má zaindexované a GitHub Pages neumí přesměrování — starý odkaz by už nikdy nefungoval.

## Jak web aktualizovat

Nahrávací stránka určuje cílovou složku. Do kořene: Add file, Upload files. Do assets/js: otevři nejdřív tu složku a teprve tam Add file, Upload files. Soubor se stejným názvem se přepíše.

Změny se na webu projeví zhruba do minuty.

## Kde se co spravuje

Doména a DNS — Wedos, zákaznické centrum

Poptávkový formulář — FormSubmit.co, poptávky chodí na petera.tomas11@gmail.com

Vyhledávače — Google Search Console, Bing Webmaster Tools, Seznam Webmaster

Firemní profil — business.google.com
