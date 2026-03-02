'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 5 — CLI Arg Parsing: Testing user-facing interfaces
//
// parseArgs takes process.argv-style arrays and returns structured options.
// CLI parsing is a GOLDMINE for edge-case bugs: missing flags, wrong order,
// unknown flags, conflicting options. Testing it saves hours of debugging.
// ─────────────────────────────────────────────────────────────────────────────

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { parseArgs } = require('../agent-xray');

// Helper: simulate argv (first two entries are node path and script path)
const argv = (...args) => ['node', 'agent-xray.js', ...args];

// ─── Default / Help mode ────────────────────────────────────────────────────

describe('parseArgs — defaults', () => {
  it('returns help mode when no args', () => {
    const result = parseArgs(argv());
    assert.equal(result.mode, 'help');
  });

  it('returns help mode for --help flag', () => {
    const result = parseArgs(argv('--help'));
    assert.equal(result.mode, 'help');
  });

  it('defaults to balanced profile', () => {
    const result = parseArgs(argv('test.md'));
    assert.equal(result.profile, 'balanced');
  });

  it('defaults jsonMode to false', () => {
    const result = parseArgs(argv('test.md'));
    assert.equal(result.jsonMode, false);
  });

  it('defaults strictMode to false', () => {
    const result = parseArgs(argv('test.md'));
    assert.equal(result.strictMode, false);
  });
});

// ─── Single file mode ───────────────────────────────────────────────────────

describe('parseArgs — single file', () => {
  it('sets mode to single and captures target', () => {
    const result = parseArgs(argv('my-agent.md'));
    assert.equal(result.mode, 'single');
    assert.equal(result.target, 'my-agent.md');
  });

  it('handles file paths with directories', () => {
    const result = parseArgs(argv('path/to/agent.md'));
    assert.equal(result.target, 'path/to/agent.md');
  });
});

// ─── Flags ──────────────────────────────────────────────────────────────────

describe('parseArgs — flags', () => {
  it('sets jsonMode with --json', () => {
    const result = parseArgs(argv('test.md', '--json'));
    assert.equal(result.jsonMode, true);
    assert.equal(result.target, 'test.md');
  });

  it('sets strictMode with --strict', () => {
    const result = parseArgs(argv('test.md', '--strict'));
    assert.equal(result.strictMode, true);
  });

  it('captures badge output path', () => {
    const result = parseArgs(argv('test.md', '--badge', 'output.svg'));
    assert.equal(result.outfile, 'output.svg');
  });

  it('handles --profile flag', () => {
    const result = parseArgs(argv('test.md', '--profile', 'security'));
    assert.equal(result.profile, 'security');
  });

  it('handles multiple flags together', () => {
    const result = parseArgs(argv('test.md', '--json', '--strict', '--profile', 'creative'));
    assert.equal(result.jsonMode, true);
    assert.equal(result.strictMode, true);
    assert.equal(result.profile, 'creative');
    assert.equal(result.target, 'test.md');
  });
});

// ─── Fleet / self-test mode ─────────────────────────────────────────────────

describe('parseArgs — fleet mode', () => {
  it('sets fleet mode with directory target', () => {
    const result = parseArgs(argv('--fleet', './agents/'));
    assert.equal(result.mode, 'fleet');
    assert.equal(result.target, './agents/');
  });

  it('sets self-test mode', () => {
    const result = parseArgs(argv('--self-test'));
    assert.equal(result.mode, 'self-test');
  });
});

// ─── Flag ordering shouldn't matter ─────────────────────────────────────────

describe('parseArgs — flag ordering', () => {
  it('file before flags', () => {
    const result = parseArgs(argv('test.md', '--json'));
    assert.equal(result.target, 'test.md');
    assert.equal(result.jsonMode, true);
  });

  it('flags before file', () => {
    const result = parseArgs(argv('--json', 'test.md'));
    assert.equal(result.target, 'test.md');
    assert.equal(result.jsonMode, true);
  });

  // LESSON: CLI users don't think about flag ordering. Your parser shouldn't
  // either. Test both directions.
});
