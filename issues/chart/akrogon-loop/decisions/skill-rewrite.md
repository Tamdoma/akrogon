# Skill Rewrite

Chart skill version: 4

Status: resolved
Type: grilling

## Question

Which skills exist in the new repo, and what shape? Constraints: entry SKILL.md plus references read on demand, the part that must survive compaction at the top and under 5,000 tokens, written for Claude 5 and GPT-5 instruction following, contradicting and compensating rules removed, no operator approval gate, no status tokens, no footers. 

Coverage pass 2026-09-08 adds: which skills exist, including whether consolidate-issues and the one-leaf-or-many-leaves shape stay (intake 43, 75); create-issue's interview, locks and three emitted files are open and now fold into the one skill (111); the grilling format is locked as it is, batches, recommended first, N-A replies, no AskUserQuestion (143); the leaf runs the repo's linter, typechecker and tests and nothing else in the harness cares (69, 71); the 5,000-token skill cap and compaction facts were checked on Claude Code only, Codex and pi must be checked before the cap is a rule (267).

Reshape 2026-09-08 after # Debate Count, # Turn Within Phase, # Driver State: every pass ends with `akrogon phase <slug> <next-phase>` then `akrogon next`, reviews end with `--verdict`; slot comes from the prompt text; the door asks debate-or-not beside the consult election; there is no planning-phase debate and no planning-phase skill (the one debate, on the implementation plan, lives in plan-issue, the successor of consult-issue); skills never read pane text or state beyond what the prompt gives.

From # Peer Questions 2026-09-08: skills carry the peer-question rules (solo passes only, wait then prompt, one exchange, tie by hierarchy) and drop every line that asks the user after the door.

From # Quality Layers 2026-09-08: check-issue verdicts are ready, ready with nits, fix via `--verdict`; no plan audit, no QA mandate, no advisory report; re-check reads the repair diff only; implement-issue writes tests from the brief's criteria before code.

From # Quality Layers 2026-09-08, operator-accepted: at the fix-round cap slot A writes one diagnosis paragraph into the plan before `akrogon phase <slug> failed`; restart is `akrogon phase <slug> implement`, which resets fix_rounds.

From # Implementer Brief 2026-09-08: implement-issue writes the eight-section brief, runs sub-briefs in order in one worktree, full suite once after the last worker, worker returns mismatches; the cap is steering text only.

## Findings

### Slot A research 2026-09-08

Inventory of July 28 skills: consult-issue 396 lines/50KB (about 12.5k tokens, 2.5x the 5k cap), check-issue 306, implement-issue 242, merge-issue 152, seed-issue 291, explain-issue 223, init-issues 165, broadcast-issue 77; current chart-issues 409 lines/30KB, create-issue 83, consolidate-issues 85, braindump 42. advisory-quality-standards is copied three times, series-materialization twice, and the copies already differ.

Proposed set: chart-issues (absorbs create-issue and braindump), plan-issue (consult positions, optional rebuttal, synthesis), implement-issue (implement and check.fix), check-issue (review and re-check), merge-issue, seed-issue. Drop consolidate-issues, explain-issue, advisory-quality-standards, authoring-reference, series-materialization. init-issues and broadcast-issue leave the skill set if # Distribution and # GitHub Intake make them commands.

Slot and phase come from the prompt line, `<invoke> <slug> slot=A phase=plan.rebuttal`; the harness prefix (`/`, `$`, `/skill:`) sits in the routing table. Family skills with phase sections recommended over one file per phase (Anthropic conditional-workflow guidance, tier 2; Instruction Stacking Collapse arXiv 2608.02639, tier 2).

