# PRD — Refonte xsom.fr

> **Phase BMAD :** Product Manager
> **Entrée :** `01-project-brief.md`
> **Statut :** Validé

---

## 1. Architecture d'information

### 1.1 Décision : 8 pages → 6 pages

Les pages `vision.html`, `IA.html` et `about.html` développent le même
argumentaire. Elles sont fusionnées pour produire des pages fortes plutôt que
des pages moyennes.

| Page actuelle | Devient | Justification |
|---------------|---------|---------------|
| `index.html` | `index.html` | Refonte complète. |
| `expertise.html` | `expertises.html` | Enrichie des secteurs et des types de mission. |
| `IA.html` + `vision.html` | `ia-souverainete.html` | Fusion. La vision *est* le discours IA & souveraineté ; les séparer affaiblit les deux. |
| `about.html` | `cabinet.html` | Recentrée sur les preuves et les principes. Retrait des formulations qui s'excusent de la taille. |
| `join.html` | `carrieres.html` | Conservée, restructurée. |
| `contact.html` | `contact.html` | Avec formulaire fonctionnel. |
| — | `mentions-legales.html` | Nouvelle. Obligation légale (LCEN). |
| `cookies.html` | `cookies.html` | Conservée, réalignée. |

### 1.2 Navigation principale

```
Accueil · Expertises · IA & Souveraineté · Le cabinet · Carrières   [Contact] [FR|EN]
```

Cinq entrées plus un CTA. Le sélecteur de langue est un lien direct vers la page
équivalente dans l'autre langue.

### 1.3 Arborescence des URL

```
/                             /en/
/expertises.html              /en/expertise.html
/ia-souverainete.html         /en/ai-sovereignty.html
/cabinet.html                 /en/firm.html
/carrieres.html               /en/careers.html
/contact.html                 /en/contact.html
/mentions-legales.html        (FR uniquement)
/cookies.html                 (FR uniquement)
```

Les anciennes URL (`expertise.html`, `IA.html`, `vision.html`, `about.html`,
`join.html`) sont conservées comme pages de redirection HTML afin de ne pas
casser les liens entrants et les résultats déjà indexés.

---

## 2. Exigences fonctionnelles

### FR-1 — Navigation
- **FR-1.1** Le header est présent dans le HTML source de chaque page, pas injecté en JavaScript.
- **FR-1.2** Le header est fixe, devient opaque au défilement au-delà de 40 px.
- **FR-1.3** La page courante est signalée dans la navigation.
- **FR-1.4** En dessous de 900 px, la navigation bascule en menu plein écran, fermable au clavier (`Échap`) et au clic sur un lien.
- **FR-1.5** Le sélecteur de langue pointe vers l'URL équivalente dans l'autre langue, jamais vers la racine.

### FR-2 — Accueil
- **FR-2.1** Hero avec titre, sous-titre, deux CTA et une visualisation animée d'infrastructure.
- **FR-2.2** La visualisation est désactivée si `prefers-reduced-motion: reduce` est actif, remplacée par un état statique.
- **FR-2.3** Bandeau de références clients (logos autorisés), défilement continu, mis en pause au survol.
- **FR-2.4** Section « trois pôles » avec accès direct aux pages détaillées.
- **FR-2.5** Bandeau de chiffres clés.
- **FR-2.6** Section « approche » et section « réalisations » (gabarit prêt, masquable par un attribut).
- **FR-2.7** CTA final double : contact commercial et candidature.

### FR-3 — Expertises
- **FR-3.1** Trois pôles détaillés, chacun avec ses domaines d'intervention.
- **FR-3.2** Grille des expertises fonctionnelles et techniques.
- **FR-3.3** Six secteurs d'intervention.
- **FR-3.4** Quatre types de mission (audit/cadrage, AMOA/PMO, AMOE, accompagnement long terme).

### FR-4 — IA & Souveraineté
- **FR-4.1** Argumentaire de fond : l'IA repose sur des fondations que peu de monde regarde.
- **FR-4.2** Les trois promesses : sérénité, sécurité, souveraineté — chacune avec ses livrables concrets.
- **FR-4.3** Les trois leviers de l'offre : data engineering, IA appliquée, contrôle & conformité.
- **FR-4.4** Cadres réglementaires couverts : AI Act, DORA, NIS2, RGPD, SecNumCloud.

