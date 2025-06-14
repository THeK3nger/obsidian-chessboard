import { Arrow } from "./Arrow";
import { Icons } from "./Icons";
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
  recolorWhite,
  recolorBlack,
} from "./Pieces";
import { Annotation } from "src/Annotations";

export interface SVGChessboardOptions {
  orientation: "white" | "black";
  drawCoordinates: boolean;
  blackSquareColor: string;
  whiteSquareColor: string;
  whitePieceColor: string;
  blackPieceColor: string;
  defaultHighlightColor: string;
  defaultArrowColor: string;
}

export class SVGChessboard {
  private chessboard: Chessboard;
  private squareSize: number;
  // Half value of the squareSize. To avoid doing a lot of /2.
  private squareSizeHalf: number;

  private options: SVGChessboardOptions;

  private readonly xmlns = "http://www.w3.org/2000/svg";
  private readonly baseSquareSize = 40;

  private whiteColor = "#f0d9b5";
  private blackColor = "#b58862";
  private whitePieceColor = "#ffffff";
  private blackPieceColor = "#000000";
  private whitePieceLineColor = "#000000";
  private blackPieceLineColor = "#ffffff";
  private defaultHighlightColor = "#b0ffb0";
  private defaultArrowColor = "#ff6060";

  private highlights: Array<[BoardCoordinate, string]> = [];
  private annotations: Annotation[] = [];

  private COLORED_WHITE_PIECES: Record<string, string>;
  private COLORED_BLACK_PIECES: Record<string, string>;

  private constructor(
    chessboard: Chessboard,
    {
      drawCoordinates = true,
      orientation = "white",
      whiteSquareColor = "#f0d9b5",
      blackSquareColor = "#b58862",
      whitePieceColor = "#ffffff",
      blackPieceColor = "#000000",
      defaultHighlightColor = "#b0ffb0",
      defaultArrowColor = "#ff6060",
    }: Partial<SVGChessboardOptions> = {}
  ) {
    this.chessboard = chessboard;
    this.squareSize = this.baseSquareSize;
    this.squareSizeHalf = this.squareSize / 2;
    this.whiteColor = whiteSquareColor;
    this.blackColor = blackSquareColor;
    this.whitePieceColor = whitePieceColor;
    this.blackPieceColor = blackPieceColor;
    this.whitePieceLineColor = blackPieceColor;
    this.blackPieceLineColor = whitePieceColor;
    this.defaultHighlightColor = defaultHighlightColor;
    this.defaultArrowColor = defaultArrowColor;

    const whiteRecolor = (piece: string) =>
      recolorWhite(piece, this.whitePieceColor, this.whitePieceLineColor);
    const blackRecolor = (piece: string) =>
      recolorBlack(piece, this.blackPieceColor, this.blackPieceLineColor);

    this.COLORED_WHITE_PIECES = {
      k: whiteRecolor(WHITE_KING),
      q: whiteRecolor(WHITE_QUEEN),
      n: whiteRecolor(WHITE_KNIGHT),
      r: whiteRecolor(WHITE_ROOK),
      b: whiteRecolor(WHITE_BISHOP),
      p: whiteRecolor(WHITE_PAWN),
    };

    this.COLORED_BLACK_PIECES = {
      k: blackRecolor(BLACK_KING),
      q: blackRecolor(BLACK_QUEEN),
      n: blackRecolor(BLACK_KNIGHT),
      r: blackRecolor(BLACK_ROOK),
      b: blackRecolor(BLACK_BISHOP),
      p: blackRecolor(BLACK_PAWN),
    };

    this.options = {
      orientation,
      drawCoordinates,
      whiteSquareColor,
      blackSquareColor,
      whitePieceColor,
      blackPieceColor,
      defaultHighlightColor,
      defaultArrowColor,
    };
  }

  draw(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    let [annotations, annotations_foreground] = this.drawAnnotations();
    g.appendChild(this.drawBoard());
    if (this.options.drawCoordinates) {
      g.appendChild(this.drawCoordinateSystem());
    }
    g.appendChild(annotations);
    g.appendChild(this.drawPieces());
    g.appendChild(annotations_foreground);
    return g;
  }

