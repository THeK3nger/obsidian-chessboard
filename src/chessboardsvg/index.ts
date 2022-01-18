import { Arrow } from "./Arrow";
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
  orientation: "white" | "black";
  drawCoordinates: boolean;
  blackSquareColor: string;
  whiteSquareColor: string;
  defaultHighlightColor: string;
  defaultArrowColor: string;
}

type Annotation = ArrowAnnotation;

export interface ArrowAnnotation {
  type: "arrow";
  start: string;
  end: string;
  color: string;
}

export class SVGChessboard {
  private chessboard: Chessboard;
  private squareSize: number;
  // Half value od the squareSize. To avoid doing a lot of /2.
  private squareSizeHalf: number;

  private options: SVGChessboardOptions;

  private readonly xmlns = "http://www.w3.org/2000/svg";
  private readonly baseSquareSize = 40;

  private whiteColor = "#f0d9b5";
  private blackColor = "#b58862";
  private defaultHighlightColor = "#b0ffb0";
  private defaultArrowColor = "#ff6060";

  private highlights: Array<[BoardCoordinate, string]> = [];
  private annotations: Annotation[] = [];

  private constructor(
    chessboard: Chessboard,
    {
      drawCoordinates = true,
      orientation = "white",
      whiteSquareColor = "#f0d9b5",
      blackSquareColor = "#b58862",
      defaultHighlightColor = "#b0ffb0",
      defaultArrowColor = "#ff6060",
    }: Partial<SVGChessboardOptions> = {}
  ) {
    this.chessboard = chessboard;
    this.squareSize = this.baseSquareSize;
    this.squareSizeHalf = this.squareSize / 2;
    this.whiteColor = whiteSquareColor;
    this.blackColor = blackSquareColor;
    this.defaultHighlightColor = defaultHighlightColor;
    this.defaultArrowColor = defaultArrowColor;

    this.options = {
      orientation,
      drawCoordinates,
      whiteSquareColor,
      blackSquareColor,
      defaultHighlightColor,
      defaultArrowColor,
    };
  }

  draw(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    g.appendChild(this.drawBoard());
    if (this.options.drawCoordinates) {
      g.appendChild(this.drawCoordinateSystem());
    }
    g.appendChild(this.drawAnnotations());
    g.appendChild(this.drawPieces());
    return g;
  }

  highlight(cell: string, color = this.defaultHighlightColor) {
    const [c, r] = this.chessboard.algebraicToCoord(cell);
    this.highlightCoord(c, r, color);
  }

  addArrow(startCell: string, endCell: string, color = this.defaultArrowColor) {
    this.annotations.push({
      type: "arrow",
      start: startCell,
      end: endCell,
      color: color,
    });
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

  setOrientation(orientation: "white" | "black") {
    this.options.orientation = orientation;
  }

  private drawAnnotations(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    for (let [coord, highlightColor] of this.highlights) {
      const square = this.drawSquare(coord);
      square.setAttributeNS(null, "fill", highlightColor);
      square.style.opacity = "0.8";
      g.appendChild(square);
    }
    for (let annotation of this.annotations) {
      if (annotation.type === "arrow") {
        let start = annotation.start;
        let end = annotation.end;
        let [x0, y0] = this.getBoardSVGCord(
          this.chessboard.algebraicToCoord(start)
        );
        let [x1, y1] = this.getBoardSVGCord(
          this.chessboard.algebraicToCoord(end)
        );
        g.appendChild(
          Arrow.drawArrow(
            x0 + this.squareSizeHalf,
            y0 + this.squareSizeHalf,
            x1 + this.squareSizeHalf,
            y1 + this.squareSizeHalf,
            annotation.color
          )
        );
      }
    }
    return g;
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
    g.setAttributeNS(null, "transform", `translate(${x},${y}) scale(${0.85})`);
    g.innerHTML = piece;
    return g;
  }

  private drawSquare(coord: BoardCoordinate): SVGRectElement {
    let [x, y] = this.getBoardSVGCord(coord);
    let rect = document.createElementNS(this.xmlns, "rect");
    rect.setAttributeNS(null, "x", String(x));
    rect.setAttributeNS(null, "y", String(y));
    rect.setAttributeNS(null, "width", String(this.squareSize));
    rect.setAttributeNS(null, "height", String(this.squareSize));
    rect.setAttributeNS(
      null,
      "fill",
      (coord[1] + coord[0]) % 2 === 0 ? this.whiteColor : this.blackColor
    );
    return rect;
  }

  drawCoordinateSystem(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (
          (c === 0 && this.options.orientation === "white") ||
          (c === 7 && this.options.orientation === "black")
        ) {
          g.appendChild(this.drawText([c, r], String(8 - r), "row"));
        }
        if (
          (r === 7 && this.options.orientation === "white") ||
          (r === 0 && this.options.orientation === "black")
        ) {
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
      txt.setAttributeNS(null, "x", String(x + 1));
      txt.setAttributeNS(null, "y", String(y + 10));
    } else {
      txt.setAttributeNS(null, "x", String(x + this.squareSize - 7));
      txt.setAttributeNS(null, "y", String(y + this.squareSize - 2));
    }
    txt.setAttributeNS(null, "font-family", "sans-serif");
    txt.setAttributeNS(null, "font-size", String(10));
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
    if (this.options.orientation == "white") {
      return [c * this.squareSize, r * this.squareSize];
    }
    return [(7 - c) * this.squareSize, (7 - r) * this.squareSize];
  }

  static fromFEN(
    fenString: string,
    options: Partial<SVGChessboardOptions> = {}
  ) {
    return new SVGChessboard(Chessboard.fromFEN(fenString), options);
  }
}
