# Architecture technique — xsom.fr

> **Phase BMAD :** Architect
> **Entrée :** `02-prd.md`, `03-ux-design-spec.md`
> **Statut :** Validé

---

## 1. Décisions structurantes

### ADR-1 — Rester en HTML statique sans build

**Décision :** aucun générateur de site, aucun bundler, aucune étape de
compilation obligatoire.

**Raison :** le site est hébergé sur GitHub Pages via le fichier `CNAME`
(`www.xsom.fr`). Le dépôt est servi tel quel. Introduire un build imposerait une
chaîne CI, un `node_modules`, et rendrait toute correction urgente dépendante
d'un environnement de développement.

**Conséquence acceptée :** le header et le pied de page sont dupliqués dans les
14 fichiers HTML. C'est le coût direct de ce choix.

**Atténuation :** l'utilitaire `tools/sync-partials.js` régénère ces blocs entre
des marqueurs de commentaire. Il est **optionnel** — le HTML est complet et
valide sans lui. Il ne sert qu'à la maintenance.

### ADR-2 — Header en HTML source, pas en JavaScript

**Décision :** abandon de l'injection par `header.js`.

**Raison :** l'injection après `DOMContentLoaded` produit un décalage visuel au
chargement et laisse la navigation absente du HTML source. Sur un site dont un
objectif est l'indexation, c'est un défaut net.

### ADR-3 — Bilingue par pages dupliquées, pas par dictionnaire JavaScript

**Décision :** deux arborescences complètes, FR à la racine et EN sous `/en/`,
reliées par `hreflang`. Suppression de `translate.js`.

**Raison :** un dictionnaire JavaScript produit un contenu qui n'existe pas dans
le HTML source, non indexable, non partageable par URL, et invisible sans
JavaScript. Les 600 lignes de `translate.js` n'étaient d'ailleurs branchées sur
aucune interface.

**Conséquence acceptée :** toute modification de contenu doit être reportée dans
deux fichiers.

### ADR-4 — Formulaire via Web3Forms

**Décision :** `POST` vers `https://api.web3forms.com/submit` en `fetch`.

**Raison :** GitHub Pages ne peut pas exécuter de code serveur — `send_mail.php`
était inopérant depuis toujours. Web3Forms est gratuit, sans compte à créer pour
l'expéditeur, et sa clé d'accès est conçue pour être publique : elle n'autorise
que l'envoi vers l'adresse email qui l'a générée.

**Repli :** en cas d'échec réseau ou d'absence de clé configurée, le formulaire
bascule sur un lien `mailto:` pré-rempli avec les valeurs saisies. Aucune saisie
n'est perdue.

### ADR-5 — Trois fichiers CSS chargés en cascade

**Décision :** `tokens.css`, `base.css`, `components.css`, dans cet ordre.
Aucun `<style>` inline, aucun attribut `style=""` porteur de charte.

**Raison :** le CSS actuel est dupliqué dans chaque page (~20-30 Ko), ce qui
annule toute mise en cache entre pages et garantit la dérive. Trois fichiers
partagés sont mis en cache une fois pour l'ensemble de la navigation.

**Pourquoi trois et pas un :** la séparation jetons / socle / composants rend le
point de modification évident. Le coût de trois requêtes est négligeable en
HTTP/2.

---

## 2. Arborescence

