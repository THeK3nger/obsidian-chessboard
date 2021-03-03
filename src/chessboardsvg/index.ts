import { BoardCoordinate, Chessboard } from "./Chessboard";
import {
  WHITE_KING,
  WHITE_QUEEN,
  WHITE_KNIGHT,
  WHITE_ROOK,
  WHITE_BISHOP,
  WHITE_PAWN,
  BLACK_KING,
  BLACK_QUEEN,
  BLACK_KNIGHT,
  BLACK_ROOK,
  BLACK_BISHOP,
  BLACK_PAWN,
} from "./Pieces";

export interface SVGChessboardOptions {
  drawCoordinates: boolean;
  scale: number;
}

export class SVGChessboard {
  private chessboard: Chessboard;
  private squareSize: number;
  private scale: number;

  private options: SVGChessboardOptions;

  private readonly xmlns = "http://www.w3.org/2000/svg";
  private readonly whiteColor = "white";
  private readonly blackColor = "gray";
  private readonly defaultHighlightColor = "green";
  private readonly baseSquareSize = 40;

  private highlights: Array<[BoardCoordinate, string]> = [];

  private constructor(
    chessboard: Chessboard,
    { drawCoordinates = true, scale = 1 }: Partial<SVGChessboardOptions>
  ) {
    this.chessboard = chessboard;
    this.scale = scale;
    this.squareSize = this.baseSquareSize * scale;
    this.options = { drawCoordinates, scale };
  }

  draw(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    g.appendChild(this.drawBoard());
    if (this.options.drawCoordinates) {
      g.appendChild(this.drawCoordinateSystem());
    }
    g.appendChild(this.drawPieces());
    return g;
  }

  highlight(cell: string, color = this.defaultHighlightColor) {
    const [c, r] = this.chessboard.algebraicToCoord(cell);
    this.highlightCoord(c, r, color);
  }

  highlightCoord(c: number, r: number, color = this.defaultHighlightColor) {
    this.highlights.push([[c, r], color]);
  }

  removeHighlight(cell: string) {
    this.removeHighlightCoord(...this.chessboard.algebraicToCoord(cell));
  }

  removeHighlightCoord(c: number, r: number) {
    this.highlights = this.highlights.filter(([coord, _]) => {
      coord !== [c, r];
    });
  }

  private getHighlightedColor(c: number, r: number): string | undefined {
    const highlightItem = this.highlights.find((hi) => {
      const [x, y] = hi[0];
      return x === c && y === r;
    });
    return highlightItem?.[1];
  }

  private drawBoard(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        g.appendChild(this.drawSquare([c, r]));
      }
    }
    return g;
  }

  private drawPieces(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.chessboard.get(c, r);
        if (piece === "K") {
          g.appendChild(this.drawPiece([c, r], WHITE_KING));
        }
        if (piece === "Q") {
          g.appendChild(this.drawPiece([c, r], WHITE_QUEEN));
        }
        if (piece === "N") {
          g.appendChild(this.drawPiece([c, r], WHITE_KNIGHT));
        }
        if (piece === "R") {
          g.appendChild(this.drawPiece([c, r], WHITE_ROOK));
        }
        if (piece === "B") {
          g.appendChild(this.drawPiece([c, r], WHITE_BISHOP));
        }
        if (piece === "P") {
          g.appendChild(this.drawPiece([c, r], WHITE_PAWN));
        }
        if (piece === "k") {
          g.appendChild(this.drawPiece([c, r], BLACK_KING));
        }
        if (piece === "q") {
          g.appendChild(this.drawPiece([c, r], BLACK_QUEEN));
        }
        if (piece === "n") {
          g.appendChild(this.drawPiece([c, r], BLACK_KNIGHT));
        }
        if (piece === "r") {
          g.appendChild(this.drawPiece([c, r], BLACK_ROOK));
        }
        if (piece === "b") {
          g.appendChild(this.drawPiece([c, r], BLACK_BISHOP));
        }
        if (piece === "p") {
          g.appendChild(this.drawPiece([c, r], BLACK_PAWN));
        }
      }
    }
    return g;
  }

  private drawPiece(coord: BoardCoordinate, piece: string): SVGElement {
    let [x, y] = this.getBoardSVGCord(coord);
    //const DELTA = 0 * this.scale;
    let g = document.createElementNS(this.xmlns, "g");
    g.setAttributeNS(
      null,
      "transform",
      `translate(${x},${y}) scale(${0.85 * this.scale})`
    );
    g.innerHTML = piece;
    return g;
  }

  private drawSquare(coord: BoardCoordinate, text?: string): SVGRectElement {
    let [x, y] = this.getBoardSVGCord(coord);
    let rect = document.createElementNS(this.xmlns, "rect");
    rect.setAttributeNS(null, "x", String(x));
    rect.setAttributeNS(null, "y", String(y));
    rect.setAttributeNS(null, "width", String(this.squareSize));
    rect.setAttributeNS(null, "height", String(this.squareSize));
    const highlightColor = this.getHighlightedColor(...coord);
    if (highlightColor) {
      rect.setAttributeNS(null, "fill", highlightColor);
    } else {
      rect.setAttributeNS(
        null,
        "fill",
        (coord[1] + coord[0]) % 2 === 0 ? this.whiteColor : this.blackColor
      );
    }
    if (text) {
    }
    return rect;
  }

  drawCoordinateSystem(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (c === 0) {
          g.appendChild(this.drawText([c, r], String(8 - r), "row"));
        }
        if (r === 7) {
          g.appendChild(
            this.drawText([c, r], String(this.numToLetter(c)), "column")
          );
        }
      }
    }
    return g;
  }

  private drawText(
    [c, r]: BoardCoordinate,
    text: string,
    position: "row" | "column"
  ): SVGElement {
    let [x, y] = this.getBoardSVGCord([c, r]);
    let txt = document.createElementNS(this.xmlns, "text");
    if (position === "row") {
      txt.setAttributeNS(null, "x", String(x + this.scale * 1));
      txt.setAttributeNS(null, "y", String(y + this.scale * 10));
    } else {
      txt.setAttributeNS(
        null,
        "x",
        String(x + this.squareSize - this.scale * 7)
      );
      txt.setAttributeNS(
        null,
        "y",
        String(y + this.squareSize - this.scale * 2)
      );
    }
    txt.setAttributeNS(null, "font-family", "sans-serif");
    txt.setAttributeNS(null, "font-size", String(this.scale * 10));
    txt.setAttributeNS(
      null,
      "fill",
      (r + c) % 2 === 0 ? this.blackColor : this.whiteColor
    );
    txt.textContent = text;
    return txt;
  }

  private numToLetter(num: number): string {
    return String.fromCharCode(97 + num);
  }

  private getBoardSVGCord([c, r]: BoardCoordinate): [number, number] {
    return [c * this.squareSize, r * this.squareSize];
  }

  static fromFEN(fenString: string, options: Partial<SVGChessboardOptions>) {
    return new SVGChessboard(Chessboard.fromFEN(fenString), options);
  }
}