### FR-5 — Le cabinet
- **FR-5.1** Récit du cabinet en registre humain, sans formulation défensive sur la taille.
- **FR-5.2** Trois valeurs : proximité, engagement, transmission.
- **FR-5.3** Cinq principes d'intervention.
- **FR-5.4** Chiffres clés du cabinet.
- **FR-5.5** Emplacement prévu pour les portraits de l'équipe, masqué tant qu'il est vide.

### FR-6 — Carrières
- **FR-6.1** Proposition de valeur employeur en six points.
- **FR-6.2** Profil recherché et domaines d'expertise attendus.
- **FR-6.3** Zone d'offres d'emploi avec état « aucune offre publiée » par défaut.
- **FR-6.4** Marche à suivre pour une candidature spontanée.

### FR-7 — Contact
- **FR-7.1** Formulaire fonctionnel : nom, organisation, email, sujet, message, consentement.
- **FR-7.2** Envoi via Web3Forms (compatible hébergement statique). La clé publique est en clair dans le HTML — c'est le fonctionnement nominal du service, elle n'autorise que l'envoi vers l'adresse configurée.
- **FR-7.3** Validation côté client avant envoi, messages d'erreur explicites par champ.
- **FR-7.4** États visibles : au repos, envoi en cours, succès, échec.
- **FR-7.5** En cas d'échec réseau, proposition de repli par `mailto:` avec le message pré-rempli.
- **FR-7.6** Champ anti-spam (honeypot) invisible.
- **FR-7.7** Coordonnées directes affichées à côté du formulaire : email, LinkedIn, implantations.

### FR-8 — Bilingue
- **FR-8.1** Chaque page FR a son équivalent EN sous `/en/`.
- **FR-8.2** Balises `<link rel="alternate" hreflang>` réciproques sur chaque page, plus `x-default` vers la version FR.
- **FR-8.3** `<html lang>` correct sur chaque page.
- **FR-8.4** Traduction rédigée, pas littérale : l'anglais s'adresse au marché américain.

### FR-9 — SEO et partage
- **FR-9.1** `<title>` et `<meta description>` uniques par page et par langue.
- **FR-9.2** Balises Open Graph et Twitter Card complètes.
- **FR-9.3** Données structurées JSON-LD `ProfessionalService` sur l'accueil.
- **FR-9.4** `sitemap.xml` couvrant les deux langues, `robots.txt` pointant dessus.
- **FR-9.5** URL canonique sur chaque page.
- **FR-9.6** Une seule balise `<h1>` par page, hiérarchie de titres continue.

### FR-10 — Accessibilité
- **FR-10.1** Contraste minimum 4.5:1 pour le texte courant, 3:1 pour le texte large.
- **FR-10.2** Focus visible sur tout élément interactif.
- **FR-10.3** Navigation complète au clavier.
- **FR-10.4** Lien d'évitement vers le contenu principal.
- **FR-10.5** Texte alternatif sur toutes les images porteuses de sens ; `alt=""` sur les images décoratives.
- **FR-10.6** Toutes les animations respectent `prefers-reduced-motion`.
- **FR-10.7** Repères ARIA : `<header>`, `<nav>`, `<main>`, `<footer>`.

---

## 3. Exigences non fonctionnelles

| Réf. | Exigence |
|------|----------|
| NFR-1 | Lighthouse ≥ 95 en Performance, Accessibilité et Bonnes pratiques, sur mobile. |
| NFR-2 | Aucune étape de build requise pour déployer. Le dépôt est servable tel quel. |
| NFR-3 | Aucune dépendance JavaScript tierce. Uniquement du JS natif. |
| NFR-4 | Seule ressource externe autorisée : les polices Google Fonts, préconnectées. |
| NFR-5 | Le site reste lisible et navigable sans JavaScript, hors formulaire et animations. |
| NFR-6 | CSS total sous 60 Ko non compressé, JS total sous 20 Ko. |
| NFR-7 | Compatible Chrome, Firefox, Safari, Edge — deux dernières versions majeures. |
| NFR-8 | Modifier une couleur d'accent = modifier une seule déclaration CSS. |

---

## 4. Epics et stories

### Epic 1 — Socle technique et design system

