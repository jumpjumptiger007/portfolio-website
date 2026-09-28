(() => {
  const pools = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?/",
  };
  const similar = new Set("il1Lo0O");
  const ambiguous = new Set("{}[]()/\\'\"`~,;:.<>");
  const generateButton = document.querySelector("#generate-password");
  const length = document.querySelector("#length");
  const lengthValue = document.querySelector("#length-value");
  const password = document.querySelector("#password");
  const message = document.querySelector("#message");
  const strengthValue = document.querySelector("#strength-value");
  const strengthBar = document.querySelector("#strength-bar");
  const selectedGroups = () => ["uppercase", "lowercase", "numbers", "symbols"].filter((name) => document.querySelector(`#${name}`).checked);
  const announce = (text, error = false) => { message.textContent = text; message.classList.toggle("error", error); };
  const webCryptoAvailable = () => Boolean(globalThis.crypto?.getRandomValues);

  function randomIndex(lengthOfPool) {
    if (!webCryptoAvailable()) throw new Error("Web Crypto is unavailable in this browser.");
    if (!Number.isInteger(lengthOfPool) || lengthOfPool < 1 || lengthOfPool > 256) throw new Error("The selected character pool is unavailable.");
    const limit = 256 - (256 % lengthOfPool);
    const byte = new Uint8Array(1);
    do { crypto.getRandomValues(byte); } while (byte[0] >= limit);
    return byte[0] % lengthOfPool;
  }

  function filteredPool(name) {
    let characters = pools[name];
    if (document.querySelector("#exclude-similar").checked && name !== "symbols") characters = [...characters].filter((character) => !similar.has(character)).join("");
    if (document.querySelector("#exclude-ambiguous").checked && name === "symbols") characters = [...characters].filter((character) => !ambiguous.has(character)).join("");
    return characters;
  }

  function secureShuffle(characters) {
    for (let index = characters.length - 1; index > 0; index -= 1) {
      const target = randomIndex(index + 1);
      [characters[index], characters[target]] = [characters[target], characters[index]];
    }
    return characters;
  }

  function generate() {
    const groups = selectedGroups();
    const requestedLength = Number(length.value);
    if (!webCryptoAvailable()) throw new Error("Web Crypto is unavailable, so this demo cannot generate a password.");
    if (!groups.length) throw new Error("Choose at least one character group.");
    if (requestedLength < groups.length) throw new Error("Length must be at least the number of selected character groups.");
    const groupPools = groups.map(filteredPool);
    if (groupPools.some((pool) => !pool.length)) throw new Error("The chosen exclusions left a selected character group empty.");
    const allowed = groupPools.join("");
    const characters = groupPools.map((pool) => pool[randomIndex(pool.length)]);
    while (characters.length < requestedLength) characters.push(allowed[randomIndex(allowed.length)]);
    return secureShuffle(characters).join("");
  }

  function updateStrength(groups) {
    const requestedLength = Number(length.value);
    const score = Math.min(5, Math.max(1, Math.floor(requestedLength / 16) + Math.max(0, groups.length - 1)));
    const labels = ["Very Weak", "Weak", "Moderate", "Strong", "Very Strong"];
    strengthValue.textContent = labels[score - 1];
    strengthBar.style.setProperty("--strength", `${score * 20}%`);
  }

  generateButton.addEventListener("click", () => {
    try {
      const groups = selectedGroups();
      password.value = generate();
      updateStrength(groups);
      announce("Generated locally. This value is not saved by the demo.");
    } catch (error) {
      password.value = "";
      strengthValue.textContent = "—";
      strengthBar.style.setProperty("--strength", "0%");
      announce(error.message, true);
    }
  });
  length.addEventListener("input", () => { lengthValue.value = length.value; if (password.value) updateStrength(selectedGroups()); });
  document.querySelector("#copy").addEventListener("click", async () => {
    if (!password.value) { announce("Generate a password before copying.", true); return; }
    password.focus(); password.select(); password.setSelectionRange(0, password.value.length);
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(password.value); announce("Copied to the clipboard."); return; }
    } catch (_) { /* Continue to the user-gesture fallback. */ }
    if (document.execCommand?.("copy")) { announce("Copied to the clipboard."); return; }
    announce("The value is selected. Copy it manually with your browser or keyboard shortcut.", true);
  });
  if (!webCryptoAvailable()) announce("Web Crypto is unavailable, so this demo cannot generate a password.", true);
  else {
    generateButton.disabled = false;
    announce("Ready. Generated values are not saved by this demo.");
  }
})();
