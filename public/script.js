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
});
