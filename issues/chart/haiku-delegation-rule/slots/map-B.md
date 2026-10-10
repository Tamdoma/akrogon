# Map B: haiku-delegation-rule

Slot B, blind, 2026-10-10. Surfaces read: `~/.claude/rules/haiku.md`, `~/.claude/CLAUDE.md`, INTAKE.md, questions.md, SKILL.md Drain. Transcript probe: `~/.claude/projects/*/subagents/*.meta.json` since 2026-10-09 (3 haiku spawns, all framework, all "Summarize ... tests"; 0 in akrogon; no `~/.claude/agents/` directory exists).

## Summary position

The rule failed for a structural reason before a wording reason. The main model reads files with `cat`, `grep`, `sed -n` and `Read` as its default move, and the rule asks it to weigh an exception every time. Anthropic's own docs say CLAUDE.md is "context, not enforced configuration" and that current models over-trigger on firm wording. So the fix is two parts: one structural change that makes the cheap path also the Haiku path, and a short rewrite that removes the self-judged exits. A3 and A5 are right. A4 is right in intent and wrong in wording. A6 is the wrong shape: a numeric tool-call trigger invites over-delegation and will rot.

## Material forks

### F1. Where the lever sits: rule text only, or rule text plus an Explore override

Context. Claude Code ships a built-in `Explore` subagent. Per the sub-agents doc, when the main conversation runs Fable, Explore runs on Opus, not Haiku. A user-level file `~/.claude/agents/Explore.md` with `model: haiku` "overrides the built-in and keeps its own model field". No such directory exists on this machine. Every one of the 3 Haiku spawns in 24 hours was the main model passing `model: haiku` by hand.

- **1a (pick): both.** Add `~/.claude/agents/Explore.md` with `model: haiku`, read-only tools, and a description that says it is the retrieval agent. Then haiku.md only has to say "use Explore" instead of "spawn a subagent with model haiku". Reason: it removes one decision from the main model (which model) and makes the built-in path the Haiku path. The system prompt already tells the main model to "delegate that and keep the conclusion" for cross-file reads, so Explore is the hook the harness already pulls on. Cost: one more file to maintain, and a user-level agent description costs a few hundred tokens of context per session. Scope note: the intake names one destination, haiku.md. This adds a second file in the same `~/.claude` tree. The operator must agree to widen by one file or the pick falls back to 1b.
- **1b: rule text only.** Rewrite haiku.md and leave Explore on Opus. Cost: the main model must remember to pass `model: haiku` on every spawn, which is the exact step it skipped. Any Explore call it makes "naturally" runs on Opus and the operator's count stays near zero.
- **1c: `CLAUDE_CODE_SUBAGENT_MODEL=haiku`.** Rejected. It sets the model for every subagent with no model field, including implement-issue workers and review judges. That is the out-of-scope outcome the operator ruled out.

What 1a could break later: akrogon skills never reference the Explore type (grep of `skills/` found none), so lifecycle work is unaffected. If a future skill spawns Explore for reasoning-heavy review, it will land on Haiku. Mitigation: the Explore description states what it does and skills name their own agent type.

### F2. The trigger: a judgment question, a numeric threshold, or a task-shape rule

Context. Today's opening line is a question ("is this wasting a stronger model?"). The main model answered it in its own favour both times. A6 proposes "more than 3 files, 3 search commands, or any web fetch". Anthropic's prompting page says current models "may spawn subagents for code exploration when a direct grep call is faster and sufficient" and that aggressive wording causes over-triggering. The Fable page says to steer with "a brief instruction rather than enumerating each behavior".

- **2a (pick): task-shape rule, no counts.** State the delegated shapes as a closed list and say the main model does not read them itself: "answering a question whose answer is in files or pages you have not opened", "finding where something is implemented", "summarizing a file, log, or page", "pulling facts from more than one file". Then two kept cases: "you are about to edit the file" and "the file is already in your context". Reason: shapes match how the model classifies a task before it acts. Counts are checked after the fact, when the reads are already done. Cost: still a judgment at the edges, but a narrower one.
- **2b: A6 numeric trigger.** Rejected. Three failure modes. First, the model cannot know it will exceed 3 files until it has read 3. Second, "any web fetch" pushes one-URL lookups through a subagent that must then also fetch, which doubles latency for no saving. Third, it conflicts with the harness line that says "do the work yourself when it is a handful of tool calls or a lookup whose target you already know". Two instructions in conflict means the model "may pick one arbitrarily" (memory doc).
- **2c: keep the question, add "if in doubt, delegate".** Rejected. The prompting page names "If in doubt, use [tool]" as a known over-trigger pattern.

