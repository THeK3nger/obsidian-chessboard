# Changelog

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
