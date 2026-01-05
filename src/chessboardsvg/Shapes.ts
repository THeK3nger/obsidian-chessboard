/**
 * Utility class for creating SVG shape elements for board annotations.
 */
export class Shapes {
  private static readonly xmlns = "http://www.w3.org/2000/svg";

  /**
   * Draws a circle at the specified coordinates.
   * @param x - The top-left x-coordinate of the square.
   * @param y - The top-left y-coordinate of the square.
   * @param size - The size of the square containing the shape.
   * @param color - The stroke color.
   * @param opacity - Optional opacity value (0-1). Defaults to 0.8.
   * @returns An SVGElement representing the circle.
   */
  static drawCircle(
    x: number,
    y: number,
    size: number,
    color: string,
    opacity: number = 0.8,
  ): SVGElement {
    const circle = document.createElementNS(this.xmlns, "circle");
    const radius = size * 0.35; // Circle takes ~70% of square
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    circle.setAttribute("cx", centerX.toString());
    circle.setAttribute("cy", centerY.toString());
    circle.setAttribute("r", radius.toString());
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", color);
    circle.setAttribute("stroke-width", "3");
    circle.setAttribute("opacity", opacity.toString());

    return circle;
  }

  /**
   * Draws a square at the specified coordinates.
   * @param x - The top-left x-coordinate of the square.
   * @param y - The top-left y-coordinate of the square.
   * @param size - The size of the square containing the shape.
   * @param color - The stroke color.
   * @param opacity - Optional opacity value (0-1). Defaults to 0.8.
   * @returns An SVGElement representing the square.
   */
  static drawSquare(
    x: number,
    y: number,
    size: number,
    color: string,
    opacity: number = 0.8,
  ): SVGElement {
    const rect = document.createElementNS(this.xmlns, "rect");
    const padding = size * 0.15; // 15% padding on each side
    const shapeSize = size * 0.7; // Square takes ~70% of cell

    rect.setAttribute("x", (x + padding).toString());
    rect.setAttribute("y", (y + padding).toString());
    rect.setAttribute("width", shapeSize.toString());
    rect.setAttribute("height", shapeSize.toString());
    rect.setAttribute("fill", "none");
    rect.setAttribute("stroke", color);
    rect.setAttribute("stroke-width", "3");
    rect.setAttribute("opacity", opacity.toString());

    return rect;
  }

  /**
   * Draws a squircle (superellipse) at the specified coordinates.
   * A squircle is a shape between a square and a circle, with rounded corners.
   * @param x - The top-left x-coordinate of the square.
   * @param y - The top-left y-coordinate of the square.
   * @param size - The size of the square containing the shape.
   * @param color - The stroke color.
   * @param opacity - Optional opacity value (0-1). Defaults to 0.8.
   * @returns An SVGElement representing the squircle.
   */
  static drawSquircle(
    x: number,
    y: number,
    size: number,
    color: string,
    opacity: number = 0.8,
  ): SVGElement {
    const path = document.createElementNS(this.xmlns, "path");
    const padding = size * 0.15;
    const shapeSize = size * 0.7;
    const cornerRadius = shapeSize * 0.25; // 25% corner radius for smooth squircle

    const left = x + padding;
    const top = y + padding;
    const right = left + shapeSize;
    const bottom = top + shapeSize;

    // SVG path for rounded rectangle (squircle approximation)
    // M = move to, L = line to, Q = quadratic bezier curve
    const pathData = `
      M ${left + cornerRadius} ${top}
      L ${right - cornerRadius} ${top}
      Q ${right} ${top} ${right} ${top + cornerRadius}
      L ${right} ${bottom - cornerRadius}
      Q ${right} ${bottom} ${right - cornerRadius} ${bottom}
      L ${left + cornerRadius} ${bottom}
      Q ${left} ${bottom} ${left} ${bottom - cornerRadius}
      L ${left} ${top + cornerRadius}
      Q ${left} ${top} ${left + cornerRadius} ${top}
      Z
    `.trim().replace(/\s+/g, " ");

    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "3");
    path.setAttribute("opacity", opacity.toString());

    return path;
  }
}
