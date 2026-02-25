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

And described what I wanted: a CLI that scans AI agent prompts and scores them across six dimensions. Think of it as an inventory check before your agent enters the dungeon — do they have a sword, a shield, a map, and a potion? Or are they walking in empty-handed?

19 minutes later, I had a working tool. 605 lines of code. 171 tests passing. Zero lines written by me.

But that's not the interesting part.

---

## The Interesting Part

The tool I built — [Agent Armor](https://github.com/DUBSOpenHub/agent-armor) — scans AI agent prompts and tells you what's missing. It checks six things:

- 🗡️ Does the agent know what it is? (**Role Clarity**)
- 🛡️ Does it have rules? (**Constraint Density**)
- 🧚 Did you tell it not to make things up? (**Hallucination Guardrails**)
- 📜 Does it know what format to respond in? (**Output Specificity**)
- 🎯 Can you tell if it's working? (**Testability**)
- 💙 Does it know what to do when it's stuck? (**Escape Hatches**)

So naturally, I pointed it at the AI agents that built it.

Their average score? **27 out of 100.**

The tools I trusted to build software autonomously were walking into battle with no armor. Half their inventory was empty. They worked — but only because they got lucky.

---

## The Loop

Here's where it gets recursive.

I used Agent Armor's scores to see exactly what each agent was missing. Low on Hallucination Guardrails? I added lines like *"Do not fabricate data. If unsure, say so explicitly."* Low on Escape Hatches? I added *"If you cannot complete the task, escalate to the user rather than guessing."*

I upgraded all 12 agents. Ran the scan again.

**27 → 67.**

The AI that built the tool got better because of the tool it built. And now, the next time I run Dark Factory, it starts from a stronger foundation — which means the next tool it builds will be better too.

That's not a pipeline. That's a flywheel.

```
Dark Factory → builds Agent Armor
                    ↓
         Agent Armor → scores the agents
                    ↓
         Scores reveal gaps → agents get upgraded
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

Agent Armor is useful on its own. But the fact that it improves the system that created it — that's the breakthrough. Every tool the factory builds can potentially feed back into making the factory better.

### 4. Most AI agents are under-equipped

When I scanned my 12 agents, the average was 27/100. These are agents I use daily. They function fine most of the time — but they're missing shields, potions, and escape routes. They're walking into boss fights with half a heart and no armor. They survive — until they don't.

If you're running AI agents, scan them. You'll be surprised how many empty slots they have.

---

## Try It Yourself

```bash
git clone https://github.com/DUBSOpenHub/agent-armor.git
cd agent-armor
node agent-armor.js --fleet ~/.copilot/agents/
```

One command. Zero dependencies. You'll get a score for every agent in your fleet, and you'll know exactly what to fix.

The scores use hearts:

```
  🗡️ Role Clarity             [ 75] ████████████████████░░░  💚💚💚💚🖤
  🧚 Hallucination Guardrails [ 26] ████████░░░░░░░░░░░░░░  🔴🖤🖤🖤🖤
```

If your composite is under 50: ⚠️ *Under-leveled. Visit the blacksmith.*

The README tells you exactly which lines to add for each dimension. Paste them into your agent prompt, rescan, watch the hearts fill up.

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

## What's Next

The flywheel keeps spinning. Every agent upgrade makes the factory stronger. Every factory build is a chance to create new tools that feed back into the loop.

The question isn't whether AI can build software anymore. It can. The question is: **what happens when the software it builds makes the AI better?**

We're about to find out.

---

*Built with [Dark Factory](https://github.com/DUBSOpenHub/dark-factory). Scanned with [Agent Armor](https://github.com/DUBSOpenHub/agent-armor). Created by [DUBSOpenHub](https://github.com/DUBSOpenHub).* 🏭🛡️
