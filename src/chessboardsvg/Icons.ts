import brilliant from "./icons/brilliant.svg";
import best from "./icons/best.svg";
import blunder from "./icons/blunder.svg";
import good from "./icons/good.svg";
import inaccuracy from "./icons/inaccuracy.svg";
import incorrect from "./icons/incorrect.svg";
import mistake from "./icons/mistake.svg";
import excellent from "./icons/excellent.svg";
import forced from "./icons/forced.svg";
import checkmate_black from "./icons/checkmate_black.svg";
import checkmate_white from "./icons/checkmate_white.svg";

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
  static checkmate_black = Icons.loadIcon(checkmate_black);
  static checkmate_white = Icons.loadIcon(checkmate_white);

  /** Returns the icon with the given name, or undefined if there is none. */
  static byName(name: string): HTMLElement | undefined {
    return Icons.byNameMap[name];
  }

  private static byNameMap: Record<string, HTMLElement | undefined> = {
    brilliant: Icons.brilliant,
    best: Icons.best,
    blunder: Icons.blunder,
    good: Icons.good,
    inaccuracy: Icons.inaccuracy,
    incorrect: Icons.incorrect,
    mistake: Icons.mistake,
    excellent: Icons.excellent,
    forced: Icons.forced,
    checkmate_black: Icons.checkmate_black,
    checkmate_white: Icons.checkmate_white,
  };

  private static loadIcon(icon: string): HTMLElement {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(icon, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    return svgElement;
  }
}
