import { describe, it, expect } from 'vitest'
import {
  parseCodeBlock,
  ANNOTATION_COLORS,
  HIGHLIGHT_DEFAULT,
  ARROW_DEFAULT,
  SHAPE_DEFAULT,
} from '../Annotations'

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

describe('parseCodeBlock', () => {
  it('parses bare FEN with no annotations', () => {
    const result = parseCodeBlock(STARTING_FEN)
    expect(result.fen).toBe(STARTING_FEN)
    expect(result.annotations).toHaveLength(0)
    expect(result.orientation).toBe('white')
    expect(result.strict).toBe(true)
  })

  it('parses fen: prefix', () => {
    const result = parseCodeBlock(`fen: ${STARTING_FEN}`)
    expect(result.fen).toBe(STARTING_FEN)
  })

  it('parses orientation: black', () => {
    const result = parseCodeBlock(`${STARTING_FEN}\norientation: black`)
    expect(result.orientation).toBe('black')
  })

  it('parses strict: false', () => {
    const result = parseCodeBlock(`${STARTING_FEN}\nstrict: false`)
    expect(result.strict).toBe(false)
  })

  describe('arrow annotations', () => {
    it('parses arrow with default color', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ae2-e4`)
      expect(result.annotations).toHaveLength(1)
      const ann = result.annotations[0]
      expect(ann.type).toBe('arrow')
      if (ann.type === 'arrow') {
        expect(ann.start).toBe('e2')
        expect(ann.end).toBe('e4')
        expect(ann.color).toBe(ARROW_DEFAULT)
      }
    })

    it('parses arrow /r color', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ae2-e4/r`)
      const ann = result.annotations[0]
      if (ann.type === 'arrow') expect(ann.color).toBe(ANNOTATION_COLORS.red)
    })

    it('parses arrow /g color', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ae2-e4/g`)
      const ann = result.annotations[0]
      if (ann.type === 'arrow') expect(ann.color).toBe(ANNOTATION_COLORS.green)
    })

    it('parses arrow /b color', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ae2-e4/b`)
      const ann = result.annotations[0]
      if (ann.type === 'arrow') expect(ann.color).toBe(ANNOTATION_COLORS.blue)
    })
  })

  describe('highlight annotations', () => {
    it('parses highlight with default color', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: He4`)
      expect(result.annotations).toHaveLength(1)
      const ann = result.annotations[0]
      expect(ann.type).toBe('highlight')
      if (ann.type === 'highlight') {
        expect(ann.square).toBe('e4')
        expect(ann.color).toBe(HIGHLIGHT_DEFAULT)
      }
    })

    it('parses highlight /y color', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: He4/y`)
      const ann = result.annotations[0]
      if (ann.type === 'highlight') expect(ann.color).toBe(ANNOTATION_COLORS.yellow)
    })

    it('parses highlight /g color', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: He4/g`)
      const ann = result.annotations[0]
      if (ann.type === 'highlight') expect(ann.color).toBe(ANNOTATION_COLORS.green)
    })
  })

  describe('icon annotations', () => {
    const cases: [string, string, string][] = [
      ['!!e4', 'e4', 'brilliant'],
      ['!?e4', 'e4', 'good'],
      ['!e4', 'e4', 'excellent'],
      ['??e4', 'e4', 'blunder'],
      ['?e4', 'e4', 'mistake'],
      ['Fe4', 'e4', 'forced'],
    ]

    for (const [token, square, icon] of cases) {
      it(`parses ${token}`, () => {
        const result = parseCodeBlock(`${STARTING_FEN}\nannotations: ${token}`)
        expect(result.annotations).toHaveLength(1)
        const ann = result.annotations[0]
        expect(ann.type).toBe('icon')
        if (ann.type === 'icon') {
          expect(ann.square).toBe(square)
          expect(ann.icon).toBe(icon)
        }
      })
    }
  })

  describe('shape annotations', () => {
    it('parses C (circle)', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ce4`)
      const ann = result.annotations[0]
      expect(ann.type).toBe('shape')
      if (ann.type === 'shape') {
        expect(ann.shape).toBe('circle')
        expect(ann.square).toBe('e4')
      }
    })

    it('parses S (square)', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Se4`)
      const ann = result.annotations[0]
      if (ann.type === 'shape') expect(ann.shape).toBe('square')
    })

    it('parses Q (squircle)', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Qe4`)
      const ann = result.annotations[0]
      if (ann.type === 'shape') expect(ann.shape).toBe('squircle')
    })

    it('parses shape with /r color', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ce4/r`)
      const ann = result.annotations[0]
      if (ann.type === 'shape') expect(ann.color).toBe(ANNOTATION_COLORS.red)
    })

    it('parses shape with default color', () => {
      const result = parseCodeBlock(`${STARTING_FEN}\nannotations: Ce4`)
      const ann = result.annotations[0]
      if (ann.type === 'shape') expect(ann.color).toBe(SHAPE_DEFAULT)
    })
  })

  it('parses multiple annotations across multiple lines', () => {
    const input = `${STARTING_FEN}\nannotations: He4 Hd4\nannotations: Ae2-e4`
    const result = parseCodeBlock(input)
    expect(result.annotations).toHaveLength(3)
  })
})
