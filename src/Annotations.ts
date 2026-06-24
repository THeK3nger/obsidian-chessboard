/**
 * Represents a highlight annotation on the board.
 *
 * It is defined by the square to highlight (in algebraic notation) and the color to use.
 */
export interface Highlight {
  type: "highlight";
  square: string;
  color: string;
}

/**
 * Represents an arrow annotation on the board.
 *
 * It is defined by the start and end squares of the arrow (in algebraic notation) and the color to use.
 */
export interface ArrowAnnotation {
  type: "arrow";
  start: string;
  end: string;
  color: string;
}

/**
 * Represents an icon annotation on the board.
 *
 * It is defined by the square to place the icon (in algebraic notation) and the icon to use.
 */
export interface IconAnnotation {
  type: "icon";
  square: string;
  icon: string;
}

/**
 * Represents a shape annotation on the board.
 *
 * It is defined by the square to draw the shape (in algebraic notation),
 * the shape type (circle, square, squircle), and the color to use.
 */
export interface ShapeAnnotation {
  type: "shape";
  square: string;
  shape: "circle" | "square" | "squircle";
  color: string;
}

export type Annotation = Highlight | ArrowAnnotation | IconAnnotation | ShapeAnnotation;

export interface ParsedChessCode {
  fen: string;
  annotations: Array<Annotation>;
  orientation: "white" | "black";
  strict: boolean;
}

/**
 * Parses a code block containing the FEN board position and the annotations
 * and returns an object with the parsed data.
 *
 * @param input The input string of the FEN code block.
 * @returns An object with the parsed data.
 */
const ICON_MAPPING: Record<string, string> = {
  "!!": "brilliant",
  "!?": "good",
  "??": "blunder",
  "?": "mistake",
  "!": "excellent",
  "F": "forced",
  "#W": "checkmate_white",
  "#B": "checkmate_black",
};

export const ANNOTATION_COLORS = {
  red: "#e67768",
  yellow: "#f1ad24",
  green: "#b3ce6e",
  blue: "#6ab5d6",
} as const;

export const HIGHLIGHT_DEFAULT = ANNOTATION_COLORS.red;
export const ARROW_DEFAULT = ANNOTATION_COLORS.yellow;
export const SHAPE_DEFAULT = ANNOTATION_COLORS.yellow;

export function parseAnnotationLine(line: string): Array<Annotation> {
  const annotations: Array<Annotation> = [];
  const tokens = line.split(" ");
  for (const annotation of tokens) {
    if (annotation.startsWith("H")) {
      let color: string = HIGHLIGHT_DEFAULT;
      if (annotation.endsWith("/y")) {
        color = ANNOTATION_COLORS.yellow;
      } else if (annotation.endsWith("/g")) {
        color = ANNOTATION_COLORS.green;
      } else if (annotation.endsWith("/b")) {
        color = ANNOTATION_COLORS.blue;
      }
      annotations.push({ type: "highlight", square: annotation.substring(1, 3), color });
      continue;
    }
    if (annotation.startsWith("A")) {
      let color: string = ARROW_DEFAULT;
      if (annotation.endsWith("/r")) {
        color = ANNOTATION_COLORS.red;
      } else if (annotation.endsWith("/g")) {
        color = ANNOTATION_COLORS.green;
      } else if (annotation.endsWith("/b")) {
        color = ANNOTATION_COLORS.blue;
      }
      const [start, end] = annotation.substring(1, 6).split("-");
      annotations.push({ type: "arrow", start, end, color });
      continue;
    }
    if (annotation.startsWith("F")) {
      annotations.push({ type: "icon", square: annotation.substring(1, 3), icon: ICON_MAPPING["F"] });
      continue;
    }
    if (annotation.startsWith("#W")) {
      annotations.push({ type: "icon", square: annotation.substring(2, 4), icon: ICON_MAPPING["#W"] });
      continue;
    }
    if (annotation.startsWith("#B")) {
      annotations.push({ type: "icon", square: annotation.substring(2, 4), icon: ICON_MAPPING["#B"] });
      continue;
    }
    if (annotation.startsWith("!?")) {
      annotations.push({ type: "icon", square: annotation.substring(2, 4), icon: ICON_MAPPING["!?"] });
      continue;
    }
    if (annotation.startsWith("!!")) {
      annotations.push({ type: "icon", square: annotation.substring(2, 4), icon: ICON_MAPPING["!!"] });
      continue;
    }
    if (annotation.startsWith("!")) {
      annotations.push({ type: "icon", square: annotation.substring(1, 3), icon: ICON_MAPPING["!"] });
      continue;
    }
    if (annotation.startsWith("??")) {
      annotations.push({ type: "icon", square: annotation.substring(2, 4), icon: ICON_MAPPING["??"] });
      continue;
    }
    if (annotation.startsWith("?")) {
      annotations.push({ type: "icon", square: annotation.substring(1, 3), icon: ICON_MAPPING["?"] });
      continue;
    }
    if (annotation.startsWith("C") || annotation.startsWith("S") || annotation.startsWith("Q")) {
      let color: string = SHAPE_DEFAULT;
      let shapeType: "circle" | "square" | "squircle";
      if (annotation.startsWith("C")) {
        shapeType = "circle";
      } else if (annotation.startsWith("S")) {
        shapeType = "square";
      } else {
        shapeType = "squircle";
      }
      if (annotation.endsWith("/r")) {
        color = ANNOTATION_COLORS.red;
      } else if (annotation.endsWith("/g")) {
        color = ANNOTATION_COLORS.green;
      } else if (annotation.endsWith("/b")) {
        color = ANNOTATION_COLORS.blue;
      } else if (annotation.endsWith("/y")) {
        color = ANNOTATION_COLORS.yellow;
      }
      annotations.push({ type: "shape", square: annotation.substring(1, 3), shape: shapeType, color });
      continue;
    }
  }
  return annotations;
}

export function parseCodeBlock(input: string): ParsedChessCode {
  const lines = input.split(/\r?\n/);
  let fen = lines[0];
  if (fen.startsWith("fen: ")) {
    fen = fen.replace("fen: ", "");
  }
  const annotations: Array<Annotation> = [];
  let orientation: "white" | "black" = "white";
  let strict = true;
  for (let line of lines.splice(1)) {
    if (line.trim() === "") {
      continue;
    }
    if (line.startsWith("strict: ")) {
      const value = line.replace("strict: ", "").trim().toLowerCase();
      strict = value !== "false";
    }
    if (line.startsWith("orientation: ")) {
      line = line.replace("orientation: ", "");
      line = line.trim();
      if (line !== "white" && line !== "black") {
        throw Error(`Unknown orientation ${orientation}`);
      }
      orientation = line;
    }
    if (line.startsWith("annotations: ")) {
      const tokenLine = line.replace("annotations: ", "");
      annotations.push(...parseAnnotationLine(tokenLine));
    }
  }
  return { fen, annotations, orientation, strict };
}
