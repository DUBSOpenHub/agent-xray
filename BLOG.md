# I Let AI Build a Tool. Then I Used That Tool to Improve the AI That Built It.

*How a 19-minute autonomous build turned into a self-improving loop, and what I learned along the way.*

---

## The Experiment

I was curious: could AI build a useful tool from scratch, spec to ship, without me writing a single line of code?

Not "help me write some functions." Not "autocomplete my code." I wanted to see what would happen if AI picks the idea, AI builds it, and I just watch.

So I started by not even choosing what to build.

I ran [Havoc Hackathon](https://github.com/DUBSOpenHub/agent-xray), a multi-model tournament that pits up to 14 AI models against each other in elimination heats. I gave them one prompt: *"What's the most attention-grabbing demo project to build with Dark Factory?"* No hints. No guidance. Just compete.

14 models entered. 4 heats. Sealed judge panels scored each pitch on hook, clarity, visual output, Dark Factory fit, and feasibility. The pitches ranged from adversarial benchmarks to self-diagnosing auditors to PR security scanners.

The winner? **Claude Opus 4.6 (1M context)** with a pitch called **Prompt X-Ray**: a CLI that scans AI agent prompts across 6 dimensions and tells you what's missing. Score: 42/50. The self-referential twist is what sold it: *point the tool at the agents that built it and see what happens*.

I didn't pick the idea. I didn't refine the idea. I took the winning pitch and handed it straight to Dark Factory:

```
dark factory
```

Think of it as the Scan Visor from Metroid. Lock on to your agent's prompt and see if they've got a powered-up suit or if they're walking into Ridley's lair in their Zero Suit.

19 minutes later, I had a working tool. 605 lines of code. 171 tests passing. Zero lines written by me.

But that's not the interesting part.

---

## What Surprised Me

The tool the factory built, [Agent X-Ray](https://github.com/DUBSOpenHub/agent-xray), scans AI agent prompts and tells you what's missing. It checks six things:

- 💥 Does the agent know what it is? (**Role Clarity**)
- 🛡️ Does it have rules? (**Constraint Density**)
- 📡 Did you tell it not to make things up? (**Hallucination Guardrails**)
- 🗺️ Does it know what format to respond in? (**Output Specificity**)
- 🎯 Can you tell if it's working? (**Testability**)
- ⚡ Does it know what to do when it's stuck? (**Escape Hatches**)

So naturally, I pointed it at the AI agents that built it.

Their average score? **27 out of 100.**

The tools I'd been trusting to build software autonomously were dropping into hostile territory with no suit upgrades. Half their systems were offline. They worked, but I suspect partly because they got lucky.

---

## The Loop

Here's where it gets recursive.

I used Agent X-Ray's scores to see exactly what each agent was missing. Low on Hallucination Guardrails? I added lines like *"Do not fabricate data. If unsure, say so explicitly."* Low on Escape Hatches? I added *"If you cannot complete the task, escalate to the user rather than guessing."*

I upgraded all 12 agents. Ran the scan again.

**27 → 67.**

The AI that built the tool got better because of the tool it built. In theory, the next time I run Dark Factory, it starts from a stronger foundation. The next tool it builds should be better too.

I didn't plan for that. It just fell out of the experiment.

```
Havoc Hackathon → 14 models compete → winning idea
                                          ↓
                    Dark Factory → builds Agent X-Ray (19 min)
                                          ↓
                              Agent X-Ray → scans the agents
                                          ↓
                              Scans reveal gaps → agents get upgraded
                                          ↓
                    Upgraded agents power both Hackathon AND Factory
                                          ↓
                              Better agents → better ideas → better tools
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

The sealed-envelope part is the most interesting design choice. In most AI coding workflows, the same system writes the code and the tests, so they share the same blind spots. Dark Factory separates them with a hash lock. (The concept is formalized as the [Shadow Score](https://github.com/DUBSOpenHub/shadow-score-spec).)

In this build, the sealed tests caught **12 issues** the engineer's own tests missed:
- A command-line parsing bug with `--fleet --json`
- Abbreviated column headers that should have been full words
- A 3-digit hex color that should have been 6 digits

None of these were architectural failures. They were the subtle stuff, the kind of bugs that slip through when the person testing is the same person who built it. The sealed envelope caught them all.

---

## What I Learned

### 1. This is further along than I expected

I didn't write code and ask AI to review it. I didn't scaffold a project and fill in blanks. I didn't even pick what to build. 14 models competed for the idea, six agents built it, and the result actually works. It's in production on my machine right now.

I started this to see what was possible. Turns out it's further along than I thought.

### 2. Testing AI with AI only works if you separate them

The [sealed-envelope pattern](https://github.com/DUBSOpenHub/shadow-score-spec) matters more than any other architectural choice in the factory. Without it, you get AI that writes code and then writes tests that confirm the code works. Circular validation. With it, you get genuine adversarial coverage.

### 3. The recursive loop was an accident

Agent X-Ray is useful on its own. But I didn't set out to build a self-improving loop. It just turned out that the obvious next step after building a prompt scanner was to scan your own prompts. And once you do that, things start feeding back into each other. That was the most fun part of the whole experiment.

### 4. Most AI agents are under-equipped

When I scanned my 12 agents, the average was 27/100. These are agents I use daily. They function fine most of the time, but they're missing suit upgrades, energy tanks, and escape routes. I had no idea how many gaps were hiding in plain sight.

If you're running AI agents, try scanning them. I was surprised.

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
| Models competing for the idea | 14 |
| Winning pitch score | 42/50 |
| Time from goal to working CLI | 19 minutes |
| Lines of production code | 605 |
| Tests (open + sealed) | 171 |
| Sealed tests that caught blind spots | 12 |
| Final gap score | 0% |
| Human lines of code written | 0 |
| Human idea selection | 0 |
| Fleet improvement | 27 → 67 (+148%) |

---

## What's Changed Since v1

The factory built v1. Then I kept building on top of it. Three additions that changed how the tool works:

### 🎯 Anti-Gaming (Keyword Density Ratio)

Someone could have written `"never never never never never"` and scored 100 on Constraint Density. That's not a well-constrained agent. That's a keyword-stuffed prompt with nothing real behind it.

v1.1 added a density ratio: keywords in thin sentences (under 10 words) get penalized. A sentence like *"Never."* scores 0.3x. A sentence like *"Never perform destructive operations without explicit user confirmation."* scores full credit. A gaming prompt that scored 98 under v1 now scores 1.

The Scan Visor got smarter. It doesn't just detect keywords. It checks if they're doing real work.

### 🔧 Scoring Profiles (`--profile`)

Not every agent needs the same suit. A security-focused agent needs stronger Hallucination Guardrails (2x weight) and Constraint Density (1.5x). A creative writing agent needs Role Clarity (1.5x) but can relax constraints (0.5x). A CI pipeline gate needs Testability cranked to 2x.

Five built-in profiles: `balanced`, `security`, `creative`, `ci-gate`, `assistant`. Same scan, different lens.

```bash
node agent-xray.js my-agent.md --profile security
```

### 🔬 Strict Mode (`--strict`)

The base scan is deterministic pattern matching. Fast, repeatable, no API key needed. But patterns can only tell you *if* a keyword is there, not *if it's any good*.

Strict mode sends matched excerpts to an OpenAI-compatible LLM for semantic evaluation. It asks: is this hallucination guardrail actually effective, or is it vague hand-waving? Requires `OPENAI_API_KEY`, graceful fallback without it.

```bash
node agent-xray.js my-agent.md --strict
```

The v1 numbers in this post (605 lines, 171 tests, 19 minutes) are the factory's output. The tool has grown since then, but the foundation the factory laid is still the core.

---

## What's Next

I'm still exploring. Agent X-Ray now scans the agents that power both [Havoc Hackathon](https://github.com/DUBSOpenHub/agent-xray) and [Dark Factory](https://github.com/DUBSOpenHub/dark-factory), the same two systems that created it. The hackathon models get scanned and upgraded. The factory agents get scanned and upgraded. Both systems get a little stronger each time.

I didn't set out to build a closed loop. I just kept following the curiosity: what if I scan *these* agents? What if I upgrade *those*? Each step taught me something new about how these systems actually work under the hood.

The question I started with was whether AI could build a useful tool on its own. It can. The question I'm sitting with now is: **what happens when you keep pulling on that thread?**

I'm still finding out.

---

*Idea by [Havoc Hackathon](https://github.com/DUBSOpenHub/agent-xray). Built with [Dark Factory](https://github.com/DUBSOpenHub/dark-factory). Scanned with [Agent X-Ray](https://github.com/DUBSOpenHub/agent-xray). Created by [DUBSOpenHub](https://github.com/DUBSOpenHub).* 🏟️🏭🔬
