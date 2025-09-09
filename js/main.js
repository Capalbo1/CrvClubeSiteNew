// Menu hamburguer global
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("active");

      // Alterna o ícone
      if (nav.classList.contains("active")) {
        toggle.innerHTML = "✖"; // X
        toggle.setAttribute("aria-label", "Fechar menu");
      } else {
        toggle.innerHTML = "☰"; // 3 barras
        toggle.setAttribute("aria-label", "Abrir menu");
      }
    });

    // Fecha menu ao clicar em qualquer link
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        toggle.innerHTML = "☰";
        toggle.setAttribute("aria-label", "Abrir menu");
      });
    });
  }
});