| Story | Intitulé | Critères d'acceptation |
|-------|----------|------------------------|
| 1.1 | Créer les jetons de design | `tokens.css` définit couleurs, typographies, échelles d'espacement, rayons, ombres, durées. Aucune valeur brute ailleurs dans le CSS. |
| 1.2 | Créer le socle de base | `base.css` : reset, typographie, conteneurs, utilitaires, styles de focus, réglages `prefers-reduced-motion`. |
| 1.3 | Créer la bibliothèque de composants | `components.css` : header, footer, boutons, cartes, badges, sections, bandeaux, formulaire. |
| 1.4 | Créer le script de site | `site.js` : menu mobile, header au défilement, révélation au défilement, compteurs de chiffres. Sous 8 Ko. |
| 1.5 | Supprimer le code mort | `send_mail.php`, `translate.js`, `carousel.js`, `navbar.js`, `animations.js`, `footer.js`, `header.js`, `style.css` supprimés. |

### Epic 2 — Pages françaises

| Story | Intitulé | Critères d'acceptation |
|-------|----------|------------------------|
| 2.1 | Accueil | FR-2.1 à FR-2.7 satisfaites. |
| 2.2 | Expertises | FR-3.1 à FR-3.4 satisfaites. |
| 2.3 | IA & Souveraineté | FR-4.1 à FR-4.4 satisfaites. |
| 2.4 | Le cabinet | FR-5.1 à FR-5.5 satisfaites. |
| 2.5 | Carrières | FR-6.1 à FR-6.4 satisfaites. |
| 2.6 | Contact | FR-7.1 à FR-7.7 satisfaites. |
| 2.7 | Pages légales | Mentions légales et cookies rédigées et alignées sur la charte. |
| 2.8 | Redirections | Les 5 anciennes URL redirigent vers leur nouvelle cible. |

### Epic 3 — Version anglaise

| Story | Intitulé | Critères d'acceptation |
|-------|----------|------------------------|
| 3.1 | Six pages EN sous `/en/` | Contenu rédigé en anglais, pas traduit mot à mot. |
| 3.2 | Liaison bilingue | `hreflang` réciproque et `x-default` sur les 12 pages. Sélecteur de langue fonctionnel dans les deux sens. |

### Epic 4 — SEO, conversion et finition

| Story | Intitulé | Critères d'acceptation |
|-------|----------|------------------------|
| 4.1 | Métadonnées complètes | FR-9.1, FR-9.2, FR-9.5 sur les 14 pages. |
| 4.2 | Données structurées | JSON-LD `ProfessionalService` valide. |
| 4.3 | Sitemap et robots | `sitemap.xml` et `robots.txt` créés et cohérents. |
| 4.4 | Formulaire opérationnel | FR-7.1 à FR-7.6 satisfaites, dégradation propre incluse. |
| 4.5 | Passe d'accessibilité | FR-10.1 à FR-10.7 vérifiées. |

---

## 5. Contenu à fournir par le client

Ces éléments bloquent partiellement la qualité finale. Le site est livré
fonctionnel sans eux, avec des valeurs de repli signalées dans
`assets/js/site.js` et dans les commentaires HTML.

| Priorité | Élément | Emplacement | Défaut appliqué |
|----------|---------|-------------|-----------------|
| 🔴 Haute | 3 à 5 études de cas anonymisées (contexte / intervention / résultat) | Section « Réalisations » de l'accueil | Section masquée. |
| 🔴 Haute | Chiffres réels : nombre de consultants, de missions, de clients, taux de renouvellement | Bandeau de chiffres, page cabinet | Valeurs vérifiables uniquement (ancienneté, secteurs, indépendance). |
| 🟠 Moyenne | Clé publique Web3Forms | `contact.html`, `en/contact.html` | Marqueur `VOTRE_CLE_WEB3FORMS`, formulaire en repli `mailto:`. |
| 🟠 Moyenne | Portraits et biographies de l'équipe | Page cabinet | Section masquée. |
| 🟡 Basse | Image de partage social 1200×630 | Balises Open Graph | Le logo est utilisé. |
| 🟡 Basse | Mentions légales : SIREN, forme juridique, capital, hébergeur, directeur de publication | `mentions-legales.html` | Marqueurs `[À COMPLÉTER]`. |
| 🟡 Basse | URL LinkedIn du cabinet | Header, footer, contact | Lien vers la recherche LinkedIn. |

---

## 6. Hors périmètre

Blog, espace client, CMS, chiffrage en ligne, prise de rendez-vous intégrée,
tests A/B, analytics. À traiter dans une itération ultérieure si le besoin se
confirme.
