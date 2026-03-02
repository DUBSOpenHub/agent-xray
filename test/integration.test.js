'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 6 — Integration Tests: Full pipeline, end-to-end
//
// Unit tests verify individual functions. Integration tests verify the whole
// pipeline: text in → structured result out. These catch bugs that only appear
// when functions interact (e.g., scoring feeds into composite, composite
// feeds into rendering).
//
// We also test file I/O here — creating temp files, scoring them, cleaning up.
// ─────────────────────────────────────────────────────────────────────────────

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  scoreText,
  renderBarChart,
  renderTable,
  DIMENSIONS,
} = require('../agent-xray');

// ─── Test fixtures ──────────────────────────────────────────────────────────

const FULL_AGENT_PROMPT = `# Security Review Agent

You are an expert application security analyst specializing in web application vulnerabilities.
Your role is to review code changes for security issues before they reach production.
Act as a senior security engineer with deep expertise in OWASP Top 10 threats.

## Constraints

- Never approve code with known SQL injection patterns without explicit user override.
- Do not modify any files — your job is review only, read-only access at all times.
- Always flag hardcoded secrets, API keys, or credentials immediately upon detection.
- Must not approve changes without checking for input validation on user-facing endpoints.

## Accuracy

- Do not fabricate vulnerability reports — only report what you can verify in the actual code.
- If you are unsure about a finding, label it as "potential" rather than "confirmed."
- Only cite CWE/CVE references you can verify against the official database entries.

## Output Format

Format all findings as markdown with severity headers organized by criticality level.
Maximum 50 lines per review to keep the output scannable and actionable for developers.
Structure: Executive Summary, Critical Findings, Warnings, Informational Notes, and Score.
Use bullet points for individual findings with a clear remediation suggestion for each.

## Examples

Given input: a function that concatenates user input into SQL, the expected output is:
"CRITICAL: SQL Injection — user input concatenated into query at line 42. Use parameterized queries instead."
Should return findings as JSON array with file, line, severity, description, and remediation fields.

## Error Handling

If you cannot access a referenced file, state that clearly and continue reviewing other available files.
When the diff is too large to review completely, escalate to the user with a summary of what was covered.
Fall back to syntax-only analysis when semantic analysis encounters parsing errors.
Default to conservative severity ratings when confidence in the assessment is low.
`;

// ─── scoreText integration ──────────────────────────────────────────────────

describe('scoreText — full pipeline', () => {
  let tmpFile;

  before(() => {
    tmpFile = path.join(os.tmpdir(), 'agent-xray-test-' + Date.now() + '.md');
    fs.writeFileSync(tmpFile, FULL_AGENT_PROMPT, 'utf8');
  });

  after(() => {
    try { fs.unlinkSync(tmpFile); } catch (e) { /* ignore cleanup errors */ }
  });

  it('returns a complete result object with all expected fields', () => {
    const result = scoreText(FULL_AGENT_PROMPT, tmpFile);

    // Verify structure
    assert.ok(result.file, 'Should have file path');
    assert.ok(result.dimensions, 'Should have dimensions object');
    assert.ok(result.excerpts, 'Should have excerpts object');
    assert.ok(typeof result.composite === 'number', 'Composite should be a number');
    assert.ok(typeof result.lineCount === 'number', 'lineCount should be a number');
    assert.ok(typeof result.wordCount === 'number', 'wordCount should be a number');
    assert.equal(result.profile, 'balanced', 'Default profile should be balanced');
  });

  it('scores all 6 dimensions', () => {
    const result = scoreText(FULL_AGENT_PROMPT, tmpFile);
    const dimKeys = DIMENSIONS.map(d => d.key);
    for (const key of dimKeys) {
      assert.ok(key in result.dimensions, `Missing dimension: ${key}`);
      assert.ok(typeof result.dimensions[key] === 'number', `${key} should be a number`);
      assert.ok(result.dimensions[key] >= 0 && result.dimensions[key] <= 100,
        `${key} score ${result.dimensions[key]} should be 0-100`);
    }
  });

  it('composite is in range 0-100', () => {
    const result = scoreText(FULL_AGENT_PROMPT, tmpFile);
    assert.ok(result.composite >= 0, 'Composite should be >= 0');
    assert.ok(result.composite <= 100, 'Composite should be <= 100');
  });

  it('well-written prompt scores higher than empty prompt', () => {
    const good = scoreText(FULL_AGENT_PROMPT, tmpFile);
    const empty = scoreText('', tmpFile);
    assert.ok(good.composite > empty.composite,
      `Good prompt (${good.composite}) should outscore empty (${empty.composite})`);
  });

  it('correctly counts words and lines', () => {
    const result = scoreText(FULL_AGENT_PROMPT, tmpFile);
    assert.ok(result.wordCount > 100, `Expected many words, got ${result.wordCount}`);
    assert.ok(result.lineCount > 20, `Expected many lines, got ${result.lineCount}`);
  });

  it('applies profile when specified', () => {
    const balanced = scoreText(FULL_AGENT_PROMPT, tmpFile, { profile: 'balanced' });
    const security = scoreText(FULL_AGENT_PROMPT, tmpFile, { profile: 'security' });
    // Scores should differ because weights change
    assert.ok(balanced.composite !== security.composite || balanced.profile !== security.profile,
      'Different profiles should produce different results or at least different profile labels');
  });

  it('is deterministic — same input always produces same output', () => {
    const run1 = scoreText(FULL_AGENT_PROMPT, tmpFile);
    const run2 = scoreText(FULL_AGENT_PROMPT, tmpFile);
    assert.deepStrictEqual(run1.dimensions, run2.dimensions,
      'Two runs of the same input should produce identical scores');
    assert.equal(run1.composite, run2.composite,
      'Composite should be identical across runs');
  });
});

// ─── Renderer integration ───────────────────────────────────────────────────

describe('renderBarChart — integration', () => {
  it('produces output that includes all dimension labels', () => {
    const result = scoreText(FULL_AGENT_PROMPT, '/tmp/test.md');
    const output = renderBarChart(result);
    for (const { label } of DIMENSIONS) {
      assert.ok(output.includes(label),
        `Bar chart should include dimension label "${label}"`);
    }
  });

  it('includes the composite score', () => {
    const result = scoreText(FULL_AGENT_PROMPT, '/tmp/test.md');
    const output = renderBarChart(result);
    assert.ok(output.includes('Composite'), 'Should include Composite label');
  });
});

describe('renderTable — integration', () => {
  it('renders a table with multiple results', () => {
    const r1 = scoreText(FULL_AGENT_PROMPT, '/tmp/agent1.md');
    const r2 = scoreText('You are a helper. Help the user with things they need.', '/tmp/agent2.md');
    const output = renderTable([r1, r2]);
    assert.ok(output.includes('agent1.md'), 'Should include first file');
    assert.ok(output.includes('agent2.md'), 'Should include second file');
    assert.ok(output.includes('MEAN'), 'Should include fleet mean');
  });

  it('returns empty string for empty results array', () => {
    assert.equal(renderTable([]), '');
  });

  it('returns empty string for null/undefined input', () => {
    assert.equal(renderTable(null), '');
    assert.equal(renderTable(undefined), '');
  });

  // LESSON: Integration tests catch "glue" bugs — where the output of one
  // function doesn't match the expected input of the next.
});
