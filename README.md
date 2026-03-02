# 🔬 Agent X-Ray

> *Your agent is about to drop onto a hostile planet. What's their suit status?*

Agent X-Ray scans your AI agent's prompt and reveals exactly which suit upgrades they're missing — before they get wrecked by Space Pirates.

📝 **[Learn more about Agent X-Ray by reading the blog post →](BLOG.md)** *"I Didn't Pick the Idea. I Didn't Write the Code. Here's What I Learned."* — More about Agent X-Ray and how it was built: 14 AI models competing for the idea, Dark Factory assembling it in 19 minutes, and the accidental recursive loop that followed.

---

🌍 **Works in any terminal.** Scans any `.md` agent prompt — Copilot, ChatGPT, Claude, LangChain, CrewAI, or your own custom agents. Zero dependencies. Just Node.js.

🏭 **v1.0 built with [Dark Factory](https://github.com/DUBSOpenHub/dark-factory)** — 6 AI agents, [sealed-envelope testing](https://github.com/DUBSOpenHub/shadow-score-spec), 0% gap score. [Read the build log →](DARK-FACTORY.md)

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

> ⚡ **Get started fast!** Clone and run in one line:
> ```bash
> git clone https://github.com/DUBSOpenHub/agent-xray.git && cd agent-xray && node agent-xray.js my-agent.md
> ```

## Why This Tool?

Ever send your agent on a mission and they come back with completely fabricated data? Or freeze when they hit something unexpected? That's an agent with no suit upgrades.

Agent X-Ray activates the **Scan Visor** on your agent's prompt. Did you tell them not to make things up? That's their 📡 Scan Visor — separating real data from hallucinations. Did you tell them what to do when they're stuck? That's their ⚡ Energy Tank — keeping them alive when things go sideways. Did you define their output format? That's their 🗺️ Area Map — so they don't wander through uncharted territory.

Most agents ship with half their suit systems offline. They work — until they don't. Agent X-Ray reveals the empty upgrade slots so you can power up before your agent gets space-wrecked in production.

Scan. Upgrade. Rescan. Full energy. 🟢🟢🟢

## 🚀 Quick Start

```bash
git clone https://github.com/DUBSOpenHub/agent-xray.git
cd agent-xray

# Scan any agent prompt
node agent-xray.js path/to/my-agent.md

# Scan an entire folder of agents
node agent-xray.js --fleet ~/.copilot/agents/
```

That's it. Point it at any `.md` file with agent instructions. No dependencies. No setup. Just answers.

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

Your agent scored low? The Chozo have left upgrades for you.

```
      ┌───┐
      │ ◆ │
    ┌─┘   └─┐
    │ ◄███► │
    │  ╱ ╲  │
    └─╱   ╲─┘

    ♪ da da da DA DAAAA ♪
```

Paste the lines below into your agent prompt. Each one powers up a different suit system.

---

### 💥 POWER BEAM ACQUIRED — Role Clarity

- *"You are a [specific role]. Your job is to [specific task]."*
- *"Your responsibilities include [list]. You do not handle [exclusions]."*
- *"Act as an expert in [domain]."*

### 🛡️ VARIA SUIT ACQUIRED — Constraint Density

- *"Never perform destructive operations without confirmation."*
- *"You must stay within the scope of [boundary]."*
- *"Do not access files outside the current working directory."*

### 📡 SCAN VISOR ACQUIRED — Hallucination Guardrails

- *"Do not fabricate data or error messages."*
- *"If you are unsure, say so explicitly."*
- *"Only cite verified sources."*

### 🗺️ AREA MAP ACQUIRED — Output Specificity

- *"Format all output as markdown with headings."*
- *"Limit response to a maximum of 100 lines."*
- *"Start your response with a one-line summary."*

### 🎯 LOCK-ON ACQUIRED — Testability

- *"Given input X, the expected output is Y."*
- *"For example: if asked to [task], respond with [format]."*
- *"The output should be deterministic — same input, same result."*

### ⚡ ENERGY TANK ACQUIRED — Escape Hatches

- *"If you cannot complete the task, escalate to the user."*
- *"When uncertain, default to read-only mode."*
- *"Fall back to reporting the error without attempting a fix."*

---

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
- macOS, Linux, or Windows
- Works in any terminal — no GitHub Copilot CLI required
- That's it. No side missions.

## License

MIT

---

🏭 **v1.0 built with [Dark Factory](https://github.com/DUBSOpenHub/dark-factory)** — 6 AI agents, [sealed-envelope testing](https://github.com/DUBSOpenHub/shadow-score-spec), 0% gap score. [Read the build log →](DARK-FACTORY.md)

---

## 🐙 Built with Love

🐙 Built with Love

Let's build! 🚀✨
