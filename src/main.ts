import {
  App,
  MarkdownPostProcessor,
  MarkdownPostProcessorContext,
  MarkdownPreviewRenderer,
  Plugin,
} from "obsidian";
import { SVGChessboard } from "./chessboardsvg/index";

interface ParsedChessCode {
  fen: string;
  annotations: Array<Highlight | ArrowAnnotation>;
}

interface Highlight {
  type: "highlight";
  square: string;
}

interface ArrowAnnotation {
  type: "arrow";
  start: string;
  end: string;
}

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
    const parsedCode = ObsidianChess.parseCode(source);
    const chessboard = SVGChessboard.fromFEN(parsedCode.fen);
    for (let annotation of parsedCode.annotations) {
      if (annotation.type === "arrow") {
        chessboard.addArrow(annotation.start, annotation.end);
      }
      if (annotation.type === "highlight") {
        chessboard.highlight(annotation.square);
      }
    }

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

  private static parseCode(input: string): ParsedChessCode {
    const lines = input.split(/\r?\n/);
    let fen = lines[0];
    if (fen.startsWith("fen: ")) {
      fen = fen.replace("fen: ", "");
    }
    const annotations: Array<Highlight | ArrowAnnotation> = [];
    for (let line of lines.splice(1)) {
      if (line.trim() === "") {
        continue;
      }
      let partial_annotations = line.split(" ");
      for (let annotation of partial_annotations) {
        if (annotation[0] === "H") {
          annotations.push({
            type: "highlight",
            square: annotation.substr(1),
          });
          continue;
        }
        if (annotation[0] === "A") {
          let [start, end] = annotation.substr(1).split("-");
          annotations.push({
            type: "arrow",
            start,
            end,
          });
          continue;
        }
      }
    }
    return { fen, annotations };
  }
}
