(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- Certificates ----------
     To show a certificate permanently:
     1) Put the image file in assets/certificates/
     2) Add an entry below (title, issuer, file). */
  var CERTIFICATES = [
    {
      title: 'Python Essentials 1',
      issuer: 'Cisco Networking Academy',
      file: 'assets/certificates/cisco-python-essentials-1.jpg'
    }
  ];

  var header = document.getElementById('header');
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var certGrid = document.getElementById('certGrid');
  var certUpload = document.getElementById('certUpload');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lastFocus = null;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header shadow on scroll ---------- */
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  function setMenu(open) {
    navMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  }
  navToggle.addEventListener('click', function () {
    setMenu(!navMenu.classList.contains('open'));
  });
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!lightbox.hidden) closeLightbox();
      else setMenu(false);
    }
  });
  document.addEventListener('click', function (e) {
    if (navMenu.classList.contains('open') && !header.contains(e.target)) setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Active nav link ---------- */
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);

  function updateActive() {
    var pos = window.scrollY + 120;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      current = sections[sections.length - 1];
    }
    navLinks.forEach(function (l) {
      var on = current && l.getAttribute('href') === '#' + current.id;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* ---------- Certificates gallery ---------- */
  function makeCertCard(cert) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card cert-item';
    btn.setAttribute('aria-label', 'View certificate: ' + cert.title);

    var imgWrap = document.createElement('div');
    imgWrap.className = 'cert-img';

    var img = document.createElement('img');
    img.alt = cert.title + (cert.issuer ? ' certificate, ' + cert.issuer : ' certificate');
    img.loading = 'lazy';
    img.addEventListener('error', function () {
      imgWrap.textContent = '';
      var ph = document.createElement('span');
      ph.className = 'cert-ph';
      ph.textContent = 'Certificate image not added yet. Place the file at ' + cert.file;
      imgWrap.appendChild(ph);
      btn.dataset.missing = 'true';
    });
    img.src = cert.file;
    imgWrap.appendChild(img);

    var cap = document.createElement('div');
    cap.className = 'cert-cap';
    cap.textContent = cert.title;
    if (cert.issuer) {
      var small = document.createElement('small');
      small.textContent = cert.issuer;
      cap.appendChild(small);
    }

    btn.appendChild(imgWrap);
    btn.appendChild(cap);
    btn.addEventListener('click', function () {
      if (btn.dataset.missing === 'true') return;
      openLightbox(img.src, img.alt, btn);
    });
    return btn;
  }

  CERTIFICATES.forEach(function (c) { certGrid.appendChild(makeCertCard(c)); });

  certUpload.addEventListener('change', function () {
    Array.prototype.forEach.call(certUpload.files, function (file) {
      if (!file.type || file.type.indexOf('image/') !== 0) return;
      var url = URL.createObjectURL(file);
      var title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
      certGrid.appendChild(makeCertCard({ title: title, issuer: 'Uploaded preview', file: url }));
    });
    certUpload.value = '';
  });

  /* ---------- Lightbox ---------- */
  function openLightbox(src, alt, trigger) {
    lastFocus = trigger || document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
})();
