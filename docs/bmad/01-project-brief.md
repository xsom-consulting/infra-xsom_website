# Project Brief — Refonte xsom.fr

> **Phase BMAD :** Analyst
> **Statut :** Validé
> **Date :** 2026-07-29

---

## 1. Contexte

xSOM Consulting est un cabinet de conseil en informatique indépendant, fondé en
2007, présent en France (Paris) et aux États-Unis. Il intervient sur trois pôles :
télécom / réseau / cybersécurité, infrastructures IA & cloud souverain, et
data science / ML / automatisation.

Le site actuel (`www.xsom.fr`, GitHub Pages) est composé de 8 pages HTML
statiques. Il présente correctement l'offre mais souffre de défauts structurels
qui l'empêchent de servir ses objectifs commerciaux.

## 2. Diagnostic de l'existant

### 2.1 Problèmes critiques

| # | Constat | Conséquence |
|---|---------|-------------|
| P1 | **Positionnement contradictoire.** La home promet gouvernance / cyber / IA sur un ton d'autorité, tandis que `about.html` revendique « petits par choix », « cabinet familial », « nous aurions pu grandir plus vite ». | Le visiteur ne sait pas s'il s'adresse à un cabinet puissant ou à une petite structure de proximité. La promesse se neutralise. |
| P2 | **Absence totale de preuve.** Aucune étude de cas, aucun résultat chiffré de mission, aucun visage, aucun témoignage. Les seuls chiffres (« 18 ans », « 3 pôles », « 100 % indépendant ») sont des attributs, pas des preuves. | Pour un achat de conseil — décision à fort risque perçu — l'absence de preuve est le premier motif d'abandon. |
| P3 | **Canal de contact défaillant.** `send_mail.php` est présent dans le dépôt mais GitHub Pages ne peut pas exécuter de PHP. Le seul canal réel est un lien `mailto:`. | Toute conversion passant par un formulaire est perdue. Le fichier PHP est du code mort trompeur. |
| P4 | **Redondance éditoriale.** `vision.html`, `IA.html` et `about.html` développent trois fois le même argumentaire (souveraineté, 18 ans d'infrastructures critiques, sérénité). | Dilution du message, coût de maintenance triplé, cannibalisation SEO entre les pages. |

### 2.2 Problèmes techniques

| # | Constat | Conséquence |
|---|---------|-------------|
| T1 | Lien mort en pied de page : `ia.html` alors que le fichier est `IA.html`. GitHub Pages est sensible à la casse. | 404 sur un lien de navigation principal. |
| T2 | Le CSS est dupliqué en `<style>` inline dans chaque page (~20 à 30 Ko par page). `assets/css/style.css` n'est quasiment pas utilisé. | Aucune mise en cache entre pages, toute évolution de style demande 8 modifications, dérive garantie. |
| T3 | Incohérence de la charte : `--accent` vaut `#bfc5ce` (gris) mais toutes les bordures et pastilles utilisent `rgba(200,164,86)` (doré). | Deux couleurs d'accent coexistent sans intention. |
| T4 | `assets/js/translate.js` : 600 lignes de dictionnaire FR/EN jamais reliées à un sélecteur de langue. | Code mort. Le bilingue annoncé n'existe pas. |
| T5 | Header et footer injectés par JavaScript après `DOMContentLoaded`. | Décalage visuel au chargement, navigation absente du HTML source. |
| T6 | SEO absent : pas de balises Open Graph, pas de `sitemap.xml`, pas de `robots.txt`, pas de données structurées, `© 2026` codé en dur. | Aucun contrôle sur le partage social, indexation non guidée. |
| T7 | Aucun jeu de couleurs clair : `.as` et `.pt` forcent un fond blanc avec des couleurs réécrites en styles inline sur chaque élément. | Sections claires fragiles et illisibles à maintenir. |

## 3. Objectifs

Le site doit servir **trois objectifs simultanés**, par ordre d'importance
décroissante dans le parcours mais tous trois structurants :

1. **Générer des leads clients** — DSI, directions techniques et directions
   métiers en recherche d'un cabinet.
2. **Crédibiliser en amont** — rassurer un contact issu d'une recommandation ou
   d'une rencontre, qui vient vérifier la solidité du cabinet.
3. **Recruter des consultants** — attirer des profils seniors en télécom, cyber,
   data et IA.

## 4. Positionnement retenu

**Hybride assumé.** Le site tient deux registres, séparés par niveau de
profondeur — et non mélangés dans une même page :

- **En façade** (accueil, expertises, IA & souveraineté) : registre de la
  **puissance technique**. Profondeur d'expertise, références grands comptes,
  maîtrise des infrastructures critiques. Ton affirmatif, densité technique
  assumée.
- **En profondeur** (le cabinet, carrières) : registre **humain**. Proximité,
  interlocuteurs stables, transmission, indépendance.

**Règle d'arbitrage :** le côté « taille humaine » est présenté comme un
*avantage d'accès* (« vous parlez directement aux experts qui font la mission »)
et jamais comme une *limite de capacité* (« nous aurions pu grandir plus vite »).
Toute formulation qui s'excuse de la taille du cabinet est supprimée.

## 5. Cibles

| Persona | Situation | Ce qu'il cherche sur le site | Preuve attendue |
|---------|-----------|------------------------------|-----------------|
| **DSI / Directeur technique** — grand compte ou ETI | A un programme complexe à cadrer ou sécuriser. Compare 2 à 3 cabinets. | Profondeur réelle de l'expertise, secteurs déjà couverts, capacité à tenir un programme critique. | Références nommées, périmètre des missions, cadres réglementaires maîtrisés (DORA, NIS2, LPM, AI Act). |
| **Direction métier / Chef de programme** | Doit lancer un projet data ou IA sans en maîtriser les fondations. | Comprendre ce qu'il achète, et à quoi il s'expose. | Pédagogie sur l'infrastructure, la conformité, la souveraineté. Vocabulaire accessible. |
| **Consultant senior candidat** | 5 à 15 ans d'expérience, veut sortir d'une grande ESN. | Nature des missions, autonomie, exposition aux décideurs, sujets techniques. | Types de missions réels, culture explicite, contact direct sans process. |
| **Prescripteur / partenaire** | A recommandé xSOM, ou évalue un partenariat. | Vérifier la solidité et la légitimité. | Ancienneté, références, indépendance, présence internationale. |

## 6. Différenciateurs

Ce que xSOM peut affirmer et que peu de concurrents peuvent revendiquer :

1. **Continuité infrastructure → IA.** 18 ans de réseaux opérateurs et
   d'infrastructures critiques appliqués aux fondations de l'IA. La plupart des
   acteurs IA viennent de la donnée, pas de l'infrastructure.
2. **Indépendance totale.** Aucune affiliation éditeur ou intégrateur, aucune
   commission. Argument fort en cyber et en cloud souverain.
3. **Références grands comptes** dans des secteurs à haute exigence : Crédit
   Agricole, EDF, La Banque Postale, E.Leclerc — usage des marques autorisé.
4. **Accès direct aux experts.** Pas de couche commerciale, pas de rotation
   d'équipe, pas de délégation.
5. **Ancrage bi-continental** France / États-Unis.

## 7. Contraintes

| Contrainte | Détail |
|------------|--------|
| **Hébergement** | GitHub Pages, domaine `www.xsom.fr` via le fichier `CNAME`. Aucun serveur applicatif, aucun exécutable côté serveur. |
| **Stack** | HTML / CSS / JavaScript statiques. Aucune étape de build obligatoire pour déployer. |
| **Bilingue** | FR et EN complets dès la mise en ligne. |
| **Contenu disponible** | Chiffres réels du cabinet uniquement. Ni études de cas rédigées, ni photos d'équipe, ni témoignages à ce stade. |
| **Budget outillage** | Services externes gratuits uniquement (formulaire). |

## 8. Périmètre

### Inclus

- Refonte complète de l'architecture d'information : 8 pages → 6 pages + 2 pages légales.
- Nouveau design system (couleurs, typographie, composants) en fichiers CSS partagés.
- Version anglaise intégrale sous `/en/`.
- Formulaire de contact fonctionnel via service tiers.
- Socle SEO : métadonnées, Open Graph, données structurées, `sitemap.xml`, `robots.txt`.
- Suppression du code mort : `send_mail.php`, `translate.js`, `carousel.js`, `navbar.js`, `animations.js`, `footer.js`.

### Exclus (hors périmètre de cette itération)

- Blog / section d'articles.
- Espace client ou zone authentifiée.
- CMS ou interface d'édition de contenu.
- Rédaction des études de cas (structure prévue, contenu à fournir ultérieurement).
- Photographies d'équipe (emplacements prévus, contenu à fournir ultérieurement).

## 9. Risque principal ouvert

**L'absence d'études de cas reste le facteur limitant n°1 de la conversion.**

La refonte apporte le design, la structure et la crédibilité formelle, mais
aucune preuve de résultat. Une section « Réalisations » est prévue dans
l'architecture, avec un gabarit prêt à recevoir 3 à 5 missions anonymisées
(contexte → intervention → résultat mesurable). Tant qu'elle n'est pas remplie,
le site plafonne sur l'objectif n°1.

**Recommandation :** produire 3 fiches de mission anonymisées en priorité après
la mise en ligne.

## 10. Critères de succès

| Critère | Mesure |
|---------|--------|
| Cohérence du message | Un lecteur externe peut résumer le positionnement en une phrase après 30 secondes sur la home. |
| Conversion technique | Le formulaire de contact délivre effectivement un email. Zéro lien mort. |
| Performance | Lighthouse ≥ 95 en Performance et Accessibilité sur mobile. |
| Bilingue | Chaque page FR a son équivalent EN, relié par `hreflang`. |
| Maintenabilité | Modifier une couleur d'accent = modifier une seule ligne. |
| Indexation | `sitemap.xml` valide, données structurées `ProfessionalService` reconnues. |
