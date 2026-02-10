import { Chess, Move } from "chess.js";
import { SVGChessboard, SVGChessboardOptions, ShowMoveOption } from "./index";
import { Chessboard } from "./Chessboard";

/**
 * Manages the state of a PGN game for interactive navigation.
 */
class PGNGameState {
  private chess: Chess;
  private moveHistory: Move[];
  private currentPly: number;
  private pgnString: string;
  private showMove: ShowMoveOption;

  constructor(pgnString: string, initialPly: number | undefined, showMove: ShowMoveOption = "none") {
    this.pgnString = pgnString;
    this.showMove = showMove;
    this.chess = new Chess();

    // Load and parse PGN
    this.chess.loadPgn(pgnString);
    this.moveHistory = this.chess.history({ verbose: true });

    // Start at initial ply or beginning
    this.currentPly = initialPly !== undefined ? Math.min(initialPly, this.moveHistory.length) : 0;

    // Reset to starting position and replay moves
    this._updatePosition();
  }

  private _updatePosition(): void {
    const headers = this.chess.header();
    if (headers.SetUp === "1" && headers.FEN) {
      this.chess.load(headers.FEN);
    } else {
      this.chess.reset();
    }
    for (let i = 0; i < this.currentPly; i++) {
      this.chess.move(this.moveHistory[i].san);
    }
  }

  goToStart(): void {
    this.currentPly = 0;
    this._updatePosition();
  }

  goToPrevious(): void {
    if (this.currentPly > 0) {
      this.currentPly--;
      this._updatePosition();
    }
  }

  goToNext(): void {
    if (this.currentPly < this.moveHistory.length) {
      this.currentPly++;
      this._updatePosition();
    }
  }

  goToEnd(): void {
    this.currentPly = this.moveHistory.length;
    this._updatePosition();
  }

  goToPly(ply: number): void {
    this.currentPly = Math.max(0, Math.min(ply, this.moveHistory.length));
    this._updatePosition();
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
function updateMoveDisplay(gameState: PGNGameState, moveInfoElement: HTMLElement): void {
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
  }
): void {
  const canGoBack = gameState.canGoBack();
  const canGoForward = gameState.canGoForward();

  buttons.first.disabled = !canGoBack;
  buttons.prev.disabled = !canGoBack;
  buttons.next.disabled = !canGoForward;
  buttons.last.disabled = !canGoForward;

  // Update visual disabled state
  [buttons.first, buttons.prev].forEach((btn) => {
    if (!canGoBack) {
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    } else {
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  });

  [buttons.next, buttons.last].forEach((btn) => {
    if (!canGoForward) {
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";
    } else {
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  });
}

/**
 * Renders the chess board at the current position.
 */
function renderBoard(
  gameState: PGNGameState,
  options: Partial<SVGChessboardOptions>,
  svgContainer: HTMLElement,
  boardWidthPx: number
): void {
  // Clear existing SVG
  svgContainer.innerHTML = "";

  // Create SVGChessboard from current FEN
  const svgBoard = SVGChessboard.fromFEN(gameState.getCurrentFEN(), options);

  // Apply move highlighting if needed
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

  // Create SVG element (matching drawChessboard from main.ts)
  const xmlns = "http://www.w3.org/2000/svg";
  const block = document.createElementNS(xmlns, "svg");
  block.setAttributeNS(null, "viewBox", "0 0 320 320");
  block.appendChild(svgBoard.draw());
  block.style.display = "block";
  block.style.width = "100%";
  block.style.maxWidth = `${boardWidthPx}px`;
  block.style.height = "auto";

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
  boardWidthPx: number
): HTMLElement {
  // Create game state
  const gameState = new PGNGameState(pgnString, initialPly, showMove);

  // Create container
  const container = document.createElement("div");
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    max-width: ${boardWidthPx}px;
    margin: 0 auto;
  `;

  // Create board container
  const boardContainer = document.createElement("div");
  boardContainer.style.cssText = `
    width: 100%;
  `;

  // Create move info display
  const moveInfo = document.createElement("div");
  moveInfo.style.cssText = `
    font-family: var(--font-text);
    font-size: 14px;
    color: var(--text-normal);
    text-align: center;
    min-height: 20px;
  `;

  // Create controls container
  const controls = document.createElement("div");
  controls.style.cssText = `
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  `;

  // Button styling
  const buttonStyle = `
    padding: 8px 16px;
    min-width: 44px;
    min-height: 44px;
    font-size: 16px;
    font-family: var(--font-text);
    background-color: var(--interactive-normal);
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    cursor: pointer;
    touch-action: manipulation;
    transition: background-color 0.1s ease;
  `;

  // Create buttons
  const firstButton = document.createElement("button");
  firstButton.textContent = "|<";
  firstButton.style.cssText = buttonStyle;
  firstButton.setAttribute("aria-label", "First move");

  const prevButton = document.createElement("button");
  prevButton.textContent = "<";
  prevButton.style.cssText = buttonStyle;
  prevButton.setAttribute("aria-label", "Previous move");

  const nextButton = document.createElement("button");
  nextButton.textContent = ">";
  nextButton.style.cssText = buttonStyle;
  nextButton.setAttribute("aria-label", "Next move");

  const lastButton = document.createElement("button");
  lastButton.textContent = ">|";
  lastButton.style.cssText = buttonStyle;
  lastButton.setAttribute("aria-label", "Last move");

  // Add hover effects
  const buttons = [firstButton, prevButton, nextButton, lastButton];
  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      if (!btn.disabled) {
        btn.style.backgroundColor = "var(--interactive-hover)";
      }
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.backgroundColor = "var(--interactive-normal)";
    });
  });

  // Update UI function
  const updateUI = () => {
    renderBoard(gameState, options, boardContainer, boardWidthPx);
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
