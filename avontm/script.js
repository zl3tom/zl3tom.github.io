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
  // Live next-meeting countdown: first, second and fourth Tuesdays in Christchurch.
  const countdown = document.querySelector(".countdown-card");
  if (countdown) {
    const zone = "Pacific/Auckland";
    const partsAt = date => {
      const parts = new Intl.DateTimeFormat("en-NZ", {
        timeZone: zone, year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23"
      }).formatToParts(date);
      return Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, Number(part.value)]));
    };
    const localDateToUtc = (year, month, day, hour) => {
      const desired = Date.UTC(year, month - 1, day, hour, 0, 0);
      let guess = desired;
      for (let i = 0; i < 3; i++) {
        const local = partsAt(new Date(guess));
        const represented = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute, local.second);
        guess += desired - represented;
      }
      return new Date(guess);
    };
    const nextMeeting = now => {
      const localNow = partsAt(now);
      for (let offset = 0; offset < 14; offset++) {
        const monthDate = new Date(Date.UTC(localNow.year, localNow.month - 1 + offset, 1));
        const year = monthDate.getUTCFullYear();
        const month = monthDate.getUTCMonth() + 1;
        let tuesdayCount = 0;
        const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
        for (let day = 1; day <= daysInMonth; day++) {
          if (new Date(Date.UTC(year, month - 1, day)).getUTCDay() !== 2) continue;
          tuesdayCount++;
          if (![1, 2, 4].includes(tuesdayCount)) continue;
          const candidate = localDateToUtc(year, month, day, 19);
          if (candidate > now) return candidate;
        }
      }
      return null;
    };
    const dateNode = countdown.querySelector("[data-next-date]");
    const noteNode = countdown.querySelector("[data-countdown-note]");
    let target = null;
    let lastDate = "";
    const updateCountdown = () => {
      const now = new Date();
      if (!target || target <= now) target = nextMeeting(now);
      if (!target) return;
      const dateText = new Intl.DateTimeFormat("en-NZ", {
        timeZone: zone, weekday: "long", day: "numeric", month: "long", year: "numeric"
      }).format(target);
      if (dateText !== lastDate) {
        dateNode.textContent = dateText;
        lastDate = dateText;
      }
      const remaining = Math.max(0, target.getTime() - now.getTime());
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      countdown.querySelector("[data-days]").textContent = String(days).padStart(2, "0");
      countdown.querySelector("[data-hours]").textContent = String(hours).padStart(2, "0");
      countdown.querySelector("[data-minutes]").textContent = String(minutes).padStart(2, "0");
      countdown.querySelector("[data-seconds]").textContent = String(seconds).padStart(2, "0");
      noteNode.textContent = "Christchurch time · Automatically updates after each meeting.";
    };
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

});