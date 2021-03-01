import {
  App,
  MarkdownPostProcessor,
  MarkdownPostProcessorContext,
  MarkdownPreviewRenderer,
  Plugin,
} from "obsidian";
import { SVGChessboard } from "./chessboardsvg/index";

export default class ObsidianChess extends Plugin {
  // This field stores your plugin settings.
  //setting: MyPluginSettings;

  onInit() {}

  async onload() {
    this.registerMarkdownCodeBlockProcessor(
      "chessboard",
      ObsidianChess.postprocessor
    );
  }

  static postprocessor = (
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ) => {
    const chessboard = SVGChessboard.fromFEN(source);

    const xmlns = "http://www.w3.org/2000/svg";
    var boxWidth = 320;
    var boxHeight = 320;
    var block = document.createElementNS(xmlns, "svg");
    block.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
    block.setAttributeNS(null, "width", String(boxWidth));
    block.setAttributeNS(null, "height", String(boxHeight));
    block.appendChild(chessboard.draw());
    block.style.display = "block";
    el.appendChild(block);
  };
}
