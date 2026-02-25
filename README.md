# 🛡️ Agent Armor

> *Your agent is about to enter the dungeon. Are they ready?*

Agent Armor scans your AI agent's prompt and tells you exactly which power-ups they're missing — before they get wrecked.

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

## ⚔️ Equip Your Weapon

No crafting table needed. Just Node.js 18+.

```bash
git clone https://github.com/DUBSOpenHub/agent-armor.git
cd agent-armor
node agent-armor.js my-agent.md
```

Zero dependencies. Single file. No `npm install`. Pick it up and swing.

## 🗺️ The 6 Dimensions

Think of your AI agent heading into a dungeon.

**Without Agent Armor**, your agent walks in with no shield, no hearts, no fairy in a bottle, and no map. They might survive — but one wrong move and they're done.

**Agent Armor scans your agent and shows you what's missing — so you know exactly which power-ups to grab:**

| Dimension | Zelda Equivalent | What Happens Without It |
|-----------|-----------------|------------------------|
| 🗡️ **Role Clarity** | The Master Sword | Your agent doesn't know what they are — they're swinging a stick |
| 🛡️ **Constraint Density** | Hylian Shield | No rules = no defense. Every bad input gets through |
| 🧚 **Hallucination Guardrails** | Navi saying "Hey! Listen!" | Nobody stops your agent from making up fake treasure maps |
| 📜 **Output Specificity** | Dungeon Map | Without it, your agent wanders — output is random, unstructured |
| 🎯 **Testability** | Target Practice | Can you even tell if your agent hit the bullseye? |
| 💙 **Escape Hatches** | Magic Potion | When your agent dies mid-task, there's nothing to revive them |

**Run the scan. Grab the missing power-ups. Send your agent back in fully armored.**

Each dimension: **0–100**. Composite: **arithmetic mean**.

## 🎮 Quests

### ⚔️ Solo Quest — scan one agent

```bash
node agent-armor.js my-agent.md
```

### 🏰 Dungeon Sweep — scan the whole fleet

```bash
node agent-armor.js --fleet ./agents/
```

```
Rank │ File                    │  Role │ Constraint │ Hallucination │ Output │ Testability │ Escape │ Composite
────┼────────────────────────┼───────┼───────┼───────┼───────┼───────┼───────┼─────
  1 │ grid-medic.agent.md    │    87 │   100 │   100 │    48 │   100 │   100 │   89
  2 │ security-audit.agent.md│    60 │    76 │    68 │    64 │    62 │    40 │   62
  ...
────┼────────────────────────┼───────┼───────┼───────┼───────┼───────┼───────┼─────
    │ MEAN                   │       │       │       │       │       │       │   67
```

### 🏅 Forge a Badge — generate an SVG trophy

```bash
node agent-armor.js my-agent.md --badge badge.svg
```

### 📜 Scroll of Truth — JSON output for CI

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

### 🔮 Mirror of Truth — self-test your Copilot agents

```bash
node agent-armor.js --self-test
```

Scans `~/.copilot/agents/`. Exits 0 if all agents score ≥ 50, exits 1 if any are below. Put it in CI — gate your agents like a dungeon boss.

## 💚 Health Bar

| Score | Hearts | Status |
|-------|--------|--------|
| 0–39 | 🔴🔴🔴 | Critical HP — one hit and they're done |
| 40–69 | 🟡🟡🟡 | Half hearts — survivable but risky |
| 70–100 | 💚💚💚 | Full hearts — ready for the boss fight |

## 🔨 Visit the Blacksmith

Your agent scored low? Here's how to forge upgrades.

### Low on Hallucination Guardrails? 🧚

Add these lines to your agent prompt:
- *"Do not fabricate data or error messages"*
- *"If you are unsure, say so explicitly"*
- *"Only cite verified sources"*

### Low on Escape Hatches? 💙

Add these lines:
- *"If you cannot complete the task, escalate to the user"*
- *"When uncertain, default to read-only mode"*
- *"Fall back to reporting the error without attempting a fix"*

### Low on Output Specificity? 📜

Add these lines:
- *"Format all output as markdown with headings"*
- *"Limit response to a maximum of 100 lines"*
- *"Start your response with a one-line summary"*

Rescan. Watch the hearts fill up. 💚💚💚

## ⚙️ How It Works

No magic. No AI. Just pattern matching. Think of it as a treasure detector — it beeps when it finds the right keywords in your prompt.

It searches for patterns like `"you are"`, `"never"`, `"do not fabricate"`, `"for example"`, `"if you cannot"` and scores based on their presence and density.

**Deterministic**: same file → same score, every time. No RNG in this dungeon.

## 📋 Requirements

- Node.js 18+
- That's it. No side quests.

## License

MIT
