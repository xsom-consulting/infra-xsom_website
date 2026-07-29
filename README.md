# xsom.fr — Site de xSOM Consulting

Site vitrine du cabinet, bilingue français / anglais, hébergé sur GitHub Pages
et servi sur `www.xsom.fr` via le fichier `CNAME`.

**Pas d'étape de build.** Le dépôt est servi tel quel : une fusion sur `main`
suffit à publier.

---

## Structure

```
index.html · expertises.html · ia-souverainete.html
cabinet.html · carrieres.html · contact.html      Pages françaises
mentions-legales.html · cookies.html              Pages légales (FR)
404.html                                          Page d'erreur

en/                       Pages anglaises (index, expertise, ai-sovereignty,
                          firm, careers, contact)

expertise.html · IA.html · vision.html            Anciennes URL conservées
about.html · join.html                            comme redirections

assets/css/tokens.css     Couleurs, typographie, espacements — source unique
assets/css/base.css       Reset, typographie, layout, utilitaires
assets/css/components.css Header, pied de page, boutons, cartes, formulaire

assets/js/site.js         Navigation, révélations au défilement, compteurs
assets/js/motion.js       Titres ligne par ligne, parallaxe, schémas animés
assets/js/hero-network.js Visualisation canvas de l'accueil (réagit au curseur)
assets/js/contact-form.js Validation et envoi du formulaire

assets/images/secteurs/   6 visuels sectoriels optimisés (~90 Ko pièce)
assets/images/backdrop.jpg  Fond des en-têtes de page
assets/images/og-cover.jpg  Vignette de partage 1200×630

tools/sync-partials.js    Utilitaire de maintenance (facultatif)
docs/bmad/                Documents de conception : brief, PRD, UX, architecture
```

---

## À faire pour rendre le site pleinement opérationnel

### 1. Activer le formulaire de contact — **requis**

Le formulaire ne peut pas envoyer d'email tant que la clé n'est pas renseignée.
Il bascule automatiquement sur `mailto:` en attendant, donc aucune saisie n'est
perdue.

