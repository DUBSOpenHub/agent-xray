# 🔬 Agent X-Ray

> *Your agent is about to drop onto a hostile planet. What's their suit status?*

Agent X-Ray scans your AI agent's prompt and reveals exactly which suit upgrades they're missing — before they get wrecked by Space Pirates.

🏭 **Built with [Dark Factory](https://github.com/DUBSOpenHub/dark-factory)** — 6 AI agents, sealed-envelope testing, 0% gap score. [Read the build log →](DARK-FACTORY.md)

```
node agent-xray.js my-agent.md
```

```
🔬  agent-xray: my-agent.md  (1848 words)

  💥 Role Clarity               [ 75] ███████████████████████░░░░░░░  🟢🟢🟢🟢⬛
  🛡️ Constraint Density         [ 70] █████████████████████░░░░░░░░░  🟢🟢🟢🟢⬛
  📡 Hallucination Guardrails   [ 26] ████████░░░░░░░░░░░░░░░░░░░░░░  🔴⬛⬛⬛⬛
  🗺️ Output Specificity         [ 48] ██████████████░░░░░░░░░░░░░░░░  🟡🟡⬛⬛⬛
  🎯 Testability                [ 31] █████████░░░░░░░░░░░░░░░░░░░░░  🔴🔴⬛⬛⬛
  ⚡ Escape Hatches             [ 12] ████░░░░░░░░░░░░░░░░░░░░░░░░░░  🔴⬛⬛⬛⬛
  ────────────────────────────────────────────────────────────────────────
  🔬  Composite                  [ 44] █████████████░░░░░░░░░░░░░░░░░  🟡🟡⬛⬛⬛

  ⚠️  Suit incomplete. Visit the Chozo Statue.
```

## Why This Tool?

Ever send your agent on a mission and they come back with completely fabricated data? Or freeze when they hit something unexpected? That's an agent with no suit upgrades.

Agent X-Ray activates the **Scan Visor** on your agent's prompt. Did you tell them not to make things up? That's their 📡 Scan Visor — separating real data from hallucinations. Did you tell them what to do when they're stuck? That's their ⚡ Energy Tank — keeping them alive when things go sideways. Did you define their output format? That's their 🗺️ Area Map — so they don't wander through uncharted territory.

Most agents ship with half their suit systems offline. They work — until they don't. Agent X-Ray reveals the empty upgrade slots so you can power up before your agent gets space-wrecked in production.

Scan. Upgrade. Rescan. Full energy. 🟢🟢🟢

## 🚀 Quick Start

```bash
git clone https://github.com/DUBSOpenHub/agent-xray.git
cd agent-xray
node agent-xray.js --fleet ~/.copilot/agents/
```

That's it. One command scans your entire agent fleet. No dependencies. No setup. Just answers.

## 🗺️ The 6 Dimensions

Think of your AI agent dropping onto a hostile planet.

**Without Agent X-Ray**, your agent lands with no beam weapon, no suit shielding, no scan visor, and no map data. They might survive — but one ambush from a Space Pirate and they're done.

**Agent X-Ray activates the Scan Visor on your prompt and shows you what's missing — so you know exactly which upgrades to grab:**

| Dimension | Metroid Equivalent | What Happens Without It |
|-----------|-------------------|------------------------|
| 💥 **Role Clarity** | Power Beam | Your agent has no primary weapon — they're punching Space Pirates bare-handed |
| 🛡️ **Constraint Density** | Varia Suit | No shielding = no defense. Every bad input burns through |
| 📡 **Hallucination Guardrails** | Scan Visor | Nobody stops your agent from fabricating fake scan data |
| 🗺️ **Output Specificity** | Area Map | Without it, your agent wanders — output is random, uncharted |
| 🎯 **Testability** | Lock-On Targeting | Can you even tell if your agent hit the target? |
| ⚡ **Escape Hatches** | Energy Tank | When your agent takes a critical hit mid-task, there's nothing to keep them alive |

**Run the scan. Grab the missing upgrades. Send your agent back in with a fully powered suit.**

Each dimension: **0–100**. Composite: **arithmetic mean**.

## 🎮 More Missions

### 🔬 Scan one agent

```bash
node agent-xray.js my-agent.md
```

### 🏅 Forge a Badge

```bash
node agent-xray.js my-agent.md --badge badge.svg
```

### 📡 JSON output for CI

```bash
node agent-xray.js my-agent.md --json
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

### 🔮 X-Ray Scope — self-test your Copilot agents

```bash
node agent-xray.js --self-test
```

Scans `~/.copilot/agents/`. Exits 0 if all agents score ≥ 50, exits 1 if any are below. Put it in CI — gate your agents like Mother Brain.

## ⚡ Energy Meter

| Score | Energy | Status |
|-------|--------|--------|
| 0–39 | 🔴🔴🔴 | Critical energy — one hit from a Space Pirate and they're done |
| 40–69 | 🟡🟡🟡 | Partial suit — survivable but vulnerable |
| 70–100 | 🟢🟢🟢 | Full power — ready for Ridley |

## 🏛️ Visit the Chozo Statue

Your agent scored low? Here's how to acquire upgrades.

### Low on Hallucination Guardrails? 📡

Add these lines to your agent prompt:
- *"Do not fabricate data or error messages"*
- *"If you are unsure, say so explicitly"*
- *"Only cite verified sources"*

### Low on Escape Hatches? ⚡

Add these lines:
- *"If you cannot complete the task, escalate to the user"*
- *"When uncertain, default to read-only mode"*
- *"Fall back to reporting the error without attempting a fix"*

### Low on Output Specificity? 🗺️

Add these lines:
- *"Format all output as markdown with headings"*
- *"Limit response to a maximum of 100 lines"*
- *"Start your response with a one-line summary"*

Rescan. Watch the energy tanks fill up. 🟢🟢🟢

### 📂 Where are my agent files?

| Platform | Path |
|----------|------|
| Copilot CLI agents | `~/.copilot/agents/*.agent.md` |
| Repo-level instructions | `.github/copilot-instructions.md` |
| Custom agents (repo) | `.github/agents/*.md` |

Open the file, paste the lines above, save, rescan. That's it.

## ⚙️ How It Works

No magic. No AI. Just pattern matching. Think of it as the Scan Visor — it locks on to keywords in your prompt and tells you what's really there.

It searches for patterns like `"you are"`, `"never"`, `"do not fabricate"`, `"for example"`, `"if you cannot"` and scores based on their presence and density.

**Deterministic**: same file → same score, every time. No RNG on this space station.

## 📋 Requirements

- Node.js 18+
- That's it. No side missions.

## License

MIT

---

🏭 **Built with [Dark Factory](https://github.com/DUBSOpenHub/dark-factory)** — 6 AI agents, sealed-envelope testing, 0% gap score. [Read the build log →](DARK-FACTORY.md)

---

## 🐙 Built with Love

Created with 💜 by [DUBSOpenHub](https://github.com/DUBSOpenHub) to help more people discover the joy of GitHub Copilot CLI.

Let's build! 🚀✨
