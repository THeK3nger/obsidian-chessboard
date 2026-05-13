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

/**
 * Creates an interactive PGN board with navigation controls.
 */
export function createInteractivePGNBoard(
  pgnString: string,
  options: Partial<SVGChessboardOptions>,
  initialPly: number | undefined,
  showMove: ShowMoveOption,
  boardWidthPx: number,
): HTMLElement {
  // Create game state
  const gameState = new PGNGameState(pgnString, initialPly, showMove);

  const container = activeDocument.createElement("div");
  container.addClass("chess-pgn-container");
  container.setCssProps({"--chess-board-max-width": `${boardWidthPx}px`});

  const boardContainer = activeDocument.createElement("div");
  boardContainer.addClass("chess-pgn-board");

  const moveInfo = activeDocument.createElement("div");
  moveInfo.addClass("chess-pgn-move-info");

  const controls = activeDocument.createElement("div");
  controls.addClass("chess-pgn-controls");

  const firstButton = activeDocument.createElement("button");
  firstButton.textContent = "|<";
  firstButton.addClass("chess-pgn-btn");
  firstButton.setAttribute("aria-label", "First move");

  const prevButton = activeDocument.createElement("button");
  prevButton.textContent = "<";
  prevButton.addClass("chess-pgn-btn");
  prevButton.setAttribute("aria-label", "Previous move");

  const nextButton = activeDocument.createElement("button");
  nextButton.textContent = ">";
  nextButton.addClass("chess-pgn-btn");
  nextButton.setAttribute("aria-label", "Next move");

  const lastButton = activeDocument.createElement("button");
  lastButton.textContent = ">|";
  lastButton.addClass("chess-pgn-btn");
  lastButton.setAttribute("aria-label", "Last move");

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

  // Append all to container
  container.appendChild(boardContainer);
  container.appendChild(moveInfo);
  container.appendChild(controls);

  // Initial render
  updateUI();

  return container;
}
