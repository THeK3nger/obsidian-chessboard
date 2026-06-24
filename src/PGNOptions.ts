import { Annotation, parseAnnotationLine } from "./Annotations";
import { ShowMoveOption } from "./chessboardsvg/index";

export interface ParsedPGNBlock {
  pgnSource: string;
  ply: number | undefined;
  showMove: ShowMoveOption;
  interactive: boolean;
  moveList: boolean;
  orientation: "white" | "black";
  annotations: Annotation[];
}

function parseOption<T extends string>(line: string, key: string, allowedValues: readonly T[]): T | undefined {
  const match = line.match(new RegExp(`${key}:\\s*(${allowedValues.join("|")})`, "i"));
  return match?.[1].toLowerCase() as T | undefined;
}

function parseBooleanOption(line: string, key: string): boolean | undefined {
  const value = parseOption(line, key, ["true", "false"] as const);
  return value === undefined ? undefined : value === "true";
}

export function parsePGNBlock(source: string): ParsedPGNBlock {
  let ply: number | undefined = undefined;
  let showMove: ShowMoveOption = "none";
  let interactive = false;
  let moveList = false;
  let orientation: "white" | "black" = "white";
  const annotations: Annotation[] = [];

  const lines = source.split(/\r?\n/);
  const keepLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    if (lower.startsWith("ply:")) {
      const m = trimmed.match(/ply:\s*(\d+)/i);
      if (m) ply = parseInt(m[1], 10);
      continue;
    }
    if (lower.startsWith("show-move:")) {
      const value = parseOption<ShowMoveOption>(trimmed, "show-move", ["none", "squares", "arrow"]);
      if (value) showMove = value;
      continue;
    }
    if (lower.startsWith("interactive:")) {
      const value = parseBooleanOption(trimmed, "interactive");
      if (value !== undefined) interactive = value;
      continue;
    }
    if (lower.startsWith("move-list:")) {
      const value = parseBooleanOption(trimmed, "move-list");
      if (value !== undefined) moveList = value;
      continue;
    }
    if (lower.startsWith("orientation:")) {
      const value = parseOption<"white" | "black">(trimmed, "orientation", ["white", "black"]);
      if (value) orientation = value;
      continue;
    }
    if (lower.startsWith("annotations:")) {
      const tokenLine = trimmed.replace(/^annotations:\s*/i, "");
      annotations.push(...parseAnnotationLine(tokenLine));
      continue;
    }

    keepLines.push(line);
  }

  if (moveList && !interactive) interactive = true;

  return {
    pgnSource: keepLines.join("\n"),
    ply,
    showMove,
    interactive,
    moveList,
    orientation,
    annotations,
  };
}
