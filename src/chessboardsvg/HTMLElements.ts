/** Creates the paired-dot indicator used to show which color moves next. */
export function createTurnIndicator(turn: "w" | "b"): HTMLElement {
  const colorName = turn === "w" ? "White" : "Black";
  const indicator = createDiv("chess-turn-indicator");
  indicator.setAttribute("role", "img");
  indicator.setAttribute("aria-label", `${colorName} to move`);
  indicator.setAttribute("title", `${colorName} to move`);

  for (const color of ["white", "black"] as const) {
    const dot = createSpan(`chess-turn-dot chess-turn-dot--${color}`);
    if (color[0] === turn) {
      dot.classList.add("chess-turn-dot--active");
    }
    indicator.appendChild(dot);
  }

  return indicator;
}
