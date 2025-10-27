import {
  App,
  MarkdownPostProcessorContext,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import { SVGChessboard, SVGChessboardOptions } from "./chessboardsvg/index";
import { parseCodeBlock } from "./Annotations";

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
      this.getDrawChessboardFENFuncion()
    );
    this.registerMarkdownCodeBlockProcessor(
      "chessboard-pgn",
      this.getDrawChessboardPGNFunction()
    );
  }

  refreshChessboardBlocks() {
    // TODO: This only works in preview mode. I still don't know how to refresh
    // the ones in edit mode.
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    view.previewMode.rerender(true);
  }

  private drawChessboard(
    chessboard: SVGChessboard,
    el: HTMLElement,
    _ctx: MarkdownPostProcessorContext
  ) {
    const xmlns = "http://www.w3.org/2000/svg";
    const boardWidthPx = this.setting.boardWidthPx;
    const block = document.createElementNS(xmlns, "svg");
    block.setAttributeNS(null, "viewBox", `0 0 320 320`);
    block.setAttributeNS(null, "width", String(boardWidthPx));
    block.setAttributeNS(null, "height", String(boardWidthPx));
    block.appendChild(chessboard.draw());
    block.style.display = "block";
    el.appendChild(block);
  }

  private drawErrorMessage(error: Error, el: HTMLElement) {
    console.error(error);
    // Append the error message to the block with red color
    const errorMessage = document.createTextNode(error.message);
    const errorEl = document.createElement("div");
    errorEl.style.color = "red";
    errorEl.appendChild(errorMessage);
    el.appendChild(errorEl);
  }

  private getDrawChessboardPGNFunction() {
    return (
      source: string,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext
    ) => {
      try {
        this.setting.orientation = "white";

        // Extract ply parameter if present
        let ply: number | undefined = undefined;
        let pgnSource = source;

        const lines = source.split('\n');
        const plyLine = lines.find(line => line.trim().toLowerCase().startsWith('ply:'));

        if (plyLine) {
          const plyMatch = plyLine.match(/ply:\s*(\d+)/i);
          if (plyMatch) {
            ply = parseInt(plyMatch[1], 10);
          }
          // Remove the ply line from the source
          pgnSource = lines.filter(line => line !== plyLine).join('\n');
        }

        const chessboard = SVGChessboard.fromPGN(pgnSource, this.setting, ply);
        // TODO: Add support for annotations in PGN
        // for (let annotation of parsedCode.annotations) {
        //   if (annotation.type === "arrow") {
        //     chessboard.addArrow(
        //       annotation.start,
        //       annotation.end,
        //       annotation.color
        //     );
        //   }
        //   if (annotation.type === "highlight") {
        //     chessboard.highlight(annotation.square, annotation.color);
        //   }
        // }
        this.drawChessboard(chessboard, el, ctx);
      } catch (e) {
        this.drawErrorMessage(e, el);
      }
    };
  }

  private getDrawChessboardFENFuncion() {
    return (
      source: string,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext
    ) => {
      const parsedCode = parseCodeBlock(source);
      try {
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
          if (annotation.type === "icon") {
            chessboard.addIcon(annotation.square, annotation.icon);
          }
        }
        this.drawChessboard(chessboard, el, ctx);
      } catch (e) {
        this.drawErrorMessage(e, el);
      }
    };
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
          this.plugin.refreshChessboardBlocks();
          this.plugin.saveData(settings);
        })
      );

    new Setting(containerEl)
      .setName("Black Square Color")
      .setDesc('Set the color of the "black" squares.')
      .addColorPicker((color) =>
        color.setValue(String(settings.blackSquareColor)).onChange((value) => {
          settings.blackSquareColor = value;
          this.plugin.refreshChessboardBlocks();
          this.plugin.saveData(settings);
        })
      );

    new Setting(containerEl)
      .setName("White Pieces Color")
      .setDesc('Set the color of the "white" pieces.')
      .addColorPicker((color) =>
        color.setValue(settings.whitePieceColor).onChange((value) => {
          settings.whitePieceColor = value;
          this.plugin.refreshChessboardBlocks();
          this.plugin.saveData(settings);
        })
      );

    new Setting(containerEl)
      .setName("Black Pieces Color")
      .setDesc('Set the color of the "black" pieces.')
      .addColorPicker((color) =>
        color.setValue(String(settings.blackPieceColor)).onChange((value) => {
          settings.blackPieceColor = value;
          this.plugin.refreshChessboardBlocks();
          this.plugin.saveData(settings);
        })
      );

    new Setting(containerEl)
      .setName("Chessboard Size (px)")
      .setDesc("Sets the side of the chess board in pixels.")
      .addText((text) =>
        text.setValue(String(settings.boardWidthPx)).onChange((value) => {
          const numericValue = Number(value);
          if (!isNaN(numericValue) && numericValue > 0) {
            settings.boardWidthPx = numericValue;
            this.plugin.refreshChessboardBlocks();
            this.plugin.saveData(settings);
          } else {
            new Notice(
              "Please enter a valid positive number for the board size."
            );
          }
        })
      );
  }
}
