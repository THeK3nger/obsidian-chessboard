# Changelog

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
