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
 * The four annotation colors that can be referenced by name (via the `/r`,
 * `/g`, `/b`, `/y` suffixes) or used as the default for an annotation type.
 */
export type AnnotationColorName = "red" | "yellow" | "green" | "blue";

/**
 * Maps each annotation color name to the value used to render it.
 *
 * This is the configuration surface that lets the annotation colors be
 * overridden from settings. Callers that don't supply a config fall back to
 * {@link DEFAULT_ANNOTATION_COLORS}.
 */
export type AnnotationColorConfig = Record<AnnotationColorName, string>;

/**
 * Built-in defaults for the annotation colors, used when no configuration is
 * provided.
 */
export const DEFAULT_ANNOTATION_COLORS: AnnotationColorConfig = {
  red: "#e67768",
  yellow: "#f1ad24",
  green: "#b3ce6e",
  blue: "#6ab5d6",
} as const;

/**
 * The color applied to each annotation type when its token omits a color
 * suffix. These are color *names* resolved against the active config, so they
 * track whatever values the user has chosen.
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
 * Resolves the color for an annotation token, honoring an explicit `/r`, `/g`,
 * `/b`, or `/y` suffix and falling back to `defaultColor` when none is present.
 */
function resolveColor(
  token: string,
  colors: AnnotationColorConfig,
  defaultColor: AnnotationColorName,
): string {
  if (token.endsWith("/r")) return colors.red;
  if (token.endsWith("/g")) return colors.green;
  if (token.endsWith("/b")) return colors.blue;
  if (token.endsWith("/y")) return colors.yellow;
  return colors[defaultColor];
}

export function parseAnnotationLine(
  line: string,
  colors: AnnotationColorConfig = DEFAULT_ANNOTATION_COLORS,
): Array<Annotation> {
  const annotations: Array<Annotation> = [];
  const tokens = line.split(" ");
  for (const annotation of tokens) {
    // Check for highlight annotations
    if (annotation.startsWith("H")) {
      const color = resolveColor(annotation, colors, HIGHLIGHT_DEFAULT);
      annotations.push({
        type: "highlight",
        square: annotation.substring(1, 3),
        color,
      });
      continue;
    }
    // Check for arrow annotations
    if (annotation.startsWith("A")) {
      const color = resolveColor(annotation, colors, ARROW_DEFAULT);
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
      const color = resolveColor(annotation, colors, SHAPE_DEFAULT);
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
 * @param input The input string of the FEN code block.
 * @param colors The annotation color configuration. Defaults to
 * {@link DEFAULT_ANNOTATION_COLORS} when not provided (e.g. before the
 * settings UI supplies a user-chosen palette).
 * @returns An object with the parsed data.
 */
export function parseCodeBlock(
  input: string,
  colors: AnnotationColorConfig = DEFAULT_ANNOTATION_COLORS,
): ParsedChessCode {
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
      annotations.push(...parseAnnotationLine(tokenLine, colors));
    }
  }
  return { fen, annotations, orientation, strict };
}
