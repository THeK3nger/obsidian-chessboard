import {
  App,
  MarkdownPostProcessorContext,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import { SVGChessboard, SVGChessboardOptions } from "./chessboardsvg/index";

interface ParsedChessCode {
  fen: string;
  annotations: Array<Highlight | ArrowAnnotation>;
  orientation: "white" | "black";
}

/**
 * Represents a highlight annotation on the board.
 *
 * It is defined by the square to highlight (in algebraic notation) and the color to use.
 */
interface Highlight {
  type: "highlight";
  square: string;
  color: string;
}

/**
 * Represents an arrow annotation on the board.
 *
 * It is defined by the start and end squares of the arrow (in algebraic notation) and the color to use.
 */
interface ArrowAnnotation {
  type: "arrow";
  start: string;
  end: string;
  color: string;
}

export default class ObsidianChess extends Plugin {
  // This field stores your plugin settings.
  setting: ObsidianChessSettings;

  onInit() {}

  async onload() {
    this.setting = (await this.loadData()) || {
      whiteSquareColor: "#f0d9b5",
      blackSquareColor: "#b58862",
      whitePieceColor: "#ffffff",
      blackPieceColor: "#000000",
      boardWidthPx: 320,
    };
    // In case the settting exists but is missing a field due to an update
    if (this.setting.boardWidthPx === undefined) {
      this.setting.boardWidthPx = 320;
    }
    this.addSettingTab(new ObsidianChessSettingsTab(this.app, this));
    this.registerMarkdownCodeBlockProcessor(
      "chessboard",
      this.draw_chessboard()
    );
  }

  refreshMarkdownCodeBlockProcessor() {
    this.draw_chessboard();
  }

  private draw_chessboard() {
    return (
      source: string,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext
    ) => {
      const parsedCode = ObsidianChess.parseCode(source);
      this.setting.orientation = parsedCode.orientation;
      const chessboard = SVGChessboard.fromFEN(parsedCode.fen, this.setting);
      for (let annotation of parsedCode.annotations) {
        if (annotation.type === "arrow") {
          chessboard.addArrow(
            annotation.start,
            annotation.end,
            annotation.color
          );
        }
        if (annotation.type === "highlight") {
          chessboard.highlight(annotation.square, annotation.color);
        }
      }

      const xmlns = "http://www.w3.org/2000/svg";
      const boardWidthPx = this.setting.boardWidthPx;
      const block = document.createElementNS(xmlns, "svg");
      block.setAttributeNS(null, "viewBox", `0 0 320 320`);
      block.setAttributeNS(null, "width", String(boardWidthPx));
      block.setAttributeNS(null, "height", String(boardWidthPx));
      block.appendChild(chessboard.draw());
      block.style.display = "block";
      el.appendChild(block);
    };
  }

  private static parseCode(input: string): ParsedChessCode {
    const lines = input.split(/\r?\n/);
    let fen = lines[0];
    if (fen.startsWith("fen: ")) {
      fen = fen.replace("fen: ", "");
    }
    const annotations: Array<Highlight | ArrowAnnotation> = [];
    let orientation: "white" | "black" = "white";
    for (let line of lines.splice(1)) {
      if (line.trim() === "") {
        continue;
      }
      if (line.startsWith("orientation: ")) {
        line = line.replace("orientation: ", "");
        line = line.trim();
        if (line !== "white" && line !== "black") {
          throw Error(`Unknown orientation ${orientation}`);
        }
        orientation = line;
      }
      if (line.startsWith("annotations: ")) {
        line = line.replace("annotations: ", "");
        let partial_annotations = line.split(" ");
        for (let annotation of partial_annotations) {
          if (annotation.startsWith("H")) {
            let color = "#e67768"; // default yellow
            if (annotation.endsWith("/y")) {
              color = "#f1ad24";
            } else if (annotation.endsWith("/g")) {
              color = "#b3ce6e";
            } else if (annotation.endsWith("/b")) {
              color = "#6ab5d6";
            }
            annotations.push({
              type: "highlight",
              square: annotation.substring(1, 3),
              color: color,
            });
            continue;
          }
          if (annotation.startsWith("A")) {
            let color = "#f1ad24"; // default yellow
            if (annotation.endsWith("/r")) {
              color = "#e67768";
            } else if (annotation.endsWith("/g")) {
              color = "#b3ce6e";
            } else if (annotation.endsWith("/b")) {
              color = "#6ab5d6";
            }
            let [start, end] = annotation.substring(1, 6).split("-");
            annotations.push({
              type: "arrow",
              start,
              end,
              color: color,
            });
            continue;
          }
        }
      }
    }
    return { fen, annotations, orientation };
  }
}

/**
 * This is a data class that contains your plugin configurations. You can edit it
 * as you wish by adding fields and all the data you need.
 */
interface ObsidianChessSettings extends SVGChessboardOptions {
  whiteSquareColor: string;
  blackSquareColor: string;
  whitePieceColor: string;
  blackPieceColor: string;
  boardWidthPx: number;
}

class ObsidianChessSettingsTab extends PluginSettingTab {
  plugin: ObsidianChess;

  constructor(app: App, plugin: ObsidianChess) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.setting;

    containerEl.empty();

    new Setting(containerEl).setName("Chessboard Customization").setHeading();

    new Setting(containerEl)
      .setName("White Square Color")
      .setDesc('Set the color of the "white" squares.')
      .addColorPicker((color) =>
        color.setValue(String(settings.whiteSquareColor)).onChange((value) => {
          settings.whiteSquareColor = value;
          this.plugin.refreshMarkdownCodeBlockProcessor();
          this.plugin.saveData(settings);
        })
      );

    new Setting(containerEl)
      .setName("Black Square Color")
      .setDesc('Set the color of the "black" squares.')
      .addColorPicker((color) =>
        color.setValue(String(settings.blackSquareColor)).onChange((value) => {
          settings.blackSquareColor = value;
          this.plugin.refreshMarkdownCodeBlockProcessor();
          this.plugin.saveData(settings);
        })
      );

    new Setting(containerEl)
      .setName("White Pieces Color")
      .setDesc('Set the color of the "white" pieces.')
      .addColorPicker((color) =>
        color.setValue(settings.whitePieceColor).onChange((value) => {
          settings.whitePieceColor = value;
          this.plugin.refreshMarkdownCodeBlockProcessor();
          this.plugin.saveData(settings);
        })
      );

    new Setting(containerEl)
      .setName("Black Pieces Color")
      .setDesc('Set the color of the "black" pieces.')
      .addColorPicker((color) =>
        color.setValue(String(settings.blackPieceColor)).onChange((value) => {
          settings.blackPieceColor = value;
          this.plugin.refreshMarkdownCodeBlockProcessor();
          this.plugin.saveData(settings);
        })
      );

    new Setting(containerEl)
      .setName("Chessboard Size (px)")
      .setDesc("Sets the side of the chess board in pixels.")
      .addText((text) =>
        text.setValue(String(settings.boardWidthPx)).onChange((value) => {
          settings.boardWidthPx = Number(value);
          this.plugin.refreshMarkdownCodeBlockProcessor();
          this.plugin.saveData(settings);
        })
      );
  }
}
