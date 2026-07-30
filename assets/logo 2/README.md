# Logo « flèches entrelacées » — kit d'intégration

Triangle récursif de 3 flèches coudées qui s'emboîtent (2 bleues + 1 accent).
Tous les fichiers sont **détourés / fond transparent**. Le **SVG est la source à privilégier** sur le web (net à toute taille, poids minime). Les PNG sont fournis pour les cas qui exigent du bitmap (favicon, e-mail, réseaux sociaux).

## Arborescence
```
logo/
  svg/<version>.svg          ← vectoriel, à utiliser partout où c'est possible
  1024/<version>.png         ← impression, réseaux sociaux, écrans Retina
  512/<version>.png          ← favicon HD, avatars, icône d'app
  256/<version>.png          ← en-têtes de site, cartes
  128/<version>.png          ← barre de navigation
  64/<version>.png           ← favicon standard
  32/<version>.png           ← favicon navigateur
```

## Versions (`<version>`)
| slug | description | fond conseillé |
|------|-------------|----------------|
| `gradient` | Dégradés bleu & graphite — proche de l'original | clair |
| `pleine` | Aplats de couleur, sans dégradé — net et direct | clair |
| `cuivre` | La flèche accent passe au cuivre chaud | clair |
| `moderne-dark` | Flat minimal, 2 bleus + flèche gris clair — arêtes nettes | **sombre / hero / réseau** |
| `noir` | Aplat noir, une seule couleur — impression, tampon | clair |
| `blanc` | Aplat blanc, une seule couleur | sombre / photos |

## Palette
- Bleu vif (flèche haut) : `#3f93ff`  (dégradé `#0f5fe0 → #3f93ff`)
- Bleu profond (flèche droite) : `#2f86ff` / `#1e5fd6`  (dégradé `#123a8f → #2f86ff`)
- Accent graphite (flèche bas-gauche) : `#2f353d`  (dégradé `#6f747b → #0b0e13`)
- Accent cuivre : dégradé `#d0905f → #5e3216`
- Gris clair (version fond sombre) : `#cad2dc`
- Noir aplat : `#14181d` · Blanc aplat : `#ffffff`

> Accent orange du site (repéré sur la maquette) ≈ `#e2662f` — une variante avec une flèche orange peut être générée sur demande.

## Reco d'usage par emplacement
- **Header / hero sur fond sombre, centre du réseau** → `svg/moderne-dark.svg`
- **Header sur fond clair** → `svg/gradient.svg` (ou `svg/pleine.svg` pour plus minimal)
- **Favicon** → `32/gradient.png`, `64/gradient.png`, plus `512/gradient.png` (ou `noir`/`blanc` mono si besoin d'un aplat)
- **Impression / mono** → `svg/noir.svg` (clair) · `svg/blanc.svg` (sombre)
- **Photos / vidéos** → `svg/blanc.svg`

## Snippets

### Favicon (HTML `<head>`)
```html
<link rel="icon" type="image/svg+xml" href="/logo/svg/gradient.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/logo/32/gradient.png">
<link rel="icon" type="image/png" sizes="64x64" href="/logo/64/gradient.png">
<link rel="apple-touch-icon" sizes="512x512" href="/logo/512/gradient.png">
```

### Logo dans le hero sombre
```html
<img src="/logo/svg/moderne-dark.svg" alt="Logo" width="320" height="320">
```

## Consigne pour Claude Code
Remplace **toutes** les occurrences de l'ancien logo (l'image générée avec fond) par ces fichiers :
1. Choisis la version selon le fond de chaque emplacement (table ci-dessus).
2. Préfère le `.svg` ; ne recours au `.png` que pour favicon / e-mail / réseaux.
3. Ne réencadre pas dans une tuile sombre : les fichiers sont déjà transparents.
4. Garde le ratio 1:1 (les SVG ont un viewBox carré).
