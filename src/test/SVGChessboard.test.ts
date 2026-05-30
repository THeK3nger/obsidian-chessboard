import { describe, it, expect } from 'vitest'
import { SVGChessboard } from '../chessboardsvg/index'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
const NO_COORDS = { drawCoordinates: false }

function board(g: SVGElement) {
  return g.querySelector<SVGElement>('[data-group="board"]')!
}
function pieces(g: SVGElement) {
  return g.querySelector<SVGElement>('[data-group="pieces"]')!
}
function bgAnnotations(g: SVGElement) {
  return g.querySelector<SVGElement>('[data-group="annotations-bg"]')!
}
function fgAnnotations(g: SVGElement) {
  return g.querySelector<SVGElement>('[data-group="annotations-fg"]')!
}

describe('SVGChessboard.fromFEN', () => {
  it('draw() returns an SVG g element', () => {
    const g = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS).draw()
    expect(g.tagName).toBe('g')
    expect(g.namespaceURI).toBe('http://www.w3.org/2000/svg')
  })

  it('board group has exactly 64 squares', () => {
    const g = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS).draw()
    expect(board(g).children).toHaveLength(64)
    expect(board(g).children[0].tagName).toBe('rect')
  })

  it('starting position has 32 pieces', () => {
    const g = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS).draw()
    expect(pieces(g).children).toHaveLength(32)
  })

  it('empty board has 0 pieces', () => {
    const g = SVGChessboard.fromFEN('8/8/8/8/8/8/8/8', NO_COORDS, true).draw()
    expect(pieces(g).children).toHaveLength(0)
  })

  it('highlight() adds a rect to the background annotations group', () => {
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.highlight('e4')
    const g = sv.draw()
    expect(bgAnnotations(g).children).toHaveLength(1)
    expect(bgAnnotations(g).children[0].tagName).toBe('rect')
  })

  it('highlight() uses the specified color', () => {
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.highlight('e4', '#ff0000')
    const g = sv.draw()
    expect(bgAnnotations(g).children[0].getAttribute('fill')).toBe('#ff0000')
  })

  it('multiple highlights accumulate', () => {
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.highlight('e4')
    sv.highlight('d4')
    sv.highlight('e5')
    const g = sv.draw()
    expect(bgAnnotations(g).children).toHaveLength(3)
  })

  it('addArrow() adds a path to the foreground annotations group', () => {
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addArrow('e2', 'e4')
    const g = sv.draw()
    expect(fgAnnotations(g).children).toHaveLength(1)
    expect(fgAnnotations(g).children[0].tagName).toBe('path')
  })

  it('square colors propagate to board rects', () => {
    const sv = SVGChessboard.fromFEN(STARTING_FEN, {
      ...NO_COORDS,
      whiteSquareColor: '#aabbcc',
      blackSquareColor: '#112233',
    })
    const fills = Array.from(board(sv.draw()).children).map((r) => r.getAttribute('fill'))
    expect(fills).toContain('#aabbcc')
    expect(fills).toContain('#112233')
  })

  it('addShape(circle) adds a circle to the foreground annotations group', () => {
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addShape('e4', 'circle')
    const g = sv.draw()
    expect(fgAnnotations(g).children).toHaveLength(1)
    expect(fgAnnotations(g).children[0].tagName).toBe('circle')
  })

  it('addShape(square) adds a rect to the foreground annotations group', () => {
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addShape('e4', 'square')
    expect(fgAnnotations(sv.draw()).children[0].tagName).toBe('rect')
  })

  it('addShape(squircle) adds a path to the foreground annotations group', () => {
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addShape('e4', 'squircle')
    expect(fgAnnotations(sv.draw()).children[0].tagName).toBe('path')
  })

  it('addIcon() adds a g element to the foreground annotations group', () => {
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addIcon('e4', 'brilliant')
    const g = sv.draw()
    expect(fgAnnotations(g).children).toHaveLength(1)
    expect(fgAnnotations(g).children[0].tagName).toBe('g')
  })

  it('multiple foreground annotations stack', () => {
    const sv = SVGChessboard.fromFEN(STARTING_FEN, NO_COORDS)
    sv.addArrow('e2', 'e4')
    sv.addShape('d4', 'circle')
    sv.addIcon('f6', 'blunder')
    expect(fgAnnotations(sv.draw()).children).toHaveLength(3)
  })

  it('drawCoordinates: true adds a coordinate group', () => {
    const g = SVGChessboard.fromFEN(STARTING_FEN, { drawCoordinates: true }).draw()
    expect(g.children).toHaveLength(5)
    expect(g.querySelectorAll('text').length).toBeGreaterThan(0)
  })
})

describe('SVGChessboard.fromPGN', () => {
  const PGN = '1.e4 e5'

  it('renders from PGN at ply 1', () => {
    const g = SVGChessboard.fromPGN(PGN, NO_COORDS, 1, 'none').draw()
    expect(pieces(g).children).toHaveLength(32)
  })

  it('show-move: squares adds 2 highlights', () => {
    const g = SVGChessboard.fromPGN(PGN, NO_COORDS, 1, 'squares').draw()
    expect(bgAnnotations(g).children).toHaveLength(2)
  })

  it('show-move: arrow adds 2 highlights + 1 arrow', () => {
    const g = SVGChessboard.fromPGN(PGN, NO_COORDS, 1, 'arrow').draw()
    expect(bgAnnotations(g).children).toHaveLength(2)
    expect(fgAnnotations(g).children).toHaveLength(1)
  })
})
