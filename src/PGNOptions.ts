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

  const lines = source.split("\n");
  const keepLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();

    if (trimmed.startsWith("ply:")) {
      const m = line.match(/ply:\s*(\d+)/i);
      if (m) ply = parseInt(m[1], 10);
      continue;
    }
    if (trimmed.startsWith("show-move:")) {
      const m = line.match(/show-move:\s*(none|squares|arrow)/i);
      if (m) showMove = m[1].toLowerCase() as ShowMoveOption;
      continue;
    }
    if (trimmed.startsWith("interactive:")) {
      const m = line.match(/interactive:\s*(true|false)/i);
      if (m) interactive = m[1].toLowerCase() === "true";
      continue;
    }
    if (trimmed.startsWith("move-list:")) {
      const m = line.match(/move-list:\s*(true|false)/i);
      if (m) moveList = m[1].toLowerCase() === "true";
      continue;
    }
    if (trimmed.startsWith("orientation:")) {
      const m = line.match(/orientation:\s*(white|black)/i);
      if (m) orientation = m[1].toLowerCase() as "white" | "black";
      continue;
    }
    if (trimmed.startsWith("annotations:")) {
      const tokenLine = line.replace(/^annotations:\s*/i, "");
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
