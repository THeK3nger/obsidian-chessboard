export class Arrow {
  private static readonly xmlns = "http://www.w3.org/2000/svg";
  static drawArrow(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string
  ): SVGElement {
    let arrow = document.createElementNS(this.xmlns, "polygon");
    const width2 = 5;
    const headWidth = 20;
    const arrowWidth = 10;
    const length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));

    // The idea here is create an horizontal right-pointing arrow and then rotate it
    // so that it points to (x1,y2).
    const ax = x0;
    const ay = y0 - width2;
    const bx = x0 + length - headWidth;
    const by = ay;
    const cx = bx;
    const cy = y0 - arrowWidth;
    const dx = x0 + length;
    const dy = y0;
    const ex = bx;
    const ey = y0 + arrowWidth;
    const fx = bx;
    const fy = y0 + width2;
    const gx = x0;
    const gy = fy;

    arrow.setAttributeNS(
      null,
      "points",
      `${ax},${ay} ${bx},${by} ${cx},${cy} ${dx},${dy} ${ex},${ey} ${fx},${fy} ${gx},${gy}`
    );

    arrow.setAttributeNS(
      null,
      "transform",
      `rotate(${Math.atan2(y1 - y0, x1 - x0) * (180 / Math.PI)},${x0},${y0})`
    );

    arrow.setAttributeNS(null, "fill", color);

    return arrow;
  }
}
