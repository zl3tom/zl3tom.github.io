(() => {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  });

  let deferredPrompt;

  const getInstallButton = () => document.querySelector("[data-pwa-install]");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    const button = getInstallButton();
    if (button) button.hidden = false;
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-pwa-install]");
    if (!button || !deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    button.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    const button = getInstallButton();
    if (button) button.hidden = true;
  });
})();
