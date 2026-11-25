/** SVG shape annotations centered within a board square at `(x, y)` of width `size`. */
export class Shapes {
  private static readonly xmlns = "http://www.w3.org/2000/svg";

  static drawCircle(
    x: number,
    y: number,
    size: number,
    color: string,
    opacity: number = 0.8,
  ): SVGElement {
    const circle = activeDocument.createElementNS(this.xmlns, "circle");
    const radius = size * 0.35;
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

  static drawSquare(
    x: number,
    y: number,
    size: number,
    color: string,
    opacity: number = 0.8,
  ): SVGElement {
    const rect = activeDocument.createElementNS(this.xmlns, "rect");
    const padding = size * 0.15;
    const shapeSize = size * 0.7;

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

  static drawSquircle(
    x: number,
    y: number,
    size: number,
    color: string,
    opacity: number = 0.8,
  ): SVGElement {
    const path = activeDocument.createElementNS(this.xmlns, "path");
    const padding = size * 0.15;
    const shapeSize = size * 0.7;
    const cornerRadius = shapeSize * 0.25;

    const left = x + padding;
    const top = y + padding;
    const right = left + shapeSize;
    const bottom = top + shapeSize;

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
