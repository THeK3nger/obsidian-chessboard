import { Menu } from "obsidian";
import type { Orientation, SVGChessboard } from "./index";

/** The full game behind a board, for menu actions that need more than the position. */
export interface BoardGame {
  pgn: string;
  ply: number;
}

/** Builds the Lichess analysis URL for a position. */
function lichessPositionUrl(fen: string, orientation: Orientation): string {
  return `https://lichess.org/analysis/${fen.trim().replace(/\s+/g, "_")}?color=${orientation}`;
}

/** Builds the Lichess analysis URL for a whole game, opened at the given ply. */
function lichessGameUrl(pgn: string, orientation: Orientation, ply: number): string {
  return `https://lichess.org/analysis/pgn/${encodeURIComponent(pgn.trim())}?color=${orientation}#${ply}`;
}

/**
 * Attaches the right-click menu to a rendered board. Add new menu entries
 * (e.g. other chess sites) here.
 */
export function attachBoardMenu(
  svg: SVGElement,
  chessboard: SVGChessboard,
  game?: BoardGame,
): void {
  const fen = chessboard.getFEN();
  const orientation = chessboard.getOrientation();

  svg.addEventListener("contextmenu", (e: MouseEvent) => {
    e.preventDefault();
    const menu = new Menu();
    if (game) {
      menu.addItem((item) =>
        item
          .setTitle("Open game on Lichess")
          .setIcon("external-link")
          .onClick(() => window.open(lichessGameUrl(game.pgn, orientation, game.ply))),
      );
    }
    menu.addItem((item) =>
      item
        .setTitle("Open position on Lichess")
        .setIcon("external-link")
        .onClick(() => window.open(lichessPositionUrl(fen, orientation))),
    );
    menu.showAtMouseEvent(e);
  });
}
