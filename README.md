# 🛡️ Agent Armor

**A health checkup for your AI agents.**

Score any `.md` agent prompt across 6 dimensions. See what's missing. Fix it. Rescan. Stronger agent.

```
node agent-armor.js my-agent.md
```

```
agent-armor: my-agent.md  (1848 words)

  Role Clarity               [ 75] ███████████████████████░░░░░░░
  Constraint Density         [ 70] █████████████████████░░░░░░░░░
  Hallucination Guardrails   [ 26] ████████░░░░░░░░░░░░░░░░░░░░░░
  Output Specificity         [ 48] ██████████████░░░░░░░░░░░░░░░░
  Testability                [ 31] █████████░░░░░░░░░░░░░░░░░░░░░
  Escape Hatches             [ 12] ████░░░░░░░░░░░░░░░░░░░░░░░░░░
  ─────────────────────────────────────────────────────────────────
  Composite                  [ 44] █████████████░░░░░░░░░░░░░░░░░
```

## Why This Tool?

It's a spell-checker, but for AI instructions. Just like a doctor checks your blood pressure, heart rate, and cholesterol — this checks six vital signs of an AI's instruction manual. Are the instructions clear? Are there safety rails? Does the AI know what to do when it's confused?

For example, one of the things it checks is whether you told your AI "don't make things up." Without that, an AI might confidently give you fake data and you'd never know. It's like a car without brakes — it still drives, but you really want those brakes before you hit the road.

You get a score. If it's low, you know exactly what to fix. You fix it, run the checkup again, score goes up. Healthier agent, safer results.

## Install

No install. Just Node.js 18+.

```bash
# Clone and run
git clone https://github.com/greggcochran/agent-armor.git
cd agent-armor
node agent-armor.js my-agent.md
```

Zero dependencies. Single file. No `npm install`.

## The 6 Dimensions

| Dimension | What It Checks | Example Signal |
|-----------|---------------|----------------|
| **Role Clarity** | Does it define who the agent is? | "You are a security auditor" |
| **Constraint Density** | Are there explicit rules and limits? | "Never modify production data" |
| **Hallucination Guardrails** | Does it defend against making things up? | "Do not fabricate error messages" |
| **Output Specificity** | Is the output format defined? | "Format as JSON with these keys" |
| **Testability** | Can you verify the agent's behavior? | "Given X input, expected output is Y" |
| **Escape Hatches** | Does it know what to do when stuck? | "If you cannot diagnose, escalate" |

Each dimension: **0–100**. Composite: **arithmetic mean**.

## Usage

### Score a single file

```bash
node agent-armor.js my-agent.md
```

### Scan a fleet

```bash
node agent-armor.js --fleet ./agents/
```

Prints a ranked table sorted by composite score:

```
Rank │ File                    │  Role │ Constraint │ Hallucination │ Output │ Testability │ Escape │ Composite
────┼────────────────────────┼───────┼───────┼───────┼───────┼───────┼───────┼─────
  1 │ grid-medic.agent.md    │    87 │   100 │   100 │    48 │   100 │   100 │   89
  2 │ security-audit.agent.md│    60 │    76 │    68 │    64 │    62 │    40 │   62
  ...
────┼────────────────────────┼───────┼───────┼───────┼───────┼───────┼───────┼─────
    │ MEAN                   │       │       │       │       │       │       │   67
```

### Generate an SVG badge

```bash
node agent-armor.js my-agent.md --badge badge.svg
```

### JSON output (for CI pipelines)

```bash
node agent-armor.js my-agent.md --json
```

```json
{
  "file": "my-agent.md",
  "scores": {
    "roleClarity": 75,
    "constraintDensity": 70,
    "hallucinationGuards": 26,
    "outputSpecificity": 48,
    "testability": 31,
    "escapeHatches": 12
  },
  "composite": 44
}
```

### Self-test (scan your Copilot agents)

```bash
node agent-armor.js --self-test
```

Scans `~/.copilot/agents/`. Exits 0 if all agents score ≥ 50, exits 1 if any are below.

## Score Colors

| Score | Color | Meaning |
|-------|-------|---------|
| 0–39 | 🔴 Red | Needs work |
| 40–69 | 🟡 Yellow | Getting there |
| 70–100 | 🟢 Green | Solid |

## How to Improve a Score

The tool tells you **what's missing**, not just that something is wrong.

Low on **Hallucination Guardrails**? Add lines like:
- "Do not fabricate data or error messages"
- "If you are unsure, say so explicitly"
- "Only cite verified sources"

Low on **Escape Hatches**? Add lines like:
- "If you cannot complete the task, escalate to the user"
- "When uncertain, default to read-only mode"
- "Fall back to reporting the error without attempting a fix"

Rescan. Watch the score climb.

## How It Works

Pure keyword and regex matching — no AI, no API calls, no network. It searches for patterns like "you are", "never", "do not fabricate", "for example", "if you cannot" and scores based on their presence and density.

**Deterministic**: same file → same score, every time.

## Requirements

- Node.js 18+
- That's it

## License

MIT
