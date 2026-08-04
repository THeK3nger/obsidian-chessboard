/**
 * The four annotation colors that can be referenced by name (via the `/r`,
 * `/g`, `/b`, `/y` suffixes) or used as the default for an annotation type.
 */
export type AnnotationColorName = "red" | "yellow" | "green" | "blue";

/**
 * Represents a highlight annotation on the board.
 *
 * It is defined by the square to highlight (in algebraic notation) and a
 * symbolic color slot (e.g. `"red"`). The renderer decides which actual
 * color value that slot represents.
 */
export interface Highlight {
  type: "highlight";
  square: string;
  color: AnnotationColorName;
}

/**
 * Represents an arrow annotation on the board.
 *
 * It is defined by the start and end squares of the arrow (in algebraic
 * notation) and a symbolic color slot. See {@link Highlight}.
 */
export interface ArrowAnnotation {
  type: "arrow";
  start: string;
  end: string;
  color: AnnotationColorName;
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
 * the shape type (circle, square, squircle), and a symbolic color slot. See
 * {@link Highlight}.
 */
export interface ShapeAnnotation {
  type: "shape";
  square: string;
  shape: "circle" | "square" | "squircle";
  color: AnnotationColorName;
}

/**
 * An annotation as produced by parsing: colors are symbolic slot names
 * (`AnnotationColorName`), not rendering values. Parsing a code block only
 * needs to recognize the `/r`, `/g`, `/b`, `/y` tokens — it doesn't need to
 * know what "red" actually looks like.
 */
export type Annotation =
  | Highlight
  | ArrowAnnotation
  | IconAnnotation
  | ShapeAnnotation;

export interface ParsedChessCode {
  fen: string;
  annotations: Array<Annotation>;
  orientation: "white" | "black";
  strict: boolean;
}

/**
 * The color applied to each annotation type when its token omits a color
 * suffix.
 */
const HIGHLIGHT_DEFAULT: AnnotationColorName = "red";
const ARROW_DEFAULT: AnnotationColorName = "yellow";
const SHAPE_DEFAULT: AnnotationColorName = "yellow";

/**
 * Maps the icon token prefixes (e.g. `!!`, `F`, `#W`) recognized in an
 * annotation line to the icon name used to render them.
 */
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

/**
 * Icon prefixes in the order they must be matched. Two-character prefixes
 * (`!!`, `!?`, `??`) are listed before their one-character counterparts (`!`,
 * `?`) so that the longer match wins.
 */
const ICON_PREFIXES = ["#W", "#B", "!?", "!!", "??", "F", "!", "?"];

const SHAPE_PREFIX_MAP: Record<string, "circle" | "square" | "squircle"> = {
  C: "circle",
  S: "square",
  Q: "squircle",
};

/**
 * Resolves the color slot for an annotation token, honoring an explicit
 * `/r`, `/g`, `/b`, or `/y` suffix and falling back to `defaultColor` when
 * none is present.
 */
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

export function parseAnnotationLine(line: string): Array<Annotation> {
  const annotations: Array<Annotation> = [];
  const tokens = line.split(" ");
  for (const annotation of tokens) {
    // Check for highlight annotations
    if (annotation.startsWith("H")) {
      const color = resolveColorName(annotation, HIGHLIGHT_DEFAULT);
      annotations.push({
        type: "highlight",
        square: annotation.substring(1, 3),
        color,
      });
      continue;
    }
    // Check for arrow annotations
    if (annotation.startsWith("A")) {
      const color = resolveColorName(annotation, ARROW_DEFAULT);
      const [start, end] = annotation.substring(1, 6).split("-");
      annotations.push({ type: "arrow", start, end, color });
      continue;
    }
    // Check for icon annotations
    const iconPrefix = ICON_PREFIXES.find((p) => annotation.startsWith(p));
    if (iconPrefix) {
      const start = iconPrefix.length;
      annotations.push({
        type: "icon",
        square: annotation.substring(start, start + 2),
        icon: ICON_MAPPING[iconPrefix],
      });
      continue;
    }
    // Check for shape annotations
    const shapeType = SHAPE_PREFIX_MAP[annotation[0]];
    if (shapeType) {
      const color = resolveColorName(annotation, SHAPE_DEFAULT);
      annotations.push({
        type: "shape",
        square: annotation.substring(1, 3),
        shape: shapeType,
        color,
      });
      continue;
    }
  }
  return annotations;
}

/**
 * Parses a code block containing the FEN board position and the annotations
 * and returns an object with the parsed data.
 *
 * Annotation colors are left as symbolic slot names (see {@link Annotation});
 * the renderer resolves them against the active color configuration.
 *
 * @param input The input string of the FEN code block.
 * @returns An object with the parsed data.
 */
export function parseCodeBlock(input: string): ParsedChessCode {
  const lines = input.split(/\r?\n/);
  const fen = lines[0].startsWith("fen: ")
    ? lines[0].slice("fen: ".length)
    : lines[0];
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
