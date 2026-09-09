# Design: chart-issues

Chart skill version: 4

## Binding decisions, verbatim

### # One Door Skill

One skill. chart-issues serves the single fuzzy issue as well: when the territory map surfaces nothing unspecified, the session goes straight to handoff and writes the issue instead of stopping. One protocol, one install, one set of learnings, the same slot B check on every issue. Forecloses a separate create-issue rewrite; # Skill Rewrite now covers one skill. Operator picked it 2026-09-08 from slot A's recommendation, both slots not grilled on it.

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

### # Door Second Slot

Slot B joins chart-issues when the operator names its pane at chart open; no pane named means single slot, and the skill says so in its first reply. No config key, no election question. The implementation debate field stays Debate Count's. Shape: a blind map at open, then for every decision one blind B pass against the current locks, run in the background while A writes its own view. B receives the intake, the decision's Question section with its carries, the related decision paths, the locks, and the operator's corrections verbatim; never A's draft or the Findings section until both passes are done. B returns a full batch; A merges with (A), (B), (both) tags; B replies once with disagreements only on the merged file; A presents one batch with the rebuttal under the challenge check. When the operator adds a mechanism or changes a contract in chat, B checks the final shape once before A records; restatements need no check. A owns the interview and the recording; B answers the operator's direct requests in its own pane.

Why: this chart's own record shows B finding forks and errors in every decision at two to four background minutes each, and the whole-territory shape would have missed the late catches. Naming the pane is the smallest election that identifies B without state.

Forecloses: a config key or open question for the door's second slot, one-shot territory passes by B, B reading A's draft before its own pass, B addressing the operator's batch, unlimited rebuttal rounds.

### # GitHub Intake

Reports reach GitHub through seed-issue, which a colleague's agent runs. The target is fixed by files, never judged: when the installed framework's routing file names an upstream issues repo, seed-issue posts there with `gh issue create -R`; otherwise it posts to the current repo's GitHub origin; a malformed file, missing origin or non-GitHub origin is a visible failure. The file writer and the FIXER submission script are retired. The routing file's path and shipping belong to the framework repo.

`akrogon pull` runs inside a registered repo: it lists that repo's open GitHub issues and writes one file per issue into `issues/seeds/<number>-<slug>.md`, deleting seed files whose issue is closed only after a complete successful listing. The folder is a gitignored mirror, derived, never edited; it is the one explicit exception to "no state outside leaf folders" because it can be deleted and rebuilt at any time. `akrogon pull --all` does the same for every registered repo and is called by the herdr startup hook beside `next --all`. The chart-issues door runs `pull` when opened. No timer.

The door consolidates as locked in Skill Rewrite: it skips seeds whose `owner/repo#n` already appears in `sources` under issues/open, issues/closed or a chart intake, copies each imported seed's text into the chart intake or brief as the evidence of record, and maps each report to one completion owner, an issue or an epic. The handoff writes `sources: [owner/repo#n, ...]` into the state.yaml of every leaf under that owner.

Closing is the command's: when `akrogon phase <slug> merged` moves the completion owner to issues/closed, in that same step it runs `gh issue close -R owner/repo n --comment "merged <commit>"` for every entry in `sources`, checking the issue state first, one retry, failure printed, never reversing the merge. The next pull removes the seed file. The broadcast message stays with broadcast-issue.

Why: the operator wants the queue online where colleagues' agents already are, seeds on disk to chart from without moving anyone's files, and closure that needs no hand. Files fix the target, a mirror fixes the copy, the issue number fixes the duplicate check, and the command already owns the transition that means done.

Forecloses: a GitHub issue template as the intake shape, an import comment or label on GitHub, a label query in the door, a local import registry, closure by merge-issue or by commit keywords, a timer-driven pull, seed-issue asking where to post.

