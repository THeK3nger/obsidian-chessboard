/**
 * Utility class for creating SVG arrow elements.
 */
export class Arrow {
  private static readonly xmlns = "http://www.w3.org/2000/svg";
  private static readonly HALF_SHAFT_WIDTH = 4;
  private static readonly HEAD_DEPTH = 12;
  private static readonly HALF_HEAD_HEIGHT = 10;

  /** Draws a knight move with its longer leg first, followed by a right-angle turn. */
  static drawKnightArrow(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    opacity: number = 0.65,
  ): SVGElement {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const horizontalFirst = Math.abs(dx) > Math.abs(dy);
    const long = Math.max(Math.abs(dx), Math.abs(dy));
    const short = Math.min(Math.abs(dx), Math.abs(dy));
    const angle = Math.atan2(horizontalFirst ? 0 : dy, horizontalFirst ? dx : 0) * (180 / Math.PI);
    const turn = Math.sign(horizontalFirst ? dx * dy : -dx * dy);
    const w = this.HALF_SHAFT_WIDTH;
    const h = this.HALF_HEAD_HEIGHT;
    const headBase = short - this.HEAD_DEPTH;
    const arrow = activeDocument.createElementNS(this.xmlns, "path");

    // One filled outline avoids darker overlaps at the elbow when translucent.
    // Local coordinates run right along the long leg, then down toward the tip.
    arrow.setAttribute("d", [
      `M 0,${-w}`,
      `A ${w},${w} 0 0 0 0,${w}`,
      `L ${long - w},${w}`,
      `L ${long - w},${headBase}`,
      `L ${long - h},${headBase}`,
      `L ${long},${short}`,
      `L ${long + h},${headBase}`,
      `L ${long + w},${headBase}`,
      `L ${long + w},${-w}`,
      "Z",
    ].join(" "));
    arrow.setAttribute("transform", `translate(${x0},${y0}) rotate(${angle}) scale(1,${turn})`);
    arrow.setAttribute("fill", color);
    arrow.setAttribute("opacity", opacity.toString());
    return arrow;
  }

  /**
   * Draws an arrow from (x0, y0) to (x1, y1) with the specified color.
   * @param x0 - The starting x-coordinate of the arrow.
   * @param y0 - The starting y-coordinate of the arrow.
   * @param x1 - The ending x-coordinate of the arrow.
   * @param y1 - The ending y-coordinate of the arrow.
   * @param color - The color of the arrow.
   * @param opacity - Optional opacity value (0-1). Defaults to 0.65.
   * @returns An SVGElement representing the arrow.
   */
  static drawArrow(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    opacity: number = 0.65,
  ): SVGElement {
    const arrow = activeDocument.createElementNS(this.xmlns, "path");
    const length = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);

    // Arrow shaft ends where the head begins
    const shaftEnd = length - this.HEAD_DEPTH;

    // Create a single path with a rounded start using an arc
    // M: Move to top of shaft
    // A: Arc around the start (creates the rounded beginning)
    // L: Line to various points forming the arrow shape
    // Z: Close the path
    const pathData = `
      M ${x0},${y0 - this.HALF_SHAFT_WIDTH}
      A ${this.HALF_SHAFT_WIDTH},${this.HALF_SHAFT_WIDTH} 0 0 0 ${x0},${y0 + this.HALF_SHAFT_WIDTH}
      L ${x0 + shaftEnd},${y0 + this.HALF_SHAFT_WIDTH}
      L ${x0 + shaftEnd},${y0 + this.HALF_HEAD_HEIGHT}
      L ${x0 + length},${y0}
      L ${x0 + shaftEnd},${y0 - this.HALF_HEAD_HEIGHT}
      L ${x0 + shaftEnd},${y0 - this.HALF_SHAFT_WIDTH}
      Z
    `
      .trim()
      .replace(/\s+/g, " ");

    // Calculate rotation angle to point from (x0, y0) to (x1, y1)
    const angle = Math.atan2(y1 - y0, x1 - x0) * (180 / Math.PI);

    arrow.setAttribute("d", pathData);
    arrow.setAttribute("transform", `rotate(${angle},${x0},${y0})`);
    arrow.setAttribute("fill", color);
    arrow.setAttribute("opacity", opacity.toString());

    return arrow;
  }
}
