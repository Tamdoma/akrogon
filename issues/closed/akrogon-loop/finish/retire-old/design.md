# Design: retire-old

Chart skill version: 4

## Binding decisions, verbatim

### # Bootstrap

The hand-built path: the `akrogon` command (install, init, config, phase, next, status), the herdr plugin, and the implement, check and merge skills, as one or two leaves in the handoff marked hand-built. The operator drives those leaves in two herdr panes, typing every pass prompt with both slots guiding, so the loop is seen once by hand before it is automated. Everything else (plan, chart, seed, broadcast skills, status view, intake work) is built by the tool on this repo, which is its own first consumer; the old-shaped issues/config.yaml and issues/.scripts are removed in the first hand-built leaf and rewritten by `akrogon init`. After the hand-built leaves merge: installer run once from source with bun, then every step through the installed command and skill symlinks. Hand-built leaves finish by hand; the first automated leaf is fresh and elected without debate; takeover is proven by one hands-off merge plus one deliberate check.fix exercise on a real failing check, then parallel leaves. If the command cannot dispatch its own repair during bootstrap, it is repaired in a direct session with the operator guided by both slots and the run is recorded as failed automation. new-beginning/ and reference/ are deleted in the last leaf once nothing in the handoff or archived chart points into them. Why: the operator's July numbers show hand-driving lands work, and one hand-driven pass is the operator's model of what the command automates. Forecloses: reviving the July 28 lifecycle, a temporary driver script, a second state store, transferring a half-done hand leaf into automation.

From # Lessons 2026-09-09: the last bootstrap leaf moves reference/lessons into learnings/history/ unchanged, fixing relative links, deriving no active line.

From # Command Tests 2026-09-09: the bootstrap leaves that build the command each add its test file under a small test tree run by `checks.test`; the takeover leaf is the live proof and no automated test drives real herdr or GitHub.

### # Lessons

Each repo keeps `learnings/LESSONS.md`, the active list, one line per lesson naming the abstract learning, the mechanism it concerns, the date and its history file, under a header that says these are learnings about what happened, not what is true. Each lesson also has `learnings/history/<date>-<slug>.md` with the specific case, evidence and the abstract lesson; history is never pruned or rewritten, is on no pass's reading list, and may be opened to check a lesson's evidence. The agent that finds a reusable lesson writes both in its own pass, from failed and successful work alike; the checker verifies the claim while reviewing the change it rides on. A line leaves the list when its improvement lands in the owning skill, doc or command (the implementing leaf deletes it and dates the history file) or when the operator prunes at chart open; no numeric cap. plan-issue and chart-issues read the list as one resource beside the reference index, never as a rule; implement, check and merge do not read it. Performance-log analysis happens on demand. The old lessons folder moves to `learnings/history/` unchanged in the last bootstrap leaf, relative links fixed, no active lines derived.

Why: the intake wants one or two lines per lesson, always updated, pruned, about mechanisms already running, and history kept. Two files give a short list that shapes work and a record that never shrinks, and the line leaving the list when applied is what keeps the list from becoming instructions.

Forecloses: lessons as canon or as a gate, a numeric cap, a lessons pass at every leaf end, every pass reading the list, distilling the old folder into active lines, a separate learning review.

### # Index Levels

The repo's reference index is two levels of plain Markdown: a top file, pointed at by the per-repo `grounding.index` config key, listing areas one line each with a link, and one area file per area listing entry points, purpose, contracts and doc links one line each. An area splits only when it is hard to scan; a small repo keeps a single file. No nested AGENTS.md or CLAUDE.md, so every harness reads the same files through the skills. Reading: plan reads the top file and the areas it needs and builds the brief's read-first list; the worker starts from that list and opens the index only on a gap; check follows the diff and the contracts it affects. Writing: the implementer updates affected docs and area lines in the same worktree before check; the checker verifies them against the diff; merge fixes only drift that integration exposes, keeping both entries on a same-line conflict when both are true. The drift audit script is retired; review does that check in prose, and a real defect goes through the normal fix round.

Why: the cost was whole-index reads on every pass; the split turns those into a top file plus the areas a pass needs, and turns most doc merge conflicts into different-file merges. Writer and separate reviewer is the reason two slots exist, so the implementer writes and the checker checks.

