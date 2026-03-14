# Agents

## Overview
Agent X-Ray is a Node.js CLI tool (no dependencies) that statically analyses AI agent prompt files and scores them across 6 quality dimensions. It is not itself a Copilot CLI agent/skill, but it is a developer tool for auditing any `.md` agent prompt — Copilot, ChatGPT, Claude, LangChain, CrewAI, or custom.

## Available Agents

### agent-xray (CLI tool)
- **Purpose**: Scans one or more agent prompt Markdown files and emits a scored report across 6 dimensions: Role Clarity, Constraint Density, Hallucination Guardrails, Output Specificity, Testability, and Escape Hatches.
- **Usage**:
  ```bash
  # Scan a single agent prompt
  node agent-xray.js path/to/my-agent.md

  # Scan an entire agents directory
  node agent-xray.js --fleet ~/.copilot/agents/
  ```
- **Model**: N/A — static analysis, no LLM calls

## Scored Dimensions

| Dimension | What it checks |
|-----------|----------------|
| 💥 Role Clarity | Whether the agent has a clear primary purpose/identity |
| 🛡️ Constraint Density | Guardrails that prevent out-of-scope behaviour |
| 📡 Hallucination Guardrails | Instructions to avoid fabricating data |
| 🗺️ Output Specificity | Defined output format/structure |
| 🎯 Testability | Whether outputs can be verified against intent |
| ⚡ Escape Hatches | Fallback behaviour when the agent hits unexpected situations |

## Configuration
- No dependencies — requires only Node.js.
- Run `node agent-xray.js --help` for all flags.
- Built with [Dark Factory](https://github.com/DUBSOpenHub/dark-factory); build log in `DARK-FACTORY.md`.