  highlight(cell: string, color = this.defaultHighlightColor) {
    const [c, r] = Chessboard.algebraicToCoord(cell);
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

  addIcon(position: string, icon: string) {
    this.annotations.push({
      type: "icon",
      square: position,
      icon: icon,
    });
  }

  highlightCoord(c: number, r: number, color = this.defaultHighlightColor) {
    this.highlights.push([[c, r], color]);
  }

  removeHighlight(cell: string) {
    this.removeHighlightCoord(...Chessboard.algebraicToCoord(cell));
  }

  removeHighlightCoord(c: number, r: number) {
    this.highlights = this.highlights.filter(
      ([coord, _]) => coord[0] !== c || coord[1] !== r
    );
  }

  setOrientation(orientation: "white" | "black") {
    this.options.orientation = orientation;
  }

  /**
   * Creates SVG group containing the chessboard annotations.
   *
   * This returns 2 groups: a background and a foreground one. We need this
   * because some annotations need to be drawn below the pieces while others
   * need to be rendered above the pieces (e.g., the icons).
   */
  private drawAnnotations(): [SVGElement, SVGElement] {
    let g = document.createElementNS(this.xmlns, "g");
    for (let [coord, highlightColor] of this.highlights) {
      const square = this.drawSquare(coord);
      square.setAttributeNS(null, "fill", highlightColor);
      square.style.opacity = "0.8";
      g.appendChild(square);
    }
    let g_foreground = document.createElementNS(this.xmlns, "g");
    for (let annotation of this.annotations) {
      if (annotation.type === "arrow") {
        let start = annotation.start;
        let end = annotation.end;
        let [x0, y0] = this.getBoardSVGCord(Chessboard.algebraicToCoord(start));
        let [x1, y1] = this.getBoardSVGCord(Chessboard.algebraicToCoord(end));
        g.appendChild(
          Arrow.drawArrow(
            x0 + this.squareSizeHalf,
            y0 + this.squareSizeHalf,
            x1 + this.squareSizeHalf,
            y1 + this.squareSizeHalf,
            annotation.color
          )
        );
      } else if (annotation.type === "icon") {
        let pos = Chessboard.algebraicToCoord(annotation.square);
        switch (annotation.icon) {
          case "best":
            g_foreground.appendChild(this.drawIcon(pos, Icons.best));
            break;
          case "blunder":
            g_foreground.appendChild(this.drawIcon(pos, Icons.blunder));
            break;
          case "mistake":
            g_foreground.appendChild(this.drawIcon(pos, Icons.mistake));
            break;
          case "inaccuracy":
            g_foreground.appendChild(this.drawIcon(pos, Icons.inaccuracy));
            break;
          case "incorrect":
            g_foreground.appendChild(this.drawIcon(pos, Icons.incorrect));
            break;
          case "good":
            g_foreground.appendChild(this.drawIcon(pos, Icons.good));
            break;
          case "brilliant":
            g_foreground.appendChild(this.drawIcon(pos, Icons.brilliant));
            break;
          case "excellent":
            g_foreground.appendChild(this.drawIcon(pos, Icons.excellent));
            break;
          case "forced":
            g_foreground.appendChild(this.drawIcon(pos, Icons.forced));
            break;
        }
      }
    }
    return [g, g_foreground];
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

        if (!piece) {
          continue;
        }

        if (piece.color === "w") {
          g.appendChild(
            this.drawPiece([c, r], this.COLORED_WHITE_PIECES[piece.type])
          );
        } else if (piece.color === "b") {
          g.appendChild(
            this.drawPiece([c, r], this.COLORED_BLACK_PIECES[piece.type])
          );
        } else {
          continue;
        }
      }
    }
    return g;
  }

  private drawIcon(coord: BoardCoordinate, icon: HTMLElement): SVGElement {
    let [x, y] = this.getBoardSVGCord(coord);
    let g = document.createElementNS(this.xmlns, "g");

    g.setAttributeNS(null, "transform", `translate(${x},${y}) scale(${0.85})`);
    Array.from(icon.childNodes).forEach((node) => {
      g.appendChild(node.cloneNode(true));
    });
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

  static fromPGN(
    pgnString: string,
    options: Partial<SVGChessboardOptions> = {}
  ) {
    return new SVGChessboard(Chessboard.fromPGN(pgnString), options);
  }
}
