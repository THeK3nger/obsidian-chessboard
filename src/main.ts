import {
  App,
  MarkdownPostProcessorContext,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  SettingGroup,
} from "obsidian";
import {
  SVGChessboard,
  SVGChessboardOptions,
} from "./chessboardsvg/index";
import { parseCodeBlock } from "./Annotations";
import { createInteractivePGNBoard } from "./chessboardsvg/InteractivePGN";
import { parsePGNBlock } from "./PGNOptions";

const DEFAULT_CHESS_SETTINGS = {
  whiteSquareColor: "#f0d9b5",
  blackSquareColor: "#b58862",
  whitePieceColor: "#ffffff",
  blackPieceColor: "#000000",
  boardWidthPx: 320,
};

export default class ObsidianChess extends Plugin {
  // This field stores your plugin settings.
  setting!: ObsidianChessSettings;

  onInit() {}

  async onload() {
    this.setting = (((await this.loadData()) ?? { ...DEFAULT_CHESS_SETTINGS }) as ObsidianChessSettings);
    // In case the settting exists but is missing a field due to an update
    if (this.setting.boardWidthPx === undefined) {
      this.setting.boardWidthPx = 320;
    }
    this.addSettingTab(new ObsidianChessSettingsTab(this.app, this));
    this.registerMarkdownCodeBlockProcessor(
      "chessboard",
      this.getDrawChessboardFENFuncion(),
    );
    this.registerMarkdownCodeBlockProcessor(
      "chessboard-pgn",
      this.getDrawChessboardPGNFunction(),
    );
  }

