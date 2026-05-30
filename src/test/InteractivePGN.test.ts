import { describe, it, expect } from 'vitest'
import { createInteractivePGNBoard } from '../chessboardsvg/InteractivePGN'

const SIMPLE_PGN = '1.e4 e5 2.Nf3 Nc6'
const BOARD_OPTS = { drawCoordinates: false }

function getNavButtons(container: HTMLElement) {
  const btns = container.querySelectorAll<HTMLButtonElement>('button.chess-pgn-btn')
  return {
    first: btns[0],
    prev: btns[1],
    next: btns[2],
    last: btns[3],
  }
}

describe('createInteractivePGNBoard', () => {
  it('renders a container element', () => {
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, undefined, 'none', 320)
    expect(el).toBeInstanceOf(HTMLElement)
  })

  it('has 4 navigation buttons', () => {
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, undefined, 'none', 320)
    const btns = el.querySelectorAll('button.chess-pgn-btn')
    expect(btns).toHaveLength(4)
  })

  it('first and prev buttons are disabled at start (ply 0 default)', () => {
    // When no initialPly given, starts at ply 0
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320)
    const { first, prev, next, last } = getNavButtons(el)
    expect(first.disabled).toBe(true)
    expect(prev.disabled).toBe(true)
    expect(next.disabled).toBe(false)
    expect(last.disabled).toBe(false)
  })

  it('next and last buttons are disabled at final ply', () => {
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 999, 'none', 320)
    const { first, prev, next, last } = getNavButtons(el)
    expect(first.disabled).toBe(false)
    expect(prev.disabled).toBe(false)
    expect(next.disabled).toBe(true)
    expect(last.disabled).toBe(true)
  })

  it('clicking next advances move info text', () => {
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320)
    const moveInfo = el.querySelector<HTMLElement>('.chess-pgn-move-info')
    expect(moveInfo?.textContent).toContain('Starting position')

    const { next } = getNavButtons(el)
    next.click()
    expect(moveInfo?.textContent).toContain('e4')
  })

  it('clicking last then first returns to start', () => {
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320)
    const moveInfo = el.querySelector<HTMLElement>('.chess-pgn-move-info')
    const { first, last } = getNavButtons(el)

    last.click()
    expect(moveInfo?.textContent).not.toContain('Starting position')

    first.click()
    expect(moveInfo?.textContent).toContain('Starting position')
  })

  it('ArrowRight key advances position', () => {
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320)
    const moveInfo = el.querySelector<HTMLElement>('.chess-pgn-move-info')
    expect(moveInfo?.textContent).toContain('Starting position')

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    expect(moveInfo?.textContent).toContain('e4')
  })

  it('ArrowLeft key goes back', () => {
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 1, 'none', 320)
    const moveInfo = el.querySelector<HTMLElement>('.chess-pgn-move-info')
    expect(moveInfo?.textContent).toContain('e4')

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    expect(moveInfo?.textContent).toContain('Starting position')
  })

  it('renders an SVG board inside the container', () => {
    const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, undefined, 'none', 320)
    const svgs = el.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  describe('move list panel', () => {
    it('renders .chess-move-list when showMoveList=true', () => {
      const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320, true)
      const panel = el.querySelector('.chess-move-list')
      expect(panel).not.toBeNull()
    })

    it('move list has SAN buttons for each half-move', () => {
      const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320, true)
      const moveBtns = el.querySelectorAll('button[data-ply]')
      // SIMPLE_PGN has 4 half-moves
      expect(moveBtns).toHaveLength(4)
    })

    it('clicking a move list button jumps to that ply', () => {
      const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 0, 'none', 320, true)
      const moveInfo = el.querySelector<HTMLElement>('.chess-pgn-move-info')
      const btn = el.querySelector<HTMLButtonElement>('button[data-ply="2"]')
      btn?.click()
      expect(moveInfo?.textContent).toContain('e5')
    })

    it('current move button gets chess-move-btn-current class', () => {
      const el = createInteractivePGNBoard(SIMPLE_PGN, BOARD_OPTS, 1, 'none', 320, true)
      const currentBtn = el.querySelector<HTMLButtonElement>('button[data-ply="1"]')
      expect(currentBtn?.classList.contains('chess-move-btn-current')).toBe(true)
    })
  })
})
