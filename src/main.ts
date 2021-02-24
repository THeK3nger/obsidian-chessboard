import {
  App,
  MarkdownPostProcessor,
  MarkdownPostProcessorContext,
  MarkdownPreviewRenderer,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import { SVGChessboard } from "./svgchess/SVGChessboard";

export default class ObsidianChess extends Plugin {
  // This field stores your plugin settings.
  //setting: MyPluginSettings;

  onInit() {}

  async onload() {
    MarkdownPreviewRenderer.registerPostProcessor(ObsidianChess.postprocessor);

    // This snippet of code is used to load pluging settings from disk (if any)
    // and then add the setting tab in the Obsidian Settings panel.
    // If your plugin does not use settings, you can delete these two lines.
    // this.setting = (await this.loadData()) || {
    //   someConfigData: 1,
    //   anotherConfigData: "defaultValue",
    // };
    //this.addSettingTab(new MyPluginSettingsTab(this.app, this));
  }

  onunload() {
    MarkdownPreviewRenderer.unregisterPostProcessor(
      ObsidianChess.postprocessor
    );
  }

  static postprocessor: MarkdownPostProcessor = (
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
  ) => {
    const blockToReplace = el.querySelector("pre");
    console.log(blockToReplace);
    if (!blockToReplace) return;

    const chessBlock = blockToReplace.querySelector("code.language-chessboard");
    console.log(chessBlock);
    if (!chessBlock) return;

    const source = chessBlock.textContent;

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

    el.replaceChild(block, blockToReplace);
  };
}

/**
 * This is a data class that contains your plugin configurations. You can edit it
 * as you wish by adding fields and all the data you need.
 */
// interface MyPluginSettings {
//   someConfigData: number;
//   anotherConfigData: string;
// }

// class MyPluginSettingsTab extends PluginSettingTab {
//   plugin: MyPlugin;

//   constructor(app: App, plugin: MyPlugin) {
//     super(app, plugin);
//     this.plugin = plugin;
//   }

//   display(): void {
//     const { containerEl } = this;
//     const settings = this.plugin.setting;
//     // This is just an example of a setting controll.
//     new Setting(containerEl)
//       .setName("Setting Name")
//       .setDesc("Setting description")
//       .addText((text) =>
//         text.setValue(String(settings.someConfigData)).onChange((value) => {
//           if (!isNaN(Number(value))) {
//             settings.someConfigData = Number(value);
//             this.plugin.saveData(settings);
//           }
//         })
//       );
//   }
// }