Forecloses: one flat index read whole, harness-loaded nested instruction files, an exhaustive per-file inventory, docs authored by the checker, any script that parses index rows.

### # Distribution

Tool repo `akrogon` holds the command, the seven skills, and the herdr plugin folder. Install once per machine with `akrogon install`: `~/.local/bin/akrogon` symlinked to the entry file, dependencies only in the tool checkout, one symlink per skill folder into `~/.claude/skills` (Claude) and `~/.agents/skills` (Codex and pi), `herdr integration install <kind>` for each harness in the global config, `herdr plugin link` for the plugin. Install refuses to replace a real folder bearing a new skill's name and prints the removal line. Per repo: the init-issues skill inspects and proposes, `akrogon init` writes issues/config.yaml, issues/open, the worktree gitignore line, and the repo entry in the global config. The consumer repo holds nothing else of ours; its own package manifest is untouched. Verify with `akrogon config` and one harmless handoff. Update is `git pull` in the tool repo at any time; the next pass reads the new text. Each skill folder is self-contained and its SKILL.md names the akrogon command as its dependency. Why: symlinks make one checkout the only copy, so update and install are one step each and no copy can drift, and the two commands hold the only machine-specific steps. Forecloses: an installed executable build, copies of skills in harness roots, a scripts folder or package.json in consumer repos, permanent skill-name prefixes, a coexistence window with the old skills.

From # Status View 2026-09-09: the plugin hook also runs `herdr notification show` when a leaf moves to `failed`; the only push to the operator, no loop.

From # GitHub Intake 2026-09-09: the `[[startup]]` hook runs `akrogon pull --all` beside `next --all`; still nothing GitHub-specific installed, `gh` is a machine prerequisite like `flock`.

### # Contract Fit

Two contracts, no bridge. The intake contract is the newer and the operator wants its doors kept, so the lifecycle side is what gets rewritten: phase vocabulary, file names, series shape and gate removal are all settled inside # Skill Rewrite, with the dump as its checklist. Research only, decides nothing beyond that. Foreclosed: patching lifecycle.ts to accept both shapes.

### # No Migration

No migration. The old machinery finishes its in-flight issues. New work enters the new door once the loop has merged its first framework issue. Nothing converts old state files. Operator answered 4-A on 2026-09-08. This forecloses a converter for old records and a freeze of the old machinery.

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

### # Debate Count

One debate, on the implementation plan, by default. The door asks one question, debate or not, next to the consult election, and writes one field; very small issues skip it and slot B writes the plan alone. Planning's unique outputs, decision IDs, codebase grounding and the execution checklist, move into the implementation synthesis. One rebuttal round stays a per-repo flag, default on, fired only on a real fork. Roles are fixed, slot A strategist, audit and merge, slot B implementation synthesis and execution, and any slot may run any harness at any time. Why: the door locks decisions, so a planning debate would re-litigate them at eleven top-model passes per issue, and the rebuttal evidence (Khan, Du vs Smit, "Stop overvaluing MAD") only supports a second round when a fork exists. Forecloses: a planning debate, a second implementation debate, a per-issue rebuttal setting, any slot-to-harness binding.

From # Door Second Slot 2026-09-09: the door's second slot is separate from the implementation debate field; naming B's pane at chart open does not touch it.

Operator 2026-09-10 (F1-A): the consult election and the debate question are one question and one field. `consult` leaves state.yaml; `debate: yes|no` is the whole election, asked once at the door with a recommendation from the settled design, default no, read by plan-issue. Intake 151's requirement, one question and one field, is met by `debate` alone; the second field arrived when the planning debate was cut and had no reader.

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

Reading note 2026-09-10: the standing lines above are the operator's creation-locked text and stay verbatim. Where they say the gate judges an exit code, this design has the checker's verdict and the blocking `checks` commands; where they say a chunk parks at dispatch, this design has no parking: an operator-owned step is done by the operator in the leaf's tab and the leaf waits in its phase.


## Leaf architecture

Mechanical moves and deletions plus three short files. Ownership: `reference/`, `new-beginning/`, `learnings/`, README.md, the index file, `grounding.index` through init. Not this leaf: `issues/chart/` (archived record, never edited), any skill or command text beyond link repair. The concurrent-run signal (a second leaf merging while a third runs) is read from the log of the github and doors leaves, not manufactured here.
