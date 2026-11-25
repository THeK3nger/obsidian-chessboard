import type { Orientation } from "./chessboardsvg/index";

/** Symbolic color slot (`/r`, `/y`, `/g`, `/b`), resolved to a CSS color at render time. */
export type AnnotationColorName = "red" | "yellow" | "green" | "blue";

export interface Highlight {
  type: "highlight";
  square: string;
  color: AnnotationColorName;
}

export interface ArrowAnnotation {
  type: "arrow";
  start: string;
  end: string;
  color: AnnotationColorName;
}

export interface IconAnnotation {
  type: "icon";
  square: string;
  icon: string;
}

export interface ShapeAnnotation {
  type: "shape";
  square: string;
  shape: "circle" | "square" | "squircle";
  color: AnnotationColorName;
}

export type Annotation =
  | Highlight
  | ArrowAnnotation
  | IconAnnotation
  | ShapeAnnotation;

export interface ParsedChessCode {
  fen: string;
  annotations: Array<Annotation>;
  orientation: Orientation;
  strict: boolean;
}

const HIGHLIGHT_DEFAULT: AnnotationColorName = "red";
const ARROW_DEFAULT: AnnotationColorName = "yellow";
const SHAPE_DEFAULT: AnnotationColorName = "yellow";

const ICON_MAPPING: Record<string, string> = {
  "!!": "brilliant",
  "!?": "good",
  "??": "blunder",
  "?": "mistake",
  "!": "excellent",
  F: "forced",
  "#W": "checkmate_white",
  "#B": "checkmate_black",
};

// Two-character prefixes must precede "!" and "?" so the longer token matches first.
const ICON_PREFIXES = ["#W", "#B", "!?", "!!", "??", "F", "!", "?"];

const SHAPE_PREFIX_MAP: Record<string, "circle" | "square" | "squircle"> = {
  C: "circle",
  S: "square",
  Q: "squircle",
};

function resolveColorName(
  token: string,
  defaultColor: AnnotationColorName,
): AnnotationColorName {
  if (token.endsWith("/r")) return "red";
  if (token.endsWith("/g")) return "green";
  if (token.endsWith("/b")) return "blue";
  if (token.endsWith("/y")) return "yellow";
  return defaultColor;
}

const SQUARE_PATTERN = /^[a-h][1-8]$/i;

function requireSquare(square: string, token: string): string {
  if (!SQUARE_PATTERN.test(square)) {
    throw Error(`Invalid square "${square}" in annotation "${token}".`);
  }
  return square;
}

/** Parses space-separated annotation tokens (`Hd4`, `Ae2-e4/g`, `!!e4`, `Cd4`). */
export function parseAnnotationLine(line: string): Array<Annotation> {
  const annotations: Array<Annotation> = [];
  const tokens = line.split(/\s+/).filter((t) => t !== "");
  for (const annotation of tokens) {
    // Hd4, Hd4/r
    if (annotation.startsWith("H")) {
      const color = resolveColorName(annotation, HIGHLIGHT_DEFAULT);
      annotations.push({
        type: "highlight",
        square: requireSquare(annotation.substring(1, 3), annotation),
        color,
      });
      continue;
    }
    // Ae2-e4, Ae2-e4/r
    if (annotation.startsWith("A")) {
      const color = resolveColorName(annotation, ARROW_DEFAULT);
      const [start = "", end = ""] = annotation.substring(1, 6).split("-");
      annotations.push({
        type: "arrow",
        start: requireSquare(start, annotation),
        end: requireSquare(end, annotation),
        color,
      });
      continue;
    }
    // !!e4, #We1
    const iconPrefix = ICON_PREFIXES.find((p) => annotation.startsWith(p));
    if (iconPrefix) {
      const start = iconPrefix.length;
      annotations.push({
        type: "icon",
        square: requireSquare(annotation.substring(start, start + 2), annotation),
        icon: ICON_MAPPING[iconPrefix],
      });
      continue;
    }
    // Cd4, Sd4, Qd4
    const shapeType = SHAPE_PREFIX_MAP[annotation[0]];
    if (shapeType) {
      const color = resolveColorName(annotation, SHAPE_DEFAULT);
      annotations.push({
        type: "shape",
        square: requireSquare(annotation.substring(1, 3), annotation),
        shape: shapeType,
        color,
      });
      continue;
    }
  }
  return annotations;
}

/** Parses a `chessboard` code block (FEN plus optional settings and annotations). */
export function parseCodeBlock(input: string): ParsedChessCode {
  const lines = input.split(/\r?\n/);
  const fen = lines[0].startsWith("fen: ")
    ? lines[0].slice("fen: ".length)
    : lines[0];
  const annotations: Array<Annotation> = [];
  let orientation: Orientation = "white";
  let strict = true;
  for (const line of lines.splice(1)) {
    if (line.trim() === "") {
      continue;
    }
    if (line.startsWith("strict: ")) {
      const value = line.replace("strict: ", "").trim().toLowerCase();
      strict = value !== "false";
    }
    if (line.startsWith("orientation: ")) {
      const value = line.replace("orientation: ", "").trim();
      if (value !== "white" && value !== "black") {
        throw Error(`Unknown orientation ${value}`);
      }
      orientation = value;
    }
    if (line.startsWith("annotations: ")) {
      const tokenLine = line.replace("annotations: ", "");
      annotations.push(...parseAnnotationLine(tokenLine));
    }
  }
  return { fen, annotations, orientation, strict };
}
