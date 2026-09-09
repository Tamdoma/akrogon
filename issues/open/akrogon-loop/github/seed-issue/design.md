# Design: seed-issue

Chart skill version: 4

## Binding decisions, verbatim

### # GitHub Intake

Reports reach GitHub through seed-issue, which a colleague's agent runs. The target is fixed by files, never judged: when the installed framework's routing file names an upstream issues repo, seed-issue posts there with `gh issue create -R`; otherwise it posts to the current repo's GitHub origin; a malformed file, missing origin or non-GitHub origin is a visible failure. The file writer and the FIXER submission script are retired. The routing file's path and shipping belong to the framework repo.

`akrogon pull` runs inside a registered repo: it lists that repo's open GitHub issues and writes one file per issue into `issues/seeds/<number>-<slug>.md`, deleting seed files whose issue is closed only after a complete successful listing. The folder is a gitignored mirror, derived, never edited; it is the one explicit exception to "no state outside leaf folders" because it can be deleted and rebuilt at any time. `akrogon pull --all` does the same for every registered repo and is called by the herdr startup hook beside `next --all`. The chart-issues door runs `pull` when opened. No timer.

The door consolidates as locked in Skill Rewrite: it skips seeds whose `owner/repo#n` already appears in `sources` under issues/open, issues/closed or a chart intake, copies each imported seed's text into the chart intake or brief as the evidence of record, and maps each report to one completion owner, an issue or an epic. The handoff writes `sources: [owner/repo#n, ...]` into the state.yaml of every leaf under that owner.

Closing is the command's: when `akrogon phase <slug> merged` moves the completion owner to issues/closed, in that same step it runs `gh issue close -R owner/repo n --comment "merged <commit>"` for every entry in `sources`, checking the issue state first, one retry, failure printed, never reversing the merge. The next pull removes the seed file. The broadcast message stays with broadcast-issue.

Why: the operator wants the queue online where colleagues' agents already are, seeds on disk to chart from without moving anyone's files, and closure that needs no hand. Files fix the target, a mirror fixes the copy, the issue number fixes the duplicate check, and the command already owns the transition that means done.

Forecloses: a GitHub issue template as the intake shape, an import comment or label on GitHub, a label query in the door, a local import registry, closure by merge-issue or by commit keywords, a timer-driven pull, seed-issue asking where to post.

Operator rule 2026-09-09 (chat, recorded for handoff): the chart-issues door consolidates seeds by destination and by speed of resolution. Seeds that share a destination and no dependency become parallel leaves of one issue; independent issues are shaped to run side by side; only a planner-named dependency (see # Parallel Merge) puts leaves in order. The door proposes the split that finishes soonest, not the tidiest one, and shows it to the operator before writing.

### # Skill Rewrite

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

### # Operator Only Install

Only the operator installs and runs it, colleagues file GitHub Issues. Operator answered 6-A on 2026-09-08 with a condition: the design must stay simple enough that anyone can pick it up later, and the skills must be usable individually. How a later person obtains them, for example by downloading the skills folder from the GitHub repo, is part of # Distribution. This forecloses install docs and testing on other machines for this chart.

### # Distribution

Tool repo `akrogon` holds the command, the seven skills, and the herdr plugin folder. Install once per machine with `akrogon install`: `~/.local/bin/akrogon` symlinked to the entry file, dependencies only in the tool checkout, one symlink per skill folder into `~/.claude/skills` (Claude) and `~/.agents/skills` (Codex and pi), `herdr integration install <kind>` for each harness in the global config, `herdr plugin link` for the plugin. Install refuses to replace a real folder bearing a new skill's name and prints the removal line. Per repo: the init-issues skill inspects and proposes, `akrogon init` writes issues/config.yaml, issues/open, the worktree gitignore line, and the repo entry in the global config. The consumer repo holds nothing else of ours; its own package manifest is untouched. Verify with `akrogon config` and one harmless handoff. Update is `git pull` in the tool repo at any time; the next pass reads the new text. Each skill folder is self-contained and its SKILL.md names the akrogon command as its dependency. Why: symlinks make one checkout the only copy, so update and install are one step each and no copy can drift, and the two commands hold the only machine-specific steps. Forecloses: an installed executable build, copies of skills in harness roots, a scripts folder or package.json in consumer repos, permanent skill-name prefixes, a coexistence window with the old skills.

From # Status View 2026-09-09: the plugin hook also runs `herdr notification show` when a leaf moves to `failed`; the only push to the operator, no loop.

From # GitHub Intake 2026-09-09: the `[[startup]]` hook runs `akrogon pull --all` beside `next --all`; still nothing GitHub-specific installed, `gh` is a machine prerequisite like `flock`.

### # Debate Count

One debate, on the implementation plan, by default. The door asks one question, debate or not, next to the consult election, and writes one field; very small issues skip it and slot B writes the plan alone. Planning's unique outputs, decision IDs, codebase grounding and the execution checklist, move into the implementation synthesis. One rebuttal round stays a per-repo flag, default on, fired only on a real fork. Roles are fixed, slot A strategist, audit and merge, slot B implementation synthesis and execution, and any slot may run any harness at any time. Why: the door locks decisions, so a planning debate would re-litigate them at eleven top-model passes per issue, and the rebuttal evidence (Khan, Du vs Smit, "Stop overvaluing MAD") only supports a second round when a fork exists. Forecloses: a planning debate, a second implementation debate, a per-issue rebuttal setting, any slot-to-harness binding.

From # Door Second Slot 2026-09-09: the door's second slot is separate from the implementation debate field; naming B's pane at chart open does not touch it.

### Decisions not binding this leaf

- none

### Standing creation-locked design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any chunk touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first chunk needing it. Non-browser flows use a real request or invocation. The gate judges the exit code and the completion half records the artifact path as evidence.
- Chunk ownership defaults to agent-owned. Only a step physically requiring the operator makes its chunk operator-owned, which parks at dispatch before any seat spawns. Credential access alone never qualifies.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

consult-election: no

## Leaf architecture

One `SKILL.md` under `skills/seed-issue/` with the gh command inline, under the cap; no code in the tool for this. Ownership: `skills/seed-issue/`. Not this leaf: pull, the door, anything in the framework repo. Skill Rewrite clauses that do not apply because the skill runs outside a leaf: compaction re-read of a brief or plan, `akrogon phase` at the end, peer answers; the cap and the footer apply.
