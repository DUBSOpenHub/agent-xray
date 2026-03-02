'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3 — Behavior-Driven Tests: Testing WHAT, not HOW
//
// Instead of testing "does regex X match string Y," we test the BEHAVIOR:
// "A well-written agent prompt should score high. A blank one should score 0."
//
// This is the most maintainable kind of test — if you refactor the regex
// patterns, these tests still pass as long as the behavior is correct.
// ─────────────────────────────────────────────────────────────────────────────

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { scoreDimension } = require('../agent-xray');

// ─── Test Fixtures ──────────────────────────────────────────────────────────
// Realistic agent prompt snippets. These are the "test data."

const EMPTY_PROMPT = '';

const MINIMAL_PROMPT = 'Help the user.';

const STRONG_ROLE_PROMPT = `# Code Review Agent

You are an expert code reviewer specializing in JavaScript and TypeScript.
Your role is to analyze pull requests for bugs, security issues, and style violations.
Your responsibilities include checking for proper error handling, input validation,
and adherence to the project's coding standards. Act as a senior engineer
performing a thorough code review.`;

const STRONG_CONSTRAINT_PROMPT = `You must never modify production databases directly.
Do not access files outside the repository root under any circumstances.
Always validate user input before processing it further in the pipeline.
You must not execute shell commands without explicit user approval.
Only use approved npm packages from the allowlist provided below.
Forbidden: running rm -rf, dropping tables, or modifying CI config files.
Limited to read-only access on the main branch at all times.`;

const STRONG_HALLUCINATION_PROMPT = `Do not fabricate error messages or stack traces that you haven't actually seen.
If you are unsure about the cause of a bug, say so explicitly rather than guessing.
Only cite verified sources when referencing documentation or standards.
Do not guess what an API endpoint returns — check the actual response payload.
When in doubt, ask the user for clarification rather than making assumptions.
Grounded in the actual codebase — do not reference files that do not exist.`;

const STRONG_OUTPUT_PROMPT = `Format all output as markdown with clear headings for each section of the report.
Maximum 200 lines per response to keep things scannable and actionable.
Structure your review as: Summary, Issues Found, Recommendations, and Overall Score.
Use bullet points for individual issues and number them sequentially.
Example output: "## Summary\\nFound 3 critical issues and 2 warnings in the latest changes."
Start your response with a one-line severity assessment before the detailed breakdown.`;

const STRONG_TESTABILITY_PROMPT = `Given input: a JavaScript function, the expected output is a list of potential bugs.
For example: if given a function with an unchecked null reference, respond with
"Line 12: Potential null pointer — 'user.name' accessed without null check."
Should return a JSON array of findings with file, line, severity, and message fields.
The output should be deterministic — same input code, same findings every time.
If the input is an empty file, then return an empty array with no findings.`;

const STRONG_ESCAPE_PROMPT = `If you cannot complete the review due to missing context, escalate to the user.
When the code is outside your expertise, state that you don't have sufficient
domain knowledge and suggest consulting a specialist in that specific area.
Fall back to reporting only syntax-level observations when semantic analysis fails.
Default to read-only mode when encountering unfamiliar file types or frameworks.
If unable to parse the code, return a structured error message explaining what went wrong.`;

// ─── Dimension Behavior Tests ───────────────────────────────────────────────

describe('Dimension: roleClarity', () => {
  it('scores 0 for empty prompt', () => {
    assert.equal(scoreDimension(EMPTY_PROMPT, 'roleClarity').score, 0);
  });

  it('scores low for minimal prompt', () => {
    const { score } = scoreDimension(MINIMAL_PROMPT, 'roleClarity');
    assert.ok(score < 30, `Minimal prompt scored ${score}, expected < 30`);
  });

  it('scores high for a well-defined role', () => {
    const { score } = scoreDimension(STRONG_ROLE_PROMPT, 'roleClarity');
    assert.ok(score >= 50, `Strong role prompt scored ${score}, expected >= 50`);
  });
});

describe('Dimension: constraintDensity', () => {
  it('scores 0 for empty prompt', () => {
    assert.equal(scoreDimension(EMPTY_PROMPT, 'constraintDensity').score, 0);
  });

  it('scores high for constraint-heavy prompt', () => {
    const { score } = scoreDimension(STRONG_CONSTRAINT_PROMPT, 'constraintDensity');
    assert.ok(score >= 40, `Constraint prompt scored ${score}, expected >= 40`);
  });
});

describe('Dimension: hallucinationGuards', () => {
  it('scores 0 for empty prompt', () => {
    assert.equal(scoreDimension(EMPTY_PROMPT, 'hallucinationGuards').score, 0);
  });

  it('scores high for hallucination-guarded prompt', () => {
    const { score } = scoreDimension(STRONG_HALLUCINATION_PROMPT, 'hallucinationGuards');
    assert.ok(score >= 40, `Hallucination prompt scored ${score}, expected >= 40`);
  });
});

describe('Dimension: outputSpecificity', () => {
  it('scores 0 for empty prompt', () => {
    assert.equal(scoreDimension(EMPTY_PROMPT, 'outputSpecificity').score, 0);
  });

  it('scores high for output-specific prompt', () => {
    const { score } = scoreDimension(STRONG_OUTPUT_PROMPT, 'outputSpecificity');
    assert.ok(score >= 40, `Output prompt scored ${score}, expected >= 40`);
  });
});

describe('Dimension: testability', () => {
  it('scores 0 for empty prompt', () => {
    assert.equal(scoreDimension(EMPTY_PROMPT, 'testability').score, 0);
  });

  it('scores high for testable prompt', () => {
    const { score } = scoreDimension(STRONG_TESTABILITY_PROMPT, 'testability');
    assert.ok(score >= 40, `Testability prompt scored ${score}, expected >= 40`);
  });
});

describe('Dimension: escapeHatches', () => {
  it('scores 0 for empty prompt', () => {
    assert.equal(scoreDimension(EMPTY_PROMPT, 'escapeHatches').score, 0);
  });

  it('scores high for escape-hatch prompt', () => {
    const { score } = scoreDimension(STRONG_ESCAPE_PROMPT, 'escapeHatches');
    assert.ok(score >= 40, `Escape hatch prompt scored ${score}, expected >= 40`);
  });
});

// ─── Cross-Dimension Tests ──────────────────────────────────────────────────
// These test that dimensions are INDEPENDENT — a role prompt shouldn't
// accidentally score high on escape hatches.

describe('Cross-dimension independence', () => {
  it('role clarity prompt does not inflate escape hatches', () => {
    const roleScore = scoreDimension(STRONG_ROLE_PROMPT, 'roleClarity').score;
    const escapeScore = scoreDimension(STRONG_ROLE_PROMPT, 'escapeHatches').score;
    assert.ok(roleScore > escapeScore,
      `Role score (${roleScore}) should be much higher than escape score (${escapeScore}) on a role-focused prompt`);
  });

  it('hallucination prompt does not inflate testability', () => {
    const hallScore = scoreDimension(STRONG_HALLUCINATION_PROMPT, 'hallucinationGuards').score;
    const testScore = scoreDimension(STRONG_HALLUCINATION_PROMPT, 'testability').score;
    assert.ok(hallScore > testScore,
      `Hallucination score (${hallScore}) should be higher than testability (${testScore}) on a hallucination-focused prompt`);
  });

  // LESSON: Cross-dimension tests catch "score bleed" — when one dimension's
  // patterns accidentally match another dimension's keywords.
});
