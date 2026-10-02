# tomaspetera.cz

Portfolio grafického designéra Tomáše Petery. Statický web bez databáze a bez redakčního systému, běží zdarma na GitHub Pages.

Web: https://tomaspetera.cz

## Co je kde

Stránky leží v kořeni, všechno ostatní v assets.

index.html — jednostránkovka: hero, o mně, práce, služby, proces, ceník, poptávka

prace.html — portfolio, 22 projektů

dekuji.html — stránka, na kterou se návštěvník dostane po odeslání poptávky

soukromi.html — zásady zpracování osobních údajů (formulář, měření návštěvnosti). Odkaz je v patičce všech stránek a pod formulářem.

404.html — stránka pro neexistující adresy. GitHub Pages ji zobrazí sám. Musí mít všechny cesty absolutní (začínají lomítkem), protože se zobrazuje na jakékoli hloubce adresy, a proto ji nepřesouvej ani nepřejmenovávej.

linkedin.html — vstupní adresa pro odkaz v sekci Featured na LinkedInu (tomaspetera.cz/linkedin). Návštěvníka hned pošle na úvod se značkou utm_source=linkedin a utm_medium=featured. Existuje proto, že LinkedIn u vloženého odkazu ukládá kanonickou adresu stránky a značku z adresy úvodní stránky zahodí. Záměrně nemá kanonickou adresu ani og:url, nepřidávej je. Když ji smažeš, odkaz na LinkedInu přestane fungovat.

assets/css/style.css — veškerý vzhled webu

assets/js/main.js — animace, filtr portfolia, lightbox, obsluha formuláře

assets/js/stats.js — měření návštěvnosti (Umami), viz sekci Měření návštěvnosti níž. Když ho smažeš, web funguje dál, jen přestane měřit.

assets/js/quiz.js — kvíz „Co tvoje značka potřebuje?" mezi ceníkem a poptávkou. Otázky, texty doporučení a pravidla, který balíček se doporučí, jsou na začátku souboru. Název služby ve výsledku musí přesně odpovídat možnostem v poptávkovém formuláři, jinak se předvyplnění nepovede.

assets/js/efekty.js — spotlight v portfoliu (jen s myší), dešifrování drobných štítků a změna váhy písma u druhého řádku nadpisů při scrollu. Při nastavení „omezit animace" v systému se nespustí nic. Když soubor smažeš, web funguje dál, jen bez těchto efektů.

assets/fonts/ — písma Space Grotesk, Inter a JetBrains Mono, hostovaná přímo u nás (ne na Googlu). Jsou zúžená na české znaky a používané váhy. Nemaž je, web na nich stojí.

assets/img/ — obrázky projektů, každý ve velké (1600 px) a malé (-800) verzi. Podsložka ring jsou desky 3D prstence na úvodu (640×360 px, teď jich je 16), podsložka loga jsou loga klientů. Když do prstence přidáš nebo z něj ubereš desku, uprav ve style.css u .ring-wrap počet --n, poloměr --r a posun --posun; vzorec je v komentáři hned vedle.

assets/dotaznik/ — dotazník značky ke stažení, ve verzi DOCX i PDF. Odkazy na dotazník jsou ve formuláři u příloh (index.html) a na kartě na stránce po odeslání (dekuji.html). Když ho budeš měnit, nahraj obě — PDF se z Wordu udělá přes Soubor, Uložit jako, PDF.

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

## Odkazy z projektů ven

U vybraných projektů vede odkaz na živý web nebo Instagram klienta (Therrapia, Česká lékárnická komora, Young Lions, Divadlo PONEC, Czech Dance Platform). Odkaz je na dvou místech a obě je potřeba držet stejná:

V prace.html má položka projektu (značka figure s třídou item) tři údaje: data-url (adresa), data-url-label (text odkazu, např. Živý web, Web komory, Instagram) a data-url-type (web nebo instagram). Z nich se v detailu projektu sám vykreslí odkaz. Na kartě je navíc malý štítek (span s třídou item__ext), který jen říká, že v detailu odkaz je.

V index.html je u stejného projektu ve „vybraných pracích" druhý odkaz vedle „Prohlédnout projekt" (má údaj data-ext s hodnotou web nebo instagram).

Přidání dalšího projektu: doplň tři údaje a štítek v prace.html a případně odkaz v index.html. Odkazy se otevírají v novém okně a kliky se měří jako událost project_link. Odkaz dávej jen tam, kde je na cílové stránce tvoje práce opravdu vidět.

## Rezervace hovoru

