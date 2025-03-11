export class Arrow {
  private static readonly xmlns = "http://www.w3.org/2000/svg";
  private static readonly WIDTH2 = 5;
  private static readonly HEAD_WIDTH = 20;
  private static readonly ARROW_WIDTH = 10;

  /**
   * Draws an arrow from (x0, y0) to (x1, y1) with the specified color.
   * @param x0 - The starting x-coordinate of the arrow.
   * @param y0 - The starting y-coordinate of the arrow.
   * @param x1 - The ending x-coordinate of the arrow.
   * @param y1 - The ending y-coordinate of the arrow.
   * @param color - The color of the arrow.
   * @returns An SVGElement representing the arrow.
   */
  static drawArrow(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string
  ): SVGElement {
    const arrow = document.createElementNS(this.xmlns, "polygon");
    const length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));

    // Define the points of the arrow
    const startX = x0;
    const startY = y0 - this.WIDTH2;
    const midX = x0 + length - this.HEAD_WIDTH;
    const midY = startY;
    const headTopX = midX;
    const headTopY = y0 - this.ARROW_WIDTH;
    const endX = x0 + length;
    const endY = y0;
    const headBottomX = midX;
    const headBottomY = y0 + this.ARROW_WIDTH;
    const midBottomX = midX;
    const midBottomY = y0 + this.WIDTH2;
    const startBottomX = x0;
    const startBottomY = midBottomY;

    // Set the points attribute for the polygon
    arrow.setAttributeNS(
      null,
      "points",
      `${startX},${startY} ${midX},${midY} ${headTopX},${headTopY} ${endX},${endY} ${headBottomX},${headBottomY} ${midBottomX},${midBottomY} ${startBottomX},${startBottomY}`
    );

    // Rotate the arrow to point from (x0, y0) to (x1, y1)
    arrow.setAttributeNS(
      null,
      "transform",
      `rotate(${Math.atan2(y1 - y0, x1 - x0) * (180 / Math.PI)},${x0},${y0})`
    );

    // Set the fill color of the arrow
    arrow.setAttributeNS(null, "fill", color);

    return arrow;
  }
}
