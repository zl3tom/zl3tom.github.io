document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu");
  const nav = document.querySelector("#nav");

  const closeMenu = (returnFocus = false) => {
    if (!menu || !nav) return;
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation menu");
    if (returnFocus) menu.focus();
  };

  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") === "true";
      menu.setAttribute("aria-expanded", String(!open));
      menu.setAttribute("aria-label", open ? "Open navigation menu" : "Close navigation menu");
      nav.classList.toggle("open", !open);
      if (!open) {
        const firstLink = nav.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
        closeMenu(true);
      }
    });

    document.addEventListener("click", event => {
      if (menu.getAttribute("aria-expanded") === "true" &&
          !nav.contains(event.target) && !menu.contains(event.target)) {
        closeMenu();
      }
    });
  }

  document.querySelectorAll("[data-year]").forEach(element => {
    element.textContent = new Date().getFullYear();
  });

  const revealItems = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion && revealItems.length) {
    document.documentElement.classList.add("has-reveal");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    revealItems.forEach(element => observer.observe(element));
  } else {
    revealItems.forEach(element => element.classList.add("is-visible"));
  }


});