Tlačítko „Vybrat termín“ (v poptávce na úvodní stránce a na stránce po odeslání) vede na rezervační stránku v Google Kalendáři, tedy „Rozvrh schůzek“ (v kalendáři vlevo Booking pages, Úvodní hovor (30 min)). Dny, hodiny, délku hovoru, předstih (48 hodin) i horizont (30 dní) měníš tam, ne na webu, odkaz zůstává stejný. Termíny, které už máš v kalendáři obsazené, se nenabízejí. Rezervace se potvrzuje automaticky (ruční schvalování bezplatný Google nemá), proto ji případně odmítni nebo smaž v kalendáři. Odkaz se otevírá v novém okně a záměrně není vložený do stránky: vložení by načetlo cookies Googlu a přestala by platit věta „bez cookies“. Kliky se měří jako událost booking_click (kde: poptavka nebo dekuji). Kdyby se odkaz změnil, přepiš ho v index.html a dekuji.html.

## Zásady zpracování údajů

Text v soukromi.html vychází z toho, jak web dnes funguje: poptávky jdou přes FormSubmit.co do Gmailu, statistiky měří Umami Cloud (EU) bez cookies, web běží na GitHub Pages. Poptávky bez zakázky se podle textu drží nejvýš 3 roky a statistiky 6 měsíců. Kdykoli se něco z toho změní (jiný formulářový nástroj, jiné měření, jiná doba uchování, nové cookies), uprav text i datum „Platné od“ dole na stránce. Text nepsal právník, nech si ho jednou zkontrolovat.

## Měření návštěvnosti

Skript assets/js/stats.js měří chování návštěvníků bez cookies a bez osobních údajů. Měří se jen na tomaspetera.cz (ne na lokálním náhledu) a respektuje se nastavení Do Not Track. Kdyby v něm byla konstanta PROVIDER prázdná, je zcela vypnutý: nic nenačítá a nic neodesílá.

Stav: zapnuto, nástroj Umami Cloud (region EU), web tomaspetera.cz, bezplatný tarif Hobby. Statistiky vidíš jen po přihlášení do Umami. U webu je v Nastavení sekce Share, ta je záměrně prázdná. Nikdy v ní nic nepřidávej, vznikl by veřejný odkaz na tvoje čísla. Kdybys někdy přecházel na jiný nástroj (Plausible a GoatCounter jsou ve skriptu připravené): z jeho „tracking code" opiš adresu skriptu a atributy do PROVIDER a zvyš číslo ?v= u stats.js ve všech HTML stránkách (index, prace, dekuji, soukromi, 404). Věta o měření v patičce je na všech stránkách.

## Vypnutí měření pro tebe

Vlastní návštěvy by zkreslovaly čísla, hlavně zpočátku. Vyloučení podle IP adresy je v Umami až v placeném tarifu, proto se měření vypíná v prohlížeči: otevři jednou tomaspetera.cz/?nemerit. Objeví se potvrzení a prohlížeč si to zapamatuje (stejný příznak čte i skript Umami). Zpátky zapneš přes tomaspetera.cz/?merit. Platí to vždy jen pro ten jeden prohlížeč na tom jednom zařízení, takže to udělej zvlášť na počítači a na telefonu. Příznak zmizí po smazání dat webu v prohlížeči a v anonymním okně platí jen do jeho zavření.

## Odkud lidé přicházejí: odkazy s UTM značkami

Umami si z adresy přečte značky utm_source, utm_medium a utm_campaign samo a ukáže je v přehledu UTM. Stačí, abys tam, kde web odkazuješ, použil adresu se značkou:

LinkedIn, odkaz na web v profilu: https://tomaspetera.cz/?utm_source=linkedin&utm_medium=profil

E-mailový podpis: https://tomaspetera.cz/?utm_source=email&utm_medium=podpis

Portfolio nebo životopis v PDF: https://tomaspetera.cz/prace.html?utm_source=pdf&utm_medium=portfolio

Vizitka nebo QR kód: https://tomaspetera.cz/?utm_source=vizitka&utm_medium=qr

Konkrétní nabídka: https://tomaspetera.cz/prace.html?utm_source=nabidka&utm_medium=email&utm_campaign=2026-10

LinkedIn, odkaz v sekci Featured: https://tomaspetera.cz/linkedin (přesměruje na úvod se značkou, viz linkedin.html)

Pravidla: malá písmena bez diacritiky, pro stejný kanál pořád stejný název (jinak se rozpadne na dvě řádky v přehledu) a do utm_campaign nikdy jméno klienta ani jiný osobní údaj. Dej tam kód nebo datum. Odkazy bez značek fungují dál, jen u nich uvidíš méně o zdroji (Umami pozná alespoň odkazující web, pokud ho prohlížeč pošle).

