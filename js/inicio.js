document.addEventListener('DOMContentLoaded', () => {
  /* ===== Carousel genérico (.carousel) ===== */
  document.querySelectorAll('.carousel').forEach((car) => {
    const track = car.querySelector('.carousel__track');
    const slides = Array.from(track?.querySelectorAll('.carousel__slide') || []);
    const prev = car.querySelector('.carousel__btn.prev');
    const next = car.querySelector('.carousel__btn.next');
    const dotsWrap = car.querySelector('.carousel__dots');
    const autoplayAttr = car.getAttribute('data-autoplay');
    const intervalMs = autoplayAttr ? parseInt(autoplayAttr, 10) : 5000;
    if (!track || slides.length === 0) return;

    let index = 0;
    let timer = null;
    const slideW = () => slides[0].getBoundingClientRect().width;

    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    const updateDots = () => {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('.carousel__dot').forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
      });
    };

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(${-index * slideW()}px)`;
      updateDots();
    };

    const nextSlide = () => goTo(index + 1);
    const prevSlide = () => goTo(index - 1);

    next?.addEventListener('click', nextSlide);
    prev?.addEventListener('click', prevSlide);

    window.addEventListener('resize', () => {
      requestAnimationFrame(() => goTo(index));
    });

    const start = () => {
      if (intervalMs > 0) {
        stop();
        timer = setInterval(nextSlide, intervalMs);
      }
    };

    const stop = () => timer && (clearInterval(timer), (timer = null));

    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', start);

    start();
  });

  /* ===== Marquee legado (.features-marquee) ===== */
  document.querySelectorAll('.features-marquee').forEach((wrap) => {
    const track = wrap.querySelector('.features-marquee__track');
    if (!track) return;
    const items = Array.from(track.children);
    if (items.length === 0) return;

    if (!wrap.dataset._cloned) {
      items.forEach((i) => track.appendChild(i.cloneNode(true)));
      wrap.dataset._cloned = '1';
    }

    const speed = parseFloat(wrap.dataset.speed || '6.0');
    const duration = Math.max(30, Math.round(items.length * speed));
    const existing = getComputedStyle(track).getPropertyValue('--featDuration').trim();
    if (!existing) track.style.setProperty('--featDuration', `${duration}s`);

    wrap.addEventListener('mouseenter', () => (track.style.animationPlayState = 'paused'));
    wrap.addEventListener('mouseleave', () => (track.style.animationPlayState = 'running'));
  });

  /* ===== Marquee atual (.features-carousel) ===== */
  document.querySelectorAll('.features-carousel').forEach((wrap) => {
    const track = wrap.querySelector('.features-track');
    if (!track) return;
    const items = Array.from(track.children);
    if (items.length === 0) return;

    if (!wrap.dataset._cloned) {
      items.forEach((i) => track.appendChild(i.cloneNode(true)));
      wrap.dataset._cloned = '1';
    }

    const existing = getComputedStyle(track).getPropertyValue('--featDuration').trim();
    if (!existing) {
      const dur = (wrap.dataset.duration || '40s').toString();
      track.style.setProperty('--featDuration', dur);
    }

    wrap.addEventListener('mouseenter', () => (track.style.animationPlayState = 'paused'));
    wrap.addEventListener('mouseleave', () => (track.style.animationPlayState = 'running'));
  });

  /* ===== Máscara de telefone ===== */
  const phoneInput = document.querySelector('#contato form.contact-form input[name="telefone"]');
  if (phoneInput) {
    const formatPhone = (val) => {
      const d = val.replace(/\D/g, '').slice(0, 11);
      if (!d) return '';
      if (d.length <= 2) return `(${d}`;
      const ddd = d.slice(0,2), rest = d.slice(2);
      if (rest.length >= 9) {
        return `(${ddd}) ${rest.slice(0,5)}-${rest.slice(5,9)}`;
      }
      if (rest.length >= 8) {
        return `(${ddd}) ${rest.slice(0,4)}-${rest.slice(4,8)}`;
      }
      if (rest.length > 5) return `(${ddd}) ${rest.slice(0,5)}-${rest.slice(5)}`;
      if (rest.length > 4) return `(${ddd}) ${rest.slice(0,4)}-${rest.slice(4)}`;
      return `(${ddd}) ${rest}`;
    };

    const applyMask = (e) => {
      e.target.value = formatPhone(e.target.value);
      try { e.target.setSelectionRange(e.target.value.length, e.target.value.length); } catch {}
    };

    phoneInput.addEventListener('input', applyMask);
    phoneInput.addEventListener('blur', applyMask);
    phoneInput.addEventListener('paste', () => setTimeout(applyMask, 0));
  }

  /* ===== Envio AJAX + Toast popup ===== */
  const contatoForm = document.querySelector('#contato form.contact-form');
  const showToast = (msg, type = 'success') => {
    const old = document.querySelector('.toast-pop');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = `toast-pop ${type}`;
    el.innerHTML = `
      <div class="toast-pop__inner">
        <span class="toast-pop__msg">${msg}</span>
        <button class="toast-pop__close" aria-label="Fechar">&times;</button>
      </div>
    `;
    document.body.appendChild(el);
    const close = () => {
      el.classList.add('is-hide');
      setTimeout(() => el.remove(), 250);
    };
    el.querySelector('.toast-pop__close').addEventListener('click', close);
    setTimeout(close, 4500);
  };

  if (contatoForm) {
    contatoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!contatoForm.checkValidity()) return;

      const data = new FormData(contatoForm);
      const btn = contatoForm.querySelector('button[type="submit"]');
      btn?.setAttribute('disabled', 'disabled');

      try {
        const resp = await fetch(contatoForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: data
        });
        if (resp.ok) {
          showToast('Mensagem enviada com sucesso!', 'success');
          contatoForm.reset();
        } else {
          showToast('Não foi possível enviar. Tente novamente.', 'error');
        }
      } catch {
        showToast('Erro de conexão. Tente novamente.', 'error');
      } finally {
        btn?.removeAttribute('disabled');
      }
    });
  }

  /* ===== Botão voltar ao topo ===== */
  const btnTop = document.getElementById('backToTop');
  if (btnTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btnTop.classList.add('is-visible');
      } else {
        btnTop.classList.remove('is-visible');
      }
    });

    btnTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===== Scroll arrastável no painel de destaques ===== */
  const panel = document.querySelector('.panel');
  if (panel) {
    let isDown = false;
    let startX;
    let scrollLeft;

    panel.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - panel.offsetLeft;
      scrollLeft = panel.scrollLeft;
      panel.classList.add('dragging');
    });
    panel.addEventListener('mouseleave', () => {
      isDown = false;
      panel.classList.remove('dragging');
    });
    panel.addEventListener('mouseup', () => {
      isDown = false;
      panel.classList.remove('dragging');
    });
    panel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - panel.offsetLeft;
      const walk = (x - startX) * 2;
      panel.scrollLeft = scrollLeft - walk;
    });

    // Touch events (mobile)
    panel.addEventListener('touchstart', (e) => {
      isDown = true;
      startX = e.touches[0].pageX - panel.offsetLeft;
      scrollLeft = panel.scrollLeft;
    });
    panel.addEventListener('touchend', () => {
      isDown = false;
    });
    panel.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - panel.offsetLeft;
      const walk = (x - startX) * 2;
      panel.scrollLeft = scrollLeft - walk;
    });
  }
});