Compaction, checked 2026-09-08 on installed versions Claude Code 2.1.263, Codex 0.153.4, pi 0.85.1: Claude re-injects the first 5k tokens of each invoked skill (tier 2, docs); Codex keeps summary plus about 20k recent tokens and discards the skill body (tier 3, issue #25792 open); pi keeps summary plus recent messages and discards the skill body (tier 2, packages/coding-agent/docs/compaction.md). The 5k-top rule is therefore Claude-only. Durable unit across all three is the prompt line plus what the skill tells the agent to re-read.

Size: under 300 lines, under 4k tokens, under 20 rule sentences, must/never only with a stated exception (Prohibition decay arXiv 2604.20911, tier 2; Prompt-Induced Waste 2608.01347, tier 2).

References kept: question-authoring, seed-shapes, brief-format, ponytail. Materialization contract becomes command behavior.

Cross-harness: no AskUserQuestion after the door (Codex has none outside plan mode, pi none); pi has no subagents, so pi as slot B cannot spawn a worker (R1); frontmatter fields beyond name/description are Claude-only; install path `.agents/skills` with a Claude symlink.

### Slot B research 2026-09-08

Proposed ten skills: chart-issues (absorbs create), seed-issue, consolidate-issues (narrowed to unstarted intake), consult-issue (implementation debate only), implement-issue, check-issue, merge-issue, init-issues, explain-issue, broadcast-issue. Sources: Pocock skills repo (tier 1, inspected 2026-09-08, separates orchestration from disciplines); Zechner pi architecture (tier 1, 2025-11-30, small core, durable artifacts); OpenAI Codex skills docs (tier 2, inspected 2026-09-08: full skill load at invocation, no retention promise after compaction, long discovery lists get descriptions shortened or entries dropped); Agent Skills specification (tier 2, entry body under 5k tokens, bundled references with relative links); pi compaction and skills docs (tier 2); Yue Xue code-audit study rev. 2026-08-01 (tier 2, context omissions observed, no threshold).

Slot B found a conflict in the carried note "skills never read pane text": # Peer Questions requires the asker to read the peer's answer from its pane. Proposed narrowing: forbid inferring slot, phase, readiness or completion from pane prose; allow reading peer answers.

Slot B questions: keep ten callable skills or six; consolidation limited to unstarted intake; split criterion is independently verifiable and mergeable result; entry file aims below 2k tokens, hard below 5k; re-read skill, assignment artifact and pass references after compaction; pane-read prohibition narrowed; references self-contained per skill folder; borrow from Pocock only term clarification, live-code checks and concrete examples. Challenge: ten names may preserve packaging not need; text cannot guarantee post-compaction behavior; self-contained references can drift.

Slot B compacted once during this pass.

### Operator answers round 1, 2026-09-08

1-A six skills. 5-A re-read rule after compaction. 6-A pane-read prohibition narrowed; operator asks for a probabilistic backup layer. 7-A references inside each skill folder, operator wants symlinks not an install script. 9-A Pocock borrowings limited to three lines; chart interview stays as run today, grounding through repo references and indices kept.

Open: 2 (consolidation into the door, operator fears chart-issues grows too complex), 3 (family skills, needs plain restatement), 4 (size cap, needs plain restatement), 8 (pi subagents: operator points to the tamdoma-subagents extension; slot A finding below), 10 (split criterion: operator proposes verifiable whole pieces of functionality).

Slot A finding 2026-09-08 (tier 2, ~/.pi/agent/extensions/tamdoma-subagents/README.md): pi's tamdoma-subagents extension spawns child sessions with tiers from `subagent-model-policy.json`, checked against `issues/config.yaml` `orchestrator.model_roles.pi`. Children currently get read, grep, find, ls and a PDF tool only, no write or bash. A worker brief needs write and bash, so the extension needs a write-capable tier before pi can be slot B. The operator owns the extension and can add it.

### Operator round 1 follow-ups, 2026-09-08

Broadcast: the operator keeps the original akrogon broadcast message shape (what was wrong, what changed, what the reader gains, plain writing for nontechnical readers) written by the slot's cheapest subagent; sending stays mechanical. Slot A finding (tier 2, /home/ivan/Work/infra/akrogon/skills/broadcast-issue/SKILL.md): message rules are one section, sending is a bun script with `--dry-run`. Broadcast-issue therefore stays a skill: rules for the writer, one send command. Seven skills.

Consolidation: operator confirms the shape wanted, point chart-issues at legacy seed files or GitHub issues and consolidate into one series.

Rebuttal blindness: operator asks whether the rebutting slot must be blind. Slot A: positions are blind (neither reads the other first); rebuttal is by definition reading the other's position; synthesis reads both.

Size: operator agrees with A and confirms reference files with explicit "read X when Y" triggers offset the cap.

Peer answer backup: operator proposes posting the question directly. Slot A revised recommendation: the peer always writes its answer to a file under the leaf; pane read dropped as primary. Reason: today's both-ends read failure shows pane reads are guesses, file reads are not.

Pi subagents: operator will extend tamdoma-subagents with a write-capable tier; work item, not a rule.

Split: operator wants leaves parallel by default, serialized only when dependent, marked in the file; merge and conflict resolution handled inside the same tab by one of the leaf's own agents, no separate merge machinery. Carried to # Parallel Merge and # Multi Chart Layout.

### Operator answers round 2, 2026-09-08

1-A seven skills (broadcast stays). 3-A family skills with phase sections, positions blind, rebuttal reads. 4-A size cap with reference triggers. 6-A peer answers return as a file, pane read dropped for peer questions (reshape line owed to # Peer Questions). 7-A symlinks for harness roots, ponytail copied plainly into implement and check.

Open: 2 (drain into more than one series), 8 (worker model configurable in config, skill reads it), 10 (parallel leaves with overlapping files, carried to # Parallel Merge).

### Operator answers round 3, 2026-09-08

8-A worker model role in config per harness, skill reads it (key shape to # Config Shape). 10-A serial only on planner-named dependency, overlapping files allowed, merger rebases and reruns checks (full shape to # Parallel Merge). Open: 2, operator asks whether two charts from one drain are unconnected.

### Operator answers round 4, 2026-09-08

2-A chart-issues may emit several unconnected charts from one drain, then stops. All questions lettered.

## Resolution

Seven skills: chart-issues (absorbs create-issue, braindump, consolidation as a door input; may emit one chart per destination from a drain of seeds or GitHub issues, then stops), plan-issue (positions blind, rebuttal reads, synthesis), implement-issue (brief, workers, check.fix), check-issue (review, re-check), merge-issue (spawns the cheap broadcast writer), seed-issue, broadcast-issue (message rules for a cheap subagent, mechanical send). Dropped: consolidate-issues, explain-issue, advisory-quality-standards, authoring-reference, series-materialization. init-issues waits on # Distribution. Family skills with phase sections, phase and slot from the prompt line. Cap per skill: under 300 lines, 4k tokens, 20 rule sentences, must/never with a stated exception, references with explicit read-when triggers; steering text, no counter. First lines of every skill: after compaction re-read this file, the slug's brief or plan, and this phase's references. Pane text is never used to infer slot, phase, readiness or completion; peer answers return as a file under the leaf, not a pane read. References live inside each skill folder; harness roots are symlinks; ponytail is a plain copy in implement and check. Workers are spawned with the `worker` model role for the harness from config; pi needs a write-capable tier in tamdoma-subagents first. From Pocock only: ground in docs first, challenge fuzzy terms, verify with a concrete scenario, check the live surface. Leaves are verifiable whole pieces, parallel unless the planner names a dependency, overlapping files allowed, the merger rebases and reruns checks.

Why: every July 28 skill carries dead or contradicting lines from removed machinery, and 2026 evidence shows rule stacking lowers compliance, so fewer, shorter, harness-neutral files with references are the least text to keep true across three harnesses.

Forecloses: one skill per phase, a shared reference directory, install scripts for copies, pane reads for peer answers, hardcoded model names in skills, serializing on file overlap.

### Operator explanations 2026-09-08 (chat, recorded for handoff)

Family skills. plan-issue is one file with sections for positions, rebuttal and synthesis; the prompt line `plan-issue <slug> slot=A phase=plan.rebuttal` says which section applies. Positions are blind: neither slot reads the other's before writing. Rebuttal reads the other position by definition. Synthesis reads both. Shared rules are written once at the top, phase sections never restate them.

Drain into charts. chart-issues accepts several inputs, legacy seed files or GitHub issue numbers, drops duplicates and groups the rest. If they describe one destination it writes one chart with one or many leaves; if finishing one group would not change the other, they are two unconnected destinations and it writes one chart folder each, then stops, and the operator picks one to work.

Compaction. Every skill's first lines say: after compaction re-read this file, the slug's brief or plan, and this phase's references. Cost is about 10k tokens once or twice per pass, cached afterwards. Claude re-injects the skill; Codex and pi do not, so the prompt line plus this instruction is the durable unit.

References. Symlinks cover harness roots. Ponytail is needed by implement-issue and check-issue and is a plain copy in both (32 lines), edited twice when it changes; no shared directory, no install script for copies.

Peer answers. The asker's prompt tells the peer to write its answer to `<leaf>/questions/<id>.md`; the asker waits for idle and reads the file. No pane read for peer questions.

Correction from # Model Tiering 2026-09-09: "workers are spawned with the worker model role from config" is withdrawn; the implement skill says "delegate the sub-brief to a subagent" and names no model or mechanism. The pi write-capable tier remains a prerequisite before pi serves as B.

From # Repeat Safety 2026-09-09: every skill ends with `akrogon phase <slug> <next>` and stops; no skill runs `akrogon next`. merge-issue spawns the broadcast writer only when the phase command reports the issue complete (its last leaf merged), with the issue's briefs, one message.

From # Multi Chart Layout 2026-09-09: chart-issues handoff writes EPIC.md and ISSUE.md index files and plain unique slugs; every skill ends with "Last operation" and "Next" lines; vocabulary epic, issue, leaf.

From # Handoff Location 2026-09-09: the two ending lines are printed only, no file. Shape: `Last operation: <what the pass did, phase moved to>` and `Next: <skill> <slug> slot=<A|B> phase=<phase>` reproducing the prompt line the next pass receives, or `Next: none <reason>`. Notes for the next agent go in the pass artifact. The footer is the probabilistic backup read from 6-A: first 50 to 100 words of the other pane, confirm only, never infer state, absent tail never blocks.

From # Status View 2026-09-09: check-issue leaves its review file as the operator record at merge-ready; the verdict word lands in state through `--verdict`; nothing else is written for the operator.

From # Index Levels 2026-09-09: plan-issue reads the top index file and the areas it needs and puts a read-first list in the brief; implement-issue updates affected docs and area index lines in the worktree before ending; check-issue verifies them against the diff and follows affected contracts, no drift script; merge-issue resolves same-line index conflicts by keeping both true entries and rechecking pointers. init-issues proposes the top index file when none exists.

From # GitHub Intake 2026-09-09: seed-issue posts to GitHub with `gh issue create -R`, target from the framework routing file or the repo origin, fails visibly otherwise, no file mode, no FIXER script; chart-issues runs `akrogon pull` on open, skips seeds already in `sources`, copies imported seed text into the intake or brief, maps each report to one owner issue or epic; merge-issue does not close GitHub issues, the command does.

Operator rule 2026-09-09 (chat, recorded for handoff): the chart-issues door consolidates seeds by destination and by speed of resolution. Seeds that share a destination and no dependency become parallel leaves of one issue; independent issues are shaped to run side by side; only a planner-named dependency (see # Parallel Merge) puts leaves in order. The door proposes the split that finishes soonest, not the tidiest one, and shows it to the operator before writing.

From # Door Second Slot 2026-09-09: chart-issues takes slot B from a pane named at open (else single slot, said in the first reply); per-decision blind pass on the Question section, carries, related paths and operator corrections only; full batch, tagged merge, disagreement-only rebuttal, focused check on late operator changes; A owns the interview.

From # Lessons 2026-09-09: any skill pass that finds a reusable lesson writes `learnings/history/<date>-<slug>.md` and one line in `learnings/LESSONS.md`; check-issue verifies the claim with the change; the leaf that applies an improvement deletes the line and dates the history file; plan-issue and chart-issues read LESSONS.md as a resource, never as a rule; chart-issues offers the operator a prune at open; implement, check and merge never read it.

From # Command Tests 2026-09-09: implement-issue briefs for the akrogon repo carry the test rule: scenario tests on a temp repo with real files and processes, herdr and gh substituted at one boundary, never real panes, install roots, GitHub or the herdr socket.

Handoff 2026-09-09 (operator 5-A): seed-issue reads `.claude/akrogon.yaml` at the consumer repo root, key `issues_repo: owner/repo`, harness-neutral despite the folder name; the framework installer writes it, the seed-issue skill only reads it.

Operator 2026-09-10 (1-A): the routing file is `akrogon.yaml` at the consumer repo root, no harness folder; the `.claude/` path was only where the framework installer already wrote files. Same key `issues_repo`, same fallback to origin. The framework installer changes its write path outside this epic.
