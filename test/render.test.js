'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 4 — Output Testing: Testing renderers and visual output
//
// These functions produce strings (ANSI bars, emoji meters, SVG badges).
// We test that the output CONTAINS expected patterns — not exact string match,
// because ANSI codes and emoji make exact matching fragile.
// ─────────────────────────────────────────────────────────────────────────────

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  renderBar,
  renderEnergy,
  renderVerdict,
  renderBadge,
  renderChozo,
  DIMENSIONS,
} = require('../agent-xray');

// ─── renderEnergy ───────────────────────────────────────────────────────────

describe('renderEnergy', () => {
  it('returns green circles for scores >= 70', () => {
    const result = renderEnergy(85);
    assert.ok(result.includes('🟢'), 'Should contain green circles');
    assert.ok(!result.includes('🔴'), 'Should not contain red circles');
  });

  it('returns yellow circles for scores 40-69', () => {
    const result = renderEnergy(55);
    assert.ok(result.includes('🟡'), 'Should contain yellow circles');
  });

  it('returns red circles for scores < 40', () => {
    const result = renderEnergy(15);
    assert.ok(result.includes('🔴'), 'Should contain red circles');
  });

  it('always returns exactly 5 indicators total', () => {
    // Each indicator is either a colored circle or a black square
    for (const score of [0, 25, 50, 75, 100]) {
      const result = renderEnergy(score);
      const circles = (result.match(/🟢|🟡|🔴/g) || []).length;
      const squares = (result.match(/⬛/g) || []).length;
      assert.equal(circles + squares, 5,
        `Score ${score}: got ${circles} circles + ${squares} squares = ${circles + squares}, expected 5`);
    }
  });

  // LESSON: For visual output, test PROPERTIES (contains green, has 5 items)
  // not exact strings. This makes tests resilient to cosmetic changes.
});

// ─── renderBar ──────────────────────────────────────────────────────────────

describe('renderBar', () => {
  it('returns a string with ANSI color codes', () => {
    const result = renderBar(50);
    assert.ok(result.includes('\x1b['), 'Should contain ANSI escape codes');
    assert.ok(result.includes('\x1b[0m'), 'Should end with ANSI reset');
  });

  it('has the correct total width', () => {
    const width = 20;
    const result = renderBar(50, width);
    // Strip ANSI codes to count actual bar characters
    const stripped = result.replace(/\x1b\[[0-9;]*m/g, '');
    assert.equal(stripped.length, width,
      `Expected bar width ${width}, got ${stripped.length}`);
  });

  it('fills more blocks for higher scores', () => {
    const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
    const low = strip(renderBar(20, 30));
    const high = strip(renderBar(80, 30));
    const lowFilled = (low.match(/█/g) || []).length;
    const highFilled = (high.match(/█/g) || []).length;
    assert.ok(highFilled > lowFilled,
      `High score (${highFilled} blocks) should have more filled than low (${lowFilled})`);
  });
});

// ─── renderVerdict ──────────────────────────────────────────────────────────

describe('renderVerdict', () => {
  it('returns "fully powered" for scores >= 70', () => {
    const result = renderVerdict(80);
    assert.ok(result.includes('fully powered') || result.includes('🟢'),
      'High score should mention full power');
  });

  it('returns "incomplete" for scores 50-69', () => {
    const result = renderVerdict(55);
    assert.ok(result.includes('incomplete') || result.includes('⚠'),
      'Mid score should mention incomplete');
  });

  it('returns "critical" for scores < 50', () => {
    const result = renderVerdict(30);
    assert.ok(result.includes('Critical') || result.includes('🚨'),
      'Low score should mention critical');
  });
});

// ─── renderBadge ────────────────────────────────────────────────────────────

describe('renderBadge', () => {
  it('returns valid SVG', () => {
    const svg = renderBadge(75);
    assert.ok(svg.startsWith('<svg'), 'Should start with SVG tag');
    assert.ok(svg.includes('</svg>'), 'Should close SVG tag');
  });

  it('includes the score value in the badge', () => {
    const svg = renderBadge(42);
    assert.ok(svg.includes('42'), 'Badge should display the score');
  });

  it('uses green color for high scores', () => {
    const svg = renderBadge(85);
    assert.ok(svg.includes('#44cc11'), 'High score should use green');
  });

  it('uses yellow color for mid scores', () => {
    const svg = renderBadge(55);
    assert.ok(svg.includes('#dfb317'), 'Mid score should use yellow');
  });

  it('uses red color for low scores', () => {
    const svg = renderBadge(25);
    assert.ok(svg.includes('#e05d44'), 'Low score should use red');
  });

  it('includes custom label text', () => {
    const svg = renderBadge(60, 'my-custom-label');
    assert.ok(svg.includes('my-custom-label'), 'Should include custom label');
  });

  it('uses default label when none provided', () => {
    const svg = renderBadge(60);
    assert.ok(svg.includes('agent-xray'), 'Should use default label');
  });
});

// ─── renderChozo ────────────────────────────────────────────────────────────

describe('renderChozo', () => {
  it('returns empty string when no dimensions are below 40', () => {
    const dims = { roleClarity: 80, constraintDensity: 70, hallucinationGuards: 60,
                   outputSpecificity: 50, testability: 45, escapeHatches: 40 };
    assert.equal(renderChozo(dims), '');
  });

  it('shows upgrade hints for dimensions below 40', () => {
    const dims = { roleClarity: 10, constraintDensity: 15, hallucinationGuards: 80,
                   outputSpecificity: 80, testability: 80, escapeHatches: 80 };
    const result = renderChozo(dims);
    assert.ok(result.includes('POWER BEAM'), 'Should suggest Role Clarity upgrade');
    assert.ok(result.includes('VARIA SUIT'), 'Should suggest Constraint Density upgrade');
  });

  it('includes the Chozo statue ASCII art', () => {
    const dims = { roleClarity: 5, constraintDensity: 90, hallucinationGuards: 90,
                   outputSpecificity: 90, testability: 90, escapeHatches: 90 };
    const result = renderChozo(dims);
    assert.ok(result.includes('da da da DA DAAAA'), 'Should include the iconic sound');
  });
});
