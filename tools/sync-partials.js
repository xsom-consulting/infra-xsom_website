#!/usr/bin/env node
/* ==========================================================================
   Synchronisation des blocs partagés (header et pied de page)

   Le site est volontairement sans étape de build : le HTML est complet et
   servable tel quel. Ce script est un simple utilitaire de maintenance.

   Il recopie les blocs délimités par les marqueurs suivants, depuis une page
   de référence vers toutes les autres pages de la même langue :

       <!-- nav:start -->    …    <!-- nav:end -->
       <!-- footer:start --> …    <!-- footer:end -->

   Il ajuste au passage, pour chaque page cible :
     - l'attribut aria-current="page" sur le bon lien de navigation ;
     - le lien du sélecteur de langue vers la page équivalente ;
     - le lien « English » / « Français » du pied de page.

   Utilisation :
       node tools/sync-partials.js            # applique les modifications
       node tools/sync-partials.js --check    # signale les écarts sans écrire

   Références : index.html pour le français, en/index.html pour l'anglais.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

/* Correspondance FR ↔ EN, et lien de navigation actif par page. */
const PAGES = {
  fr: {
    reference: 'index.html',
    items: [
      { file: 'index.html',             nav: 'index.html',            alt: 'en/index.html' },
      { file: 'expertises.html',        nav: 'expertises.html',       alt: 'en/expertise.html' },
      { file: 'ia-souverainete.html',   nav: 'ia-souverainete.html',  alt: 'en/ai-sovereignty.html' },
      { file: 'cabinet.html',           nav: 'cabinet.html',          alt: 'en/firm.html' },
      { file: 'carrieres.html',         nav: 'carrieres.html',        alt: 'en/careers.html' },
      { file: 'contact.html',           nav: 'contact.html',          alt: 'en/contact.html' },
      { file: 'mentions-legales.html',  nav: null,                    alt: 'en/index.html' },
      { file: 'cookies.html',           nav: null,                    alt: 'en/index.html' }
    ]
  },
  en: {
    reference: 'en/index.html',
    items: [
      { file: 'en/index.html',          nav: 'index.html',            alt: '../index.html' },
      { file: 'en/expertise.html',      nav: 'expertise.html',        alt: '../expertises.html' },
      { file: 'en/ai-sovereignty.html', nav: 'ai-sovereignty.html',   alt: '../ia-souverainete.html' },
      { file: 'en/firm.html',           nav: 'firm.html',             alt: '../cabinet.html' },
      { file: 'en/careers.html',        nav: 'careers.html',          alt: '../carrieres.html' },
      { file: 'en/contact.html',        nav: 'contact.html',          alt: '../contact.html' }
    ]
  }
};

const BLOCKS = ['nav', 'footer'];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function extract(html, name) {
  const re = new RegExp(`<!--\\s*${name}:start\\s*-->[\\s\\S]*?<!--\\s*${name}:end\\s*-->`);
  const match = html.match(re);
  if (!match) throw new Error(`Bloc "${name}" introuvable dans la page de référence.`);
  return match[0];
}

function replaceBlock(html, name, block) {
  const re = new RegExp(`<!--\\s*${name}:start\\s*-->[\\s\\S]*?<!--\\s*${name}:end\\s*-->`);
  if (!re.test(html)) return null;
  return html.replace(re, function () { return block; });
}

/* Retire tous les aria-current="page" du bloc, puis le repose sur le premier
   lien qui pointe vers la page courante — en ignorant le logo, qui pointe vers
   l'accueil sans pour autant être l'entrée de navigation active.
   Sur la page de contact, le lien concerné est le bouton d'appel à l'action :
   on ne peut donc pas se contenter de chercher `<a href="…"` en début de balise. */
function setActiveNav(block, navTarget) {
  const out = block.replace(/\s+aria-current="page"/g, '');
  if (!navTarget) return out;

  const esc = navTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reHref = new RegExp(`href="${esc}"`);
  let done = false;

  return out.replace(/<a\b[^>]*>/g, function (tag) {
    if (done || /class="brand"/.test(tag) || !reHref.test(tag)) return tag;
    done = true;
    return tag.replace(/>$/, ' aria-current="page">');
  });
}

/* Réécrit la cible du sélecteur de langue et le lien de langue du pied de page.

   On cible le libellé du lien (EN / English, FR / Français) et pas seulement
   l'attribut hreflang : le pied de page anglais pointe aussi vers les pages
   légales françaises, qui portent le même hreflang et ne doivent pas bouger. */
function setLanguageLinks(block, lang, altHref) {
  const otherLang = lang === 'fr' ? 'en' : 'fr';
  const labels = lang === 'fr' ? 'EN|English' : 'FR|Français';
  const reLang = new RegExp(
    `(<a href=")[^"]*(" hreflang="${otherLang}" lang="${otherLang}">(?:${labels})</a>)`,
    'g'
  );
  return block.replace(reLang, `$1${altHref}$2`);
}

let changed = 0;
let mismatched = 0;

for (const lang of Object.keys(PAGES)) {
  const group = PAGES[lang];
  const referenceHtml = read(group.reference);
  const source = {};
  for (const name of BLOCKS) source[name] = extract(referenceHtml, name);

  for (const item of group.items) {
    const full = path.join(ROOT, item.file);
    if (!fs.existsSync(full)) {
      console.warn(`  ignoré (absent)  ${item.file}`);
      continue;
    }

    const original = read(item.file);
    let updated = original;

    for (const name of BLOCKS) {
      let block = source[name];
      block = setLanguageLinks(block, lang, item.alt);
      if (name === 'nav') block = setActiveNav(block, item.nav);

      const next = replaceBlock(updated, name, block);
      if (next === null) {
        console.warn(`  marqueurs "${name}" absents dans ${item.file} — ignoré`);
        continue;
      }
      updated = next;
    }

    if (updated === original) continue;

    if (CHECK_ONLY) {
      console.log(`  écart détecté    ${item.file}`);
      mismatched++;
    } else {
      fs.writeFileSync(full, updated, 'utf8');
      console.log(`  mis à jour       ${item.file}`);
      changed++;
    }
  }
}

if (CHECK_ONLY) {
  console.log(mismatched
    ? `\n${mismatched} page(s) désynchronisée(s). Relancer sans --check pour corriger.`
    : '\nToutes les pages sont synchronisées.');
  process.exit(mismatched ? 1 : 0);
}

console.log(changed ? `\n${changed} page(s) mise(s) à jour.` : '\nAucune modification nécessaire.');
