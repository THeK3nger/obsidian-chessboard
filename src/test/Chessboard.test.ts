import { describe, it, expect } from 'vitest'
import { Chessboard } from '../chessboardsvg/Chessboard'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

describe('Chessboard.algebraicToCoord', () => {
  it('converts a1 to [0, 7]', () => {
    expect(Chessboard.algebraicToCoord('a1')).toEqual([0, 7])
  })

  it('converts h8 to [7, 0]', () => {
    expect(Chessboard.algebraicToCoord('h8')).toEqual([7, 0])
  })

  it('converts e4 correctly', () => {
    expect(Chessboard.algebraicToCoord('e4')).toEqual([4, 4])
  })
})

describe('Chessboard.coordToAlgebraic', () => {
  it('converts [0, 7] to a1', () => {
    expect(Chessboard.coordToAlgebraic([0, 7])).toBe('a1')
  })

  it('converts [7, 0] to h8', () => {
    expect(Chessboard.coordToAlgebraic([7, 0])).toBe('h8')
  })

  it('round-trips all 64 squares', () => {
    for (let c = 0; c < 8; c++) {
      for (let r = 0; r < 8; r++) {
        const algebraic = Chessboard.coordToAlgebraic([c, r])
        expect(Chessboard.algebraicToCoord(algebraic)).toEqual([c, r])
      }
    }
  })
})

describe('Chessboard.fromFEN', () => {
  it('loads starting position', () => {
    const board = Chessboard.fromFEN(STARTING_FEN)
    // White king on e1 = [4, 7]
    const piece = board.get(4, 7)
    expect(piece).toBeDefined()
    expect(piece?.type).toBe('k')
    expect(piece?.color).toBe('w')
  })

  it('loads FEN without move color (tolerant format)', () => {
    const board = Chessboard.fromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR')
    const piece = board.get(4, 7)
    expect(piece?.type).toBe('k')
  })

  it('accepts non-standard positions with skipValidation', () => {
    // Two white kings — illegal but should parse without throwing
    const board = Chessboard.fromFEN('8/8/8/8/8/8/8/KKKKKKKK', true)
    expect(board.get(0, 7)?.type).toBe('k')
  })

  it('has no piece on empty square', () => {
    const board = Chessboard.fromFEN(STARTING_FEN)
    expect(board.get(4, 4)).toBeUndefined() // e4 is empty
  })
})

describe('Chessboard.fromPGN', () => {
  const PGN = '1.e4 e5 2.Nf3 Nc6'

  it('loads to end of game by default (lastMove not tracked without ply)', () => {
    // fromPGN without ply uses chess.js loadPgn directly; lastMovePlayed is only
    // tracked when ply navigation is used, so getLastMove() is undefined here.
    const board = Chessboard.fromPGN(PGN)
    expect(board.getLastMove()).toBeUndefined()
  })

  it('ply: 0 returns starting position', () => {
    const board = Chessboard.fromPGN(PGN, 0)
    // e2 pawn should still be on e2
    expect(board.get(4, 6)?.type).toBe('p') // e2 = [4, 6]
    expect(board.getLastMove()).toBeUndefined()
  })

  it('ply: 1 plays 1.e4', () => {
    const board = Chessboard.fromPGN(PGN, 1)
    const lastMove = board.getLastMove()
    expect(lastMove?.san).toBe('e4')
    // e2 pawn moved away
    expect(board.get(4, 6)).toBeUndefined()
    // pawn is now on e4 = [4, 4]
    expect(board.get(4, 4)?.type).toBe('p')
  })

  it('ply beyond game length clamps to last move', () => {
    const board = Chessboard.fromPGN(PGN, 999)
    const lastMove = board.getLastMove()
    expect(lastMove?.san).toBe('Nc6')
  })
})