```
/
├── CNAME                          www.xsom.fr — ne pas modifier
├── robots.txt
├── sitemap.xml
├── 404.html
│
├── index.html                     Accueil FR
├── expertises.html
├── ia-souverainete.html
├── cabinet.html
├── carrieres.html
├── contact.html
├── mentions-legales.html
├── cookies.html
│
├── expertise.html                 ─┐
├── IA.html                         │ Redirections des anciennes URL
├── vision.html                     │ (meta refresh + canonical + lien manuel)
├── about.html                      │
├── join.html                      ─┘
│
├── en/
│   ├── index.html
│   ├── expertise.html
│   ├── ai-sovereignty.html
│   ├── firm.html
│   ├── careers.html
│   └── contact.html
│
├── assets/
│   ├── css/
│   │   ├── tokens.css             Jetons de design — source unique de vérité
│   │   ├── base.css               Reset, typographie, layout, utilitaires
│   │   └── components.css         Header, footer, boutons, cartes, formulaire
│   ├── js/
│   │   ├── site.js                Navigation, révélations, compteurs
│   │   ├── ui.js                  Halo curseur, indicateur de nav, progression
│   │   ├── motion.js              Titres ligne par ligne, parallaxe, schémas
│   │   ├── hero-network.js        Visualisation canvas (accueil uniquement)
│   │   └── contact-form.js        Soumission et validation (contact uniquement)
│   └── images/
│       ├── secteurs/              6 visuels sectoriels optimisés (~90 Ko pièce)
│       ├── backdrop.jpg           Fond des en-têtes de page
│       ├── og-cover.jpg           Vignette de partage 1200×630
│       └── …                      Originaux conservés, non servis
│
├── tools/
│   └── sync-partials.js           Utilitaire de maintenance, non requis
│
└── docs/bmad/                     Documents de conception
```

## 3. Chargement des ressources

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Inter+Tight:wght@600;700;800&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">

<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/components.css">

<script src="assets/js/site.js" defer></script>
```

`hero-network.js` n'est chargé que par l'accueil. `contact-form.js` uniquement
par les pages de contact. Tous en `defer`.

Les chemins depuis `/en/` sont préfixés `../`.

## 4. Structure d'une page

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <!-- charset, viewport, title, description -->
  <!-- canonical + hreflang fr / en / x-default -->
  <!-- Open Graph + Twitter Card -->
  <!-- favicon, polices, feuilles de style -->
  <!-- JSON-LD (accueil uniquement) -->
</head>
<body>
  <a class="skip-link" href="#main">Aller au contenu</a>

  <!-- nav:start --> ... <!-- nav:end -->

  <main id="main"> ... </main>

  <!-- footer:start --> ... <!-- footer:end -->

  <script src="assets/js/site.js" defer></script>
</body>
</html>
```

Les marqueurs `nav:start` / `nav:end` et `footer:start` / `footer:end`
délimitent les zones régénérables par `tools/sync-partials.js`.

## 5. Contrat JavaScript

### `site.js` — chargé partout

| Module | Rôle | Dégradation sans JS |
|--------|------|---------------------|
| `initNav` | Ouverture / fermeture du menu mobile, `Échap`, piégeage du focus. | Menu masqué sous 900 px — le pied de page contient tous les liens. |
| `initScrollHeader` | Bascule de la classe `is-scrolled` sur le header au-delà de 40 px. | Header en état initial, lisible. |
| `initReveal` | `IntersectionObserver` ajoutant `is-visible`. | Le contenu est visible : l'opacité 0 n'est appliquée que si `.js` est présent sur `<html>`. |
| `initCounters` | Incrémentation des chiffres à l'entrée dans le viewport. | La valeur finale est écrite dans le HTML, le script ne fait que l'animer. |
| `initYear` | Injecte l'année courante dans le pied de page. | Année de repli écrite dans le HTML. |

**Règle de dégradation :** `site.js` ajoute `document.documentElement.classList.add('js')`
en première instruction. Toutes les règles d'état initial masqué sont préfixées
`.js` — sans JavaScript, rien n'est caché.

### `hero-network.js` — accueil uniquement

Canvas 2D, ~28 nœuds, arêtes entre voisins proches, impulsions cuivre le long
des arêtes. Rendu suspendu hors viewport (`IntersectionObserver`) et onglet
masqué (`visibilitychange`). Si `prefers-reduced-motion: reduce`, le script ne
s'initialise pas et un rendu SVG statique reste affiché.

### `contact-form.js` — pages de contact

1. Validation à la soumission : champs requis, format d'email, consentement.
2. Honeypot : si le champ `botcheck` est rempli, abandon silencieux.
3. Si la clé Web3Forms n'est pas configurée, bascule immédiate sur `mailto:`.
4. `fetch` POST, état « envoi en cours » sur le bouton.
5. Succès : message de confirmation, formulaire réinitialisé.
6. Échec : message d'erreur et bouton de repli `mailto:` pré-rempli.

