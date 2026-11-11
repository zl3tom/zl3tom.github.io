// Independent, resilient Avon Toastmasters meeting countdown.
(() => {
  const start = () => {
    const card = document.querySelector(".countdown-card");
    if (!card) return;
    const dateNode = card.querySelector("[data-next-date]");
    const noteNode = card.querySelector("[data-countdown-note]");
    const fields = {
      days: card.querySelector("[data-days]"),
      hours: card.querySelector("[data-hours]"),
      minutes: card.querySelector("[data-minutes]"),
      seconds: card.querySelector("[data-seconds]")
    };
    if (!dateNode || !noteNode || Object.values(fields).some(node => !node)) return;
    const zone = "Pacific/Auckland";
    const formatter = new Intl.DateTimeFormat("en-NZ", {
      timeZone: zone, year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23"
    });
    const localParts = date => Object.fromEntries(
      formatter.formatToParts(date)
        .filter(part => ["year","month","day","hour","minute","second"].includes(part.type))
        .map(part => [part.type, Number(part.value)])
    );
    const christchurchTime = (year, month, day, hour) => {
      const wanted = Date.UTC(year, month - 1, day, hour);
      let result = wanted;
      for (let n = 0; n < 4; n++) {
        const p = localParts(new Date(result));
        result += wanted - Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      }
      return new Date(result);
    };
    const findNext = now => {
      const today = localParts(now);
      for (let offset = 0; offset < 15; offset++) {
        const monthDate = new Date(Date.UTC(today.year, today.month - 1 + offset, 1));
        const year = monthDate.getUTCFullYear();
        const month = monthDate.getUTCMonth() + 1;
        let tuesdays = 0;
        const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
        for (let day = 1; day <= count; day++) {
          if (new Date(Date.UTC(year, month - 1, day)).getUTCDay() !== 2) continue;
          tuesdays++;
          if (![1, 2, 4].includes(tuesdays)) continue;
          const meeting = christchurchTime(year, month, day, 19);
          if (meeting.getTime() > now.getTime()) return meeting;
        }
      }
      throw new Error("Could not find the next meeting date.");
    };
    let target;
    const render = () => {
      try {
        const now = new Date();
        if (!target || target.getTime() <= now.getTime()) target = findNext(now);
        dateNode.textContent = new Intl.DateTimeFormat("en-NZ", {
          timeZone: zone, weekday: "long", day: "numeric", month: "long", year: "numeric"
        }).format(target);
        let seconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
        const values = {
          days: Math.floor(seconds / 86400),
          hours: Math.floor((seconds % 86400) / 3600),
          minutes: Math.floor((seconds % 3600) / 60),
          seconds: seconds % 60
        };
        Object.entries(values).forEach(([key, value]) => {
          fields[key].textContent = String(value).padStart(2, "0");
        });
        noteNode.textContent = "Christchurch time · Automatically updates after each meeting.";
      } catch (error) {
        console.error("Avon meeting countdown:", error);
        dateNode.textContent = "Next meeting details";
        noteNode.textContent = "Meetings are held on the 1st, 2nd and 4th Tuesday of each month at 7:00 pm.";
      }
    };
    render();
    window.setInterval(render, 1000);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();