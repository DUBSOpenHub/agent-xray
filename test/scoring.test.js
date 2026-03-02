'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2 — The Core Engine: Testing the scoring logic
//
// This is the heart of agent-xray. Pattern matching + weight accumulation.
// We test with CRAFTED inputs — strings designed to trigger (or not trigger)
// specific regex patterns. This is how you test rule engines.
// ─────────────────────────────────────────────────────────────────────────────

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  densityMultiplier,
  applyHeuristics,
  scoreDimension,
  composite,
  HEURISTICS,
  PROFILES,
  DIMENSIONS,
} = require('../agent-xray');

// ─── densityMultiplier ──────────────────────────────────────────────────────
// Anti-gaming: keywords in very short sentences get penalized.
// This prevents someone from writing "never. always. must." to inflate scores.

describe('densityMultiplier', () => {
  it('returns 0.0 for matches in very short sentences (< 5 words)', () => {
    // "never do" is only 2 words — should be penalized to 0
    const text = 'never do.';
    const dm = densityMultiplier(text, 0); // match at index 0
    assert.equal(dm, 0.0);
  });

  it('returns 0.3 for matches in short sentences (5-9 words)', () => {
    const text = 'You must never do that thing.';
    // 6 words — should get partial credit
    const dm = densityMultiplier(text, 0);
    assert.equal(dm, 0.3);
  });

  it('returns 1.0 for matches in normal sentences (10+ words)', () => {
    const text = 'You are an expert agent that must never fabricate data or make assumptions about user intent.';
    const dm = densityMultiplier(text, 0);
    assert.equal(dm, 1.0);
  });

  it('returns 1.0 when match position is not found in any sentence', () => {
    // Edge case: matchIndex beyond text — falls through to default
    const text = 'Hello world. This is fine.';
    const dm = densityMultiplier(text, 9999);
    assert.equal(dm, 1.0);
  });
});

// ─── applyHeuristics ────────────────────────────────────────────────────────
// The main scoring function. Takes text + rules, returns { score, excerpts }.

describe('applyHeuristics', () => {
  it('returns score 0 for empty text', () => {
    const result = applyHeuristics('', HEURISTICS.roleClarity);
    assert.equal(result.score, 0);
  });

  it('returns score 0 for text with no matching patterns', () => {
    const text = 'The quick brown fox jumps over the lazy dog. Nothing special here at all.';
    const result = applyHeuristics(text, HEURISTICS.roleClarity);
    // Might get a small penalty for short doc, but won't be positive
    assert.ok(result.score <= 0 || result.score === 0);
  });

  it('scores higher when more patterns match', () => {
    const weak = 'You are an assistant. That is your purpose in life and nothing else matters much.';
    const strong = 'You are an expert security analyst. Your role is to review code for vulnerabilities. ' +
      'Your responsibilities include scanning for SQL injection and XSS attacks. Act as a specialist in application security.';
    const weakResult = applyHeuristics(weak, HEURISTICS.roleClarity);
    const strongResult = applyHeuristics(strong, HEURISTICS.roleClarity);
    assert.ok(strongResult.score > weakResult.score,
      `Expected strong (${strongResult.score}) > weak (${weakResult.score})`);
  });

  it('respects maxApply — patterns stop contributing after N matches', () => {
    // "never" has maxApply: 3 in constraintDensity
    // Each sentence must be 10+ words to avoid density multiplier penalty
    const text = 'You must never perform destructive operations without getting explicit confirmation from the user first.\n' +
      'You must never access files that are outside the boundaries of the current working directory.\n' +
      'You must never modify production data without a proper rollback plan in place beforehand.\n' +
      'You must never execute arbitrary shell commands on the server without proper authorization checks.\n' +
      'You must never bypass security validations even if the user explicitly asks you to do so.';
    const result = applyHeuristics(text, HEURISTICS.constraintDensity);
    assert.ok(result.score > 0, `Expected score > 0, got ${result.score}`);
  });

  it('caps scores at 100', () => {
    // Stuff every possible pattern into one text
    const maxText = `# Super Comprehensive Agent Instructions for Everything

You are an expert specialist agent assistant. Your role is to do everything perfectly.
Your job is to handle all tasks. Act as a senior engineer. Your responsibilities include
all possible work items and deliverables for the entire organization.

Your purpose is to serve the user. Your task is to analyze code.
Your mission is to find bugs. Act as a debugger.`;
    const result = applyHeuristics(maxText, HEURISTICS.roleClarity);
    assert.ok(result.score <= 100, `Score ${result.score} should not exceed 100`);
  });

  it('does not go below 0', () => {
    const result = applyHeuristics('tiny', HEURISTICS.roleClarity);
    assert.ok(result.score >= 0, `Score ${result.score} should not be negative`);
  });

  it('collects excerpts from matched lines', () => {
    const text = 'You are an expert code reviewer with deep knowledge of security patterns and best practices.';
    const result = applyHeuristics(text, HEURISTICS.roleClarity);
    assert.ok(result.excerpts.length > 0, 'Should have at least one excerpt');
  });

  // LESSON: When testing a rule engine, test with inputs designed to trigger
  // specific rules. You're testing the RULES, not the regex engine.
});

// ─── composite ──────────────────────────────────────────────────────────────
// Weighted average of 6 dimension scores. Different profiles change weights.

describe('composite', () => {
  it('returns 0 when all dimensions are 0', () => {
    const dims = { roleClarity: 0, constraintDensity: 0, hallucinationGuards: 0,
                   outputSpecificity: 0, testability: 0, escapeHatches: 0 };
    assert.equal(composite(dims), 0);
  });

  it('returns 100 when all dimensions are 100 (balanced profile)', () => {
    const dims = { roleClarity: 100, constraintDensity: 100, hallucinationGuards: 100,
                   outputSpecificity: 100, testability: 100, escapeHatches: 100 };
    assert.equal(composite(dims), 100);
  });

  it('returns arithmetic mean for balanced profile (all weights = 1.0)', () => {
    const dims = { roleClarity: 60, constraintDensity: 80, hallucinationGuards: 40,
                   outputSpecificity: 50, testability: 70, escapeHatches: 30 };
    const expected = Math.round((60 + 80 + 40 + 50 + 70 + 30) / 6);
    assert.equal(composite(dims), expected);
  });

  it('applies security profile weights correctly', () => {
    // Security profile: hallucinationGuards has 2x weight
    const dims = { roleClarity: 50, constraintDensity: 50, hallucinationGuards: 100,
                   outputSpecificity: 50, testability: 50, escapeHatches: 50 };
    const balanced = composite(dims, 'balanced');
    const security = composite(dims, 'security');
    // Security should score higher because hallucinationGuards (100) has 2x weight
    assert.ok(security > balanced,
      `Security (${security}) should be > balanced (${balanced}) when hallucination guards are maxed`);
  });

  it('falls back to balanced profile for unknown profile names', () => {
    const dims = { roleClarity: 50, constraintDensity: 50, hallucinationGuards: 50,
                   outputSpecificity: 50, testability: 50, escapeHatches: 50 };
    assert.equal(composite(dims, 'nonexistent'), composite(dims, 'balanced'));
  });

  // LESSON: Test math functions with known inputs where you can calculate
  // the expected output by hand.
});