1. Aller sur [web3forms.com](https://web3forms.com) et saisir `jean-philippe.talou@xsom.fr`
2. Récupérer la clé d'accès reçue par email
3. Remplacer `VOTRE_CLE_WEB3FORMS` dans `contact.html` **et** `en/contact.html`

La clé est publique par conception : elle n'autorise que l'envoi vers l'adresse
qui l'a générée.

### 2. Compléter les mentions légales — **obligation légale**

Renseigner les champs `[À COMPLÉTER]` dans `mentions-legales.html` : forme
juridique, capital, siège, SIREN, TVA, directeur de publication.

### 3. Vérifier l'URL LinkedIn

Le site pointe vers `linkedin.com/company/xsom-consulting/`. Corriger dans les
14 pages si l'URL réelle diffère.

### 4. Ajouter les preuves — **le vrai levier de conversion**

Deux sections sont construites et masquées, en attente de contenu. Retirer
l'attribut `data-requires-content` de la balise `<section>` suffit à les activer.

| Section | Fichiers | Contenu attendu |
|---------|----------|-----------------|
| Réalisations | `index.html`, `en/index.html` | 3 à 5 missions anonymisées : contexte → intervention → résultat mesurable |
| Équipe | `cabinet.html`, `en/firm.html` | Portraits et parcours, au moins des associés |

C'est le principal facteur limitant du site : le design et la structure sont en
place, la preuve de résultat ne l'est pas encore.

### 5. Remplacer les chiffres génériques

Le bandeau de chiffres n'affiche pour l'instant que des valeurs vérifiables
(ancienneté, secteurs, indépendance). Dès que les chiffres réels du cabinet sont
disponibles — nombre de consultants, de missions, de clients, taux de
renouvellement — les substituer dans `index.html`, `cabinet.html` et leurs
équivalents anglais.

Les chiffres animés fonctionnent ainsi :

```html
<span data-count="18" data-suffix=" ans">18 ans</span>
```

La valeur finale est écrite dans le HTML ; le script ne fait que l'animer. Sans
JavaScript, le bon chiffre s'affiche quand même.

---

## Modifier le site

### Changer une couleur

Tout est dans `assets/css/tokens.css`. L'accent cuivre, par exemple :

```css
--copper: #e2603a;
```

Aucune valeur de couleur n'est écrite ailleurs.

### Remplacer une image sectorielle

Les visuels de `assets/images/secteurs/` sont des versions recadrées en 900×600
et compressées. Les originaux restent à la racine de `assets/images/` mais ne
sont pas servis. Pour en remplacer un :

```bash
python3 - <<'EOF'
from PIL import Image, ImageOps
im = Image.open('assets/images/NOUVELLE.jpg').convert('RGB')
im = ImageOps.fit(im, (900, 600), Image.LANCZOS, centering=(0.5, 0.45))
im.save('assets/images/secteurs/energie.jpg', 'JPEG', quality=76,
        optimize=True, progressive=True)
EOF
```

Ne pas nommer un fichier optimisé comme son original en changeant seulement la
casse : `PUBLIC.jpg` et `public.jpg` entrent en collision sur macOS et Windows.
C'est la raison du sous-dossier `secteurs/`.

### Désactiver une animation

Toutes les dynamiques sont pilotées par des attributs dans le HTML, pas par des
sélecteurs de classe : les retirer suffit.

| Attribut | Effet |
|----------|-------|
| `data-split` sur un titre | Révélation ligne par ligne |
| `data-parallax` sur une image | Déplacement léger au défilement |
| `data-diagram` sur un SVG | Construction progressive du schéma |
| `data-count` sur un chiffre | Incrémentation à l'entrée dans le viewport |

Tout est déjà neutralisé sous `prefers-reduced-motion: reduce`.

### Modifier la navigation ou le pied de page

Ces blocs sont dupliqués dans les 14 pages — c'est le coût assumé de l'absence
de build. Modifier `index.html` (référence française) ou `en/index.html`
(référence anglaise), puis propager :

```bash
node tools/sync-partials.js          # applique
node tools/sync-partials.js --check  # vérifie sans écrire
```

Le script recopie les blocs entre `<!-- nav:start -->` / `<!-- nav:end -->` et
`<!-- footer:start -->` / `<!-- footer:end -->`, en ajustant le lien actif et le
sélecteur de langue de chaque page.

### Ajouter une page

1. Copier une page existante de la même langue
2. Adapter `<title>`, `<meta description>`, `canonical` et les `hreflang`
3. Ajouter l'entrée dans `PAGES` de `tools/sync-partials.js`
4. Ajouter l'URL dans `sitemap.xml`

### Modifier du contenu bilingue

Toute modification de contenu doit être reportée dans les deux langues. Les
correspondances sont listées dans `tools/sync-partials.js`.

---

## Vérifier avant de fusionner

```bash
# Aperçu local
python3 -m http.server 8000
# puis http://localhost:8000

# Cohérence des blocs partagés
node tools/sync-partials.js --check
```

À contrôler également :

- aucun lien mort — **attention à la casse**, GitHub Pages y est sensible ;
- les cinq anciennes URL redirigent toujours ;
- le formulaire envoie réellement un email (nécessite la clé Web3Forms) ;
- `sitemap.xml` reste valide.

---

## Choix techniques

Les décisions structurantes et leurs raisons sont documentées dans
[`docs/bmad/04-architecture.md`](docs/bmad/04-architecture.md) : pourquoi pas de
build, pourquoi des pages bilingues dupliquées plutôt qu'un dictionnaire
JavaScript, pourquoi Web3Forms, et quelle dette est assumée.

Le diagnostic du site précédent et le positionnement retenu figurent dans
[`docs/bmad/01-project-brief.md`](docs/bmad/01-project-brief.md).