## Co se zaznamenává

Událost (a její jediná vlastnost):

section_view (sekce) — kterých sekcí si návštěvník dojel. Místo procent stránky, protože showcase je několikanásobně vyšší než obrazovka.

showcase_view (projekt) — kolik ze šesti vybraných projektů v showcase lidé projdou.

cta_click (cil, ve tvaru "kde > kam", např. "hero > contact" nebo "cenik > Vizuální identita") — kam lidé klikají: hero, hlavička, menu, boční tečky, ceník, showcase, konec portfolia.

price_reveal (plan) — kdo si odkryl rozmazanou cenu. Počítá se až po 350 ms nad kartou, nebo po klepnutí na mobilu.

project_open (projekt), filter_use (filtr) — co lidi zajímá v portfoliu.

form_start, form_attach (pocet), form_submit (sluzba), form_blocked — kde lidé ve formuláři váhají. Jména, e-maily ani texty se neposílají.

dotaznik_download (format), contact_click (typ: email, telefon, linkedin), contact_copy (typ: email, telefon) — to druhé je pro lidi, kteří kontakt nekliknou, ale zkopírují.

engaged_30s a engaged_120s — jen aktivní čas, kdy je záložka vidět a návštěvník něco udělal za posledních 10 s.

quiz_start, quiz_answer (odpoved, ve tvaru "otázka > možnost"), quiz_result (balicek) — průchod kvízem. Volby se neposílají s vazbou na člověka. Kvíz jednomu průchodu přidá zhruba 11 událostí.

js_error (kde) — když se na něčím zařízení rozbije skript nebo se nenačte obrázek či soubor z webu. Nejvýš 3 hlášení na načtení stránky, cizí skripty a rozšíření prohlížeče se nehlásí. Jestli se někdy objeví, je to signál, že se má web opravit.

Mimo to Umami (díky data-performance) posílá jedno hlášení o rychlosti na načtení stránky: LCP, INP, CLS, TTFB. Najdeš je v Umami v části Performance a ukazují skutečnou rychlost u návštěvníků, ne laboratorní test.

Nejspolehlivější měřítko poptávky je zobrazení stránky /dekuji.html, na kterou se člověk dostane až po odeslání formuláře. Událost form_submit je jen doplňková, protože se stránka okamžitě přesměruje.

## Limity bezplatného Umami

Ověřeno v účtu 2. 10. 2026 (ověř si aktuální podmínky v Umami, Nastavení, Billing): 100 000 událostí měsíčně, 1 web, 6 měsíců historie. Upozornění e-mailem, když se blížíš limitu, je zapnuté. Spotřebu najdeš v Umami v Nastavení, Usage.

Počítá se každé zobrazení stránky jako 1 událost a každá vlastní událost jako 1 plus 1 za každou uloženou vlastnost. Proto má každá událost nejvýš jednu vlastnost. Návštěvník, který projde celý web včetně kvízu, spotřebuje zhruba 20 až 45 událostí, ten, kdo hned odejde, 1 až 3. Co se stane po překročení limitu v bezplatném tarifu, ceník nerozepisuje, proto občas zkontroluj spotřebu v Usage. Kdyby limit nestačil, nejdřív vypni showcase_view.

Co v bezplatném tarifu není: vyloučení IP adres (Pro), e-mailové reporty (Pro), přístup přes API (Pro), nahrávky návštěv a heatmapy (Business). Funnely, cíle, Journeys, Retention, Segmenty, UTM, Performance i vlastní přehledy (Boards) jsou k dispozici.

Část návštěvníků se měřit nebude: seznam EasyPrivacy, který používají blokátory reklam (uBlock Origin, AdGuard, Brave), Umami blokuje. Čísla jsou proto spíš minimum. Obejít se to dá jen vlastním přeposíláním přes tvoji doménu (Cloudflare), což jsme zatím nedělali.

Při přidávání další události drž pravidlo jedné vlastnosti (viz komentář „Rozpočet událostí" v souboru stats.js).

## Verze CSS a JS

V index.html, prace.html, dekuji.html, soukromi.html a 404.html jsou odkazy na style.css a main.js s číslem verze (?v=2026100208). GitHub Pages posílá soubory s 10minutovou cache, takže bez toho by návštěvník po aktualizaci chvíli viděl nový HTML se starým CSS. Kdykoli změníš style.css nebo main.js, přepiš to číslo ve všech těchto souborech (třeba na dnešní datum).

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
