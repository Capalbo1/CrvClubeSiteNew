/* ==========================================================================
   ESTRUTURA – JavaScript local (revisto para desktop + mobile)
   ========================================================================== */

(() => {
  'use strict';

  // Utils
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const normalize = (str) =>
    (str || '')
      .toString()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();

  // =========================
  // Carrossel
  // =========================
  function initCarousel(root) {
    const track = root.querySelector(".carousel__track");
    const slides = [...root.querySelectorAll(".carousel__slide")];
    const btnPrev = root.querySelector(".carousel__btn.prev");
    const btnNext = root.querySelector(".carousel__btn.next");
    const dotsWrap = root.querySelector(".carousel__dots");

    if (!track || slides.length === 0) return;

    let index = 0;

    // Criar os dots dinamicamente
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "carousel__dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `Ir para slide ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.querySelectorAll(".carousel__dot")];

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(${-index * 100}%)`;
      dots.forEach((d) => d.classList.remove("is-active"));
      dots[index].classList.add("is-active");
    }

    btnPrev?.addEventListener("click", () => goTo(index - 1));
    btnNext?.addEventListener("click", () => goTo(index + 1));

    // autoplay (se tiver data-autoplay no HTML)
    const delay = root.dataset.autoplay;
    if (delay) {
      setInterval(() => goTo(index + 1), parseInt(delay, 10));
    }

    // Inicializa na posição 0
    goTo(0);
  }

  // =========================
  // Dados Horários & Normas
  // =========================
  const scheduleItems = [
    // ESPORTE
    {
      title: "Academia",
      time: "Terça a Sexta: 6h às 22h • Sáb/Dom: 7h às 22h",
      note: "Equipamentos modernos, ambiente climatizado e orientações no local.",
      group: "esporte",
      tags: ["esporte", "musculacao", "bem-estar", "academia"]
    },
    {
      title: "Área de Lutas",
      time: "Aulas/treinos conforme grade esportiva.",
      note: "Espaço apropriado e instrutores especializados.",
      group: "esporte",
      tags: ["esporte", "lutas", "judô", "karatê", "muay thai"]
    },
    {
      title: "Campo",
      time: "Agenda por evento/competição.",
      note: "Reservas e informações na secretaria esportiva.",
      group: "esporte",
      tags: ["futebol", "campo", "esporte"]
    },
    {
      title: "Campo Society",
      time: "Reservas por aplicativo/secretaria.",
      note: "Aulas/treinos conforme grade esportiva.",
      group: "esporte",
      tags: ["society", "futebol", "esporte"]
    },
    {
      title: "Ginásio & Quadras",
      time: "Uso conforme grade esportiva.",
      note: "Estrutura para múltiplas modalidades.",
      group: "esporte",
      tags: ["vôlei", "basquete", "tênis", "poliesportiva", "esporte"]
    },
    // LAZER
    {
      title: "Balneário (piscina externa)",
      time: "Terça a Domingo: 10h às 18h",
      note: "Piscinas externas; atividades conforme grade de aulas e eventos.",
      group: "lazer",
      tags: ["lazer", "natação", "piscina", "hidroginástica"]
    },
    {
      title: "Pesqueiro",
      time: "Consultar regras de pesca recreativa.",
      note: "Ambiente natural, preservação e segurança.",
      group: "lazer",
      tags: ["lazer", "pesca"]
    },
    {
      title: "Parque Infantil",
      time: "Uso livre acompanhado de responsáveis.",
      note: "Brinquedos e áreas seguras para crianças.",
      group: "lazer",
      tags: ["lazer", "infantil", "família"]
    },
    // BEM-ESTAR
    {
      title: "Piscina Aquecida",
      time: "Consultar grade de aulas e orientações técnicas.",
      note: "Conforto térmico para natação e hidroginástica.",
      group: "bemestar",
      tags: ["bem-estar", "lazer", "piscina", "natação"]
    },
    {
      title: "Sala de Dança",
      time: "Aulas conforme grade.",
      note: "Espaço com piso adequado e espelhos.",
      group: "bemestar",
      tags: ["bem-estar", "dança", "aulas"]
    },
    {
      title: "Sauna",
      time: "Uso conforme normas e horários internos.",
      note: "Ambiente confortável para relaxamento.",
      group: "bemestar",
      tags: ["bem-estar", "relaxamento", "sauna"]
    },
    // CONVÍVIO
    {
      title: "Deck",
      time: "Conforme programação interna.",
      note: "Espaço para confraternizações e integrações.",
      group: "convivio",
      tags: ["convívio", "eventos", "deck"]
    },
    {
      title: "Salão Social",
      time: "Conforme programação interna.",
      note: "Ambiente climatizado e versátil para eventos.",
      group: "convivio",
      tags: ["convívio", "eventos", "salão"]
    },
    {
      title: "Quiosques",
      time: "Reservas mediante disponibilidade.",
      note: "Espaços para churrasco e encontros.",
      group: "convivio",
      tags: ["convívio", "churrasco", "reservas"]
    }
  ];

  const state = { q: '', group: 'todos' };

  // Suporte a múltiplos seletores (desktop e mobile)
  const els = {
    list: $('.schedule-list') || $('.resultados'),   // aceita ambos
    input: $('#sch-q') || $('#busca') || $('#sch_input'), // aceita variações
    chips: $$('.chip.filter')
  };

  const matchItem = (item, qNorm, group) => {
    // Mapear filtros do HTML para grupos dos dados
    const filterMap = {
      'todos': 'todos',
      'esporte': 'esporte',
      'lazer': 'lazer',
      'bemestar': 'bemestar',
      'convivio': 'convivio'
    };

    const targetGroup = filterMap[group] || group;
    const matchesGroup = targetGroup === 'todos' || item.group === targetGroup;

    if (!qNorm) return matchesGroup;

    const haystack = normalize([
      item.title,
      item.note,
      item.time,
      ...(item.tags || [])
    ].join(' '));

    return matchesGroup && haystack.includes(qNorm);
  };

  const renderList = () => {
    if (!els.list) return;
    const qNorm = normalize(state.q);
    const group = state.group;
    const items = scheduleItems.filter((it) => matchItem(it, qNorm, group));

    if (!items.length) {
      els.list.innerHTML = `<div class="schedule-empty">Nenhum resultado para sua busca.</div>`;
      return;
    }

    els.list.innerHTML = items.map((it) => {
      const tags = (it.tags || [])
        .map(t => `<span class="schedule-tag">${t}</span>`)
        .join('');
      return `
        <article class="schedule-item">
          <h4>${it.title}</h4>
          <p class="time">${it.time}</p>
          <p class="note">${it.note}</p>
          <div class="schedule-tags">${tags}</div>
        </article>
      `;
    }).join('');
  };

  const bindSchedule = () => {
    if (els.input) {
      els.input.addEventListener('input', (e) => {
        state.q = e.target.value || '';
        renderList();
      });
    }

    els.chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        els.chips.forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        state.group = chip.dataset.filter || 'todos';
        renderList();
      });
    });

    renderList();
  };

  // Botão voltar ao topo
  const initBackToTop = () => {
    const btnTop = document.getElementById('backToTop');
    if (!btnTop) return;
    window.addEventListener('scroll', () => {
      btnTop.classList.toggle('is-visible', window.scrollY > 300);
    });
    btnTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // Boot
  const ready = () => {
    // Corrigido: inicializar carrosséis
    $$('.carousel').forEach(initCarousel);

    bindSchedule();
    initBackToTop();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();