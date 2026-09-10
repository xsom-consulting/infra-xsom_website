# Logo « flèches entrelacées »

## xSOM Signal — active identity

The current site and console use `design-system/assets/mark.svg`: the exact original
three-arrow geometry, mechanically recolored in copper, bronze and a neutral accent.
`design-system/assets/mark-source.svg` preserves the original drawing; the shared
build command checks the derivation. The existing variants below remain historical
source assets. Active header/footer and favicon use the same shared SVG. The PNG kit
and bilingual OG covers were rerendered from that identity. `tools/render-signal-kit.mjs`
reproduces them from the local component/OG pages.

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
| En-tête et pied de page, 34 px | `moderne-dark.svg` | Le site est sombre partout où le logo apparaît. |
| Hero, ~180 px | `moderne-dark.svg` | Même fichier : une seule requête mise en cache pour tout le site. |
| Favicon | `cuivre.svg` + `favicon-32.png` | Voir ci-dessous. |
| Écran d'accueil iOS | `apple-touch-icon.png` | iOS compose la transparence sur du noir, ce qui est précisément le fond prévu pour `moderne-dark`. |
| JSON-LD `Organization.logo` | `logo-512.png` | Google n'accepte pas le SVG pour le logo d'une organisation, et l'affiche sur fond blanc — d'où la variante `gradient`. |

### Pourquoi le cuivre en favicon

La barre d'onglets suit le thème du système : claire ou sombre selon la
machine. `gradient` perd sa flèche graphite en mode sombre, `moderne-dark`
perd sa flèche gris clair en mode clair. Le cuivre a la luminance
intermédiaire qui tient des deux côtés — vérifié en rendu réel à 32 px, pas
estimé. C'est accessoirement le seul endroit où le logo rejoint l'accent du
site.

## Palette

- Bleu vif (flèche haut) : `#3f93ff` — dégradé `#0f5fe0 → #3f93ff`
- Bleu profond (flèche droite) : `#1e64de` — dégradé `#123a8f → #2f86ff`
- Accent graphite (flèche bas-gauche) : `#2f353d` — dégradé `#6f747b → #0b0e13`
- Accent cuivre : dégradé `#d0905f → #5e3216`
- Gris clair, version fond sombre : `#cad2dc`
- Noir aplat `#14181d` · Blanc aplat `#ffffff`

L'accent du site est le cuivre `#e2603a`, défini dans `assets/css/tokens.css`.
Le logo reste bleu : les deux cohabitent volontairement, le cuivre continue de
piloter boutons, titres et liens.

## Remplacer ou ajouter une variante

Poser le `.svg` dans ce dossier et changer la référence dans les pages. Les
blocs d'en-tête et de pied de page sont dupliqués dans les 22 pages ; utiliser
`node tools/sync-partials.js` pour les propager depuis `index.html`.

Le kit d'origine contenait aussi une échelle de PNG (32 à 1024 px pour chaque
variante, 1,7 Mo). Elle a été retirée du dépôt : tout est régénérable depuis
les SVG, et les fichiers restent accessibles dans l'historique git au commit
`f6371d0`.
