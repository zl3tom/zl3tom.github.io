document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-button");
  const navigation = document.getElementById("main-navigation");
  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });
    navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }

  const copyButton = document.querySelector(".template-box button");
  const template = document.querySelector(".template-box pre");
  if (copyButton && template) {
    const original = copyButton.innerHTML;
    copyButton.addEventListener("click", async () => {
      const text = template.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const field = document.createElement("textarea");
        field.value = text;
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
      }
      copyButton.textContent = "✓ Copied to clipboard";
      window.setTimeout(() => { copyButton.innerHTML = original; }, 2500);
    });
  }

  const gallery = document.querySelector(".photo-gallery");
  if (gallery) {
    const galleryStyles = document.createElement("link");
    galleryStyles.rel = "stylesheet";
    galleryStyles.href = "/gallery.css";
    document.head.appendChild(galleryStyles);

    gallery.tabIndex = 0;
    gallery.setAttribute("role", "region");
    gallery.setAttribute("aria-label", "Scrollable photos of Thomas Bernard, ZL3TOM");

    const controls = document.createElement("div");
    controls.className = "gallery-controls";
    controls.innerHTML = `
      <p class="gallery-scroll-hint">Swipe, scroll, or use the arrow buttons</p>
      <div class="gallery-buttons">
        <button class="gallery-arrow gallery-previous" type="button" aria-label="Show previous photo">←</button>
        <span class="gallery-position" aria-live="polite">Photo 1 of 7</span>
        <button class="gallery-arrow gallery-next" type="button" aria-label="Show next photo">→</button>
      </div>`;
    gallery.before(controls);

    const items = [...gallery.querySelectorAll(".gallery-item")];
    const previousButton = controls.querySelector(".gallery-previous");
    const nextButton = controls.querySelector(".gallery-next");
    const position = controls.querySelector(".gallery-position");

    function currentItemIndex() {
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      items.forEach((item, index) => {
        const distance = Math.abs(item.offsetLeft - gallery.scrollLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      return nearestIndex;
    }

    function updateGalleryControls() {
      const index = currentItemIndex();
      position.textContent = `Photo ${index + 1} of ${items.length}`;
      previousButton.disabled = gallery.scrollLeft <= 2;
      nextButton.disabled = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 2;
    }

    function showPhoto(offset) {
      const targetIndex = Math.min(
        items.length - 1,
        Math.max(0, currentItemIndex() + offset)
      );
      gallery.scrollTo({ left: items[targetIndex].offsetLeft, behavior: "smooth" });
    }

    previousButton.addEventListener("click", () => showPhoto(-1));
    nextButton.addEventListener("click", () => showPhoto(1));
    gallery.addEventListener("scroll", updateGalleryControls, { passive: true });
    window.addEventListener("resize", updateGalleryControls);
    updateGalleryControls();
  }

  const contactGrid = document.querySelector(".contact-grid");
  if (contactGrid) {
    const contactStyles = document.createElement("link");
    contactStyles.rel = "stylesheet";
    contactStyles.href = "/contact-form.css";
    document.head.appendChild(contactStyles);

    const formSection = document.createElement("section");
    formSection.className = "site-container contact-form-wrap";
    formSection.setAttribute("aria-labelledby", "contact-form-title");
    formSection.innerHTML = `
      <div class="contact-form-card">
        <div class="contact-form-heading">
          <p class="eyebrow">SEND A MESSAGE</p>
          <h2 id="contact-form-title">Contact Thomas — ZL3TOM</h2>
          <p>Your message will go directly to Thomas. Fields marked <span aria-hidden="true">*</span><span class="sr-only">with an asterisk</span> are required.</p>
        </div>
        <form id="contact-form" novalidate>
          <div class="contact-field-row">
            <div class="contact-field">
              <label for="contact-name">Name <span aria-hidden="true">*</span></label>
              <input id="contact-name" name="name" type="text" autocomplete="name" minlength="2" maxlength="80" required>
            </div>
            <div class="contact-field">
              <label for="contact-email">Email <span aria-hidden="true">*</span></label>
              <input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" required>
            </div>
          </div>
          <div class="contact-field-row">
            <div class="contact-field">
              <label for="contact-callsign">Amateur radio callsign <span class="optional">(optional)</span></label>
              <input id="contact-callsign" name="callsign" type="text" autocomplete="off" maxlength="20" autocapitalize="characters" placeholder="e.g. ZL3ABC">
            </div>
            <div class="contact-field">
              <label for="contact-topic">Topic <span aria-hidden="true">*</span></label>
              <select id="contact-topic" name="topic" required>
                <option value="">Choose a topic</option>
                <option value="qsl">QSL request</option>
                <option value="radio">Amateur radio question</option>
                <option value="website">Website feedback</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="contact-field">
            <label for="contact-message">Message <span aria-hidden="true">*</span></label>
            <textarea id="contact-message" name="message" rows="7" minlength="10" maxlength="5000" required></textarea>
            <p class="field-help">10–5,000 characters. Please do not include private passwords or sensitive information.</p>
          </div>
          <div class="contact-honeypot" aria-hidden="true">
            <label for="contact-website">Leave this field blank</label>
            <input id="contact-website" name="website" type="text" autocomplete="off" tabindex="-1">
          </div>
          <div id="contact-turnstile" class="contact-turnstile" aria-label="Security check"></div>
          <div class="contact-form-actions">
            <button class="button button-primary contact-submit" type="submit" disabled>Send message</button>
            <p id="contact-status" class="contact-status" role="status" aria-live="polite">Loading the secure contact form…</p>
          </div>
        </form>
      </div>`;
    contactGrid.after(formSection);

    const form = formSection.querySelector("#contact-form");
    const submitButton = formSection.querySelector(".contact-submit");
    const status = formSection.querySelector("#contact-status");
    const turnstileContainer = formSection.querySelector("#contact-turnstile");
    let turnstileToken = "";
    let widgetId;

    const requestedTopic = new URLSearchParams(window.location.search).get("topic");
    if (["qsl", "radio", "website", "other"].includes(requestedTopic)) {
      form.elements.namedItem("topic").value = requestedTopic;
    }

    function showStatus(message, state = "") {
      status.textContent = message;
      status.className = `contact-status${state ? ` is-${state}` : ""}`;
    }

    function loadTurnstile() {
      if (window.turnstile) return Promise.resolve(window.turnstile);
      return new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[data-zl3tom-turnstile]');
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(window.turnstile), { once: true });
          existingScript.addEventListener("error", reject, { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.zl3tomTurnstile = "true";
        script.addEventListener("load", () => resolve(window.turnstile), { once: true });
        script.addEventListener("error", reject, { once: true });
        document.head.appendChild(script);
      });
    }

    async function initialiseContactForm() {
      try {
        const configResponse = await fetch("/api/contact-config", {
          headers: { Accept: "application/json" }
        });
        const config = await configResponse.json();
        if (!configResponse.ok || !config.enabled || !config.siteKey) {
          throw new Error("The secure form is being connected. Please email thomas@zl3tom.com for now.");
        }

        const turnstile = await loadTurnstile();
        if (!turnstile) throw new Error("The security check could not load. Please refresh the page.");
        widgetId = turnstile.render(turnstileContainer, {
          sitekey: config.siteKey,
          theme: "light",
          size: "flexible",
          callback(token) {
            turnstileToken = token;
            showStatus("Security check complete. Your message is ready to send.", "ready");
          },
          "expired-callback"() {
            turnstileToken = "";
            showStatus("The security check expired. Please complete it again.", "error");
          },
          "error-callback"() {
            turnstileToken = "";
            showStatus("The security check could not load. Please refresh the page.", "error");
          }
        });
        submitButton.disabled = false;
        showStatus("Complete the security check, then send your message.");
      } catch (error) {
        submitButton.disabled = true;
        turnstileContainer.hidden = true;
        showStatus(error.message || "The contact form is unavailable. Please email thomas@zl3tom.com.", "error");
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (!turnstileToken) {
        showStatus("Please complete the security check before sending.", "error");
        return;
      }

      const formData = new FormData(form);
      const payload = {
        name: formData.get("name"),
        email: formData.get("email"),
        callsign: formData.get("callsign"),
        topic: formData.get("topic"),
        message: formData.get("message"),
        website: formData.get("website"),
        turnstileToken
      };

      submitButton.disabled = true;
      submitButton.textContent = "Sending…";
      showStatus("Sending your message…");

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.ok) {
          throw new Error(result.message || "The message could not be sent.");
        }

        form.reset();
        turnstileToken = "";
        if (window.turnstile && widgetId !== undefined) window.turnstile.reset(widgetId);
        showStatus(result.message, "success");
      } catch (error) {
        turnstileToken = "";
        if (window.turnstile && widgetId !== undefined) window.turnstile.reset(widgetId);
        showStatus(error.message || "The message could not be sent. Please try again.", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send message";
      }
    });

    initialiseContactForm();
  }

  const siteSearchIndex = [
    ["Home", "/", "ZL3TOM Thomas Bernard amateur radio Christchurch New Zealand station guides"],
    ["About Thomas — ZL3TOM", "/about", "about photos gallery callsigns ZL3TOM ZL3KY Christchurch"],
    ["Station and radio networks", "/radio-fun", "EchoLink 304602 ZL3TOM-L AllStar 40452 APRS Zello IRN ZMR RemoteHams DMR TG 91 QRZ logbook"],
    ["QSL confirmation", "/qsl", "QSL request card contact confirm radio contact logbook"],
    ["Contact ZL3TOM", "/contact", "contact Thomas message question QSL website"],
    ["Amateur radio operating basics", "/guides/operating-basics", "operating HF VHF UHF linked systems transmit listen logging"],
    ["HF CQ and contacts", "/guides/hf-cq-and-contacts", "HF CQ calling contact QSO pileup signal report"],
    ["Repeaters and nets", "/guides/repeaters-and-nets", "repeater offset tone net AllStar EchoLink"],
    ["Audio and levels", "/guides/audio-and-levels", "microphone gain ALC audio SSB FM digital clean signal"],
    ["Antenna basics", "/guides/antenna-basics", "antenna feedline SWR dipole vertical safety"],
    ["Q codes and jargon", "/guides/q-codes-and-jargon", "QTH QSL QSO QRZ 73 radio terms"],
    ["Emergency communications basics", "/guides/emergency-comms-basics", "emergency communications message traffic directed net priority"],
    ["How to install and use EchoLink", "/guides/echolink-getting-started", "EchoLink download install Android iPhone Windows web validation callsign audio connection"],
    ["How to get a DMR ID", "/guides/getting-a-dmr-id", "DMR ID RadioID register BrandMeister codeplug hotspot talkgroup"],
    ["Radio apps for phone and computer", "/guides/amateur-radio-apps", "apps software Android iPhone Windows computer CHIRP WSJT-X APRSdroid Ham2K logging"],
    ["Digital voice for beginners", "/guides/digital-voice-for-beginners", "digital voice DMR D-STAR C4FM System Fusion M17 talkgroup reflector room hotspot"],
    ["QSO One setup guide", "/guides/qso-one-guide", "QSO One QSO1 app DMR EchoLink AllStar IAX BrandMeister TGIF System Fusion M17 Windows Android"]
  ].map(([title, url, terms]) => ({ title, url, terms: `${title} ${terms}`.toLowerCase() }));

  function searchWebsite(query) {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    return siteSearchIndex
      .map((page) => ({ page, score: words.reduce((total, word) => total + (page.terms.includes(word) ? 1 : 0), 0) }))
      .filter(({ score }) => score === words.length)
      .sort((left, right) => right.score - left.score)
      .slice(0, 8)
      .map(({ page }) => page);
  }

  function renderSearchResults(query, resultsContainer) {
    resultsContainer.replaceChildren();
    if (!query.trim()) return;
    const matches = searchWebsite(query);
    if (matches.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = `No pages matched “${query.trim()}”. Try a shorter radio term.`;
      resultsContainer.appendChild(emptyMessage);
      return;
    }

    const summary = document.createElement("p");
    summary.textContent = `${matches.length} result${matches.length === 1 ? "" : "s"}`;
    resultsContainer.appendChild(summary);
    matches.forEach((page) => {
      const link = document.createElement("a");
      link.className = "site-search-result";
      link.href = page.url;
      const title = document.createElement("strong");
      title.textContent = page.title;
      const url = document.createElement("span");
      url.textContent = page.url;
      link.append(title, url);
      resultsContainer.appendChild(link);
    });
  }

  function connectSearchForm(form, resultsContainer) {
    const input = form.querySelector("input[type='search']");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      renderSearchResults(input.value, resultsContainer);
      resultsContainer.querySelector("a")?.focus();
    });
    input.addEventListener("input", () => {
      if (input.value.trim().length >= 2) renderSearchResults(input.value, resultsContainer);
      else resultsContainer.replaceChildren();
    });
  }

  const websiteSearch = document.querySelector(".site-search");
  const searchResults = document.getElementById("site-search-results");
  if (websiteSearch && searchResults) connectSearchForm(websiteSearch, searchResults);

  const mainNavigation = document.getElementById("main-navigation");
  if (mainNavigation) {
    const searchButton = document.createElement("button");
    searchButton.className = "nav-search";
    searchButton.type = "button";
    searchButton.setAttribute("aria-haspopup", "dialog");
    searchButton.textContent = "⌕ Search";
    const qrzLink = mainNavigation.querySelector(".nav-qrz");
    if (qrzLink) qrzLink.before(searchButton);
    else mainNavigation.appendChild(searchButton);

    const searchDialog = document.createElement("dialog");
    searchDialog.className = "site-search-dialog";
    searchDialog.setAttribute("aria-labelledby", "global-search-title");
    searchDialog.innerHTML = `<div class="search-dialog-card"><div class="search-dialog-heading"><div><p>SEARCH ZL3TOM.COM</p><h2 id="global-search-title">Find a page or radio guide</h2></div><button class="search-dialog-close" type="button" aria-label="Close search">×</button></div><form class="global-search" role="search"><label class="sr-only" for="global-search-input">Search the ZL3TOM website</label><div><input id="global-search-input" type="search" inputmode="search" autocomplete="off" placeholder="Try EchoLink, DMR, antennas or QSL…"><button type="submit">Search</button></div></form><div class="site-search-results global-search-results" aria-live="polite"></div></div>`;
    document.body.appendChild(searchDialog);
    const globalSearchForm = searchDialog.querySelector(".global-search");
    const globalSearchResults = searchDialog.querySelector(".global-search-results");
    const globalSearchInput = globalSearchForm.querySelector("input");
    connectSearchForm(globalSearchForm, globalSearchResults);

    searchButton.addEventListener("click", () => {
      searchDialog.showModal();
      window.setTimeout(() => globalSearchInput.focus(), 0);
    });
    searchDialog.querySelector(".search-dialog-close").addEventListener("click", () => searchDialog.close());
    searchDialog.addEventListener("click", (event) => {
      if (event.target === searchDialog) searchDialog.close();
    });
  }

  const siteFooter = document.querySelector(".site-footer");
  if (siteFooter && !document.querySelector(".world-clock")) {
    const clocks = [
      ["UTC", "Etc/UTC", "Universal time"],
      ["Eastern (ET)", "America/New_York", "US & Canada"],
      ["United Kingdom", "Europe/London", "London"],
      ["Australia", "Australia/Sydney", "Sydney"],
      ["New Zealand", "Pacific/Auckland", "Auckland / Christchurch"]
    ];
    const clockSection = document.createElement("section");
    clockSection.className = "world-clock";
    clockSection.setAttribute("aria-labelledby", "world-clock-title");
    clockSection.innerHTML = `<div class="site-container"><div class="world-clock-header"><strong id="world-clock-title">On-Air World Clock</strong><span>Live local times for planning contacts</span></div><div class="world-clock-grid"></div></div>`;
    const clockGrid = clockSection.querySelector(".world-clock-grid");

    clocks.forEach(([label, timeZone, location]) => {
      const card = document.createElement("div");
      card.className = "world-clock-card";
      card.dataset.timeZone = timeZone;
      const heading = document.createElement("span");
      heading.textContent = label;
      const time = document.createElement("time");
      const place = document.createElement("small");
      place.textContent = location;
      card.append(heading, time, place);
      clockGrid.appendChild(card);
    });

    function updateWorldClocks() {
      const now = new Date();
      clockGrid.querySelectorAll(".world-clock-card").forEach((card) => {
        const timeZone = card.dataset.timeZone;
        const localTime = new Intl.DateTimeFormat("en-NZ", {
          timeZone,
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZoneName: "short"
        }).format(now).replace(/\b(am|pm)\b/gi, (value) => value.toUpperCase());
        const localDate = new Intl.DateTimeFormat("en-NZ", {
          timeZone,
          weekday: "short",
          day: "numeric",
          month: "short"
        }).format(now);
        const time = card.querySelector("time");
        time.dateTime = now.toISOString();
        time.textContent = localTime;
        card.querySelector("small").textContent = `${card.querySelector("small").dataset.location || card.querySelector("small").textContent.split(" · ")[0]} · ${localDate}`;
        card.querySelector("small").dataset.location = card.querySelector("small").textContent.split(" · ")[0];
      });
    }

    siteFooter.before(clockSection);
    updateWorldClocks();
    const clockTimer = window.setInterval(updateWorldClocks, 1000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) updateWorldClocks();
    });
    window.addEventListener("pagehide", () => window.clearInterval(clockTimer), { once: true });
  }
});
