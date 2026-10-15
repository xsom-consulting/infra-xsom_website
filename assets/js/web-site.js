/* A disclosure menu keeps the page usable without animation or a UI framework. */
(() => {
  const toggle = document.querySelector(".web-toggle");
  const menu = document.querySelector(".web-menu");
  if (toggle && menu) {
    menu.dataset.enhanced = "true";
    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      menu.dataset.open = "false";
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      menu.dataset.open = String(open);
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        close();
        toggle.focus();
      }
    });
    const wide = matchMedia("(min-width: 901px)");
    wide.addEventListener("change", close);
  }
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
