(() => {
  const ROOT_HALF = 1 / Math.sqrt(2);
  const BITS_COUNT = 40;
  const viewSize = 600;
  const center = viewSize / 2;
  const scale = 220;
  const mapping = {
    "00": { real: ROOT_HALF, imag: ROOT_HALF },
    "01": { real: -ROOT_HALF, imag: ROOT_HALF },
    "10": { real: ROOT_HALF, imag: -ROOT_HALF },
    "11": { real: -ROOT_HALF, imag: -ROOT_HALF },
  };
  const ns = "http://www.w3.org/2000/svg";
  const state = { bits: [], symbols: [], displacement: 0.05, showOriginal: true, showPerturbed: true };
  const elements = {
    grid: document.querySelector("#grid"), axes: document.querySelector("#axes"), labels: document.querySelector("#axis-labels"),
    ideal: document.querySelector("#ideal-points"), perturbed: document.querySelector("#perturbed-points"), pairs: document.querySelector("#pair-list"),
    count: document.querySelector("#symbol-count"), slider: document.querySelector("#displacement"), value: document.querySelector("#displacement-value"),
    original: document.querySelector("#show-original"), perturbedToggle: document.querySelector("#show-perturbed"),
  };
  const svg = (tag, attributes = {}) => { const node = document.createElementNS(ns, tag); Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value)); return node; };
  const coordinate = ({ real, imag }) => ({ x: center + real * scale, y: center - imag * scale });
  const randomOffset = () => state.displacement * (2 * Math.random() - 1);
  const perturb = (original) => ({ real: original.real + randomOffset(), imag: original.imag + randomOffset() });

  function drawField() {
    for (let position = 80; position < viewSize; position += 55) {
      elements.grid.append(svg("line", { x1: position, y1: 0, x2: position, y2: viewSize, class: "grid-line" }));
      elements.grid.append(svg("line", { x1: 0, y1: position, x2: viewSize, y2: position, class: "grid-line" }));
    }
    elements.axes.append(svg("line", { x1: 36, y1: center, x2: 564, y2: center, class: "axis-line" }));
    elements.axes.append(svg("line", { x1: center, y1: 36, x2: center, y2: 564, class: "axis-line" }));
    [center - scale, center + scale].forEach((position) => {
      elements.axes.append(svg("line", { x1: position, y1: center - 7, x2: position, y2: center + 7, class: "axis-tick" }));
      elements.axes.append(svg("line", { x1: center - 7, y1: position, x2: center + 7, y2: position, class: "axis-tick" }));
    });
    const labels = [[548, center - 12, "Real", "axis-text"], [center + 12, 52, "Imag", "axis-text"], [center + 116, center - 110, "00", "quadrant-label"], [center - 132, center - 110, "01", "quadrant-label"], [center + 116, center + 126, "10", "quadrant-label"], [center - 132, center + 126, "11", "quadrant-label"]];
    labels.forEach(([x, y, text, className]) => { const node = svg("text", { x, y, class: className }); node.textContent = text; elements.labels.append(node); });
  }

  function render() {
    elements.ideal.replaceChildren(); elements.perturbed.replaceChildren(); elements.pairs.replaceChildren();
    elements.count.textContent = String(state.symbols.length);
    state.symbols.forEach((symbol) => {
      const original = coordinate(symbol.original); const displaced = coordinate(symbol.perturbed);
      if (state.showPerturbed) {
        elements.perturbed.append(svg("line", { x1: original.x, y1: original.y, x2: displaced.x, y2: displaced.y, class: "perturbed-link" }));
        elements.perturbed.append(svg("circle", { cx: displaced.x, cy: displaced.y, r: 5, class: "perturbed-point" }));
      }
      if (state.showOriginal) elements.ideal.append(svg("circle", { cx: original.x, cy: original.y, r: 6, class: "ideal-point" }));
      const pair = document.createElement("li"); pair.textContent = symbol.bits; elements.pairs.append(pair);
    });
  }

  function generateData() {
    state.bits = Array.from({ length: BITS_COUNT }, () => Math.floor(Math.random() * 2));
    state.symbols = [];
    for (let index = 0; index < state.bits.length; index += 2) {
      const bits = `${state.bits[index]}${state.bits[index + 1]}`;
      const original = mapping[bits];
      state.symbols.push({ bits, original: { ...original }, perturbed: perturb(original) });
    }
    render();
  }
  function regenerateDisplacement() { state.symbols = state.symbols.map((symbol) => ({ ...symbol, perturbed: perturb(symbol.original) })); render(); }

  elements.slider.addEventListener("input", () => { state.displacement = Number(elements.slider.value); elements.value.value = state.displacement.toFixed(2); regenerateDisplacement(); });
  document.querySelector("#generate-data").addEventListener("click", generateData);
  document.querySelector("#regenerate-displacement").addEventListener("click", regenerateDisplacement);
  elements.original.addEventListener("change", () => { state.showOriginal = elements.original.checked; render(); });
  elements.perturbedToggle.addEventListener("change", () => { state.showPerturbed = elements.perturbedToggle.checked; render(); });
  drawField(); generateData();
})();
