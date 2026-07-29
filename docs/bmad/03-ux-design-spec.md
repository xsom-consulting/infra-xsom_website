# Spécification UX & Design System — xsom.fr

> **Phase BMAD :** UX Expert
> **Entrée :** `02-prd.md`
> **Statut :** Validé

---

## 1. Intention de design

**Registre visé :** cabinet technique cher. Un visiteur doit percevoir, avant
d'avoir lu une phrase, qu'il est chez des gens qui construisent des
infrastructures — pas chez une agence de communication.

**Trois principes qui tranchent les arbitrages :**

1. **La densité est un signal de compétence.** On ne cache pas la technicité
   derrière des visuels vagues. Les cadres réglementaires, les technologies et
   les périmètres sont nommés.
2. **Le mouvement doit signifier quelque chose.** Aucune animation décorative.
   Le hero anime un réseau parce que le métier est l'infrastructure réseau. Les
   chiffres s'incrémentent parce que ce sont des mesures.
3. **Un seul accent.** Le cuivre marque ce qui compte. Utilisé partout, il ne
   marque plus rien.

**Le piège à éviter :** l'esthétique « SaaS sombre » générique — dégradés
violets, cartes flottantes molles, glassmorphism, illustrations 3D abstraites.
C'est le langage visuel par défaut du secteur et il ne différencie rien.

---

## 2. Couleurs

### 2.1 Palette

| Jeton | Valeur | Usage |
|-------|--------|-------|
| `--ink-950` | `#050B14` | Fond le plus profond, pied de page. |
| `--ink-900` | `#0A1628` | Fond principal. Couleur historique de la marque, conservée. |
| `--ink-800` | `#0F2038` | Sections alternées, cartes. |
| `--ink-700` | `#16304F` | Cartes surélevées, états de survol. |
| `--ink-600` | `#1E3D63` | Bordures marquées. |
| `--copper` | `#E2603A` | **Accent signature.** CTA principaux, chiffres, mots accentués, filets. |
| `--copper-bright` | `#F5793F` | Survol de l'accent. |
| `--copper-deep` | `#B84A28` | Ombres et pressions de l'accent. |
| `--paper` | `#FFFFFF` | Texte sur fond sombre, fond des sections claires. |
| `--paper-warm` | `#F6F3F0` | Fond des sections claires. Légèrement chaud pour s'accorder au cuivre. |
| `--paper-dim` | `#E8E2DC` | Bordures sur fond clair. |

### 2.2 Texte

| Jeton | Valeur | Ratio sur `--ink-900` |
|-------|--------|----------------------|
| `--text-hi` | `rgba(255,255,255,.95)` | 17.3:1 |
| `--text-mid` | `rgba(255,255,255,.72)` | 9.6:1 |
| `--text-low` | `rgba(255,255,255,.52)` | 5.4:1 |
| `--text-faint` | `rgba(255,255,255,.38)` | 3.4:1 — **réservé aux éléments non textuels et au texte large uniquement** |

Sur fond clair : `--ink-900` pour le texte courant (16.8:1 sur `--paper-warm`),
`--ink-700` pour le texte secondaire.

### 2.3 Contraste du cuivre

`#E2603A` sur `#0A1628` donne 4.62:1 — conforme AA pour le texte courant.
`#E2603A` sur `#FFFFFF` donne 3.54:1 — **insuffisant pour du texte courant sur
fond clair**. Sur fond clair, le cuivre est réservé aux surfaces (fonds de
boutons, filets, pastilles) et au texte large en 700 ou plus. Le texte courant
en cuivre sur fond clair utilise `--copper-deep` (`#B84A28`, 5.9:1).

Sur un bouton cuivre plein, le texte est `--ink-950` (11.4:1) et non blanc
(3.5:1, non conforme).

---

## 3. Typographie

### 3.1 Familles

