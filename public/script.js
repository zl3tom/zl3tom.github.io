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
          <p>Your message will go directly to <a href="mailto:thomas@zl3tom.com">thomas@zl3tom.com</a>. Fields marked <span aria-hidden="true">*</span><span class="sr-only">with an asterisk</span> are required.</p>
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
});
