import { Chess, Square, Piece, Move } from "chess.js";

/**
 * Chessboard coordinate in (column, row) format.
 *
 * The 0,0 coordinate is the topmost left square.
 */
export type BoardCoordinate = [number, number];

/**
 * The Chessboard class is a thin façade around the chess.js library. This is
 * too keep most of the compatibility with the old Chessboard class, but to take
 * advance of a more solid Chessboard library that include built-in FEN
 * validation, PGN support, history and cooler features that we can use in the
 * visualization.
 */
export class Chessboard {
  private chessboard: Chess;
  private lastMovePlayed?: Move;

  private constructor() {
    this.chessboard = new Chess();
  }

  set(c: number, r: number, piece: Piece) {
    this.chessboard.put(piece, Chessboard.coordToAlgebraic([c, r]));
  }

  get(c: number, r: number): Piece {
    return this.chessboard.get(Chessboard.coordToAlgebraic([c, r]));
  }

  setAlgebraic(algebraic: Square, piece: Piece): boolean {
    return this.chessboard.put(piece, algebraic);
  }

  getAlgebraic(algebraic: Square): Piece {
    return this.chessboard.get(algebraic);
  }

  print() {
    console.log(this.chessboard.ascii());
  }

  getLastMove(): Move | undefined {
    return this.lastMovePlayed;
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

    // Check if FEN includes at least the moving color. If not, append ' w' to the string.
    // This is to ensure compatibility with our less-strict format.
    if (!fenString.trim().includes(" ")) {
      fenString += " w";
    }

    if (skipValidation) {
      // Parse FEN manually without chess.js validation.
      // This allows non-standard positions (chess variants, puzzles, etc.)
      chessboard.chessboard.clear();
      const piecePlacement = fenString.split(" ")[0];
      let r = 0;
      for (const row of piecePlacement.split("/")) {
        let c = 0;
        for (const char of row) {
          const numToken = parseInt(char, 10);
          if (!isNaN(numToken)) {
            c += numToken;
            continue;
          }
          const color = char === char.toUpperCase() ? "w" : "b";
          const type = char.toLowerCase() as "k" | "q" | "r" | "b" | "n" | "p";
          chessboard.chessboard.put({ type, color }, Chessboard.coordToAlgebraic([c, r]));
          c++;
        }
        r++;
      }
    } else {
      chessboard.chessboard.load(fenString);
    }

    return chessboard;
  }

  static fromPGN(pgnString: string, ply?: number): Chessboard {
    const chessboard = new Chessboard();
    chessboard.chessboard.loadPgn(pgnString);

    // If ply is specified, replay moves up to that ply
    if (ply !== undefined) {
      // Get detailed move history with verbose: true
      const history = chessboard.chessboard.history({ verbose: true });
      const headers = chessboard.chessboard.header();
      if (headers.SetUp === "1" && headers.FEN) {
        chessboard.chessboard.load(headers.FEN);
      } else {
        chessboard.chessboard.reset();
      }

      // If ply is 0, show starting position (already reset)
      if (ply === 0) {
        return chessboard;
      }

      // Replay moves up to the specified ply (or all moves if ply exceeds history length)
      const movesToReplay = Math.min(ply, history.length);
      for (let i = 0; i < movesToReplay; i++) {
        chessboard.chessboard.move(history[i].san);
        // Store the last move that was played
        if (i === movesToReplay - 1) {
          chessboard.lastMovePlayed = history[i];
        }
      }
    }

    return chessboard;
  }
}
