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
      const m = trimmed.match(/show-move:\s*(none|squares|arrow)/i);
      if (m) showMove = m[1].toLowerCase() as ShowMoveOption;
      continue;
    }
    if (lower.startsWith("interactive:")) {
      const m = trimmed.match(/interactive:\s*(true|false)/i);
      if (m) interactive = m[1].toLowerCase() === "true";
      continue;
    }
    if (lower.startsWith("move-list:")) {
      const m = trimmed.match(/move-list:\s*(true|false)/i);
      if (m) moveList = m[1].toLowerCase() === "true";
      continue;
    }
    if (lower.startsWith("orientation:")) {
      const m = trimmed.match(/orientation:\s*(white|black)/i);
      if (m) orientation = m[1].toLowerCase() as "white" | "black";
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
