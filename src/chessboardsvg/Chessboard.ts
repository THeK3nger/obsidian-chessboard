import { Chess, Square, Piece, Move } from "chess.js";

/** Zero-based `[col, row]` board index where `[0, 0]` is `a8`. */
export type BoardCoordinate = [number, number];

/** Loads a PGN into `chess`, normalizing parser failures to `"Invalid PGN: ..."` for UI display. */
export function loadPgnOrThrow(chess: Chess, pgnString: string): void {
  try {
    chess.loadPgn(pgnString);
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid PGN: ${reason}`, { cause: e });
  }
}

/** Thin wrapper around `chess.js` with `[col, row]` lookup and ply-sliced PGN loading. */
export class Chessboard {
  private chessboard: Chess;
  private lastMovePlayed?: Move;

  private constructor() {
    this.chessboard = new Chess();
  }

  set(c: number, r: number, piece: Piece) {
    this.chessboard.put(piece, Chessboard.coordToAlgebraic([c, r]));
  }

  get(c: number, r: number): Piece | undefined {
    return this.chessboard.get(Chessboard.coordToAlgebraic([c, r]));
  }

  setAlgebraic(algebraic: Square, piece: Piece): boolean {
    return this.chessboard.put(piece, algebraic);
  }

  getLastMove(): Move | undefined {
    return this.lastMovePlayed;
  }

  getTurn(): "w" | "b" {
    return this.chessboard.turn();
  }

  getFEN(): string {
    return this.chessboard.fen();
  }

  static algebraicToCoord(algebraic: string): BoardCoordinate {
    algebraic = algebraic.toLowerCase();
    if (algebraic.length !== 2) {
      throw Error("Input does not look algebraic notation.");
    }
    const column = algebraic.charCodeAt(0) - "a".charCodeAt(0);
    const row = 8 - parseInt(algebraic[1]);
    return [column, row];
  }

  static coordToAlgebraic(coord: BoardCoordinate): Square {
    const [c, r] = coord;
    if (c < 0 || c > 7 || r < 0 || r > 7) {
      throw Error("Input does not look like a chessboard coordinate.");
    }
    return (String.fromCharCode(c + "a".charCodeAt(0)) + (8 - r)) as Square;
  }

  static fromFEN(fenString: string, skipValidation = false): Chessboard {
    const chessboard = new Chessboard();

    // Default to White to move when given piece placement only.
    if (!fenString.trim().includes(" ")) {
      fenString += " w";
    }

    chessboard.chessboard.load(fenString, { skipValidation });

    return chessboard;
  }

  static fromPGN(pgnString: string, ply?: number): Chessboard {
    const chessboard = new Chessboard();
    loadPgnOrThrow(chessboard.chessboard, pgnString);

    // loadPgn leaves the board at the end of the game; reset and replay up to ply.
    if (ply !== undefined) {
      const history = chessboard.chessboard.history({ verbose: true });
      const headers = chessboard.chessboard.getHeaders();
      if (headers.SetUp === "1" && headers.FEN) {
        chessboard.chessboard.load(headers.FEN);
      } else {
        chessboard.chessboard.reset();
      }

      if (ply === 0) {
        return chessboard;
      }

      const movesToReplay = Math.min(ply, history.length);
      for (let i = 0; i < movesToReplay; i++) {
        chessboard.chessboard.move(history[i].san);
        if (i === movesToReplay - 1) {
          chessboard.lastMovePlayed = history[i];
        }
      }
    }

    return chessboard;
  }
}
