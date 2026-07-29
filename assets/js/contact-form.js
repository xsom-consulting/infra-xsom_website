/* ==========================================================================
   xSOM Consulting — Formulaire de contact

   GitHub Pages ne peut pas exécuter de code serveur. L'envoi passe par
   Web3Forms (https://web3forms.com), gratuit et conçu pour les sites
   statiques. La clé d'accès est publique par conception : elle n'autorise
   que l'envoi vers l'adresse email qui l'a générée.

   Repli : si la clé n'est pas configurée, ou si la requête échoue, le
   formulaire bascule sur un `mailto:` pré-rempli. Aucune saisie n'est perdue.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var statusBox = form.querySelector('[data-form-status]');
  var submitBtn = form.querySelector('[type="submit"]');
  var submitLabel = submitBtn ? submitBtn.textContent : '';
  var keyField = form.querySelector('input[name="access_key"]');
  var accessKey = keyField ? keyField.value.trim() : '';
  var keyConfigured = accessKey && accessKey.indexOf('VOTRE_CLE') === -1;

  var t = {
    required: form.getAttribute('data-msg-required') || 'Ce champ est requis.',
    email:    form.getAttribute('data-msg-email')    || 'Adresse email invalide.',
    consent:  form.getAttribute('data-msg-consent')  || 'Merci de cocher cette case pour continuer.',
    sending:  form.getAttribute('data-msg-sending')  || 'Envoi en cours…',
    success:  form.getAttribute('data-msg-success')  || 'Message envoyé. Nous revenons vers vous sous 48 h.',
    error:    form.getAttribute('data-msg-error')    || "L'envoi a échoué.",
    fallback: form.getAttribute('data-msg-fallback') || 'Envoyer par email à la place'
  };

  var mailTo = form.getAttribute('data-mailto') || 'jean-philippe.talou@xsom.fr';

  /* ---- Validation -------------------------------------------------------- */

  function setError(field, message) {
    var wrap = field.closest('.field') || field.closest('.consent');
    if (!wrap) return;
    var box = wrap.querySelector('.field__error');
    if (box) box.textContent = message || '';
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
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
      if (!message && rules.indexOf('email') !== -1 && field.value.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim())) message = t.email;
      }

      setError(field, message);
      if (message) {
        ok = false;
        if (!firstInvalid) firstInvalid = field;
      }
    }

    if (firstInvalid) firstInvalid.focus();
    return ok;
  }

  // Efface l'erreur dès que l'utilisateur corrige.
  form.addEventListener('input', function (e) {
    if (e.target.hasAttribute('data-validate') && e.target.getAttribute('aria-invalid')) {
      setError(e.target, '');
    }
  });

  /* ---- Repli mailto ------------------------------------------------------ */

  function buildMailto() {
    var data = new FormData(form);
    var subject = 'Contact xsom.fr — ' + (data.get('subject') || 'Demande');
    var body = [
      'Nom : ' + (data.get('name') || ''),
      'Organisation : ' + (data.get('company') || ''),
      'Email : ' + (data.get('email') || ''),
      'Sujet : ' + (data.get('subject') || ''),
      '',
      data.get('message') || ''
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
    submitBtn.setAttribute('aria-busy', String(busy));
    submitBtn.textContent = busy ? t.sending : submitLabel;
  }

  /* ---- Soumission -------------------------------------------------------- */

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot : un bot coche tout, un humain ne voit pas ce champ.
    // Attention : sur une case à cocher, `.value` vaut "on" même décochée —
    // c'est `.checked` qu'il faut lire, sinon le formulaire sort toujours ici.
    var honey = form.querySelector('[name="botcheck"]');
    if (honey && (honey.type === 'checkbox' ? honey.checked : honey.value)) return;

    if (!validate()) return;

    if (!keyConfigured || typeof window.fetch !== 'function') {
      showFallback(t.error);
      window.location.href = buildMailto();
      return;
    }

    setBusy(true);
    if (statusBox) statusBox.className = 'form__status';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) { return res.json().catch(function () { return {}; }); })
      .then(function (data) {
        setBusy(false);
        if (data && data.success) {
          showStatus('success', t.success);
          form.reset();
          var errs = form.querySelectorAll('.field__error');
          for (var i = 0; i < errs.length; i++) errs[i].textContent = '';
        } else {
          showFallback(t.error);
        }
      })
      .catch(function () {
        setBusy(false);
        showFallback(t.error);
      });
  });
})();
