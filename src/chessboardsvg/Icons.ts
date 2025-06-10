//@ts-ignore
import brilliant from "./icons/brilliant.svg";
// @ts-ignore
import best from "./icons/best.svg";
// @ts-ignore
import blunder from "./icons/blunder.svg";
// @ts-ignore
import good from "./icons/good.svg";
// @ts-ignore
import inaccuracy from "./icons/inaccuracy.svg";
// @ts-ignore
import incorrect from "./icons/incorrect.svg";
// @ts-ignore
import mistake from "./icons/mistake.svg";
// @ts-ignore
import excellent from "./icons/excellent.svg";
// @ts-ignore
import forced from "./icons/forced.svg";

export class Icons {
  static brilliant = Icons.loadIcon(brilliant);
  static best = Icons.loadIcon(best);
  static blunder = Icons.loadIcon(blunder);
  static good = Icons.loadIcon(good);
  static inaccuracy = Icons.loadIcon(inaccuracy);
  static incorrect = Icons.loadIcon(incorrect);
  static mistake = Icons.loadIcon(mistake);
  static excellent = Icons.loadIcon(excellent);
  static forced = Icons.loadIcon(forced);

  private static loadIcon(icon: string): HTMLElement {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(icon, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    return svgElement;
  }
}