Operator rule 2026-09-09 (chat, recorded for handoff): the chart-issues door consolidates seeds by destination and by speed of resolution. Seeds that share a destination and no dependency become parallel leaves of one issue; independent issues are shaped to run side by side; only a planner-named dependency (see # Parallel Merge) puts leaves in order. The door proposes the split that finishes soonest, not the tidiest one, and shows it to the operator before writing.

### # Multi Chart Layout

Charts live at `issues/chart/<chart-slug>/` with CHART.md, INTAKE.md (source text verbatim plus scope) and decisions/, always a subfolder, never moved; a handed-off chart gets one "Handed off <date>" line. The work tree is `issues/open/<epic>/<issue>/<leaf>/` or `issues/open/<issue>/<leaf>/`: a leaf is any folder holding state.yaml, an issue is the folder holding leaves, an epic is a folder holding two or more issues; a single issue has no epic. Plain slugs, unique within the repo, enforced at handoff; commands take the bare slug; no order or mode markers in names; order lives only in each leaf's blocked-by. An index file per container (EPIC.md listing issues, ISSUE.md listing leaves, one line each with purpose), written by the handoff, never read by the command. A leaf's issue is its parent folder; the merged transition holds `flock` on `<issue>/.lock` around the state write and the "every sibling merged" check and reports completion only from the transition that made it true, so one broadcast per issue. Authoritative state is the registered repo checkout from global `repos`; worktree copies of issues/ are inert. `hand_built: true` in leaf state makes `next` and `--all` skip the leaf. The handoff writes directly into issues/open in one attended pass; a leaf whose blocked-by names a missing folder is refused. A finished issue, or a finished epic as a whole, is moved by the command to `issues/closed/` under the issue lock right after the completion check; a failed move is retried by the next run. One log file, `issues/log.jsonl`. Why: every fact the command needs is a folder or a state field, every fact a person needs is one short index file beside the thing it describes, and one rename closes work. Forecloses: the term "series", July 28 markers and series-wide state, an explicit issue reference in state, a state copy in worktrees, per-leaf broadcasts, staged publishing, issue records that never close.

From # Status View 2026-09-09: operator dropped the `hand_built` marker from status rows ("useless"); the flag still skips `next`.

From # GitHub Intake 2026-09-09: `issues/seeds/` is a gitignored derived mirror of open GitHub issues, the one folder outside leaf folders, deletable at any time; leaf state.yaml gains `sources: [owner/repo#n]` written by the handoff; the transition that moves an owner issue or epic to issues/closed also closes those GitHub issues.

From # Lessons 2026-09-09: `learnings/LESSONS.md` and `learnings/history/` are per-repo tracked files beside issues/, the only prose read outside the leaf by plan-issue and chart-issues.

### # Lessons

Each repo keeps `learnings/LESSONS.md`, the active list, one line per lesson naming the abstract learning, the mechanism it concerns, the date and its history file, under a header that says these are learnings about what happened, not what is true. Each lesson also has `learnings/history/<date>-<slug>.md` with the specific case, evidence and the abstract lesson; history is never pruned or rewritten, is on no pass's reading list, and may be opened to check a lesson's evidence. The agent that finds a reusable lesson writes both in its own pass, from failed and successful work alike; the checker verifies the claim while reviewing the change it rides on. A line leaves the list when its improvement lands in the owning skill, doc or command (the implementing leaf deletes it and dates the history file) or when the operator prunes at chart open; no numeric cap. plan-issue and chart-issues read the list as one resource beside the reference index, never as a rule; implement, check and merge do not read it. Performance-log analysis happens on demand. The old lessons folder moves to `learnings/history/` unchanged in the last bootstrap leaf, relative links fixed, no active lines derived.

Why: the intake wants one or two lines per lesson, always updated, pruned, about mechanisms already running, and history kept. Two files give a short list that shapes work and a record that never shrinks, and the line leaving the list when applied is what keeps the list from becoming instructions.

Forecloses: lessons as canon or as a gate, a numeric cap, a lessons pass at every leaf end, every pass reading the list, distilling the old folder into active lines, a separate learning review.

### # Index Levels

The repo's reference index is two levels of plain Markdown: a top file, pointed at by the per-repo `grounding.index` config key, listing areas one line each with a link, and one area file per area listing entry points, purpose, contracts and doc links one line each. An area splits only when it is hard to scan; a small repo keeps a single file. No nested AGENTS.md or CLAUDE.md, so every harness reads the same files through the skills. Reading: plan reads the top file and the areas it needs and builds the brief's read-first list; the worker starts from that list and opens the index only on a gap; check follows the diff and the contracts it affects. Writing: the implementer updates affected docs and area lines in the same worktree before check; the checker verifies them against the diff; merge fixes only drift that integration exposes, keeping both entries on a same-line conflict when both are true. The drift audit script is retired; review does that check in prose, and a real defect goes through the normal fix round.

Why: the cost was whole-index reads on every pass; the split turns those into a top file plus the areas a pass needs, and turns most doc merge conflicts into different-file merges. Writer and separate reviewer is the reason two slots exist, so the implementer writes and the checker checks.

Forecloses: one flat index read whole, harness-loaded nested instruction files, an exhaustive per-file inventory, docs authored by the checker, any script that parses index rows.

### # Debate Count

One debate, on the implementation plan, by default. The door asks one question, debate or not, next to the consult election, and writes one field; very small issues skip it and slot B writes the plan alone. Planning's unique outputs, decision IDs, codebase grounding and the execution checklist, move into the implementation synthesis. One rebuttal round stays a per-repo flag, default on, fired only on a real fork. Roles are fixed, slot A strategist, audit and merge, slot B implementation synthesis and execution, and any slot may run any harness at any time. Why: the door locks decisions, so a planning debate would re-litigate them at eleven top-model passes per issue, and the rebuttal evidence (Khan, Du vs Smit, "Stop overvaluing MAD") only supports a second round when a fork exists. Forecloses: a planning debate, a second implementation debate, a per-issue rebuttal setting, any slot-to-harness binding.

From # Door Second Slot 2026-09-09: the door's second slot is separate from the implementation debate field; naming B's pane at chart open does not touch it.

### # Door Settles Human Steps

The door settles product choices and completes known human steps before the leaf opens, and the door skill must warn the operator during chart-issues or create-issue when it sees such a step. An unforeseen physical blocker ends that attempt and pings the operator, no hold state anywhere. Operator answered 7-A on 2026-09-08. This forecloses leaves opened with human steps outstanding.

### # Merge Without Approval

Yes. After the door, no approval step exists anywhere in the loop. The operator answered 3-A on 2026-09-08 because the August stall was operator availability, and the two-door rule means the operator is only at intake. This forecloses a merge-ready wait, an approval gate at P-synth as July 28 had, and any hold state.

### # Handoff Location

The two lines are printed, never saved. Every skill pass ends its response with exactly this shape, judged by a reader, never parsed:

```text
Last operation: <what this pass did and observed, one or two sentences, naming the phase it moved to>
Next: <skill> <slug> slot=<A|B> phase=<phase>
```

"Next" is the prompt line the next pass receives, reproduced from the state the pass just wrote. When no pass is due (merged, failed, waiting on a peer answer) it reads `Next: none` plus the reason. The hook and `akrogon next` are the authority; if retry or peer routing sends the real prompt elsewhere, the printed line is simply wrong and nothing breaks. A note meant for the next agent goes in the artifact the pass already writes (plan, review, report), not in the footer.

Backup use: the footer is the probabilistic backup layer from # Skill Rewrite. An agent that finds its context scrambled may read the first 50 to 100 words of the other pane to confirm what happened. It never derives slot, phase, readiness or completion from it, and a missing or empty tail never blocks the pass.

Why: the next pass already receives its prompt line, the state file and the leaf files, so a saved copy of two prose lines has no reader. Printing costs nothing, serves the operator on hand-built leaves, and keeps the backup.

Forecloses: `handoff.md`, a handoff section in the plan, pasting the lines into the `next` prompt, the July 28 Grounding footer line, and any reader that parses the footer.

### # Operator Only Install

Only the operator installs and runs it, colleagues file GitHub Issues. Operator answered 6-A on 2026-09-08 with a condition: the design must stay simple enough that anyone can pick it up later, and the skills must be usable individually. How a later person obtains them, for example by downloading the skills folder from the GitHub repo, is part of # Distribution. This forecloses install docs and testing on other machines for this chart.

### # Driver State

State lives in the issue's own `state.yaml`: `phase`, `attempts`, `done`, `slot` and `pane` hints. `akrogon next` finds the issue from the pane's cwd, which herdr restores across restarts, or from the folder the operator names. Tabs and panes are created and named automatically by the command from the slug, one tab of two panes per leaf, never reused. Slot is text in the prompt. The phase-to-skill-and-slot table is a constant in the command. Work starts only when the operator runs `akrogon next` on a leaf, an epic folder or `--all`; a merge closes the tab and starts what it unblocked, bounded by `max_active`. Blocked or unknown panes go to the peer wake-up path from # Next Command Owner. Auto-approval per harness is a fact, not a setting: Claude `--dangerously-skip-permissions`, Codex `-a never -s danger-full-access`, pi `-a`. Why: cwd is the one fact herdr owns and restores, so no mapping file, no registry, no program to maintain. Forecloses: a pane registry, tab renaming by hand, a separate `start` verb, pane reuse across issues, marker files for slot, any auto-start after the chart.

From # Config Shape 2026-09-08: `akrogon next` starts a slot by filling the harness launch line from config with the slot model and effort and handing it to herdr; `akrogon config` prints the effective config for a repo.

From # Model Tiering 2026-09-09: `akrogon phase` also appends one JSON line to `issues/log.jsonl` per move, from data it already holds plus `git rev-parse HEAD` and `git diff --shortstat $AKROGON_BASE` in the worktree.

From # Repeat Safety 2026-09-09: `next` and `phase` take `flock` on `<leaf>/.lock` (gitignored) around state read-modify-write; `next` prompts with `--wait --until working` and a short timeout; a `working` event never counts an attempt.

From # Multi Chart Layout 2026-09-09: "series" is now "epic" (two or more issues); the command moves a finished issue or epic to issues/closed under the issue lock; `hand_built: true` leaves are skipped by `next` and `--all`; the authoritative state is the registered checkout, never a worktree copy.

From # GitHub Intake 2026-09-09: state.yaml gains an optional `sources` list; `akrogon phase merged` closes the listed GitHub issues when the owner folder moves to closed, state check first, one retry, failure printed.

### # Turn Within Phase

Whose turn it is comes from one field: `phase`, a dotted name per pass, about 24 names, moved only by `akrogon phase` with compare-and-set and tmp+rename. A pass whose two slots run concurrently (positions, rebuttals, check reviews) is one phase with a `done` list and per-slot `attempts`; the command refuses to advance until both slots are done, and for reviews it decides from two recorded `--verdict` flags. The fix loop is the review phase entered again with `fix_rounds` one higher, capped by config, cap reached means `failed`. The routing table is a typed constant in the command. Why: one field with no product of phase and step makes illegal pairs unrepresentable (Minsky, gen_statem, statecharts, Temporal), a crash re-prompts the same pass, and no code reads prose or scaffolded files. Forecloses: run-status tokens, a step field beside phase, files-as-turn-signal, a shared single done value, any review verdict parsed from text.

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

`skills/chart-issues/SKILL.md` plus assets (question authoring, leaf shapes, standing design) rewritten from the current file, which is the July shape plus this chart's edits. The handoff shapes are those written by this handoff: EPIC.md and ISSUE.md one line per child, brief.md with What, Why, Done-criteria, design.md with Binding decisions verbatim and Leaf architecture, state.yaml with the handoff fields. Leaf file names, fixed for every leaf: `positions-A.md` and `positions-B.md` (blind positions), `rebuttal-A.md` and `rebuttal-B.md`, `plan.md` (the synthesis; slot A's diagnosis paragraph is appended to it after `failed`), `implementation/brief.md` (the worker brief), `review-A.md` and `review-B.md` (each reviewer's findings; A's re-check notes and merge findings append to `review-A.md`), `questions/<id>.md` (peer answers), `.lock` (gitignored). State fields written by the handoff: `slug`, `phase`, `created`, `priority`, `repo`, `consult`, `debate`, `blocked-by`, `sources` (optional), `hand_built` (only when true). A pane runs one turn at a time and is prompted again only after a phase move, so the `done` guard is the whole stale-call defence. Fields written by the command: `attempts` (map slot to count for the current phase), `done` (list of slots done in the current phase), `fix_rounds`, `verdict` (map slot to word), `tab`, `worktree`. Log line fields (one JSON object per phase move): `ts`, `repo`, `slug`, `from`, `to`, `slot`, `attempts`, `fix_rounds`, `verdict`, `head`, `diff` (shortstat against `AKROGON_BASE`), `session` (the harness session id from the pane, when known). Phase names: `plan.positions`, `plan.rebuttal`, `plan.synthesis`, `implement`, `check.review`, `check.fix`, `merge`, `merged`, `failed`; a leaf with `debate: no` starts at `plan.synthesis` and slot B writes the plan alone. Handoff answers that bind: 3-A, 5-A, 6-A, 7-A of 2026-09-09. Ownership: `skills/chart-issues/`, deletion of the three old skills. Not this leaf: pull (leaf pull-close), init (leaf init-issues), seed-issue's text (leaf seed-issue), the repo's own index and LESSONS.md (leaf retire-old).
