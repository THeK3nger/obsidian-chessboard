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
  setting: ObsidianChessSettings;

  onInit() {}

  async onload() {
    this.setting = (await this.loadData()) || {
      whiteSquareColor: "#f0d9b5",
      blackSquareColor: "#b58862",
    };
    this.addSettingTab(new ObsidianChessSettingsTab(this.app, this));
    this.registerMarkdownCodeBlockProcessor(
      "chessboard",
      this.draw_chessboard()
    );
  }

  refreshMarkdownCodeBlockProcessor() {
    this.registerMarkdownCodeBlockProcessor(
      "chessboard",
      this.draw_chessboard()
    );
  }

  private draw_chessboard() {
    return (
      source: string,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext
    ) => {
      const parsedCode = ObsidianChess.parseCode(source);
      const chessboard = SVGChessboard.fromFEN(parsedCode.fen, this.setting);
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
      block.setAttributeNS(
        null,
        "viewBox",
        "0 0 " + boxWidth + " " + boxHeight
      );
      block.setAttributeNS(null, "width", String(boxWidth));
      block.setAttributeNS(null, "height", String(boxHeight));
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
    for (let line of lines.splice(1)) {
      if (line.trim() === "") {
        continue;
      }
      if (line.startsWith("annotations: ")) {
        line = line.replace("annotations: ", "");
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
}

/**
 * This is a data class that contains your plugin configurations. You can edit it
 * as you wish by adding fields and all the data you need.
 */
interface ObsidianChessSettings extends SVGChessboardOptions {
  whiteSquareColor: string;
  blackSquareColor: string;
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

    containerEl.createEl("h2", { text: "Obsidian Chessboard Settings" });

    new Setting(containerEl)
      .setName("White Square Color")
      .setDesc('Set the color of the "white" squares.')
      .addText((text) =>
        text.setValue(String(settings.whiteSquareColor)).onChange((value) => {
          settings.whiteSquareColor = value;
          this.plugin.refreshMarkdownCodeBlockProcessor();
          this.plugin.saveData(settings);
        })
      );

    new Setting(containerEl)
      .setName("Black Square Color")
      .setDesc('Set the color of the "black" squares.')
      .addText((text) =>
        text.setValue(String(settings.blackSquareColor)).onChange((value) => {
          settings.blackSquareColor = value;
          this.plugin.refreshMarkdownCodeBlockProcessor();
          this.plugin.saveData(settings);
        })
      );
  }
}
