/**
 * Utility class for creating SVG arrow elements.
 */
export class Arrow {
  private static readonly xmlns = "http://www.w3.org/2000/svg";
  private static readonly HALF_SHAFT_WIDTH = 5;
  private static readonly HEAD_DEPTH = 20;
  private static readonly HALF_HEAD_HEIGHT = 10;

  /**
   * Draws an arrow from (x0, y0) to (x1, y1) with the specified color.
   * @param x0 - The starting x-coordinate of the arrow.
   * @param y0 - The starting y-coordinate of the arrow.
   * @param x1 - The ending x-coordinate of the arrow.
   * @param y1 - The ending y-coordinate of the arrow.
   * @param color - The color of the arrow.
   * @param opacity - Optional opacity value (0-1). Defaults to 0.8.
   * @returns An SVGElement representing the arrow.
   */
  static drawArrow(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    opacity: number = 0.8,
  ): SVGElement {
    const arrow = document.createElementNS(this.xmlns, "polygon");
    const length = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);

    // Arrow shaft ends where the head begins
    const shaftEnd = length - this.HEAD_DEPTH;

    // Define the arrow points pair to pair, starting from x0, y0.
    const points = `
      ${x0},${y0 - this.HALF_SHAFT_WIDTH}
      ${x0 + shaftEnd},${y0 - this.HALF_SHAFT_WIDTH}
      ${x0 + shaftEnd},${y0 - this.HALF_HEAD_HEIGHT}
      ${x0 + length},${y0}
      ${x0 + shaftEnd},${y0 + this.HALF_HEAD_HEIGHT}
      ${x0 + shaftEnd},${y0 + this.HALF_SHAFT_WIDTH}
      ${x0},${y0 + this.HALF_SHAFT_WIDTH}
    `
      .trim()
      .replace(/\s+/g, " ");

    // Calculate rotation angle to point from (x0, y0) to (x1, y1)
    const angle = Math.atan2(y1 - y0, x1 - x0) * (180 / Math.PI);

    // Set attributes using setAttribute (simpler than setAttributeNS with null namespace)
    arrow.setAttribute("points", points);
    arrow.setAttribute("transform", `rotate(${angle},${x0},${y0})`);
    arrow.setAttribute("fill", color);
    arrow.setAttribute("opacity", opacity.toString());

    return arrow;
  }
}
