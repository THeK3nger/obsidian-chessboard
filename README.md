# Obsidian Chess Plugin

This plugin adds the capability to visualize Chess [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) positions on a SVG chessboard directly in preview mode.

## How to use it

After you installed the plugin, just write the FEN position representation inside a code block with the `chessboard` language.

### Example

````
```chessboard
r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R
```
````

![Example](example.png)

## How to compile the plugin

First, install the dependencies with

```bash
npm i
```

Then, you can compile the plugin with:

```bash
npm run build
```

This will create a `main.js` file in the project root. That is the entry point of the plugin.

## Planned Features

- [ ] Chessboard color customization.
- [ ] Chessboard annotation and highlights.

## Chess Pieces

The SVG pieces were made by jurgenwesterhof (adapted from work of Cburnett), CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0>, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Chess_Pieces_Sprite.svg).
