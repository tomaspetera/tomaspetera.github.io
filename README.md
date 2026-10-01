# tomaspetera.cz

Portfolio grafického designéra Tomáše Petery. Statický web bez databáze a bez redakčního systému, běží zdarma na GitHub Pages.

Web: https://tomaspetera.cz

## Co je kde

Stránky leží v kořeni, všechno ostatní v assets.

index.html — jednostránkovka: hero, o mně, práce, služby, proces, ceník, poptávka

prace.html — portfolio, 18 projektů

dekuji.html — stránka, na kterou se návštěvník dostane po odeslání poptávky

assets/css/style.css — veškerý vzhled webu

assets/js/main.js — animace, filtr portfolia, lightbox, obsluha formuláře

assets/fonts/ — písma Space Grotesk, Inter a JetBrains Mono, hostovaná přímo u nás (ne na Googlu). Jsou zúžená na české znaky a používané váhy. Nemaž je, web na nich stojí.

assets/img/ — obrázky projektů, každý ve velké (1600 px) a malé (-800) verzi. Podsložka ring jsou desky 3D prstence na úvodu, podsložka loga jsou loga klientů.

assets/dotaznik/ — dotazník značky ke stažení, ve verzi DOCX i PDF. Když ho budeš měnit, nahraj obě — PDF se z Wordu udělá přes Soubor, Uložit jako, PDF.

## Tohle nikdy nemaž a nepřesouvej

Každý z těchto souborů drží něco, co se špatně obnovuje. Všechny musí zůstat v kořeni.

CNAME — napojení domény tomaspetera.cz. Bez něj web spadne zpátky na tomaspetera.github.io

BingSiteAuth.xml — ověření vlastnictví u Bingu

seznam-wmt-....txt — ověření vlastnictví u Seznamu

sitemap.xml a robots.txt — odeslané do Googlu i Bingu na těchto adresách

favicon.ico — prohlížeče si ho berou přímo z kořene

og-cover.jpg — náhledový obrázek při sdílení odkazu. LinkedIn a Facebook mají tuhle adresu nacachovanou.

Ze stejného důvodu nepřesouvej ani index.html a prace.html. Google je má zaindexované a GitHub Pages neumí přesměrování — starý odkaz by už nikdy nefungoval.

## Reference

Sekce na reference je v index.html hotová, ale zakomentovaná, aby se na web nedostaly vymyšlené citace. Až budeš mít aspoň dvě skutečné, postup je popsaný v komentáři přímo nad tou sekcí — přepsat texty, smazat dvě řádky komentáře, přidat odkaz do boční navigace a přečíslovat sekce pod ní.

Jak o citaci požádat, ať za něco stojí: nechtěj "napiš mi referenci", z toho vznikne obecná chvála. Zeptej se, co klient řešil předtím, co se změnilo potom a co by překvapilo někoho dalšího. Z odpovědí vyber dvě tři věty a nech si je odsouhlasit.

## Ceny v ceníku

Ceny jsou záměrně rozmazané a ukážou se až po najetí myší na kartu (na mobilu po klepnutí na cenu, na pár sekund). Řídí to CSS u .plan__price-val a krátký skript v main.js. Pozor na pravidla typu filter:none s !important na .plan__price-val nebo display:none na .plan__price-hint — cenu by odkryla napořád. Jednou se to při aktualizaci stalo.

## Verze CSS a JS

V index.html, prace.html a dekuji.html jsou odkazy na style.css a main.js s číslem verze (?v=20261002). GitHub Pages posílá soubory s 10minutovou cache, takže bez toho by návštěvník po aktualizaci chvíli viděl nový HTML se starým CSS. Kdykoli změníš style.css nebo main.js, přepiš to číslo ve všech třech souborech (třeba na dnešní datum).

## Pás klientů

Značky v pásu jedou záměrně textem, ne logy. Loga mají různé váhy a barvy, vedle sebe působí rozdrbaně a u větších značek by bylo potřeba řešit souhlas. Kdybys to chtěl přesto zkusit, návod je v assets/img/loga/CTI-ME.txt.

## Jak web aktualizovat

Nahrávací stránka určuje cílovou složku. Do kořene: Add file, Upload files. Do assets/js: otevři nejdřív tu složku a teprve tam Add file, Upload files. Soubor se stejným názvem se přepíše.

Rychlejší cesta: na nahrávací stránce v kořeni přetáhni najednou celou složku assets i jednotlivé soubory z kořene. GitHub zachová podsložky. Při jednom nahrání je limit 100 souborů.

Změny se na webu projeví zhruba do minuty.

## Kde se co spravuje

Doména a DNS — Wedos, zákaznické centrum

Poptávkový formulář — FormSubmit.co, poptávky chodí na petera.tomas11@gmail.com

Vyhledávače — Google Search Console, Bing Webmaster Tools, Seznam Webmaster

Firemní profil — business.google.com
