import { Chess, Move } from "chess.js";
import { SVGChessboard, SVGChessboardOptions, ShowMoveOption } from "./index";

/**
 * Manages the state of a PGN game for interactive navigation.
 */
class PGNGameState {
  private chess: Chess;
  private moveHistory: Move[];
  private currentPly: number;
  private showMove: ShowMoveOption;
  private startingFEN: string | undefined;
  private chessPly: number; // Track where the chess instance currently is

  constructor(
    pgnString: string,
    initialPly: number | undefined,
    showMove: ShowMoveOption = "none",
  ) {
    this.showMove = showMove;
    this.chess = new Chess();

    // Load and parse PGN
    this.chess.loadPgn(pgnString);

    // Capture starting FEN from headers (must do this before any position changes)
    const headers = this.chess.getHeaders();
    this.startingFEN =
      headers.SetUp === "1" && headers.FEN ? headers.FEN : undefined;

    this.moveHistory = this.chess.history({ verbose: true });

    // Start at initial ply or beginning
    this.currentPly =
      initialPly !== undefined
        ? Math.min(initialPly, this.moveHistory.length)
        : 0;

    // Reset to starting position and replay moves to initial ply
    this._resetToStart();
    this.chessPly = 0;
    this._ensurePosition(this.currentPly);
  }

  /**
   * Resets the chess instance to the starting position.
   */
  private _resetToStart(): void {
    if (this.startingFEN) {
      this.chess.load(this.startingFEN);
    } else {
      this.chess.reset();
    }
  }

  /**
   * Efficiently moves the chess instance to the target ply.
   * Uses undo/move to minimize work instead of replaying from scratch.
   */
  private _ensurePosition(targetPly: number): void {
    if (this.chessPly === targetPly) {
      return; // Already at the right position
    }

    // If we need to go back
    if (targetPly < this.chessPly) {
      const stepsBack = this.chessPly - targetPly;
      for (let i = 0; i < stepsBack; i++) {
        this.chess.undo();
      }
      this.chessPly = targetPly;
    }
    // If we need to go forward
    else if (targetPly > this.chessPly) {
      for (let i = this.chessPly; i < targetPly; i++) {
        this.chess.move(this.moveHistory[i].san);
      }
      this.chessPly = targetPly;
    }
  }

  goToStart(): void {
    this.currentPly = 0;
    this._ensurePosition(this.currentPly);
  }

  goToPrevious(): void {
    if (this.currentPly > 0) {
      this.currentPly--;
      this._ensurePosition(this.currentPly);
    }
  }

  goToNext(): void {
    if (this.currentPly < this.moveHistory.length) {
      this.currentPly++;
      this._ensurePosition(this.currentPly);
    }
  }

  goToEnd(): void {
    this.currentPly = this.moveHistory.length;
    this._ensurePosition(this.currentPly);
  }

  goToPly(ply: number): void {
    this.currentPly = Math.max(0, Math.min(ply, this.moveHistory.length));
    this._ensurePosition(this.currentPly);
  }

  getCurrentPly(): number {
    return this.currentPly;
  }

  getTotalPlies(): number {
    return this.moveHistory.length;
  }

  getCurrentMove(): Move | undefined {
    if (this.currentPly === 0) return undefined;
    return this.moveHistory[this.currentPly - 1];
  }

  canGoBack(): boolean {
    return this.currentPly > 0;
  }

  canGoForward(): boolean {
    return this.currentPly < this.moveHistory.length;
  }

  getCurrentFEN(): string {
    return this.chess.fen();
  }

  getShowMove(): ShowMoveOption {
    return this.showMove;
  }

  getMoveHistory(): readonly Move[] {
    return this.moveHistory;
  }

  /** Whether the starting position has Black to move (affects move-list row layout). */
  blackStartsFirst(): boolean {
    if (this.startingFEN) {
      const sideToMove = this.startingFEN.split(/\s+/)[1];
      return sideToMove === "b";
    }
    return this.moveHistory.length > 0 && this.moveHistory[0].color === "b";
  }
}

/**
 * Formats move display text.
 */
function formatMoveDisplay(move: Move | undefined, ply: number): string {
  if (!move) {
    return "Starting position";
  }

  // Calculate move number (1-indexed, 2 plies per move)
  const moveNumber = Math.floor((ply - 1) / 2) + 1;
  const isWhiteMove = move.color === "w";

  // Format: "Move 12: Nf3" or "Move 12: ...Nc6"
  if (isWhiteMove) {
    return `Move ${moveNumber}: ${move.san}`;
  } else {
    return `Move ${moveNumber}: ...${move.san}`;
  }
}

/**
 * Updates the move display element.
 */