### F3. The cost exception (A3)

Context. "Skip delegation if the task needs back-and-forth with me or the hand-off costs more than doing it." The transcript shows the model used the cost half both times.

- **3a (pick): delete the cost half, keep the back-and-forth half.** A3 is right. Reason: a self-judged cost comparison is the exit that fired. The back-and-forth case is a real one (the user is answering questions live). Cost: a few more hand-offs on tiny reads. That is the operator's stated preference.
- **3b: keep it with a floor** ("unless the whole read is under N lines"). Rejected for the same reason as A6: numbers rot and get argued.

### F4. The re-read line (A4)

Context. "Before a decision, re-read the cited lines yourself." The model read this as double work. A4 rewrites it to "spot-check only the cited lines your decision depends on" and adds "this is never a reason to skip delegation".

- **4a (pick): keep the spot-check, drop the second sentence.** Reason: A4's first sentence fixes the real problem (it reads as re-reading everything). The second sentence is argumentative text addressed to the model about its own excuses. The Fable page says brief instructions steer better than enumerated counter-arguments, and the model will just find the next exit. Cost: none.
- **4b: A4 as written.** Acceptable. Cost: one sentence of rule rot that only makes sense to someone who read this chart.
- **4c: delete the re-read line.** Rejected. Wrong facts reaching a decision is the risk the operator should care about most. Haiku's path:line citations are the cheap verification surface. Removing the check invites silent errors.

### F5. Retrieval inside kept work (A5)

Context. "Keep for yourself: planning, hard debugging, design, final review" absorbed the reads done during a plan-issue position.

- **5a (pick): A5, merged into the Keep line, not added as a new line.** Rewrite to "Keep the judgment: planning, hard debugging, design, final review, and talking with me. The reading those need still goes to Haiku." Reason: one line, same place, no new section. Cost: none.
- **5b: A5 as a separate sentence elsewhere.** Works, slightly more text.

### F6. Hard enforcement or none

Context. The memory doc says to block an action regardless of what Claude decides, use a PreToolUse hook. A hook on Read or Bash could count reads and return a reminder via `additionalContext`.

- **6a (pick): none now.** Reason: a hook that nags on every `cat` fires inside implement-issue workers and merge checks too, and would need its own exclusion logic. The operator asked for an .md change. Cost: the rule stays advisory. Measure first: if the count is still near zero after a week with 1a and 2a, revisit.
- **6b: PreToolUse hook on Read that injects a one-line reminder after the Nth read in a turn.** Deferred. Cheap to build, but it is the counting trigger from A6 moved into code, with the same rot.

### F7. Where Haiku must not go (the boundary text)

Context. The operator's second message says Haiku's only function is retrieval and the listed points. The current file lists the shapes but has no explicit "never" line. Pushing more work to Haiku raises the chance of edge-case drift: a "mechanical edit" that is really a design change, or a "triage" that becomes a fix.

- **7a (pick): add one short line.** "Haiku never implements, plans, reviews, or decides. Lifecycle skills choose their own agents." Reason: one sentence closes the boundary the operator cares about most and prevents the Explore override from being read as a general downgrade. Cost: one line.
- **7b: rely on the existing "Keep for yourself" list.** Rejected. It lists what the main model keeps, not what Haiku is forbidden. Different models reading the file will draw the line differently.

## A3 to A6 verdicts

- A3: right. Delete the cost half. (F3)
- A4: right in intent, wrong in wording. Keep "spot-check only the cited lines your decision depends on". Drop the sentence that argues with the model. (F4)
- A5: right. Merge into the Keep line rather than adding a sentence. (F5)
- A6: wrong shape. Replace with task-shape triggers. Numeric thresholds conflict with the harness prompt, cannot be evaluated before the reads happen, and the "any web fetch" clause doubles latency on single lookups. (F2)
- Missing from A's list: the Explore model override (F1), which is the only change that makes the natural path the Haiku path. Also missing: an explicit Haiku boundary line (F7). Also missing: the hand-off section of the file is already good and should not grow. The rule is at 28 lines, under the 200-line target, and length is not the problem.

## What each pick could break or invite later