## 6. SEO

| Élément | Mise en œuvre |
|---------|---------------|
| Canonique | `<link rel="canonical">` absolu sur chaque page. |
| Alternates | `hreflang="fr"`, `hreflang="en"`, `hreflang="x-default"` → FR. |
| Open Graph | `og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:locale`, `og:site_name`. |
| Twitter | `summary_large_image`. |
| JSON-LD | `ProfessionalService` sur l'accueil FR et EN : nom, description, date de création, zones desservies, catalogue de services, email. |
| `sitemap.xml` | 14 URL, avec `xhtml:link` réciproques pour les alternates de langue. |
| `robots.txt` | Tout autorisé, `Sitemap:` renseigné. |
| Redirections | `<meta http-equiv="refresh" content="0;url=...">` + `<link rel="canonical">` vers la cible + lien cliquable de secours. GitHub Pages ne permet pas de redirection HTTP 301. |

## 7. Performance

| Levier | Mise en œuvre |
|--------|---------------|
| Polices | 4 familles, 8 graisses au total, `display=swap`, préconnexion. |
| Images | Visuels sectoriels recadrés en 900×600 et compressés (~90 Ko pièce, contre 1 Mo pour certains originaux). `loading="lazy"`, `width` et `height` explicites pour éviter les décalages de mise en page. |
| CSS | 3 fichiers partagés, mis en cache pour toute la navigation. 50 Ko bruts, **11 Ko transmis** — GitHub Pages compresse en gzip. |
| JS | 5 fichiers, tous `defer`, zéro dépendance externe. Aucune page ne les charge tous : `site.js` + `ui.js` + `motion.js` partout, plus `hero-network.js` sur l'accueil ou `contact-form.js` sur les pages de contact. Page la plus lourde (l'accueil) : 29 Ko bruts, **8,3 Ko transmis**. |
| Canvas | Suspendu hors viewport et onglet masqué. |
| Animations | Limitées à `transform` et `opacity` — pas de recalcul de mise en page. Le parallaxe lit toutes les positions avant d'écrire les styles, dans un seul `requestAnimationFrame`. |

## 8. Compatibilité et repli

| Fonctionnalité | Repli |
|----------------|-------|
| `backdrop-filter` | `@supports not` → fond opaque du header. |
| `IntersectionObserver` | Test d'existence — sinon tout le contenu est visible immédiatement. |
| Canvas | Rendu SVG statique en dessous, révélé si le canvas ne s'initialise pas. |
| `fetch` | Test d'existence — sinon soumission `mailto:`. |
| CSS `:has()` | Non utilisé. |

## 9. Déploiement

Aucun changement de procédure. Fusion sur `main` → GitHub Pages publie
automatiquement. Le fichier `CNAME` est conservé à l'identique.

**Vérifications avant fusion :**

1. Aucun lien mort — attention à la casse, GitHub Pages est sensible à la casse.
2. Les 5 anciennes URL redirigent correctement.
3. Le formulaire de contact envoie réellement un email (nécessite la clé Web3Forms).
4. Les alternates `hreflang` sont réciproques.
5. `sitemap.xml` est valide.
6. Lighthouse mobile ≥ 95 en Performance et Accessibilité.

## 10. Dette assumée

| Point | Raison | Déclencheur de traitement |
|-------|--------|---------------------------|
| Header et footer dupliqués sur 14 pages | Conséquence directe d'ADR-1. | Au-delà de 20 pages, envisager Astro. |
| Contenu bilingue dupliqué | Conséquence d'ADR-3. | Si une troisième langue devient nécessaire. |
| Pas de CMS | Hors périmètre. | Si un non-développeur doit éditer le contenu régulièrement. |
| Clé Web3Forms en clair | Fonctionnement nominal du service. | Aucun — la clé n'autorise que l'envoi vers l'adresse configurée. |
