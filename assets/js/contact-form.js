/* ==========================================================================
   xSOM Consulting — Formulaires de contact

   GitHub Pages ne sert que des fichiers statiques : aucun code serveur ne
   peut envoyer d'email depuis www.xsom.fr. Chaque formulaire
   `form[data-contact-form]` envoie donc sa demande, en JSON, à l'adresse de
   son attribut `action` : le serveur du site de la division IA
   (https://ai.xsom.fr/api/contact, hébergé chez Vercel), qui transmet le
   message par Resend à l'adresse de contact xsom.fr, avec le visiteur en
   adresse de réponse. Aucune clé ni aucun secret ne figure dans ce site.

   Sans JavaScript, le même `action` reçoit un POST natif ; le serveur
   renvoie alors vers la page d'origine avec `?envoi=ok` ou `?envoi=erreur`,
   que ce script affiche s'il s'exécute au retour.

   Repli : si l'envoi échoue, la saisie est conservée et un lien `mailto:`
   pré-rempli est proposé. Aucune saisie n'est perdue.

   Un lien `[data-contact-toggle="id"]` (fermeture de l'accueil) déplie le
   formulaire placé dans l'élément `id` au lieu de quitter la page ; sans
   JavaScript, il reste un simple lien vers la page de contact.
   ========================================================================== */
