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

export class SVGChessboard {
  chessboard: Chessboard;

  private readonly xmlns = "http://www.w3.org/2000/svg";
  private readonly whiteColor = "white";
  private readonly blackColor = "gray";

  private constructor(
    chessboard: Chessboard,
    private readonly squareSize: number
  ) {
    this.chessboard = chessboard;
  }

  draw(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    g.appendChild(this.drawBoard());
    g.appendChild(this.drawPieces());
    return g;
  }

  drawBoard(): SVGElement {
    console.log("Creating Board");
    let g = document.createElementNS(this.xmlns, "g");
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        g.appendChild(this.drawRect([i, j]));
      }
    }
    return g;
  }

  drawPieces(): SVGElement {
    let g = document.createElementNS(this.xmlns, "g");
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.chessboard.get(i, j);
        if (piece === "K") {
          g.appendChild(this.drawPiece([j, i], WHITE_KING));
        }
        if (piece === "Q") {
          g.appendChild(this.drawPiece([j, i], WHITE_QUEEN));
        }
        if (piece === "N") {
          g.appendChild(this.drawPiece([j, i], WHITE_KNIGHT));
        }
        if (piece === "R") {
          g.appendChild(this.drawPiece([j, i], WHITE_ROOK));
        }
        if (piece === "B") {
          g.appendChild(this.drawPiece([j, i], WHITE_BISHOP));
        }
        if (piece === "P") {
          g.appendChild(this.drawPiece([j, i], WHITE_PAWN));
        }
        if (piece === "k") {
          g.appendChild(this.drawPiece([j, i], BLACK_KING));
        }
        if (piece === "q") {
          g.appendChild(this.drawPiece([j, i], BLACK_QUEEN));
        }
        if (piece === "n") {
          g.appendChild(this.drawPiece([j, i], BLACK_KNIGHT));
        }
        if (piece === "r") {
          g.appendChild(this.drawPiece([j, i], BLACK_ROOK));
        }
        if (piece === "b") {
          g.appendChild(this.drawPiece([j, i], BLACK_BISHOP));
        }
        if (piece === "p") {
          g.appendChild(this.drawPiece([j, i], BLACK_PAWN));
        }
      }
    }
    return g;
  }

  drawPiece(coord: BoardCoordinate, piece: string): SVGElement {
    let corner = this.getBoardSVGCord(coord);
    const DELTA = 3;
    let g = document.createElementNS(this.xmlns, "g");
    g.setAttributeNS(
      null,
      "transform",
      `translate(${corner[1] - DELTA},${corner[0] - DELTA})`
    );
    g.innerHTML = piece;
    return g;
  }

  drawRect(coord: BoardCoordinate): SVGRectElement {
    let corner = this.getBoardSVGCord(coord);
    let rect = document.createElementNS(this.xmlns, "rect");
    rect.setAttributeNS(null, "x", String(corner[1]));
    rect.setAttributeNS(null, "y", String(corner[0]));
    rect.setAttributeNS(null, "width", String(this.squareSize));
    rect.setAttributeNS(null, "height", String(this.squareSize));
    rect.setAttributeNS(
      null,
      "fill",
      (coord[1] + coord[0]) % 2 === 0 ? this.whiteColor : this.blackColor
    );
    return rect;
  }

  private getBoardSVGCord(coord: BoardCoordinate): [number, number] {
    return [coord[0] * this.squareSize, coord[1] * this.squareSize];
  }

  static fromFEN(fenString: string, squareSize: number = 40) {
    return new SVGChessboard(Chessboard.fromFEN(fenString), squareSize);
  }
}
