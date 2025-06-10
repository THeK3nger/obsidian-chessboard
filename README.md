# Obsidian Chess Plugin

This plugin adds the capability to visualize Chess [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) positions on a SVG chessboard directly in preview mode.

By design, this plugin is for visualization only. Do not expect interactivity or the possibility to handle entire games in PGN format. This plugin want to render just a SVG image and it is optimized for visualization and HTML/PDF exports.

If you want a more interactive plugin, I recommend [Chesser](https://github.com/SilentVoid13/Chesser).

## How to use it

After you installed the plugin, just write the FEN position representation inside a code block with the `chessboard` language.

### Example

For example, something like this

````
```chessboard
fen: r2qrbk1/1bp2pp1/p2p1n1p/1p6/Pn1PP3/5N1P/1P1N1PP1/RBBQR1K1 b - - 2 17
annotations: Hf5 He5 Hd5 Ae1-e8/g Ab1-h7/g Ad4-d5
annotations: Hf6/g
```
````

will be rendered as in the following picture:

<img src="https://github.com/user-attachments/assets/642788cd-796a-4298-b85b-d82576254246" width="500px" />

### Change Board Orientation

Use the `orientation` command. It can be `white` (default) or `black`.

````
```chessboard
fen: r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R
orientation: black
```
````

## Annotations (Beta)

You can annotate your schema with arrows, highlights and icons:

````
```chessboard
fen: r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R
annotations: Af8-b4 Hf8 Ha7/g !!f8 ??a7 ?e4 Fe8 !?d8
orientation: white
```
````

<img src="https://github.com/user-attachments/assets/2b2c1672-1423-4a34-9826-d5fccc66860f" width="500px" />

### Annotation Syntax

The annotations are written in the `annotations` field, and you can use the following syntax: 

- `A<square>-<square>`, draws an arrow from the first square to the second square. E.g., `Af8-b4`.
- `H<square>`, highlight a specific square. E.g., `Hf8`. If you add `/g` or `/r` or `/b` you can highlight the square in green, red or blue.
- `!!<square>`, adds a "brilliant move" icon to the specified square. E.g., `!!e5`.
- `??<square>`, adds a "blunder" icon to the specified square. E.g., `??e5`.
- `?<square>`, adds a "questionable move" icon to the specified square. E.g., `?e5`.
- `!<square>`, adds a "excellent move" icon to the specified square. E.g., `!e5`.
- `!?<square>`, adds a "okay move" icon to the specified square. E.g., `!?e5`.
- `F<square>`, adds a "forced move" icon to the specified square. E.g., `Fe5`.

Not that the annotation syntax is is beta and may change in the future. If you have suggestions, don't hesitate to open an issue.

## Experimental: PGN

It is also possible to render games written in PGN. This is done by using the `chessboard-pgn` code block.

````
```chessboard-pgn
[Event "Casual Game"]
[Site "Berlin GER"]
[Date "1852.??.??"]
[EventDate "?"]
[Round "?"]
[Result "1-0"]
[White "Adolf Anderssen"]
[Black "Jean Dufresne"]
[ECO "C52"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "47"]

1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O
d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4
Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 17.Nf6+ gxf6 18.exf6
Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8
23.Bd7+ Kf8 24.Bxe7# 1-0
```
````

This supports the full PGN specification but, for now, the feature is experimental and has limitations:

1. The plugin will render the board as it appears after the last move. There is no way to select the move (for now).
2. At the moment, this mode do not support annotations.

I am planning a way to use PGN to navigate the game, showing multiple board positions in a grid, and things like that.

### Syntax

- `A<square>-<square>`, draws an arrow from the first square to the second square. E.g., `Af8-b4`.
- `H<square>`, highlight a specific square. E.g., `Hf8`.

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

- [x] Chessboard color customization.
- [x] Pieces color customization.
- [x] Chessboard annotation and highlights.
- [ ] Custom annotation shapes.

## Chess Pieces

The SVG pieces were made by jurgenwesterhof (adapted from work of Cburnett), CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0>, via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Chess_Pieces_Sprite.svg).
