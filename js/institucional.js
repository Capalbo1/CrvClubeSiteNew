(() => {
  const page = document.querySelector('.page-institucional');
  if (!page) return;

  const DUR_EXPAND_MS = 450;
  const DUR_COLLAPSE_MS = 420;
  const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
  const prefersReduced =
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;

  const sectionOf = (el) => el.closest('.section') || el;
  const topOf = (el) => el.getBoundingClientRect().top + window.scrollY;
  const bottomOf = (el) => el.getBoundingClientRect().bottom + window.scrollY;
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

  const smoothScrollTo = (y) => {
    if (prefersReduced) {
      window.scrollTo(0, Math.max(0, y));
    } else {
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  const scrollToBottomOf = (el, padding = 28) => {
    const y = bottomOf(el) - window.innerHeight + padding;
    if (y > window.scrollY) smoothScrollTo(y);
  };

  // Transição suave de altura
  const transitionHeight = async (el, toHeightPx, duration) => {
    if (prefersReduced) {
      el.style.maxHeight = '';
      el.style.overflow = '';
      return;
    }
    const startH = el.offsetHeight;
    el.style.overflow = 'hidden';
    el.style.maxHeight = `${startH}px`;
    el.offsetHeight; // força reflow
    el.style.transition = `max-height ${duration}ms ${EASE}`;
    requestAnimationFrame(() => (el.style.maxHeight = `${toHeightPx}px`));

    await new Promise((resolve) => {
      const end = () => {
        el.removeEventListener('transitionend', end);
        resolve();
      };
      setTimeout(end, duration + 60);
      el.addEventListener('transitionend', end);
    });

    el.style.transition = '';
    el.style.maxHeight = '';
    el.style.overflow = '';
  };

  /* ======================
   * Clamp de listas
   * ====================== */
  const clampList = (listEl, limit = 8) => {
    const items = [...listEl.querySelectorAll('.card-person')];
    const btn = page.querySelector(`.btn-reveal[data-reveal="#${listEl.id}"]`);

    items.forEach((li) => {
      li.classList.remove('is-hidden', 'fade-in');
      li.style.removeProperty('animationDelay');
      li.style.removeProperty('animationDuration');
    });

    if (items.length > limit) {
      items.forEach((li, i) => {
        if (i >= limit) li.classList.add('is-hidden');
      });
      if (btn) {
        btn.classList.remove('is-hidden');
        btn.textContent = 'Ver todos';
        btn.dataset.state = 'closed';
        btn.setAttribute('aria-expanded', 'false');
      }
    } else if (btn) {
      btn.classList.add('is-hidden');
    }
  };

  const listaDiretoria = page.querySelector('#lista-diretoria');
  if (listaDiretoria) clampList(listaDiretoria, 8);
  const listaDeliberativo = page.querySelector('#lista-deliberativo');
  if (listaDeliberativo) clampList(listaDeliberativo, 8);

  /* ======================
   * "Ver todos" / "Ver menos"
   * ====================== */
  page.querySelectorAll('.btn-reveal[data-reveal]').forEach((btn) => {
    const sel = btn.getAttribute('data-reveal');
    const list = page.querySelector(sel);
    if (!list) return;

    btn.addEventListener('click', async () => {
      const state = btn.dataset.state || 'closed';
      const section = sectionOf(list);

      if (state === 'closed') {
        const currentH = list.offsetHeight;
        const hidden = [...list.querySelectorAll('.card-person.is-hidden')];
        let k = 0;
        hidden.forEach((li) => {
          li.classList.remove('is-hidden');
          li.classList.add('fade-in');
          if (!prefersReduced) {
            li.style.animationDelay = `${k * 0.03}s`;
            li.style.animationDuration = '0.32s';
          }
          li.addEventListener('animationend', () => li.classList.remove('fade-in'), {
            once: true,
          });
          k++;
        });

        await nextFrame();
        const targetH = list.scrollHeight;

        list.style.maxHeight = `${currentH}px`;
        await transitionHeight(list, targetH, DUR_EXPAND_MS);

        btn.textContent = 'Ver menos';
        btn.dataset.state = 'open';
        btn.setAttribute('aria-expanded', 'true');

        scrollToBottomOf(section, 28);
      } else {
        const currentH = list.offsetHeight;
        const items = [...list.querySelectorAll('.card-person')];
        items.forEach((li, i) => {
          if (i >= 8) li.classList.add('is-hidden');
        });

        await nextFrame();
        const targetH = list.scrollHeight;

        list.style.maxHeight = `${currentH}px`;
        await transitionHeight(list, targetH, DUR_COLLAPSE_MS);

        btn.textContent = 'Ver todos';
        btn.dataset.state = 'closed';
        btn.setAttribute('aria-expanded', 'false');

        clampList(list, 8);

        smoothScrollTo(topOf(section) - 8);
      }
    });
  });

  /* ======================
   * Palavra do Presidente
   * ====================== */
  const btnToggle = page.querySelector('#btn-ler-mais');
  const box = page.querySelector('#presidente-texto');

  if (btnToggle && box) {
    box.classList.add('is-collapsed');

    const updateLabel = () => {
      const expanded = !box.classList.contains('is-collapsed');
      btnToggle.textContent = expanded ? 'Ver menos' : 'Ver tudo';
      btnToggle.setAttribute('aria-expanded', String(expanded));
      box.setAttribute('aria-expanded', String(expanded));
    };
    updateLabel();

    btnToggle.addEventListener('click', async () => {
      const willExpand = box.classList.contains('is-collapsed');
      const section = sectionOf(box);

      box.classList.toggle('is-collapsed');
      updateLabel();

      if (willExpand) {
        await nextFrame();
        scrollToBottomOf(section, 28);
      } else {
        smoothScrollTo(topOf(section) - 8);
      }
    });
  }

  /* ======================
   * Botão Voltar ao Topo
   * ====================== */
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backBtn.classList.add('is-visible');
      } else {
        backBtn.classList.remove('is-visible');
      }
    });

    backBtn.addEventListener('click', () => {
      smoothScrollTo(0);
    });
  }
})();