  refreshChessboardBlocks() {
    // TODO: This only works in preview mode. I still don't know how to refresh
    // the ones in edit mode.
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      return;
    }
    view.previewMode.rerender(true);
  }

  private drawChessboard(
    chessboard: SVGChessboard,
    el: HTMLElement,
    _ctx: MarkdownPostProcessorContext,
  ) {
    const xmlns = "http://www.w3.org/2000/svg";
    const block = activeDocument.createElementNS(xmlns, "svg");
    block.setAttributeNS(null, "viewBox", `0 0 320 320`);
    block.appendChild(chessboard.draw());
    block.addClass("chess-board-svg");
    block.setCssProps({"--chess-board-max-width": `${this.setting.boardWidthPx}px`});
    el.appendChild(block);
  }

  private drawErrorMessage(error: unknown, el: HTMLElement) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const errorEl = createDiv({ cls: "chess-error", text: message });
    el.appendChild(errorEl);
  }

  private getDrawChessboardPGNFunction() {
    return (
      source: string,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext,
    ) => {
      try {
        const { pgnSource, ply, showMove, interactive, moveList, orientation, annotations } =
          parsePGNBlock(source);
        const boardOptions = { ...this.setting, orientation };

        if (interactive) {
          const interactiveBoard = createInteractivePGNBoard(
            pgnSource,
            boardOptions,
            ply,
            showMove,
            this.setting.boardWidthPx,
            moveList,
            annotations,
          );
          el.appendChild(interactiveBoard);
        } else {
          const chessboard = SVGChessboard.fromPGN(pgnSource, boardOptions, ply, showMove);
          for (const ann of annotations) {
            if (ann.type === "arrow") chessboard.addArrow(ann.start, ann.end, ann.color);
            else if (ann.type === "highlight") chessboard.highlight(ann.square, ann.color);
            else if (ann.type === "icon") chessboard.addIcon(ann.square, ann.icon);
            else if (ann.type === "shape") chessboard.addShape(ann.square, ann.shape, ann.color);
          }
          this.drawChessboard(chessboard, el, ctx);
        }
      } catch (e) {
        this.drawErrorMessage(e, el);
      }
    };
  }

  private getDrawChessboardFENFuncion() {
    return (
      source: string,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext,
    ) => {
      try {
        const parsedCode = parseCodeBlock(source);
        const boardOptions = {
          ...this.setting,
          orientation: parsedCode.orientation,
        };
        const chessboard = SVGChessboard.fromFEN(
          parsedCode.fen,
          boardOptions,
          !parsedCode.strict,
        );
        for (let annotation of parsedCode.annotations) {
          if (annotation.type === "arrow") {
            chessboard.addArrow(
              annotation.start,
              annotation.end,
              annotation.color,
            );
          }
          if (annotation.type === "highlight") {
            chessboard.highlight(annotation.square, annotation.color);
          }
          if (annotation.type === "icon") {
            chessboard.addIcon(annotation.square, annotation.icon);
          }
          if (annotation.type === "shape") {
            chessboard.addShape(
              annotation.square,
              annotation.shape,
              annotation.color,
            );
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

  private resetToDefaults(): void {
    // Update settings object with defaults
    this.plugin.setting.whiteSquareColor =
      DEFAULT_CHESS_SETTINGS.whiteSquareColor;
    this.plugin.setting.blackSquareColor =
      DEFAULT_CHESS_SETTINGS.blackSquareColor;
    this.plugin.setting.whitePieceColor =
      DEFAULT_CHESS_SETTINGS.whitePieceColor;
    this.plugin.setting.blackPieceColor =
      DEFAULT_CHESS_SETTINGS.blackPieceColor;
    this.plugin.setting.boardWidthPx = DEFAULT_CHESS_SETTINGS.boardWidthPx;

    void this.plugin.saveData(this.plugin.setting);

    this.plugin.refreshChessboardBlocks();
    this.display();

    new Notice("Chessboard settings reset to default values");
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.setting;

    containerEl.empty();

    const customizationGroup = new SettingGroup(containerEl).setHeading(
      "Chessboard Customization",
    );

    //new Setting(containerEl).setName("Chessboard Customization").setHeading();

    customizationGroup.addSetting((setting) => {
      setting
        .setName("White square color")
        .setDesc('Set the color of the "white" squares.')
        .addColorPicker((color) =>
          color
            .setValue(String(settings.whiteSquareColor))
            .onChange((value) => {
              settings.whiteSquareColor = value;
              this.plugin.refreshChessboardBlocks();
              void this.plugin.saveData(settings);
            }),
        );
    });

    customizationGroup.addSetting((setting) => {
      setting
        .setName("Black square color")
        .setDesc('Set the color of the "black" squares.')
        .addColorPicker((color) =>
          color
            .setValue(String(settings.blackSquareColor))
            .onChange((value) => {
              settings.blackSquareColor = value;
              this.plugin.refreshChessboardBlocks();
              void this.plugin.saveData(settings);
            }),
        );
    });

    customizationGroup.addSetting((setting) => {
      setting
        .setName("White pieces color")
        .setDesc('Set the color of the "white" pieces.')
        .addColorPicker((color) =>
          color.setValue(settings.whitePieceColor).onChange((value) => {
            settings.whitePieceColor = value;
            this.plugin.refreshChessboardBlocks();
            void this.plugin.saveData(settings);
          }),
        );
    });

    customizationGroup.addSetting((setting) => {
      setting
        .setName("Black pieces color")
        .setDesc('Set the color of the "black" pieces.')
        .addColorPicker((color) =>
          color.setValue(String(settings.blackPieceColor)).onChange((value) => {
            settings.blackPieceColor = value;
            this.plugin.refreshChessboardBlocks();
            void this.plugin.saveData(settings);
          }),
        );
    });

    customizationGroup.addSetting((setting) => {
      setting
        .setName("Chessboard max width (px)")
        .setDesc(
          "Sets the maximum width of the chess board in pixels. On narrow screens, the board will scale down to fit the viewport.",
        )
        .addText((text) =>
          text.setValue(String(settings.boardWidthPx)).onChange((value) => {
            const numericValue = Number(value);
            if (!isNaN(numericValue) && numericValue > 0) {
              settings.boardWidthPx = numericValue;
              this.plugin.refreshChessboardBlocks();
              void this.plugin.saveData(settings);
            } else {
              new Notice(
                "Please enter a valid positive number for the board size.",
              );
            }
          }),
        );
    });

    // Add reset button at the bottom
    customizationGroup.addSetting((setting) => {
      setting
        .setName("Reset to defaults")
        .setDesc(
          "Restore all chessboard customization settings to their default values.",
        )
        .addButton((button) =>
          button
            .setButtonText("Reset")
            .setWarning()
            .onClick(() => {
              this.resetToDefaults();
            }),
        );
    });
  }
}
