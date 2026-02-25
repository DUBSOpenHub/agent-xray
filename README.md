# 🛡️ Agent Armor

> *Your agent is about to enter the dungeon. Are they ready?*

Agent Armor scans your AI agent's prompt and tells you exactly which power-ups they're missing — before they get wrecked.

```
node agent-armor.js my-agent.md
```

```
🛡️  agent-armor: my-agent.md  (1848 words)

  🗡️ Role Clarity               [ 75] ███████████████████████░░░░░░░  💚💚💚💚🖤
  🛡️ Constraint Density         [ 70] █████████████████████░░░░░░░░░  💚💚💚💚🖤
  🧚 Hallucination Guardrails   [ 26] ████████░░░░░░░░░░░░░░░░░░░░░░  🔴🖤🖤🖤🖤
  📜 Output Specificity         [ 48] ██████████████░░░░░░░░░░░░░░░░  🟡🟡🖤🖤🖤
  🎯 Testability                [ 31] █████████░░░░░░░░░░░░░░░░░░░░░  🔴🔴🖤🖤🖤
  💙 Escape Hatches             [ 12] ████░░░░░░░░░░░░░░░░░░░░░░░░░░  🔴🖤🖤🖤🖤
  ────────────────────────────────────────────────────────────────────────
  ⚔️  Composite                  [ 44] █████████████░░░░░░░░░░░░░░░░░  🟡🟡🖤🖤🖤

  ⚠️  Under-leveled. Visit the blacksmith.
```

## Why This Tool?

Ever send your agent on a quest and they come back with completely made-up answers? Or freeze when they hit something unexpected? That's an agent with no armor.

Agent Armor checks whether your agent is actually equipped for battle. Did you tell them not to make things up? That's their 🧚 Navi. Did you tell them what to do when they're stuck? That's their 💙 Magic Potion. Did you define their output format? That's their 📜 Dungeon Map.

Most agents ship with half their inventory empty. They work — until they don't. Agent Armor shows you the empty slots so you can fill them before your agent face-plants in production.

Scan. Upgrade. Rescan. Full hearts. 💚💚💚

## 🚀 Quick Start

```bash
git clone https://github.com/DUBSOpenHub/agent-armor.git
cd agent-armor
node agent-armor.js --fleet ~/.copilot/agents/
```

That's it. One command scans your entire agent fleet. No dependencies. No setup. Just answers.

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

## 🎮 More Quests

### ⚔️ Scan one agent

```bash
node agent-armor.js my-agent.md
```

### 🏅 Forge a Badge

```bash
node agent-armor.js my-agent.md --badge badge.svg
```

### 📜 JSON output for CI

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

---

🏭 **Built with [Dark Factory](DARK-FACTORY.md)** — 6 AI agents, sealed-envelope testing, 0% gap score. [Read the build log →](DARK-FACTORY.md)

---

## 🐙 Built with Love

Created with 💜 by [DUBSOpenHub](https://github.com/DUBSOpenHub) to help more people discover the joy of GitHub Copilot CLI.

Let's build! 🚀✨
