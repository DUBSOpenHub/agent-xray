'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1 — Baby Steps: Testing pure utility functions
//
// This is where everyone starts. These functions take a value in, return a
// value out, no side effects. If you can test these, you can test anything.
// ─────────────────────────────────────────────────────────────────────────────

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Import the functions we're testing — they're already exported!
const {
  getSentences,
  colorize,
  COLOR_THRESHOLDS,
} = require('../agent-xray');

// We also need wordCount, but it's not exported. That's OK — we can test it
// indirectly through other functions. (This is a real-world lesson: sometimes
// you test private functions through their public callers.)

// ─── getSentences ───────────────────────────────────────────────────────────

describe('getSentences', () => {
  it('splits on sentence-ending punctuation', () => {
    const result = getSentences('Hello world. How are you? Fine!');
    assert.deepStrictEqual(result, ['Hello world.', 'How are you?', 'Fine!']);
  });

  it('splits on newlines', () => {
    const result = getSentences('Line one\nLine two\nLine three');
    assert.deepStrictEqual(result, ['Line one', 'Line two', 'Line three']);
  });

  it('filters out empty strings', () => {
    const result = getSentences('Hello.\n\n\nWorld.');
    // Empty lines between content get filtered
    assert.ok(result.every(s => s.length > 0));
  });

  it('handles empty input', () => {
    const result = getSentences('');
    assert.deepStrictEqual(result, []);
  });

  it('handles single sentence with no terminator', () => {
    const result = getSentences('Just one line');
    assert.deepStrictEqual(result, ['Just one line']);
  });
});

// ─── colorize ───────────────────────────────────────────────────────────────
// This tests THRESHOLD LOGIC — a pattern you'll see everywhere.
// The key insight: test the boundaries, not random values in the middle.

describe('colorize', () => {
  it('returns red ANSI code for scores 0-39', () => {
    const red = '\x1b[31m';
    assert.equal(colorize(0), red);
    assert.equal(colorize(20), red);
    assert.equal(colorize(39), red);   // boundary: last red value
  });

  it('returns yellow ANSI code for scores 40-69', () => {
    const yellow = '\x1b[33m';
    assert.equal(colorize(40), yellow); // boundary: first yellow value
    assert.equal(colorize(55), yellow);
    assert.equal(colorize(69), yellow); // boundary: last yellow value
  });

  it('returns green ANSI code for scores 70-100', () => {
    const green = '\x1b[32m';
    assert.equal(colorize(70), green);  // boundary: first green value
    assert.equal(colorize(85), green);
    assert.equal(colorize(100), green);
  });

  // LESSON: Boundary testing. The bugs hide at 39→40 and 69→70, not at 50.
});
