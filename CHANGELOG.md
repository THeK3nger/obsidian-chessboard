# Changelog

## Unreleased

## v0.11.0

### New

- ⭐ In PGN mode, it is now possible to specify which move to display by adding the `ply` field. You can also specify how to highlight the move with the `show-move` field. See the README for more details.

### Fix

- Now the pieces are properly centered in each square.

## v0.10.0

## New

- ⭐ Added support for annotation icons. Now you can specify annotations such as `!!e2` to add a "brilliant move" icon to `e2`. Look at the README for all the supported icons.

## v0.9.0

### New

- ⭐ I moved most of the chessboard internal representation to the external library `chess.js`. The drawback is that now the plugin is 4 times bigger (from ~60Kb to ~250Kb). However, we now have a much more robust FEN validation and chessboard representation. Moreover, this will make way easier to implement more features in the future. I think it is worth the increased size.
- ⭐ The first feature enabled by this migration: PGN support. Now you can render positions via the PGN format. The feature is still very **experimental** and has several limitations.

### Fix

- Changing colors in the settings now refresh the rendering in preview mode (not in edit mode, unfortunately).

## v0.8.0

### New

- Now, if you write an invalid FEN string, you'll get a red error message in the preview explaining what's wrong. That's way better than before: the plugin just didn't render anything. Improvements!

## v0.7.0

### New

- Added the possibility to configure the color for the set pieces.
- I finally added the actual color picker UI for color picking. No more typing hex codes!

## v0.6.1

### Fixed

- Fix the parsing of colors in annotations (thanks to [@SimoneRota83](https://github.com/SimoneRota83))

## v0.6.0

### New

- Added the possibility to set annotation color (thanks to [@DekuD2](https://github.com/DekuD2))
- Added a setting to set the board size in pixels (thanks to [@advait](https://github.com/advait))

## v0.3.0

### New

I added the possibility to annotate the chessboard with arrows and and square highlighting. This feature is still in alpha but works in this way:

````
```chessboard
fen: r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R
annotations: Af8-b4 Hf8
```
````

You add an `annotations` field and you write the annotations. The format is explained in the README.

Ah, did you note that the FEN string now starts with `fen:`? This is optional but it ensure compatibility with the other chess plugin for Obsidian: Chesser.
