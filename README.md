# DH kartējums LU HZF

Latvijas Universitātes Humanitāro zinātņu fakultātes digitālo humanitāro zinātņu kartējums.

Izstrādā LU Digitālo humanitāro zinātņu centrs. Par mērķi, autoriem un avotiem: [Par kartējumu](par-kartejumu.html).

## Vietne

https://ul-dhc.github.io/dh-hzf/

Statiskas HTML lapas un attēli. GitHub Pages publicē `main` zara saknes direktoriju; būvēšana nav nepieciešama.

- `index.html` – sākumlapa
- `HZF_DH_karte.html` – DH kopaina
- `HZF_DH_tikls.html` – aktivitāšu tīkls
- `HZF_DH_ekspertize.html` – ekspertīzes jomas
- `HZF_DH_piedavajums.html` – studijas, projekti, resursi un rīki, pasākumi un zināšanu apmaiņa
- `par-kartejumu.html`, `ieteikumi.html` – apraksts un ieteikumi

Dati var būt nepilnīgi vai neprecīzi. Precizējumi un ieteikumi: dhc@lu.lv.

## Valodas

Visās lapās pieejama LV / EN izvēle. Parametrs `?lang=en` vai `?lang=lv` nosaka valodu; bez tā izmanto pārlūkā saglabāto izvēli, pēc noklusējuma latviešu valodu. Pārslēgšana saglabā pašreizējo sadaļu un ekspertīzes jomu.

`assets/translations-en.js` satur saskarnes un ierakstu tulkojumus. `assets/i18n.js` tulko publiski attēloto tekstu un pieejamības etiķetes, saglabājot sākotnējos datus, ierakstu ID, filtru vērtības un saites. Meklēšana atpazīst latviešu un angļu tekstu. Pievienojot vai mainot ierakstu, jāpapildina arī tā tulkojums.

Pārbaude: `node tests/i18n.cjs`. Tā pārbauda visu ierakstu publiskā satura tulkojumus, valodas izvēli, meklēšanu, JavaScript sintaksi un atkārtotu dinamiskā satura atjaunināšanu.