| Rôle | Police | Poids | Justification |
|------|--------|-------|---------------|
| Titres | **Inter Tight** | 600, 700, 800 | Grotesque serré, neutre, excellent en très grande taille. Ne date pas. |
| Accent éditorial | **Instrument Serif** *italique* | 400 | Un ou deux mots par titre, en cuivre. C'est le marqueur de la marque : il introduit la dimension humaine dans un système par ailleurs technique. Résout visuellement le positionnement hybride. |
| Texte courant | **Inter** | 400, 500 | Lisibilité de référence en interface. |
| Labels et données | **JetBrains Mono** | 500 | Numérotations de section, étiquettes, chiffres, badges techniques. Signale l'ingénierie. |

Chargement : `preconnect` vers Google Fonts, `display=swap`, sous-ensembles
`latin` et `latin-ext`, poids strictement limités à ceux listés.

### 3.2 Échelle

Fluide via `clamp()`, base 16 px.

| Jeton | Taille | Interlignage | Approche | Usage |
|-------|--------|--------------|----------|-------|
| `--fs-display` | `clamp(2.6rem, 6vw, 4.75rem)` | 1.02 | −0.035em | H1 de hero |
| `--fs-h1` | `clamp(2.1rem, 4.4vw, 3.4rem)` | 1.08 | −0.03em | H1 de page intérieure |
| `--fs-h2` | `clamp(1.65rem, 3.2vw, 2.5rem)` | 1.14 | −0.025em | Titre de section |
| `--fs-h3` | `clamp(1.15rem, 1.8vw, 1.4rem)` | 1.25 | −0.015em | Titre de carte |
| `--fs-lead` | `clamp(1rem, 1.4vw, 1.15rem)` | 1.65 | 0 | Chapô |
| `--fs-body` | `0.975rem` | 1.7 | 0 | Texte courant |
| `--fs-sm` | `0.875rem` | 1.6 | 0 | Texte secondaire |
| `--fs-label` | `0.7rem` | 1.4 | 0.14em | Mono, capitales |
| `--fs-metric` | `clamp(2.2rem, 4vw, 3.2rem)` | 1 | −0.03em | Chiffres clés |

Longueur de ligne maximale : 68 caractères pour le texte courant, 22 mots pour
les chapôs.

---

## 4. Espacement et grille

Échelle de base 4 px : `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160`.

- Conteneur : `max-width: 1240px`, marges latérales `clamp(1.25rem, 4vw, 2.5rem)`.
- Conteneur étroit (contenu éditorial) : `max-width: 760px`.
- Espacement vertical de section : `clamp(4.5rem, 9vw, 8rem)`.
- Grille : 12 colonnes sur desktop, 6 sur tablette, 4 sur mobile.

Points de rupture : `560px`, `768px`, `900px`, `1100px`.

---

## 5. Signature visuelle

Cinq éléments récurrents constituent l'identité du site. Ils sont appliqués
systématiquement et rien d'autre n'est ajouté.

### 5.1 Le filet cuivre

Un trait de 1 px, cuivre à 40 % d'opacité, en dégradé vers la transparence.
Il ouvre chaque section, sous le numéro. Il remplace les séparateurs gris
génériques.

### 5.2 La numérotation mono

Chaque section porte un numéro en JetBrains Mono, capitales, approche large :
`[ 01 ] NOTRE OFFRE`. Le crochet et le chiffre sont en cuivre, le libellé en
`--text-low`. C'est le marqueur de rythme du site.

### 5.3 Le grain

Un bruit SVG en overlay à 3 % d'opacité sur les fonds sombres, en
`pointer-events: none`. Il retire l'aspect « aplat numérique » et donne une
matière imprimée. Généré en data-URI, aucun fichier image.

### 5.4 L'italique serif accentué

Dans les titres, un ou deux mots passent en Instrument Serif italique cuivre.
Exemple : « Gouvernance, cybersécurité et *intelligence artificielle* ».
Un seul par titre. Jamais sur un mot technique — toujours sur le mot qui porte
l'enjeu.

### 5.5 La visualisation d'infrastructure

Dans le hero : un réseau de nœuds reliés, dessiné en canvas. Les nœuds pulsent,
des impulsions circulent le long des arêtes en cuivre. Le logo xSOM est au
centre.

