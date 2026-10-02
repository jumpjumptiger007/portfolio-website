document.addEventListener("DOMContentLoaded", () => {
  const tickerTrack = document.querySelector("#home-ticker-track");
  const tickerControl = document.querySelector(".ticker-control");
  if (tickerTrack && tickerControl) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const storageKey = "home-ticker-paused";
    let userPaused = false;
    try {
      userPaused = window.sessionStorage.getItem(storageKey) === "true";
    } catch {
      // The in-memory state still keeps an explicit pause until this page unloads.
    }

    const updateTicker = () => {
      tickerTrack.classList.toggle("is-paused", userPaused);
      tickerControl.hidden = reducedMotion.matches;
      tickerControl.textContent = userPaused ? "RESUME" : "PAUSE";
      tickerControl.setAttribute("aria-pressed", String(userPaused));
      tickerControl.setAttribute("aria-label", `${userPaused ? "Resume" : "Pause"} homepage ticker`);
    };

    updateTicker();
    tickerControl.addEventListener("click", () => {
      if (reducedMotion.matches) return;
      userPaused = !userPaused;
      try {
        if (userPaused) window.sessionStorage.setItem(storageKey, "true");
        else window.sessionStorage.removeItem(storageKey);
      } catch {
        // Keep the current page's in-memory state if session storage is unavailable.
      }
      updateTicker();
    });
    reducedMotion.addEventListener?.("change", updateTicker);
  }

  const hero = document.querySelector(".hero");
  const ghost = document.querySelector(".hero-ghost");
  if (!hero || !ghost || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  let frame = 0;
  let pointerX = 0.5;
  let pointerY = 0.45;
  let pointerInside = false;
  const updateGhost = () => {
    frame = 0;
    if (!pointerInside) {
      ghost.style.setProperty("--ghost-wdth", "92");
      ghost.style.setProperty("--ghost-scale", "1");
      ghost.style.setProperty("--ghost-x", "0vw");
      ghost.style.color = "rgba(166,255,26,.058)";
      return;
    }
    const squeeze = 64 + pointerX * 34;
    const scale = 0.93 + (1 - Math.abs(pointerX - 0.5) * 2) * 0.1;
    const shift = (pointerX - 0.5) * 2.4;
    const alpha = 0.05 + (1 - Math.abs(pointerY - 0.45)) * 0.02;
    ghost.style.setProperty("--ghost-wdth", squeeze.toFixed(1));
    ghost.style.setProperty("--ghost-scale", scale.toFixed(3));
    ghost.style.setProperty("--ghost-x", `${shift.toFixed(2)}vw`);
    ghost.style.color = `rgba(166,255,26,${Math.min(0.078, alpha).toFixed(3)})`;
  };
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    pointerInside = true;
    pointerX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    pointerY = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    if (!frame) frame = window.requestAnimationFrame(updateGhost);
  });
  hero.addEventListener("pointerleave", () => {
    pointerInside = false;
    pointerX = 0.5;
    pointerY = 0.45;
    if (!frame) frame = window.requestAnimationFrame(updateGhost);
  });
});
