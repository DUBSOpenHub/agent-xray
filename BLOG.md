# I Told AI to Build a Tool. Then I Used That Tool to Improve the AI That Built It.

*How a 19-minute autonomous build created a self-improving loop — and what it means for how we build software now.*

---

## The Experiment

I wanted to know: could AI build a useful tool from scratch — spec to ship — without me writing a single line of code?

Not "help me write some functions." Not "autocomplete my code." I mean: I describe what I want, and six AI agents handle everything — product spec, architecture, implementation, testing, and delivery — while I watch.

So I said this to my terminal:

```
dark factory
```

And described what I wanted: a CLI that scans AI agent prompts and scores them across six dimensions. Think of it as the Scan Visor from Metroid — lock on to your agent's prompt and see if they've got a powered-up suit or if they're walking into Ridley's lair in their Zero Suit.

19 minutes later, I had a working tool. 605 lines of code. 171 tests passing. Zero lines written by me.

But that's not the interesting part.

---

## The Interesting Part

The tool I built — [Agent X-Ray](https://github.com/DUBSOpenHub/agent-xray) — scans AI agent prompts and tells you what's missing. It checks six things:

- 💥 Does the agent know what it is? (**Role Clarity**)
- 🛡️ Does it have rules? (**Constraint Density**)
- 📡 Did you tell it not to make things up? (**Hallucination Guardrails**)
- 🗺️ Does it know what format to respond in? (**Output Specificity**)
- 🎯 Can you tell if it's working? (**Testability**)
- ⚡ Does it know what to do when it's stuck? (**Escape Hatches**)

So naturally, I pointed it at the AI agents that built it.

Their average score? **27 out of 100.**

The tools I trusted to build software autonomously were dropping into hostile territory with no suit upgrades. Half their systems were offline. They worked — but only because they got lucky.

---

## The Loop

Here's where it gets recursive.

I used Agent X-Ray's scores to see exactly what each agent was missing. Low on Hallucination Guardrails? I added lines like *"Do not fabricate data. If unsure, say so explicitly."* Low on Escape Hatches? I added *"If you cannot complete the task, escalate to the user rather than guessing."*

I upgraded all 12 agents. Ran the scan again.

**27 → 67.**

The AI that built the tool got better because of the tool it built. And now, the next time I run Dark Factory, it starts from a stronger foundation — which means the next tool it builds will be better too.

That's not a pipeline. That's a flywheel.

```
Dark Factory → builds Agent X-Ray
                    ↓
         Agent X-Ray → scans the agents
                    ↓
         Scans reveal gaps → agents get upgraded
                    ↓
         Upgraded agents → make Dark Factory stronger
                    ↓
         Stronger factory → builds better tools
                    ↓
                   ...∞
```

---

## How the Factory Works

[Dark Factory](https://github.com/DUBSOpenHub/dark-factory) isn't one AI doing everything. It's six specialists on an assembly line:

1. **Product Manager** — turns my goal into a detailed spec (42 requirements, 17 acceptance criteria)
2. **QA Sealed** — writes acceptance tests *before the engineer sees the spec*, then locks them behind a cryptographic hash
3. **Architect** — designs the system structure
4. **Lead Engineer** — builds the code and their own tests
5. **QA Validator** — opens the sealed envelope and runs *all* tests against the code
6. **Hardening Loop** — fixes failures without ever seeing the test source code

The sealed-envelope part is the key innovation. In most AI coding workflows, the same system writes the code and the tests — which means they share the same blind spots. Dark Factory separates them with a hash lock.

In this build, the sealed tests caught **12 issues** the engineer's own tests missed:
- A command-line parsing bug with `--fleet --json`
- Abbreviated column headers that should have been full words
- A 3-digit hex color that should have been 6 digits

None of these were architectural failures. They were the subtle stuff — the kind of bugs that slip through when the person testing is the same person who built it. The sealed envelope caught them all.

---

## What I Learned

### 1. Zero human code is real now

I didn't write code and ask AI to review it. I didn't scaffold a project and fill in blanks. I described intent, and six agents handled the rest. The code works. The tests pass. It's in production on my machine right now.

This isn't a demo. It's how I build things now.

### 2. Testing AI with AI requires separation

The sealed-envelope pattern matters more than any other architectural choice in the factory. Without it, you get AI that writes code and then writes tests that confirm the code works — circular validation. With it, you get genuine adversarial coverage.

### 3. The recursive loop is the real product

Agent X-Ray is useful on its own. But the fact that it improves the system that created it — that's the breakthrough. Every tool the factory builds can potentially feed back into making the factory better.

### 4. Most AI agents are under-equipped

When I scanned my 12 agents, the average was 27/100. These are agents I use daily. They function fine most of the time — but they're missing suit upgrades, energy tanks, and escape routes. They're dropping into Ridley's lair with half an energy tank and no Varia Suit. They survive — until they don't.

If you're running AI agents, scan them. You'll be surprised how many empty upgrade slots they have.

---

## Try It Yourself

```bash
git clone https://github.com/DUBSOpenHub/agent-xray.git
cd agent-xray
node agent-xray.js --fleet ~/.copilot/agents/
```

One command. Zero dependencies. You'll get a score for every agent in your fleet, and you'll know exactly what to fix.

The scores use energy indicators:

```
  💥 Role Clarity             [ 75] ████████████████████░░░  🟢🟢🟢🟢⬛
  📡 Hallucination Guardrails [ 26] ████████░░░░░░░░░░░░░░  🔴⬛⬛⬛⬛
```

If your composite is under 50: ⚠️ *Suit incomplete. Visit the Chozo Statue.*

The README tells you exactly which lines to add for each dimension. Paste them into your agent prompt, rescan, watch the energy tanks fill up.

---

## The Numbers

| Metric | Value |
|--------|-------|
| Time from goal to working CLI | 19 minutes |
| Lines of production code | 605 |
| Tests (open + sealed) | 171 |
| Sealed tests that caught blind spots | 12 |
| Final gap score | 0% |
| Human lines of code written | 0 |
| Fleet improvement | 27 → 67 (+148%) |

---

## What's Changed Since v1

The factory built v1. Then I kept building on top of it. Three additions that changed how the tool works:

### 🎯 Anti-Gaming (Keyword Density Ratio)

Someone could have written `"never never never never never"` and scored 100 on Constraint Density. That's not a well-constrained agent — that's a keyword-stuffed prompt with nothing real behind it.

v1.1 added a density ratio: keywords in thin sentences (under 10 words) get penalized. A sentence like *"Never."* scores 0.3x. A sentence like *"Never perform destructive operations without explicit user confirmation."* scores full credit. A gaming prompt that scored 98 under v1 now scores 1.

The Scan Visor got smarter. It doesn't just detect keywords — it checks if they're doing real work.

### 🔧 Scoring Profiles (`--profile`)

Not every agent needs the same suit. A security-focused agent needs stronger Hallucination Guardrails (2x weight) and Constraint Density (1.5x). A creative writing agent needs Role Clarity (1.5x) but can relax constraints (0.5x). A CI pipeline gate needs Testability cranked to 2x.

Five built-in profiles: `balanced`, `security`, `creative`, `ci-gate`, `assistant`. Same scan, different lens.

```bash
node agent-xray.js my-agent.md --profile security
```

### 🔬 Strict Mode (`--strict`)

The base scan is deterministic pattern matching — fast, repeatable, no API key needed. But patterns can only tell you *if* a keyword is there, not *if it's any good*.

Strict mode sends matched excerpts to an OpenAI-compatible LLM for semantic evaluation. It asks: is this hallucination guardrail actually effective, or is it vague hand-waving? Requires `OPENAI_API_KEY`, graceful fallback without it.

```bash
node agent-xray.js my-agent.md --strict
```

The v1 numbers in this post (605 lines, 171 tests, 19 minutes) are the factory's output. The tool has grown since then — but the foundation the factory laid is still the core.

---

## What's Next

The flywheel keeps spinning. Every agent upgrade makes the factory stronger. Every factory build is a chance to create new tools that feed back into the loop.

The question isn't whether AI can build software anymore. It can. The question is: **what happens when the software it builds makes the AI better?**

We're about to find out.

---

*Built with [Dark Factory](https://github.com/DUBSOpenHub/dark-factory). Scanned with [Agent X-Ray](https://github.com/DUBSOpenHub/agent-xray). Created by [DUBSOpenHub](https://github.com/DUBSOpenHub).* 🏭🔬