Le réseau **réagit au curseur** : les nœuds situés dans un rayon de 26 % de la
largeur s'agrandissent, virent au cuivre et se relient au pointeur. L'intensité
monte et retombe progressivement — pas d'apparition ni de coupure nette.
Désactivé sur pointeur grossier (`pointer: coarse`), où l'effet n'a pas de sens.

Contraintes : ~28 nœuds, arrêt du rendu quand l'onglet est masqué
(`visibilitychange`) et hors du viewport (`IntersectionObserver`). Remplacé par
un rendu SVG statique si `prefers-reduced-motion: reduce`.

### 5.6 Les visuels sectoriels

Les six secteurs d'intervention sont illustrés. Au repos, l'image est désaturée
et teintée navy (`mix-blend-mode: color`) : elle reste dans la charte et ne
concurrence pas le texte. Au survol, la couleur revient et un filet cuivre se
déploie en bordure basse.

Un zoom permanent de 8 % laisse au parallaxe la marge nécessaire pour translater
l'image de ±14 px sans découvrir les bords. Un voile dégradé garantit la
lisibilité du texte quelle que soit l'image.

### 5.7 Les schémas techniques

Deux schémas SVG construits au défilement, sur la page IA & Souveraineté :

- **La pile souveraine** — quatre couches, de l'infrastructure à la gouvernance,
  qui s'allument de bas en haut le long d'un axe cuivre. Le message est
  structurel : la souveraineté se construit du sol vers le sommet.
- **La chaîne de production** — sources, pipeline, modèle, production, refermée
  par une boucle de supervision continue. Le message est opérationnel : ce qui
  fait tenir un système IA dans la durée, c'est la boucle, pas la ligne droite.

Les tracés portent une longueur de pointillé égale à leur longueur réelle,
calculée par `getTotalLength()` : passer l'offset à zéro dessine le trait. Les
étages s'enchaînent par paliers de 300 ms.

### 5.8 Les titres révélés ligne par ligne

Chaque mot des grands titres est enveloppé dans un span, puis reçoit un délai
calculé à partir de son `offsetTop` : les mots d'une même ligne partagent le
même délai, la ligne se lève donc d'un bloc. Aucun conteneur de ligne n'est
inséré — cela casserait la césure naturelle du navigateur.

Le découpage préserve les éléments inline : l'italique serif de `.em` survit à
l'opération. Il n'est appliqué que si `prefers-reduced-motion` est inactif, et
l'état masqué n'est posé qu'après découpage réussi.

---

## 6. Composants

### 6.1 Boutons

| Variante | Fond | Texte | Bordure | Survol |
|----------|------|-------|---------|--------|
| Primaire | `--copper` | `--ink-950` | — | `--copper-bright`, translation −1 px, ombre cuivre |
| Secondaire | transparent | `--paper` | `rgba(255,255,255,.16)` | bordure à 32 %, fond blanc à 4 % |
| Fantôme | transparent | `--copper` | — | soulignement animé |
| Sur fond clair | `--ink-900` | `--paper` | — | `--ink-700` |

Hauteur : 44 px minimum (cible tactile). Rayon : 4 px — angles quasi droits,
cohérents avec le registre technique. Pas de pilule.

### 6.2 Cartes

Fond `--ink-800`, bordure 1 px `rgba(255,255,255,.07)`, rayon 6 px.
Au survol : bordure `rgba(226,96,58,.35)`, translation −2 px, et un filet cuivre
apparaît en bordure haute. Transition 240 ms.

Pas d'ombre portée sur fond sombre — elle n'y est pas lisible. La profondeur est
donnée par la bordure et la valeur de fond.

### 6.3 Header

Hauteur 72 px. Au repos : fond `rgba(10,22,40,.72)` avec `backdrop-filter: blur(16px)`.
Au-delà de 40 px de défilement : `rgba(5,11,20,.94)`, bordure basse cuivre à 15 %.

Le logo est un lien vers l'accueil. Le sélecteur de langue est un groupe
`FR | EN`, la langue active en `--paper`, l'autre en `--text-low`.