(function () {
  'use strict';

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var english = document.documentElement.lang === 'en';

  /* ---- Retour d'un envoi natif (sans JavaScript au moment de l'envoi) ---- */

  var returned = (function () {
    var match = /[?&]envoi=(ok|erreur)(?:&|$)/.exec(window.location.search);
    if (!match) return '';
    // On retire le paramètre de l'adresse : recharger la page ne doit pas
    // réafficher un message déjà lu.
    if (window.history && typeof window.history.replaceState === 'function') {
      var search = window.location.search.replace(/([?&])envoi=(?:ok|erreur)(&|$)/, function (_, lead, tail) {
        return tail ? lead : '';
      }).replace(/^\?$/, '');
      window.history.replaceState(null, '', window.location.pathname + search + window.location.hash);
    }
    return match[1];
  })();

  /* ---- Dépliage du formulaire depuis un lien ----------------------------- */

  function firstField(panel) {
    return panel.querySelector('input:not([type="hidden"]):not(.hp), textarea, select');
  }

  function setOpen(toggle, panel, open, focus) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open && focus) {
      var field = firstField(panel);
      if (field) field.focus();
    }
  }

  function initToggle(toggle) {
    var panel = document.getElementById(toggle.getAttribute('data-contact-toggle'));
    if (!panel) return;
    // Le lien devient un bouton de dépliage ; son href reste pour un nouvel onglet.
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-controls', panel.id);
    setOpen(toggle, panel, !panel.hidden, false);

    toggle.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return;
      e.preventDefault();
      setOpen(toggle, panel, panel.hidden, true);
    });
    // Un rôle de bouton promet aussi la barre d'espace.
    toggle.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Spacebar') return;
      e.preventDefault();
      setOpen(toggle, panel, panel.hidden, true);
    });

    if (returned) setOpen(toggle, panel, true, false);
  }

  /* ---- Formulaire -------------------------------------------------------- */

  function initForm(form) {
    // Le POST natif et la validation du navigateur restent le repli sans JavaScript.
    form.noValidate = true;

    var statusBox = form.querySelector('[data-form-status]');
    var submitBtn = form.querySelector('[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : '';
    var endpoint = form.getAttribute('action');

    var t = {
      required:  form.getAttribute('data-msg-required')  || 'Ce champ est requis.',
      email:     form.getAttribute('data-msg-email')     || 'Adresse email invalide.',
      minlength: form.getAttribute('data-msg-minlength') || (english ? 'Please write a few more words.' : 'Quelques mots de plus, s’il vous plaît.'),
      consent:   form.getAttribute('data-msg-consent')   || 'Merci de cocher cette case pour continuer.',
      sending:   form.getAttribute('data-msg-sending')   || 'Envoi en cours…',
      success:   form.getAttribute('data-msg-success')   || 'Message envoyé. Nous revenons vers vous sous 48 h.',
      error:     form.getAttribute('data-msg-error')     || "L'envoi a échoué.",
      fallback:  form.getAttribute('data-msg-fallback')  || 'Envoyer par email à la place'
    };

    var mailTo = form.getAttribute('data-mailto') || 'jean-philippe.talou@xsom.fr';

    /* -- Validation -- */

    function setError(field, message) {
      var wrap = field.closest('.field') || field.closest('.consent');
      if (!wrap) return;
      var box = wrap.querySelector('.field__error');
      if (box) {
        box.textContent = message || '';
        if (!box.id && field.id) box.id = field.id + '-error';
        if (box.id) field.setAttribute('aria-describedby', box.id);
      }
      wrap.classList.toggle('is-valid', !message && field.type !== 'checkbox' && !!field.value.trim());
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }

    // Message d'erreur d'un champ rempli (format, longueur), ou chaîne vide.
    function formatError(field, rules) {
      var value = field.value.trim();
      if (rules.indexOf('email') !== -1 && !EMAIL.test(value)) return t.email;
      var min = parseInt(field.getAttribute('minlength'), 10);
      if (min > 0 && value.length < min) return t.minlength;
      return '';
    }

    function validate() {
      var ok = true;
      var firstInvalid = null;
      var fields = form.querySelectorAll('[data-validate]');

      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var rules = field.getAttribute('data-validate').split(' ');
        var message = '';

        if (rules.indexOf('required') !== -1) {
          var filled = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
          if (!filled) message = field.type === 'checkbox' ? t.consent : t.required;
        }
        if (!message && field.type !== 'checkbox' && field.value.trim()) message = formatError(field, rules);

        setError(field, message);
        if (message) {
          ok = false;
          if (!firstInvalid) firstInvalid = field;
        }
      }

      if (firstInvalid) firstInvalid.focus();
      return ok;
    }

    // Efface l'erreur dès que l'utilisateur corrige, pour ne pas le harceler
    // pendant la frappe.
    form.addEventListener('input', function (e) {
      if (e.target.hasAttribute('data-validate') && e.target.getAttribute('aria-invalid')) {
        setError(e.target, '');
      }
    });

    // Mais à la sortie du champ, on revalide : sinon un email resté invalide
    // paraît accepté jusqu'à la soumission, alors que l'erreur était affichée
    // un instant plus tôt.
    form.addEventListener('focusout', function (e) {
      var field = e.target;
      if (!field.hasAttribute || !field.hasAttribute('data-validate')) return;
      var value = field.type === 'checkbox' ? field.checked : field.value.trim();
      if (!value) return;                     // champ vide : on attend l'envoi
      setError(field, field.type === 'checkbox' ? '' : formatError(field, field.getAttribute('data-validate').split(' ')));
    }, true);

    /* -- Repli mailto -- */

    function value(name) {
      var field = form.elements[name];
      return field && typeof field.value === 'string' ? field.value.trim() : '';
    }

    function buildMailto() {
      var subject = 'Contact xsom.fr — ' + (value('subject') || (english ? 'Request' : 'Demande'));
      var body = [
        (english ? 'Name: ' : 'Nom : ') + value('name'),
        (english ? 'Organisation: ' : 'Organisation : ') + value('company'),
        (english ? 'Email: ' : 'Email : ') + value('email'),
        (english ? 'Subject: ' : 'Sujet : ') + value('subject'),
        '',
        value('message')
      ].join('\n');

      return 'mailto:' + mailTo +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }

    function showStatus(kind, html) {
      if (!statusBox) return;
      statusBox.className = 'form__status is-' + kind;
      statusBox.innerHTML = html;
      statusBox.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    }

    function showFallback(message) {
      showStatus('error',
        message + ' <a href="' + buildMailto() + '">' + t.fallback + '</a>');
    }

    function setBusy(busy) {
      if (!submitBtn) return;
      submitBtn.disabled = busy;
      submitBtn.setAttribute('aria-busy', String(busy));
      submitBtn.textContent = busy ? t.sending : submitLabel;
    }

    function clearFeedback() {
      var errs = form.querySelectorAll('.field__error');
      for (var i = 0; i < errs.length; i++) errs[i].textContent = '';
      form.querySelectorAll('[aria-invalid]').forEach(function (field) { field.removeAttribute('aria-invalid'); });
      form.querySelectorAll('.is-valid').forEach(function (field) { field.classList.remove('is-valid'); });
    }

    if (returned) {
      if (returned === 'ok') showStatus('success', t.success);
      else showFallback(t.error);
      if (statusBox && statusBox.scrollIntoView) statusBox.scrollIntoView({ block: 'center' });
    }

    /* -- Soumission -- */

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitBtn && submitBtn.disabled) return;

      // Honeypot : un bot coche tout, un humain ne voit pas ce champ.
      // Attention : sur une case à cocher, `.value` vaut "on" même décochée —
      // c'est `.checked` qu'il faut lire, sinon le formulaire sort toujours ici.
      var honey = form.querySelector('[name="botcheck"]');
      if (honey && (honey.type === 'checkbox' ? honey.checked : honey.value)) return;

      if (!validate()) return;

      // Navigateur sans fetch : le POST natif reste possible, le serveur
      // renvoie ensuite vers cette page avec le résultat.
      if (typeof window.fetch !== 'function') {
        if (endpoint) form.submit();
        else {
          showFallback(t.error);
          window.location.href = buildMailto();
        }
        return;
      }

      setBusy(true);
      if (statusBox) statusBox.className = 'form__status';

      var payload = {
        name: value('name'),
        email: value('email'),
        company: value('company'),
        subject: value('subject'),
        message: value('message'),
        botcheck: false,
        lang: english ? 'en' : 'fr'
      };

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          setBusy(false);
          if (res.ok) {
            showStatus('success', t.success);
            form.reset();
            clearFeedback();
          } else {
            showFallback(t.error);
          }
        })
        .catch(function () {
          setBusy(false);
          showFallback(t.error);
        });
    });
  }

  // Les volets d'abord : au retour d'un envoi natif, le formulaire doit être
  // déplié avant que son message soit affiché et amené à l'écran.
  var toggles = document.querySelectorAll('[data-contact-toggle]');
  for (var j = 0; j < toggles.length; j++) initToggle(toggles[j]);

  var forms = document.querySelectorAll('form[data-contact-form]');
  for (var i = 0; i < forms.length; i++) initForm(forms[i]);
})();
