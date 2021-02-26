const example = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export type ChessPiece =
  | "r"
  | "n"
  | "b"
  | "q"
  | "k"
  | "p"
  | "R"
  | "N"
  | "B"
  | "Q"
  | "K"
  | "P"
  | "_";

/**
 * Chessboard coordinate in (column, row) format.
 *
 * The 0,0 coordinate is the topmost left square.
 */
export type BoardCoordinate = [number, number];

export class Chessboard {
  private chessboard: ChessPiece[];
  private BOARD_SIZE = 8;
  private constructor() {
    this.chessboard = new Array(this.BOARD_SIZE * this.BOARD_SIZE).fill("_");
  }

  set(c: number, r: number, value: ChessPiece) {
    this.chessboard[r * this.BOARD_SIZE + c] = value;
  }

  get(c: number, r: number): ChessPiece {
    return this.chessboard[r * this.BOARD_SIZE + c];
  }

  setAlgebraic(algebraic: string, value: ChessPiece) {
    const [c, r] = this.algebraicToCoord(algebraic);
    this.set(c, r, value);
  }

  getAlgebraic(algebraic: string): ChessPiece {
    const [c, r] = this.algebraicToCoord(algebraic);
    return this.get(c, r);
  }

  algebraicToCoord(algebraic: string): BoardCoordinate {
    if (this.BOARD_SIZE !== 8) {
      throw Error(
        "Algebraic notation currently supported only for 8x8 chessboards."
      );
    }
    algebraic = algebraic.toLowerCase();
    if (algebraic.length !== 2) {
      throw Error("Input does not look algebraic notation.");
    }
    let columnMap: { [x: string]: number } = {
      a: 0,
      b: 1,
      c: 2,
      d: 3,
      e: 4,
      f: 5,
      g: 6,
      h: 7,
      i: 8,
    };
    let columnA = algebraic[0];
    let rowA = algebraic[1];
    return [columnMap[columnA], 8 - parseInt(rowA)];
  }

  print() {
    let chessString = "";
    this.chessboard.forEach((p, i) => {
      if (p === "_") {
        chessString += ".";
      } else {
        chessString += p;
      }
      if ((i + 1) % this.BOARD_SIZE === 0) {
        chessString += "\n";
      }
    });
    console.log(chessString);
  }

  static fromFEN(fenString: string): Chessboard {
    try {
      let [
        board,
        activePlayer,
        castling,
        enPassant,
        halfMoveClock,
        fullMoveClock,
      ] = fenString.split(" ");

      const chessboard = new Chessboard();

      let r = 0;
      for (const row of board.split("/")) {
        const parsed = Chessboard.parseFENBoardLine(row);
        for (let c = 0; c < chessboard.BOARD_SIZE; c++) {
          chessboard.set(c, r, parsed[c]);
        }
        r += 1;
      }
      return chessboard;
    } catch {
      throw Error("Invalid FEN String.");
    }
  }

  private static parseFENBoardLine(line: string): ChessPiece[] {
    let i = 0;
    let j = 0;
    let result = new Array(8).fill("_");
    while (i < line.length) {
      const token = line[i];
      const numToken = parseInt(token, 10);
      if (!isNaN(numToken)) {
        j += numToken;
        i++;
        continue;
      }
      result[j] = token;
      i++;
      j++;
    }
    return result;
  }
}