function updateMoveDisplay(
  gameState: PGNGameState,
  moveInfoElement: HTMLElement,
): void {
  const currentMove = gameState.getCurrentMove();
  const currentPly = gameState.getCurrentPly();
  const totalPlies = gameState.getTotalPlies();

  const moveText = formatMoveDisplay(currentMove, currentPly);
  const plyText = `(${currentPly}/${totalPlies})`;

  moveInfoElement.textContent = `${moveText} ${plyText}`;
}

/**
 * Updates button states based on current position.
 */
function updateButtonStates(
  gameState: PGNGameState,
  buttons: {
    first: HTMLButtonElement;
    prev: HTMLButtonElement;
    next: HTMLButtonElement;
    last: HTMLButtonElement;
  },
): void {
  const canGoBack = gameState.canGoBack();
  const canGoForward = gameState.canGoForward();
  buttons.first.disabled = !canGoBack;
  buttons.prev.disabled = !canGoBack;
  buttons.next.disabled = !canGoForward;
  buttons.last.disabled = !canGoForward;
}

/**
 * Renders the chess board at the current position.
 */
function renderBoard(
  gameState: PGNGameState,
  options: Partial<SVGChessboardOptions>,
  svgContainer: HTMLElement,
): void {
  svgContainer.innerHTML = "";

  const svgBoard = SVGChessboard.fromFEN(gameState.getCurrentFEN(), options);

  const showMove = gameState.getShowMove();
  if (showMove !== "none") {
    const lastMove = gameState.getCurrentMove();
    if (lastMove) {
      svgBoard.highlight(lastMove.from);
      svgBoard.highlight(lastMove.to);
      if (showMove === "arrow") {
        svgBoard.addArrow(lastMove.from, lastMove.to);
      }
    }
  }

  const xmlns = "http://www.w3.org/2000/svg";
  const block = activeDocument.createElementNS(xmlns, "svg");
  block.setAttributeNS(null, "viewBox", "0 0 320 320");
  block.appendChild(svgBoard.draw());
  block.addClass("chess-board-svg");

  svgContainer.appendChild(block);
}

const MOVELIST_MIN_WIDTH = 220;
const MOVELIST_GAP = 12;

const MOVE_CELL_BUTTON_STYLE = `
  margin: 0;
  padding: 2px 4px;
  border: none;
  border-radius: 3px;
  background: transparent;
  font-family: var(--font-monospace);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  color: var(--text-normal);
`;

function syncMoveListHighlight(panel: HTMLElement, currentPly: number): void {
  panel.querySelectorAll("button[data-ply]").forEach((node) => {
    const btn = node as HTMLButtonElement;
    const cellPly = parseInt(btn.dataset.ply ?? "0", 10);
    const isCurrent = cellPly === currentPly && currentPly > 0;

    btn.removeAttribute("aria-current");

    if (isCurrent) {
      btn.style.backgroundColor = "var(--background-modifier-hover)";
      btn.style.color = "var(--text-accent)";
      btn.style.fontWeight = "600";
      btn.setAttribute("aria-current", "true");
    } else if (cellPly < currentPly) {
      btn.style.backgroundColor = "transparent";
      btn.style.color = "var(--text-normal)";
      btn.style.fontWeight = "400";
    } else {
      btn.style.backgroundColor = "transparent";
      btn.style.color = "var(--text-muted)";
      btn.style.fontWeight = "400";
    }
  });
}

function createMoveCellButton(
  san: string,
  ply: number,
  onSelectPly: (ply: number) => void,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = san;
  btn.dataset.ply = String(ply);
  btn.style.cssText = MOVE_CELL_BUTTON_STYLE;
  btn.addEventListener("click", () => {
    onSelectPly(ply);
  });
  return btn;
}