- Over-delegation: 2a's closed list plus the two kept cases bounds it. Anthropic reports current models already lean toward subagents, so no "when in doubt" wording.
- Haiku on reasoning work: F7 line plus 1a's description limited to retrieval. Lifecycle skills do not reference Explore.
- Latency: each hand-off adds a subagent round trip. 2a's kept case "file already in your context" and the back-and-forth exit cover the interactive case. Single-URL fetches stay with the main model.
- Wrong facts reaching decisions: F4 keeps the spot-check. Haiku briefs already require path:line per claim.
- Conflict with CLAUDE.md or harness prompt: the harness tells the model to delegate cross-file reads and to do a handful of tool calls itself. 2a is consistent with both. A6 is not.
- Rule rot: no numbers, no sentences that reference past excuses, no second copy of the delegation rule inside the Explore file (description only).
- Scope creep: 1a adds one file outside the named destination. Operator decides (Q1).

## Research

- better-than-training · Claude Code sub-agents doc, https://code.claude.com/docs/en/sub-agents, read 2026-10-10 · Explore runs on Opus when main is Fable; a user `Explore` agent with `model: haiku` overrides it; model resolution order is per-call param, frontmatter, `CLAUDE_CODE_SUBAGENT_MODEL`, main model; "use proactively" in a description encourages delegation · Produced F1 and ruled out 1c.
- better-than-training · Claude Code memory doc, https://code.claude.com/docs/en/memory, read 2026-10-10 · CLAUDE.md and rules are "context, not enforced configuration"; use PreToolUse hook to block; concrete, verifiable instructions beat vague ones; contradicting instructions get picked arbitrarily · Produced F6 and the conflict argument against A6.
- better-than-training · Claude Code hooks reference, https://code.claude.com/docs/en/hooks, read 2026-10-10 · PreToolUse can deny or inject `additionalContext`; SubagentStart is context-only · Bounded F6.
- better-than-training · Anthropic prompting best practices, https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices, read 2026-10-10 · current models over-trigger on "CRITICAL / MUST" and "if in doubt, use [tool]"; they "may spawn subagents for code exploration when a direct grep call is faster"; sample damping prompt uses task shapes (parallel, isolated context, independent) not counts · Produced 2a over 2b and 2c.
- better-than-training · Prompting Claude Fable 5, https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5, read 2026-10-10 · "steer most behaviors with a brief instruction rather than enumerating each behavior"; Fable "dispatches parallel subagents more readily"; "give the reason, not only the request" · Produced 4a over 4b and kept the file's opening cost sentence as the reason line.
- practitioner · Anthropic engineering, "How we built our multi-agent research system", https://www.anthropic.com/engineering/multi-agent-research-system, read 2026-10-10 · delegation briefs need objective, output format, tool guidance, boundaries; scaling rules by task class ("simple fact-finding: 1 agent, 3-10 calls") were added to stop over-investment · Supports keeping the existing hand-off section, and shows that Anthropic's own thresholds are per task class, not per file count.
- better-than-training · local transcripts `~/.claude/projects/*/subagents/*.meta.json` since 2026-10-09, read 2026-10-10 · 3 haiku spawns, all explicit `model: haiku`, all summarize tasks; none for exploration; no `~/.claude/agents/` exists · Confirms the natural Explore path never hit Haiku.

Nothing stronger found for "how often does Fable delegate reads under a CLAUDE.md rule"; that is model-knowledge and is why F6 says measure before adding a hook.

## Questions for the operator, in order

1. Q1. May the change add `~/.claude/agents/Explore.md` (model haiku, read-only) alongside the haiku.md rewrite, or must it stay to the one file? This decides F1 and reshapes F2's wording.
2. Q2. Should single-URL web fetches go to Haiku or stay with the main model? My pick: stay, because a one-page fetch through a subagent is a double fetch. A6 says otherwise.
3. Q3. Is a small latency increase on interactive sessions acceptable in exchange for more hand-offs? If no, keep the back-and-forth exit wide; if yes, narrow it to "I am answering your questions live".
4. Q4. After the change, what count over what window counts as "working"? Suggest: Haiku Explore spawns per akrogon main session over 7 days, measured the same way as the intake. Without a target, F6 cannot be decided later.

## Proposed shape of the rewritten file (for A's merge, not final text)

- Opening: one reason sentence (cost and speed), then "Haiku does retrieval. You keep judgment."
- Delegate (closed list of task shapes, 2a), with the Explore pointer from 1a.
- Keep (merged A5 line), plus the F7 boundary line.
- Hand-offs section unchanged except the re-read line (4a).
- Exits: back-and-forth only (3a), and "file already in your context".
- No numbers anywhere.
