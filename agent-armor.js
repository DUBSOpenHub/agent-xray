'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — CONSTANTS & CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const os   = require('os');
const fs   = require('fs');
const path = require('path');

const DIMENSIONS = [
  { key: 'roleClarity',         label: 'Role Clarity'             },
  { key: 'constraintDensity',   label: 'Constraint Density'       },
  { key: 'hallucinationGuards', label: 'Hallucination Guardrails' },
  { key: 'outputSpecificity',   label: 'Output Specificity'       },
  { key: 'testability',         label: 'Testability'              },
  { key: 'escapeHatches',       label: 'Escape Hatches'           },
];

const COLOR_THRESHOLDS = { red: 39, yellow: 69 };

const SELF_TEST_DIR = path.join(os.homedir(), '.copilot', 'agents');

const HEURISTICS = {
  roleClarity: [
    { pattern: /^#\s+.{10,}/m,                              weight:  15, maxApply: 1 },
    { pattern: /\byou are\b/i,                              weight:  20, maxApply: 1 },
    { pattern: /\byour (role|job|task|mission|purpose)\b/i, weight:  20, maxApply: 1 },
    { pattern: /\bact as\b/i,                               weight:  15, maxApply: 1 },
    { pattern: /\bspecialist|expert|agent|assistant\b/i,    weight:  10, maxApply: 2 },
    { pattern: /\bdo not\b.{0,30}\bact as\b/i,              weight: -10, maxApply: 1 },
    { pattern: /\bresponsibilities\b/i,                     weight:  10, maxApply: 1 },
    { fn: (text) => text.split('\n').length < 50 ? -10 : 0 },
  ],
  constraintDensity: [
    { pattern: /\bnever\b/i,                                weight:  8, maxApply: 3 },
    { pattern: /\balways\b/i,                               weight:  6, maxApply: 3 },
    { pattern: /\bmust( not)?\b/i,                          weight:  6, maxApply: 4 },
    { pattern: /\bdo not\b/i,                               weight:  6, maxApply: 4 },
    { pattern: /\bonly\b.{0,40}(when|if|unless)/i,          weight:  8, maxApply: 3 },
    { pattern: /\bforbidden|prohibited|disallowed\b/i,      weight: 10, maxApply: 2 },
    { pattern: /\bexcept\b/i,                               weight:  5, maxApply: 2 },
    { pattern: /\blimit(ed)? to\b/i,                        weight:  8, maxApply: 2 },
    { pattern: /\bunder no circumstances\b/i,               weight: 12, maxApply: 1 },
    {
      fn: (text) => {
        const lines = text.split('\n');
        let inSection = false;
        let count = 0;
        for (const line of lines) {
          if (/^#+\s+(Rules|Constraints|Restrictions)/i.test(line)) {
            inSection = true;
            continue;
          }
          if (inSection && /^#+/.test(line.trim())) {
            inSection = false;
          }
          if (inSection && /^\s*-\s+/.test(line)) {
            count++;
          }
        }
        return Math.min(count, 5) * 4;
      },
    },
  ],
  hallucinationGuards: [
    { pattern: /\bdo not (make up|fabricate|invent|hallucinate)\b/i,        weight: 20, maxApply: 1 },
    { pattern: /\bif (you are|you're) (not sure|uncertain|unsure)\b/i,      weight: 15, maxApply: 1 },
    { pattern: /\bonly (use|rely on|cite) (verified|real|actual|provided)\b/i, weight: 15, maxApply: 1 },
    { pattern: /\bdo not (guess|assume|speculate)\b/i,                      weight: 12, maxApply: 2 },
    { pattern: /\bsay (so|that you don't know)\b/i,                         weight: 10, maxApply: 1 },
    { pattern: /\bcite\b.{0,30}\bsource/i,                                  weight: 10, maxApply: 1 },
    { pattern: /\bground(ed)?\b.{0,30}(in|on)\b/i,                          weight:  8, maxApply: 1 },
    { pattern: /\bverif(y|ied|iable)\b/i,                                    weight:  8, maxApply: 2 },
    { pattern: /\bwhen in doubt\b/i,                                         weight:  8, maxApply: 1 },
  ],
  outputSpecificity: [
    { pattern: /\bformat(ted)?\b/i,                                          weight: 10, maxApply: 1 },
    { pattern: /\b(json|yaml|markdown|csv|xml|table)\b/i,                    weight: 15, maxApply: 2 },
    { pattern: /\bstructure(d)?\b/i,                                         weight:  8, maxApply: 1 },
    { pattern: /\b(max|maximum|limit)\s+\d+\s+(words|lines|chars|tokens)\b/i, weight: 15, maxApply: 1 },
    { pattern: /\bsection(s)?\b/i,                                           weight:  8, maxApply: 1 },
    { pattern: /\bbullet(s|ed)?|numbered list\b/i,                           weight:  8, maxApply: 1 },
    { pattern: /\bheading(s)?\b/i,                                           weight:  8, maxApply: 1 },
    { pattern: /\bexample output\b/i,                                        weight: 20, maxApply: 1 },
    { pattern: /\bdo not include\b.{0,40}(explanation|preamble|intro)\b/i,   weight: 10, maxApply: 1 },
    { pattern: /\bstart (your response|with|by)\b/i,                         weight:  8, maxApply: 1 },
    { pattern: /\bend (your response|with)\b/i,                              weight:  8, maxApply: 1 },
  ],
  testability: [
    { pattern: /\bexpected (output|result|behavior)\b/i,                     weight: 20, maxApply: 1 },
    { pattern: /\bfor example\b/i,                                           weight: 12, maxApply: 3 },
    { pattern: /\bgiven.{0,40}(input|prompt|request)\b/i,                    weight: 12, maxApply: 2 },
    { pattern: /\b(input|output):\s/i,                                       weight: 15, maxApply: 2 },
    { pattern: /\bshould (return|output|produce|respond)\b/i,                weight: 12, maxApply: 3 },
    { pattern: /\bmust (return|output|produce|always return)\b/i,            weight: 12, maxApply: 2 },
    { pattern: /\btest\b/i,                                                  weight:  8, maxApply: 2 },
    { pattern: /\bdeterministic\b/i,                                         weight: 15, maxApply: 1 },
    { pattern: /\bif.{0,60}then\b/i,                                         weight:  8, maxApply: 3 },
    { pattern: /\bappropriately|as needed|use judgment\b/i,                  weight: -8, maxApply: 3 },
  ],
  escapeHatches: [
    { pattern: /\bif (you can't|you cannot|unable to)\b/i,                   weight: 15, maxApply: 2 },
    { pattern: /\bfall(s)? (back|through)\b/i,                               weight: 15, maxApply: 1 },
    { pattern: /\boutside (your|the) (scope|capability|expertise)\b/i,       weight: 15, maxApply: 1 },
    { pattern: /\bescalat(e|ion)\b/i,                                        weight: 12, maxApply: 1 },
    { pattern: /\brefuse\b.{0,40}(if|when)\b/i,                              weight: 12, maxApply: 2 },
    { pattern: /\bdefault (to|behavior)\b/i,                                 weight: 10, maxApply: 1 },
    { pattern: /\bwhen (not sure|unsure|uncertain|ambiguous)\b/i,             weight: 12, maxApply: 2 },
    { pattern: /\bdo not (attempt|try)\b.{0,30}(if|when|unless)\b/i,         weight: 10, maxApply: 2 },
    { pattern: /\bstate that\b.{0,40}(cannot|don't|won't)\b/i,               weight: 10, maxApply: 1 },
    { pattern: /\berror(s)?\b.{0,40}(handle|report|surface)\b/i,             weight: 10, maxApply: 1 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — SCORING ENGINE  (pure, no I/O)
// ─────────────────────────────────────────────────────────────────────────────

function applyHeuristics(text, rules) {
  let score = 0;
  for (const rule of rules) {
    if (typeof rule.fn === 'function') {
      score += rule.fn(text);
      continue;
    }
    const pat = rule.pattern;
    // Ensure global flag so we can count all occurrences
    const flags = pat.flags.includes('g') ? pat.flags : pat.flags + 'g';
    const globalPat = new RegExp(pat.source, flags);
    const matchCount = (text.match(globalPat) || []).length;
    score += rule.weight * Math.min(matchCount, rule.maxApply);
  }
  return Math.max(0, Math.min(100, score));
}

function scoreDimension(text, dim) {
  return applyHeuristics(text, HEURISTICS[dim]);
}

function scoreText(text, filePath) {
  const dimensions = {};
  for (const { key } of DIMENSIONS) {
    dimensions[key] = scoreDimension(text, key);
  }
  const comp = composite(dimensions);
  const lineCount = text.split('\n').length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return {
    file: path.resolve(filePath),
    dimensions,
    composite: comp,
    lineCount,
    wordCount,
  };
}

function composite(dims) {
  const keys = DIMENSIONS.map(d => d.key);
  const sum = keys.reduce((acc, k) => acc + (dims[k] || 0), 0);
  return Math.round(sum / keys.length);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — FILE I/O
// ─────────────────────────────────────────────────────────────────────────────

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && path.extname(e.name).toLowerCase() === '.md')
    .map(e => path.resolve(dir, e.name))
    .sort();
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, data, 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — OUTPUT RENDERERS  (pure, return strings)
// ─────────────────────────────────────────────────────────────────────────────

const ANSI_RESET  = '\x1b[0m';
const ANSI_BOLD   = '\x1b[1m';
const ANSI_RED    = '\x1b[31m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_GREEN  = '\x1b[32m';

function colorize(score) {
  if (score <= COLOR_THRESHOLDS.red)    return ANSI_RED;
  if (score <= COLOR_THRESHOLDS.yellow) return ANSI_YELLOW;
  return ANSI_GREEN;
}

function renderBar(score, width) {
  if (width === undefined) width = 30;
  const filled = Math.round(score / 100 * width);
  const empty  = width - filled;
  const bar    = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
  return colorize(score) + bar + ANSI_RESET;
}

function renderBarChart(result) {
  const { file, dimensions, composite: comp, wordCount } = result;
  const name       = path.basename(file);
  const labelWidth = 26;
  const BAR_WIDTH  = 30;

  let out = '\n' + ANSI_BOLD + 'agent-armor: ' + name + ANSI_RESET +
            '  (' + wordCount + ' words)\n\n';

  for (const { key, label } of DIMENSIONS) {
    const score     = dimensions[key];
    const padLabel  = label.padEnd(labelWidth);
    const scoreStr  = String(score).padStart(3);
    out += '  ' + padLabel + ' [' + scoreStr + '] ' + renderBar(score, BAR_WIDTH) + '\n';
  }

  const divider = '─'.repeat(labelWidth + BAR_WIDTH + 9);
  out += '  ' + divider + '\n';
  out += '  ' + 'Composite'.padEnd(labelWidth) +
         ' [' + String(comp).padStart(3) + '] ' +
         renderBar(comp, BAR_WIDTH) + '\n\n';

  return out;
}

function renderTable(results) {
  if (!results || results.length === 0) return '';

  const sorted = [...results].sort((a, b) => b.composite - a.composite);

  // Column widths
  const CW = { rank: 3, file: 28, dim: 5, comp: 4 };

  // Build separator using ─┼─ between cells
  const allWidths = [CW.rank, CW.file, CW.dim, CW.dim, CW.dim, CW.dim, CW.dim, CW.dim, CW.comp];
  const sep = allWidths.map(w => '─'.repeat(w)).join('─┼─');

  // Header row
  const headers = [
    'Rank'.padStart(CW.rank),
    'File'.padEnd(CW.file),
    'Role'.padStart(CW.dim),
    'Constraint'.padStart(CW.dim),
    'Hallucination'.padStart(CW.dim),
    'Output'.padStart(CW.dim),
    'Testability'.padStart(CW.dim),
    'Escape'.padStart(CW.dim),
    'Composite'.padStart(CW.comp),
  ];

  let out = '\n' + headers.join(' │ ') + '\n' + sep + '\n';

  // Data rows
  sorted.forEach((r, i) => {
    const d    = r.dimensions;
    const name = path.basename(r.file);
    const truncName = name.length > CW.file ? name.slice(0, CW.file - 1) + '…' : name;
    const compStr = colorize(r.composite) + String(r.composite).padStart(CW.comp) + ANSI_RESET;

    const cells = [
      String(i + 1).padStart(CW.rank),
      truncName.padEnd(CW.file),
      String(d.roleClarity).padStart(CW.dim),
      String(d.constraintDensity).padStart(CW.dim),
      String(d.hallucinationGuards).padStart(CW.dim),
      String(d.outputSpecificity).padStart(CW.dim),
      String(d.testability).padStart(CW.dim),
      String(d.escapeHatches).padStart(CW.dim),
      compStr,
    ];
    out += cells.join(' │ ') + '\n';
  });

  out += sep + '\n';

  // Fleet mean footer
  const mean      = sorted.reduce((s, r) => s + r.composite, 0) / sorted.length;
  const meanScore = Math.round(mean);
  const meanStr   = String(meanScore);
  const meanComp  = colorize(meanScore) + meanStr.padStart(CW.comp) + ANSI_RESET;

  const footerCells = [
    ''.padStart(CW.rank),
    'MEAN'.padEnd(CW.file),
    ''.padStart(CW.dim),
    ''.padStart(CW.dim),
    ''.padStart(CW.dim),
    ''.padStart(CW.dim),
    ''.padStart(CW.dim),
    ''.padStart(CW.dim),
    meanComp,
  ];
  out += footerCells.join(' │ ') + '\n\n';

  return out;
}

function renderBadge(score, label) {
  if (label === undefined) label = 'agent-armor';
  const rightText = String(score);
  const CHAR_W    = 6.5;
  const PADDING   = 10;
  const leftW     = Math.round(label.length * CHAR_W) + PADDING;
  const rightW    = Math.round(rightText.length * CHAR_W) + PADDING;
  const totalW    = leftW + rightW;
  const color     = score >= 70 ? '#44cc11' : score >= 40 ? '#dfb317' : '#e05d44';

  // Text positions (SVG units = pixels * 10 due to scale(.1))
  const leftCenter  = Math.round(leftW  / 2 * 10);
  const rightCenter = Math.round((leftW + rightW / 2) * 10);
  const leftTL      = Math.max(1, Math.round((label.length    * CHAR_W - 2) * 10));
  const rightTL     = Math.max(1, Math.round((rightText.length * CHAR_W - 2) * 10));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="20" role="img" aria-label="${label}: ${score}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalW}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftW}" height="20" fill="#555"/>
    <rect x="${leftW}" width="${rightW}" height="20" fill="${color}"/>
    <rect width="${totalW}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
    <text aria-hidden="true" x="${leftCenter}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${leftTL}" lengthAdjust="spacing">${label}</text>
    <text x="${leftCenter}" y="140" transform="scale(.1)" textLength="${leftTL}" lengthAdjust="spacing">${label}</text>
    <text aria-hidden="true" x="${rightCenter}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${rightTL}" lengthAdjust="spacing">${rightText}</text>
    <text x="${rightCenter}" y="140" transform="scale(.1)" textLength="${rightTL}" lengthAdjust="spacing">${rightText}</text>
  </g>
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — CLI
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    return { mode: 'help', target: null, outfile: null, jsonMode: false };
  }

  const result = { mode: 'single', target: null, outfile: null, jsonMode: false };

  if (args.includes('--json')) result.jsonMode = true;

  // Track indices consumed as flag values so they are not treated as positionals
  const flagValueIdxs = new Set();

  if (args.includes('--badge')) {
    const idx = args.indexOf('--badge');
    const val = args[idx + 1];
    if (!val || val.startsWith('--')) {
      process.stderr.write('Error: --badge requires a path argument.\n');
      process.exit(1);
    }
    result.outfile = val;
    flagValueIdxs.add(idx + 1);
  }

  if (args.includes('--self-test')) {
    result.mode = 'self-test';
    return result;
  }

  if (args.includes('--fleet')) {
    const idx = args.indexOf('--fleet');
    let val = null;
    let valIdx = -1;
    for (let i = idx + 1; i < args.length; i++) {
      if (!args[i].startsWith('--')) { val = args[i]; valIdx = i; break; }
    }
    if (!val) {
      process.stderr.write('Error: --fleet requires a directory argument.\n');
      process.exit(1);
    }
    result.mode   = 'fleet';
    result.target = val;
    flagValueIdxs.add(valIdx);
    return result;
  }

  // Single file mode — first non-flag positional argument (not a flag value)
  const positional = args.find((a, i) => !a.startsWith('--') && !flagValueIdxs.has(i));
  if (!positional) {
    printHelp();
    process.exit(0);
  }
  result.target = positional;

  // Reject unknown flags
  const knownFlags = new Set(['--json', '--badge', '--fleet', '--self-test', '--help']);
  for (const arg of args) {
    if (arg.startsWith('--') && !knownFlags.has(arg)) {
      process.stderr.write('Error: Unknown flag: ' + arg + '\n');
      printHelp();
      process.exit(1);
    }
  }

  return result;
}

function dispatch(opts) {
  const { mode, target, outfile, jsonMode } = opts;

  if (mode === 'help') {
    printHelp();
    return;
  }

  // ── Single file mode ──────────────────────────────────────────────────────
  if (mode === 'single') {
    let text;
    try {
      text = readFile(target);
    } catch (e) {
      process.stderr.write('Error: Cannot read file "' + target + '": ' + e.message + '\n');
      process.exit(1);
    }

    const result = scoreText(text, target);

    if (jsonMode) {
      process.stdout.write(JSON.stringify({
        file:      result.file,
        scores:    result.dimensions,
        composite: result.composite,
      }, null, 2) + '\n');
    } else {
      process.stdout.write(renderBarChart(result));
    }

    if (outfile) {
      try {
        writeFile(outfile, renderBadge(result.composite));
      } catch (e) {
        process.stderr.write('Error: Cannot write badge to "' + outfile + '": ' + e.message + '\n');
        process.exit(1);
      }
    }
    return;
  }

  // ── Fleet / self-test mode ────────────────────────────────────────────────
  if (mode === 'fleet' || mode === 'self-test') {
    const dir = mode === 'self-test' ? SELF_TEST_DIR : target;

    let files;
    try {
      files = scanDir(dir);
    } catch (e) {
      process.stderr.write('Error: Cannot scan directory "' + dir + '": ' + e.message + '\n');
      process.exit(1);
    }

    if (files.length === 0) {
      process.stderr.write('Warning: No .md files found in "' + dir + '".\n');
      process.exit(1);
    }

    const results = [];
    for (const f of files) {
      try {
        results.push(scoreText(readFile(f), f));
      } catch (e) {
        process.stderr.write('Warning: Could not read "' + f + '": ' + e.message + '\n');
      }
    }

    const sorted = [...results].sort((a, b) => b.composite - a.composite);

    if (jsonMode) {
      process.stdout.write(JSON.stringify(
        sorted.map(r => ({ file: r.file, scores: r.dimensions, composite: r.composite })),
        null, 2
      ) + '\n');
    } else {
      process.stdout.write('agent-armor Fleet Report: ' + dir + '\n');
      process.stdout.write(renderTable(sorted));
    }

    if (outfile) {
      // Fleet badge mode: outfile is a directory
      for (const r of sorted) {
        const base      = path.basename(r.file, '.md');
        const badgePath = path.join(outfile, base + '.svg');
        try {
          writeFile(badgePath, renderBadge(r.composite, path.basename(r.file)));
        } catch (e) {
          process.stderr.write('Warning: Could not write badge "' + badgePath + '": ' + e.message + '\n');
        }
      }
    }

    if (mode === 'self-test') {
      const anyLow = sorted.some(r => r.composite < 50);
      process.exit(anyLow ? 1 : 0);
    }
    return;
  }
}

function printHelp() {
  process.stdout.write(
    'agent-armor — Agent Prompt Quality Analyzer\n' +
    '\n' +
    'Usage:\n' +
    '  node agent-armor.js <file.md>                     Score a single prompt file\n' +
    '  node agent-armor.js --fleet <dir>                 Score all .md files in directory\n' +
    '  node agent-armor.js --self-test                   Run fleet mode on dark-factory agents dir\n' +
    '  node agent-armor.js --badge <outfile>             Write SVG badge (single file mode)\n' +
    '  node agent-armor.js --fleet <dir> --badge <dir>   Write one SVG badge per file into dir\n' +
    '  node agent-armor.js --json                        Emit scores as JSON to stdout\n' +
    '  node agent-armor.js --help                        Show this help\n' +
    '\n' +
    'Scoring Dimensions:\n' +
    '  Role Clarity             — Explicit persona, scope, and responsibility statements\n' +
    '  Constraint Density       — Prohibitions, limits, and boundary definitions\n' +
    '  Hallucination Guardrails — Source citation, uncertainty expressions, refusals\n' +
    '  Output Specificity       — Format, length, structure, or schema definitions\n' +
    '  Testability              — Example inputs/outputs, acceptance criteria\n' +
    '  Escape Hatches           — Instructions for out-of-scope conditions\n' +
    '\n' +
    'Score Colors:\n' +
    '  \x1b[31mRed    (0–39)\x1b[0m   — Needs significant improvement\n' +
    '  \x1b[33mYellow (40–69)\x1b[0m  — Acceptable, room for improvement\n' +
    '  \x1b[32mGreen  (70–100)\x1b[0m — Well-specified\n' +
    '\n' +
    'Exit Codes:\n' +
    '  0 — Success (or all agents >= 50 in --self-test mode)\n' +
    '  1 — Error, or any agent < 50 in --self-test mode\n'
  );
}

function main() {
  try {
    const opts = parseArgs(process.argv);
    dispatch(opts);
  } catch (e) {
    process.stderr.write('Unexpected error: ' + e.message + '\n');
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  DIMENSIONS,
  HEURISTICS,
  COLOR_THRESHOLDS,
  SELF_TEST_DIR,
  applyHeuristics,
  scoreDimension,
  scoreText,
  composite,
  readFile,
  scanDir,
  writeFile,
  colorize,
  renderBar,
  renderBarChart,
  renderTable,
  renderBadge,
  parseArgs,
  printHelp,
};

if (require.main === module) main();