function createMoveListPanel(
  gameState: PGNGameState,
  boardWidthPx: number,
  onSelectPly: (ply: number) => void,
): HTMLElement {
  const root = document.createElement("div");
  root.setAttribute("role", "navigation");
  root.setAttribute("aria-label", "Move list");
  root.style.cssText = `
    font-family: var(--font-text);
    font-size: 13px;
    min-width: ${MOVELIST_MIN_WIDTH}px;
    width: min(240px, 100%);
    flex: 1 1 ${MOVELIST_MIN_WIDTH}px;
    max-height: ${boardWidthPx}px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 4px 6px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    color: var(--text-normal);
  `;

  const history = gameState.getMoveHistory();
  const blackStartsFirst = gameState.blackStartsFirst();

  type MoveCell = { move: Move; ply: number };
  type RowData = { white?: MoveCell; black?: MoveCell };
  const rows = new Map<number, RowData>();

  // PGN row numbers: Black's nth move is always row n;
  // White's nth move is row n, except when Black moved first (then row n+1).
  let whiteCount = 0;
  let blackCount = 0;
  history.forEach((move, index) => {
    const ply = index + 1;
    if (move.color === "w") {
      whiteCount++;
      const rowNum = blackStartsFirst ? whiteCount + 1 : whiteCount;
      const row = rows.get(rowNum) ?? {};
      row.white = { move, ply };
      rows.set(rowNum, row);
    } else {
      blackCount++;
      const row = rows.get(blackCount) ?? {};
      row.black = { move, ply };
      rows.set(blackCount, row);
    }
  });

  for (const rowNum of Array.from(rows.keys()).sort((a, b) => a - b)) {
    const rowData = rows.get(rowNum)!;

    const row = document.createElement("div");
    row.style.display = "grid";
    row.style.gridTemplateColumns = "2.2em 1fr 1fr";
    row.style.columnGap = "6px";
    row.style.alignItems = "center";
    row.style.marginBottom = "2px";

    const num = document.createElement("span");
    num.textContent = `${rowNum}.`;
    num.style.color = "var(--text-faint)";
    num.style.textAlign = "right";

    row.appendChild(num);
    row.appendChild(
      rowData.white
        ? createMoveCellButton(rowData.white.move.san, rowData.white.ply, onSelectPly)
        : document.createElement("span"),
    );
    row.appendChild(
      rowData.black
        ? createMoveCellButton(rowData.black.move.san, rowData.black.ply, onSelectPly)
        : document.createElement("span"),
    );

    root.appendChild(row);
  }

  syncMoveListHighlight(root, gameState.getCurrentPly());
  return root;
}

/**
 * Creates an interactive PGN board with navigation controls.
 */
export function createInteractivePGNBoard(
  pgnString: string,
  options: Partial<SVGChessboardOptions>,
  initialPly: number | undefined,
  showMove: ShowMoveOption,
  boardWidthPx: number,
  showMoveList = false,
): HTMLElement {
  // Create game state
  const gameState = new PGNGameState(pgnString, initialPly, showMove);

  const container = createDiv("chess-pgn-container");
  container.setCssProps({ "--chess-board-max-width": `${boardWidthPx}px` });

  const boardContainer = createDiv("chess-pgn-board");
  const moveInfo = createDiv("chess-pgn-move-info");
  const controls = createDiv("chess-pgn-controls");

  const firstButton = createEl("button", { cls: "chess-pgn-btn", text: "|<", attr: { "aria-label": "First move" } });
  const prevButton = createEl("button", { cls: "chess-pgn-btn", text: "<", attr: { "aria-label": "Previous move" } });
  const nextButton = createEl("button", { cls: "chess-pgn-btn", text: ">", attr: { "aria-label": "Next move" } });
  const lastButton = createEl("button", { cls: "chess-pgn-btn", text: ">|", attr: { "aria-label": "Last move" } });

  let moveListPanel: HTMLElement | undefined;

  // Update UI function
  const updateUI = () => {
    renderBoard(gameState, options, boardContainer);
    updateMoveDisplay(gameState, moveInfo);
    updateButtonStates(gameState, {
      first: firstButton,
      prev: prevButton,
      next: nextButton,
      last: lastButton,
    });
    if (moveListPanel) {
      syncMoveListHighlight(moveListPanel, gameState.getCurrentPly());
    }
  };

  // Event handlers
  firstButton.addEventListener("click", () => {
    gameState.goToStart();
    updateUI();
  });

  prevButton.addEventListener("click", () => {
    gameState.goToPrevious();
    updateUI();
  });

  nextButton.addEventListener("click", () => {
    gameState.goToNext();
    updateUI();
  });

  lastButton.addEventListener("click", () => {
    gameState.goToEnd();
    updateUI();
  });

  // Append buttons to controls
  controls.appendChild(firstButton);
  controls.appendChild(prevButton);
  controls.appendChild(nextButton);
  controls.appendChild(lastButton);

  container.appendChild(boardContainer);
  container.appendChild(moveInfo);
  container.appendChild(controls);

  if (showMoveList) {
    const outer = document.createElement("div");
    outer.style.cssText = `
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: center;
      gap: ${MOVELIST_GAP}px;
      max-width: min(100%, ${boardWidthPx + MOVELIST_GAP + MOVELIST_MIN_WIDTH}px);
      margin: 0 auto;
    `;
    container.style.margin = "0";
    moveListPanel = createMoveListPanel(
      gameState,
      boardWidthPx,
      (ply) => {
        gameState.goToPly(ply);
        updateUI();
      },
    );
    outer.appendChild(container);
    outer.appendChild(moveListPanel);
    updateUI();
    return outer;
  }

  updateUI();
  return container;
}
