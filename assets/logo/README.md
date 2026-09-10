# Logo « flèches entrelacées »

## Original blue identity — active

The site and console preserve the original artwork and colors, without recoloring.
`design-system/assets/mark.svg` and `mark-source.svg` are byte-identical copies of
`moderne-dark.svg`. `mark-light.svg` is an unchanged copy of `gradient.svg` for light
surfaces. Theme-aware headers use these two original variants. The shared build
checks the exact source; `tools/render-signal-kit.mjs` reproduces the PNG kit and
bilingual OG covers from the local logo and typography.

Triangle récursif de trois flèches coudées qui s'emboîtent. Tous les fichiers
sont détourés, fond transparent. **Le SVG est la source** : net à toute taille,
2,4 Ko pièce. Les PNG ne servent qu'aux cas qui exigent du bitmap.

## Variantes

| Fichier | Description | Fond |
|---------|-------------|------|
| `moderne-dark.svg` | Flat, 2 bleus + flèche gris clair | **sombre** |
| `gradient.svg` | Dégradés bleu et graphite | clair |
| `pleine.svg` | Aplats, sans dégradé | clair |
| `cuivre.svg` | La flèche d'accent passe au cuivre | clair **et** sombre |
| `noir.svg` | Aplat noir, monochrome | clair, impression |
| `blanc.svg` | Aplat blanc, monochrome | sombre, photos |

## Où chaque variante est utilisée

| Emplacement | Fichier | Raison |
|-------------|---------|--------|
| En-tête et pied de page | `gradient.svg` ou `moderne-dark.svg` | Variante d'origine adaptée au fond clair ou sombre. |
| Favicon | `moderne-dark.svg` + `favicon-32.png` | Les bleus et le gris d'origine restent inchangés. |
| Écran d'accueil iOS | `apple-touch-icon.png` | iOS compose la transparence sur du noir, ce qui est précisément le fond prévu pour `moderne-dark`. |
| JSON-LD `Organization.logo` | `logo-512.png` | Export de la variante `gradient` pour un fond clair. |

Les variantes cuivre et monochromes restent des sources historiques disponibles ;
elles ne remplacent pas l'identité bleue actuellement publiée.

## Palette

- Bleu vif (flèche haut) : `#3f93ff` — dégradé `#0f5fe0 → #3f93ff`
- Bleu profond (flèche droite) : `#1e64de` — dégradé `#123a8f → #2f86ff`
- Accent graphite (flèche bas-gauche) : `#2f353d` — dégradé `#6f747b → #0b0e13`
- Accent cuivre : dégradé `#d0905f → #5e3216`
- Gris clair, version fond sombre : `#cad2dc`
- Noir aplat `#14181d` · Blanc aplat `#ffffff`

L'accent principal du site est bleu. Le cuivre n'est qu'un accent secondaire
disponible dans `design-system/design/tokens.json`, jamais une recoloration du logo.

## Remplacer ou ajouter une variante

Poser le `.svg` dans ce dossier et changer la référence dans les pages. Les
blocs d'en-tête et de pied de page sont partagés entre les pages ; utiliser
`node tools/sync-partials.js` pour les propager depuis `index.html`.

Le kit d'origine contenait aussi une échelle de PNG (32 à 1024 px pour chaque
variante, 1,7 Mo). Elle a été retirée du dépôt : tout est régénérable depuis
les SVG, et les fichiers restent accessibles dans l'historique git au commit
`f6371d0`.
