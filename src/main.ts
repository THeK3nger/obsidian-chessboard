import {
  App,
  MarkdownPostProcessorContext,
  MarkdownView,
  Plugin,
  PluginSettingTab,
  Setting,
  SettingDefinitionItem,
  SettingGroupItem,
} from "obsidian";
import {
  SVGChessboard,
  SVGChessboardOptions,
} from "./chessboardsvg/index";
import {
  AnnotationColorConfig,
  DEFAULT_ANNOTATION_COLORS,
  parseCodeBlock,
} from "./Annotations";
import { createInteractivePGNBoard } from "./chessboardsvg/InteractivePGN";
import { parsePGNBlock } from "./PGNOptions";

const DEFAULT_CHESS_SETTINGS = {
  whiteSquareColor: "#f0d9b5",
  blackSquareColor: "#b58862",
  whitePieceColor: "#ffffff",
  blackPieceColor: "#000000",
  boardWidthPx: 320,
  annotationColorRed: DEFAULT_ANNOTATION_COLORS.red,
  annotationColorYellow: DEFAULT_ANNOTATION_COLORS.yellow,
  annotationColorGreen: DEFAULT_ANNOTATION_COLORS.green,
  annotationColorBlue: DEFAULT_ANNOTATION_COLORS.blue,
};

type ChessSettingsKey = keyof typeof DEFAULT_CHESS_SETTINGS;
type ChessSettingsKeys = Array<ChessSettingsKey>;

export default class ObsidianChess extends Plugin {
  // This field stores your plugin settings.
  setting!: ObsidianChessSettings;

  onInit() {}

  async onload() {
    this.setting = ((await this.loadData()) ?? {
      ...DEFAULT_CHESS_SETTINGS,
    }) as ObsidianChessSettings;
    // In case the setting exists but is missing a field due to an update
    for (const key of Object.keys(DEFAULT_CHESS_SETTINGS) as ChessSettingsKeys) {
      if (this.setting[key] === undefined) {
        (this.setting[key] as unknown) = DEFAULT_CHESS_SETTINGS[key];
      }
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

  private getAnnotationColors(): AnnotationColorConfig {
    return {
      red: this.setting.annotationColorRed,
      yellow: this.setting.annotationColorYellow,
      green: this.setting.annotationColorGreen,
      blue: this.setting.annotationColorBlue,
    };
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
    block.setCssProps({
      "--chess-board-max-width": `${this.setting.boardWidthPx}px`,
    });
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
          parsePGNBlock(source, this.getAnnotationColors());
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
        const parsedCode = parseCodeBlock(source, this.getAnnotationColors());
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
  // Required so getControlValue/setControlValue can access properties by the string key Obsidian passes in.
  [key: string]: unknown;
  whiteSquareColor: string;
  blackSquareColor: string;
  whitePieceColor: string;
  blackPieceColor: string;
  boardWidthPx: number;
  annotationColorRed: string;
  annotationColorYellow: string;
  annotationColorGreen: string;
  annotationColorBlue: string;
}

class ObsidianChessSettingsTab extends PluginSettingTab {
  plugin: ObsidianChess;

  constructor(app: App, plugin: ObsidianChess) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        type: "group",
        heading: "Chessboard Customization",
        items: [
          this.colorSetting(
            "whiteSquareColor",
            "White square color",
            'Set the color of the "white" squares.',
          ),
          this.colorSetting(
            "blackSquareColor",
            "Black square color",
            'Set the color of the "black" squares.',
          ),
          this.colorSetting(
            "whitePieceColor",
            "White pieces color",
            'Set the color of the "white" pieces.',
          ),
          this.colorSetting(
            "blackPieceColor",
            "Black pieces color",
            'Set the color of the "black" pieces.',
          ),
          this.numberSetting(
            "boardWidthPx",
            "Chessboard max width (px)",
            "Sets the maximum width of the chess board in pixels. On narrow screens, the board will scale down to fit the viewport.",
            1,
          ),
        ],
      },
      {
        type: "group",
        heading: "Annotation Colors",
        items: [
          this.colorSetting(
            "annotationColorRed",
            "Red annotation color",
            'Color used by annotations tagged "/r", and the default for highlights (e.g. "Hd4").',
          ),
          this.colorSetting(
            "annotationColorYellow",
            "Yellow annotation color",
            'Color used by annotations tagged "/y", and the default for arrows and shapes (e.g. "Ae2-e4", "Qd4").',
          ),
          this.colorSetting(
            "annotationColorGreen",
            "Green annotation color",
            'Color used by annotations tagged "/g".',
          ),
          this.colorSetting(
            "annotationColorBlue",
            "Blue annotation color",
            'Color used by annotations tagged "/b".',
          ),
        ],
      },
    ];
  }

  getControlValue(key: string): unknown {
    return this.plugin.setting[key];
  }

  setControlValue(key: string, value: unknown): void {
    this.plugin.setting[key] = value;
    void this.plugin.saveData(this.plugin.setting);
    this.plugin.refreshChessboardBlocks();
  }

  /**
   * Adds the small circular-arrow button that restores a single setting to
   * its default value, matching the per-row reset affordance used by themes
   * like Minimal.
   */
  private addResetButton(
    setting: Setting,
    key: ChessSettingsKey,
  ): void {
    setting.addExtraButton((button) => {
      button
        .setIcon("rotate-ccw")
        .setTooltip("Reset to default")
        .onClick(() => {
          this.setControlValue(key, DEFAULT_CHESS_SETTINGS[key]);
          this.update();
        });
    });
  }

  private colorSetting(
    key: ChessSettingsKey,
    name: string,
    desc: string,
  ): SettingGroupItem<string> {
    return {
      name,
      desc,
      render: (setting) => {
        setting.setName(name).setDesc(desc);
        this.addResetButton(setting, key);
        setting.addColorPicker((picker) => {
          picker
            .setValue(this.plugin.setting[key] as string)
            .onChange((value) => this.setControlValue(key, value));
        });
      },
    };
  }

  private numberSetting(
    key: ChessSettingsKey,
    name: string,
    desc: string,
    min?: number,
  ): SettingGroupItem<string> {
    return {
      name,
      desc,
      render: (setting) => {
        setting.setName(name).setDesc(desc);
        this.addResetButton(setting, key);
        setting.addText((text) => {
          text.inputEl.type = "number";
          if (min !== undefined) text.inputEl.min = String(min);
          text.setValue(String(this.plugin.setting[key])).onChange((value) => {
            const parsed = Number(value);
            this.setControlValue(
              key,
              Number.isFinite(parsed) ? parsed : DEFAULT_CHESS_SETTINGS[key],
            );
          });
        });
      },
    };
  }
}