Sous 900 px : bascule en menu plein écran, ouverture par bouton hamburger,
fermeture par `Échap`, par clic sur un lien, ou par clic sur le bouton de
fermeture. Le focus est piégé dans le menu ouvert.

### 6.4 Formulaire

Champs : fond `rgba(255,255,255,.04)`, bordure basse 1 px `rgba(255,255,255,.14)`,
sans bordure latérale ni supérieure. Au focus : bordure basse cuivre 2 px, pas
de halo. Le label est au-dessus, en mono, capitales.

États d'erreur : bordure basse `#FF6B6B`, message sous le champ, `aria-invalid`
et `aria-describedby` renseignés.

### 6.5 Chiffres clés

Valeur en Inter Tight 800, cuivre. Libellé en dessous en `--text-low`.
Un filet cuivre vertical de 1 px à gauche. Les valeurs numériques s'incrémentent
à l'entrée dans le viewport, une seule fois, en 900 ms — sauf si
`prefers-reduced-motion` est actif.

---

## 7. Mouvement

| Élément | Comportement | Durée | Courbe |
|---------|--------------|-------|--------|
| Révélation au défilement | Opacité 0→1, translation Y 20px→0 | 700 ms | `cubic-bezier(.16,1,.3,1)` |
| Décalage en grille | 60 ms par élément, 5 éléments maximum | — | — |
| Survol de carte | Translation Y −2 px, bordure | 240 ms | `cubic-bezier(.25,.46,.45,.94)` |
| Survol de bouton | Fond, translation Y −1 px | 200 ms | idem |
| Header au défilement | Fond, bordure | 320 ms | idem |
| Compteur | Incrémentation | 900 ms | `easeOutExpo` |
| Réseau du hero | Boucle continue | — | — |

**Règle absolue :** sous `prefers-reduced-motion: reduce`, toutes les durées
passent à 0.01 ms, les translations sont supprimées, le canvas est remplacé par
un rendu statique, les compteurs affichent directement leur valeur finale. Les
éléments à révéler sont visibles par défaut — jamais d'opacité 0 sans script.

---

## 8. Sections claires

Deux sections sur fond `--paper-warm` cassent la continuité sombre :
le bandeau de références clients et la section « approche » de l'accueil.

Ces sections sont gérées par une classe `.section--light` qui **redéfinit les
jetons de texte** au niveau du bloc :

```css
.section--light {
  --text-hi: var(--ink-900);
  --text-mid: rgba(15,32,56,.78);
  --text-low: rgba(15,32,56,.58);
  --surface: rgba(10,22,40,.03);
  --border: rgba(10,22,40,.10);
  --copper-text: var(--copper-deep);
}
```

Aucun style inline sur les éléments enfants. C'est la correction directe du
défaut T7 identifié dans le brief : le site actuel réécrit les couleurs élément
par élément en `style=""`.

---

## 9. Parcours utilisateur

### 9.1 DSI en évaluation

```
Accueil ──▶ perçoit le niveau technique en 5 s (hero + logos clients)
   │
   ├──▶ Expertises ──▶ vérifie la couverture de son besoin
   │        │
   │        └──▶ IA & Souveraineté ──▶ vérifie la profondeur sur son sujet
   │                     │
   └────────────────────┴──▶ Le cabinet ──▶ vérifie l'indépendance et l'ancienneté
                                  │
                                  └──▶ Contact ──▶ formulaire
```

Point de friction identifié : entre « Expertises » et « Contact », il manque une
preuve de résultat. C'est l'emplacement de la section « Réalisations », à
alimenter en priorité.

### 9.2 Candidat consultant

```
Accueil ou LinkedIn ──▶ Carrières ──▶ Le cabinet ──▶ candidature par email
```

Le CTA de candidature est présent en haut et en bas de la page Carrières.

---

## 10. Contenu de secours

Les zones dont le contenu n'est pas encore disponible sont gérées par un
attribut `data-requires-content` sur la section. Une règle CSS unique
(`[data-requires-content] { display: none; }`) les masque. Retirer l'attribut
suffit à activer la section une fois le contenu fourni.

Concerné : section « Réalisations » de l'accueil, section « Équipe » de la page
cabinet.
