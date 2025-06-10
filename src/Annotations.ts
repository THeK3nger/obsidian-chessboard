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

export type Annotation = Highlight | ArrowAnnotation | IconAnnotation;

export interface ParsedChessCode {
  fen: string;
  annotations: Array<Annotation>;
  orientation: "white" | "black";
}

/**
 * Parses a code block containing the FEN board position and the annotations
 * and returns an object with the parsed data.
 *
 * @param input The input string of the FEN code block.
 * @returns An object with the parsed data.
 */
export function parseCodeBlock(input: string): ParsedChessCode {
  const lines = input.split(/\r?\n/);
  let fen = lines[0];
  if (fen.startsWith("fen: ")) {
    fen = fen.replace("fen: ", "");
  }
  const annotations: Array<Annotation> = [];
  let orientation: "white" | "black" = "white";
  for (let line of lines.splice(1)) {
    if (line.trim() === "") {
      continue;
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
      line = line.replace("annotations: ", "");
      let partial_annotations = line.split(" ");
      for (let annotation of partial_annotations) {
        if (annotation.startsWith("H")) {
          let color = "#e67768"; // default yellow
          if (annotation.endsWith("/y")) {
            color = "#f1ad24";
          } else if (annotation.endsWith("/g")) {
            color = "#b3ce6e";
          } else if (annotation.endsWith("/b")) {
            color = "#6ab5d6";
          }
          annotations.push({
            type: "highlight",
            square: annotation.substring(1, 3),
            color: color,
          });
          continue;
        }
        if (annotation.startsWith("A")) {
          let color = "#f1ad24"; // default yellow
          if (annotation.endsWith("/r")) {
            color = "#e67768";
          } else if (annotation.endsWith("/g")) {
            color = "#b3ce6e";
          } else if (annotation.endsWith("/b")) {
            color = "#6ab5d6";
          }
          let [start, end] = annotation.substring(1, 6).split("-");
          annotations.push({
            type: "arrow",
            start,
            end,
            color: color,
          });
          continue;
        }
        const iconMapping: Record<string, string> = {
          "!!": "brilliant",
          "!?": "good",
          "??": "blunder",
          "?": "mistake",
          "!": "excellent",
          "F": "forced"
        };
        if (annotation.startsWith("F")) {
          annotations.push({
            type: "icon",
            square: annotation.substring(1, 3),
            icon: iconMapping["F"],
          });
          continue;
        }
        if (annotation.startsWith("!?")) {
          annotations.push({
            type: "icon",
            square: annotation.substring(2, 4),
            icon: iconMapping["!?"],
          });
          continue;
        }
        if (annotation.startsWith("!!")) {
          annotations.push({
            type: "icon",
            square: annotation.substring(2, 4),
            icon: iconMapping["!!"],
          });
          continue;
        }
        if (annotation.startsWith("!")) {
          let icon = iconMapping["!"];
          annotations.push({
            type: "icon",
            square: annotation.substring(1, 3),
            icon: icon,
          });
          continue;
        }
        if (annotation.startsWith("??")) {
          let icon = iconMapping["??"];
          annotations.push({
            type: "icon",
            square: annotation.substring(2, 4),
            icon: icon,
          });
          continue;
        }
        if (annotation.startsWith("?")) {
          let icon = iconMapping["?"];
          annotations.push({
            type: "icon",
            square: annotation.substring(1, 3),
            icon: icon,
          });
          continue;
        }
      }
    }
  }
  return { fen, annotations, orientation };
}
