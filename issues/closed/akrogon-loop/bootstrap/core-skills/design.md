# Design: core-skills

Chart skill version: 4

## Binding decisions, verbatim

### # Bootstrap

The hand-built path: the `akrogon` command (install, init, config, phase, next, status), the herdr plugin, and the implement, check and merge skills, as one or two leaves in the handoff marked hand-built. The operator drives those leaves in two herdr panes, typing every pass prompt with both slots guiding, so the loop is seen once by hand before it is automated. Everything else (plan, chart, seed, broadcast skills, status view, intake work) is built by the tool on this repo, which is its own first consumer; the old-shaped issues/config.yaml and issues/.scripts are removed in the first hand-built leaf and rewritten by `akrogon init`. After the hand-built leaves merge: installer run once from source with bun, then every step through the installed command and skill symlinks. Hand-built leaves finish by hand; the first automated leaf is fresh and elected without debate; takeover is proven by one hands-off merge plus one deliberate check.fix exercise on a real failing check, then parallel leaves. If the command cannot dispatch its own repair during bootstrap, it is repaired in a direct session with the operator guided by both slots and the run is recorded as failed automation. new-beginning/ and reference/ are deleted in the last leaf once nothing in the handoff or archived chart points into them. Why: the operator's July numbers show hand-driving lands work, and one hand-driven pass is the operator's model of what the command automates. Forecloses: reviving the July 28 lifecycle, a temporary driver script, a second state store, transferring a half-done hand leaf into automation.

From # Lessons 2026-09-09: the last bootstrap leaf moves reference/lessons into learnings/history/ unchanged, fixing relative links, deriving no active line.

From # Command Tests 2026-09-09: the bootstrap leaves that build the command each add its test file under a small test tree run by `checks.test`; the takeover leaf is the live proof and no automated test drives real herdr or GitHub.

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

### # Implementer Brief

The implementer receives one file, `implementation/brief.md`, written by slot B in its implement pass, eight sections: goal with decision IDs, numbered acceptance criteria, read-first list with one pattern to copy and the ponytail file, change list, do-not list with reason and exception restated at the end, ordered steps naming file and criterion, config commands, done-when with pasted command output and a short report. Under 1,500 words and under 20 rules, steered by the skill text and judged by the plan author, never counted by machinery. Slot B is never a cheap model; it spawns the cheap worker and gives it the brief path and the worktree path. A leaf that is one verifiable unit gets one brief; otherwise B writes numbered sub-briefs and runs the workers in order in the one worktree, each worker's done being its tests and the config checks, and B runs the full suite once after the last. A worker returns a mismatch to B instead of changing an interface or scope; B revises the brief; the phase never moves. The checker reads the same file's criteria, change list, do-not list, done and report, and still judges the whole diff. Why: 2026 measurements show small models collapse under stacked rules, drop prohibitions without exceptions, waste tokens on "consider alternatives", and claim done without evidence; the format addresses each with one section rather than a rule. Forecloses: a separate checker brief, pseudocode plans, a word counter, parallel workers in one worktree, a phase or state for sub-briefs, any mismatch reaching the operator.


Operator-locked 2026-09-08: the brief's commands section lists `test_changed` for the worker and nothing else; workers never run the full suite; the full suite runs once per leaf, by B after the last worker, before handoff; reviewers rerun it only on a specific concern. Config names `test_changed` wherever the runner supports it, which is every repo surveyed.

Operator 2026-09-08: a red full suite at the end of the leaf is fixed by a worker, not by B: B writes one more sub-brief whose acceptance criteria are the failing tests with the output pasted, the worker fixes and runs the changed command, B reruns the full suite. B fixes by hand only when the change is a line or two.
Refinement: a failure inside one brief's files goes to a worker; a failure between briefs, a wrong shared interface or two workers' choices not fitting, is B's, who fixes the plan and reruns the affected worker; one or two lines B edits itself.

Reshape 2026-09-08 after # Parallel Merge: at fix round three slot B repairs itself with no worker sub-brief.

Reshape 2026-09-08 after # Config Shape: workers get the fix rounds before the last; slot B takes the last one itself. `test_changed` compares against `$AKROGON_BASE`, the leaf branch point on main.

From # Index Levels 2026-09-09: the brief's read-first list comes from the plan's walk of the top index and its areas; the worker opens the index only on a gap; the implementer, not the checker, updates the docs and area lines its change affects.

Operator 2026-09-10 (2-A), four changes to the eight sections after a research check by both slots: section 4 (change list) carries the interfaces this worker needs, signatures, data shapes and what the preceding worker produced, not every interface; section 5 (do-not) tells the worker itself to return a mismatch with evidence to the plan author instead of changing scope or an interface; section 6 (ordered steps) states an advisory size, about N files and under M turns, and the worker reports a mismatch when the work is clearly past it, never a hard stop; section 8 (report) names changed files with reasons, test results, known limitations and any criterion not verified. Evidence: Software Delegation Contracts 2026-06-14 (changed-file reporting 7% to 93%, limitations 0% to 80%, +13% tokens, pass rate unchanged), Cursor 2026-07-20 (planners settle interfaces before delegating), Anthropic multi-agent 2025-06 (effort scaling), LangWatch 2026-08-02 (top 10% of workers make half of all calls).

Operator 2026-09-10 (compliance, 1-A 2-A 3-A): section 8 ends with a four-line fill-in skeleton, equivalent wording accepted: `Changed files and reasons: <path, why>` / `Tests run: <command, result>` / `Known limitations: <or none known>` / `Unverified criteria: <criterion, why, or none>`. The launch prompt carries one line beside the brief and worktree paths: read the brief before editing, follow sections 5 and 6, reread section 8 and fill its report before returning; the rules are not copied. Slot B refuses a worker return whose report lacks any of the four contents, judged by content not heading, and sends it back to the worker for the report; that is a worker turn, never a check.fix round and never a `fix_rounds` increment. The checker gives `fix` only for material gaps. Evidence: Compliance Gap arXiv 2605.01771 2026-05-03 (0% process compliance unmonitored, 97% when the audit trail is checked), Codex spawn_agents_on_csv docs 2026-03-26 (a worker exiting without its report call is marked error), McMillan arXiv 2605.10039 2026-05-11 (position and file structure null, compliance drifts 5.6% per function generated), Instruction Stacking Collapse arXiv 2608.02639 2026-07-31 (96% to 20% from 1 to 20 rules).

Operator 2026-09-10 (standalone): `implement-issue` with no leaf in its prompt runs standalone: the prompt text is the task, the current checkout is the repo, the session acts as slot B. It plans briefly, writes the same eight-section brief, delegates, sends back a return with a missing report, runs the changed tests, repairs itself. It reads no config, no leaf file, writes no state and no log line, and no checker follows. The brief template and worker protocol therefore live in the skill folder and depend on nothing outside it. Other loop skills stay leaf-only.

### # Quality Layers

Four layers become two. The plan audit and the mandatory QA subagent are gone; the implementer may spawn a subagent freely and nothing records it. The repo's own tools measure: config lists the check commands, linter, typecheck, full tests, an optional changed-tests command, and optionally a mutation-testing command; a quality blocking flag says whether failures block. Reviewers judge: a finding blocks only for a real defect, wrong behavior, broken contract, a concrete maintainability problem, or one of ponytail's four never-cut items when it is also a defect; everything else is a "Nit:" and never starts a fix round. Verdicts are ready, ready with nits, or fix. A re-check reads the repair diff only, confirms earlier findings, and may add a blocking finding only if the repair introduced it; fix rounds are capped by config, three by default, then failed. Reviewers rerun checks only on a change, missing evidence or a concern. Tests: the planner writes acceptance criteria in the brief, the implementer derives tests from them before code, red then green, one per criterion, a fail-first test for a bug, no test for trivial one-liners; the checker compares tests to criteria and rejects mocks of the unit under test. Code-quality advice is one 32-line file, ponytail's rule text, in the skills folder, required reading for implement and check, no plugin, no separate simplify pass. Why: the intake measured the watchers at 74 stall hours a month against 2 for deterministic checks; Shiryaev July 2026 measured rules-in-context working and passive skills never activating; 2025 and 2026 evidence shows agents special-case tests after failures and over-mock, and criteria written by another role before code remove the target. Forecloses: the fidelity audit phase, a mandated QA pass, AQ- ids and the advisory rulebook, a required quality paragraph, a post-hoc simplify pass, full re-review per round, any test selection logic in akrogon, an installed ponytail plugin.

Operator addition 2026-09-08: before a leaf is marked failed at the fix-round cap, slot A writes one paragraph into the plan, what kept failing and why. Prose for the operator only, nothing reads it. On the operator's follow-up about swapping the implementer at the cap: rejected, the reviewer would become author and judge, three failures usually mean a wrong brief or design, and it adds a second counter. Failed is terminal like merged, the operator restarts with `akrogon phase <slug> implement` after fixing the brief, or drops the leaf.

Operator 2026-09-08, later reply: round 2 Q5 answered in words, "understood, I agree", recorded as 5-A. TIA clarified: always used where the repo's config names a changed-tests command, never required, never selected by akrogon; sub-briefs each run the fast command, B runs the full suite once.

Operator-locked 2026-09-08: the brief's commands section lists `test_changed` for the worker and nothing else; workers never run the full suite; the full suite runs once per leaf, by B after the last worker, before handoff; reviewers rerun it only on a specific concern. Config names `test_changed` wherever the runner supports it, which is every repo surveyed.

Reshape 2026-09-08 after # Parallel Merge: check.fix is also entered from merge on conflict or red checks after rebase, with findings written by slot A; at fix round three slot B repairs itself, no worker, before failed (operator 4-yes).

Reshape 2026-09-08 after # Config Shape: the `quality.blocking` flag is gone; every command under `checks` blocks, an optional `advisory` list reports failures as Nit. Slot B repairs itself on the last allowed round, workers take the rounds before it.

From # Index Levels 2026-09-09: the checker verifies the implementer's docs and index lines against the diff; the reviewer never authors them; drift audit script retired.

From # Command Tests 2026-09-09: in the akrogon repo, check-issue treats a test that asserts prose or output wording as a maintainability defect; exact text is testable only where it runs as written; a new test needs a contract or an observed defect behind it, never coverage.

Operator 2026-09-10 (1-A, nits from A's position): at check.review slot A reads its own positions-A.md and rebuttal-A.md first; they say where to look hardest. A finding grounded in a done criterion, a failing `checks` command or a reproducible defect is a Fix and cites which. A finding grounded only in A's own position is a Nit with its reason, never a Fix, so it cannot open a check.fix round. At merge, a Nit slot A still holds and finds reusable becomes one lesson line plus its history file under the # Lessons rule; B meets it at its next plan. No new turn, no new file, no B reply on the same leaf.

### # Parallel Merge

Slot A merges inside the leaf's tab: rebase the leaf branch on current `origin/main`, rerun the config checks, push fast-forward only to `origin main`. There is no local main branch, no lock and no queue; git's refusal of a non-fast-forward push is the serializer, and the loser rebases, rechecks and pushes again. The leaf is `merged` only after the push succeeds; then the cheap writer broadcasts with one retry, failure recorded in the leaf folder, never blocking. A rebase conflict or red checks after rebase: slot A writes findings as a reviewer would (conflicting files or pasted failing output, rebased-on commit), moves the leaf to `check.fix`; slot B repairs in the same worktree, slot A re-checks the repair diff, then merges again; fix rounds count as usual, and at round three slot B repairs itself with no worker before `failed`. A break on main found later by another leaf's full suite is fixed forward by that leaf in its own `check.fix`, failing tests as acceptance criteria, no revert step.

Why: the push already does what a lock or queue would, and reusing check.fix gives conflict resolutions a second reader with no new phase, file or counter; 2026 evidence (Piaggio, Mikhalev, Lin) says the danger is untested combinations and resolvers discarding the other side's intent, which checks-after-rebase and the re-check cover.

Forecloses: a merger tab or process, a local main checkout, file locks, force pushes, a revert step, broadcast as a completion condition.

Reshape 2026-09-08 after # Config Shape: "round three" reads as "the last allowed round" of `fix_rounds`.

### Operator explanations 2026-09-08 (chat, recorded for handoff)

Merge sequence. Review passes. Slot A runs `akrogon phase <slug> merge`, then in the leaf worktree: fetch, rebase the leaf branch onto `origin/main`, run every command under `checks`, push the branch to `origin main` fast-forward only. Never force. If the push is rejected because main moved, repeat from fetch. A rejected push lands nothing. A lost network reply may still have landed: check whether the leaf head is an ancestor of `origin/main` before repeating. After the push succeeds, `akrogon phase <slug> merged`; the tab closes; the cheap writer runs broadcast-issue once with one retry; a broadcast failure is written into the leaf folder and never reopens the leaf.

Conflict or red checks after rebase, step by step. 1. Slot A writes findings into the same file the reviewer uses: the conflicting files, or the failing command output pasted, plus one line naming the commit the branch is now rebased on. 2. Slot A runs `akrogon phase <slug> check.fix`; fix_rounds plus one. 3. `akrogon next` prompts slot B in the same tab with implement-issue, phase check.fix; B reads the findings file, repairs in the same worktree, runs its checks, runs `akrogon phase <slug> check.review`. 4. Slot A re-checks only the repair diff, gives `--verdict`, and on ready returns to merge. Same cap as any repair; on the last allowed round B repairs itself without a worker; at the cap the leaf is `failed` with A's diagnosis paragraph. The whole loop stays in one tab and one worktree; other leaves are in other tabs and are not involved.

Main broken after two green leaves both landed. The leaf that discovers it, through its own full suite after rebase, fixes it forward in its own check.fix with the failing tests as acceptance criteria. No revert step. The checker's existing rule against weakening a failing test applies.

From # Repeat Safety 2026-09-09: the broadcast after merge is per issue, not per leaf; the merge skill sends only when `akrogon phase <slug> merged` reports the issue's last leaf merged.

From # Status View 2026-09-09: the carried "broadcast failure visible in status" is retired; Repeat Safety records no broadcast outcome, so status has nothing to show.

From # Index Levels 2026-09-09: area index files make parallel doc updates different-file merges; a same-line conflict is resolved at merge by keeping both true entries and rechecking pointers.

### # Peer Questions

Outside the door, a solo pass that needs the peer asks once: it prompts the peer pane through herdr with the question in Question and Option form and the instruction to write the answer to `<leaf>/questions/<id>.md`, runs `herdr agent wait` on the peer with no timeout, reads the file, and decides. One exchange; the asker owns the decision; ties break by simplicity, clarity, elegance, cost, speed, quality. State is untouched, no pane read for the answer. `akrogon next` already checks the peer idle before prompting; a mid-pass question to a working peer waits for idle first. Forecloses: sending a fork to the operator, pane reads as the return path, more than one exchange.

### # Debate Count

One debate, on the implementation plan, by default. The door asks one question, debate or not, next to the consult election, and writes one field; very small issues skip it and slot B writes the plan alone. Planning's unique outputs, decision IDs, codebase grounding and the execution checklist, move into the implementation synthesis. One rebuttal round stays a per-repo flag, default on, fired only on a real fork. Roles are fixed, slot A strategist, audit and merge, slot B implementation synthesis and execution, and any slot may run any harness at any time. Why: the door locks decisions, so a planning debate would re-litigate them at eleven top-model passes per issue, and the rebuttal evidence (Khan, Du vs Smit, "Stop overvaluing MAD") only supports a second round when a fork exists. Forecloses: a planning debate, a second implementation debate, a per-issue rebuttal setting, any slot-to-harness binding.

From # Door Second Slot 2026-09-09: the door's second slot is separate from the implementation debate field; naming B's pane at chart open does not touch it.

Operator 2026-09-10 (F1-A): the consult election and the debate question are one question and one field. `consult` leaves state.yaml; `debate: yes|no` is the whole election, asked once at the door with a recommendation from the settled design, default no, read by plan-issue. Intake 151's requirement, one question and one field, is met by `debate` alone; the second field arrived when the planning debate was cut and had no reader.

### # Turn Within Phase

Whose turn it is comes from one field: `phase`, a dotted name per pass, about 24 names, moved only by `akrogon phase` with compare-and-set and tmp+rename. A pass whose two slots run concurrently (positions, rebuttals, check reviews) is one phase with a `done` list and per-slot `attempts`; the command refuses to advance until both slots are done, and for reviews it decides from two recorded `--verdict` flags. The fix loop is the review phase entered again with `fix_rounds` one higher, capped by config, cap reached means `failed`. The routing table is a typed constant in the command. Why: one field with no product of phase and step makes illegal pairs unrepresentable (Minsky, gen_statem, statecharts, Temporal), a crash re-prompts the same pass, and no code reads prose or scaffolded files. Forecloses: run-status tokens, a step field beside phase, files-as-turn-signal, a shared single done value, any review verdict parsed from text.

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

### # Index Levels

The repo's reference index is two levels of plain Markdown: a top file, pointed at by the per-repo `grounding.index` config key, listing areas one line each with a link, and one area file per area listing entry points, purpose, contracts and doc links one line each. An area splits only when it is hard to scan; a small repo keeps a single file. No nested AGENTS.md or CLAUDE.md, so every harness reads the same files through the skills. Reading: plan reads the top file and the areas it needs and builds the brief's read-first list; the worker starts from that list and opens the index only on a gap; check follows the diff and the contracts it affects. Writing: the implementer updates affected docs and area lines in the same worktree before check; the checker verifies them against the diff; merge fixes only drift that integration exposes, keeping both entries on a same-line conflict when both are true. The drift audit script is retired; review does that check in prose, and a real defect goes through the normal fix round.

Why: the cost was whole-index reads on every pass; the split turns those into a top file plus the areas a pass needs, and turns most doc merge conflicts into different-file merges. Writer and separate reviewer is the reason two slots exist, so the implementer writes and the checker checks.

Forecloses: one flat index read whole, harness-loaded nested instruction files, an exhaustive per-file inventory, docs authored by the checker, any script that parses index rows.

### # Lessons

Each repo keeps `learnings/LESSONS.md`, the active list, one line per lesson naming the abstract learning, the mechanism it concerns, the date and its history file, under a header that says these are learnings about what happened, not what is true. Each lesson also has `learnings/history/<date>-<slug>.md` with the specific case, evidence and the abstract lesson; history is never pruned or rewritten, is on no pass's reading list, and may be opened to check a lesson's evidence. The agent that finds a reusable lesson writes both in its own pass, from failed and successful work alike; the checker verifies the claim while reviewing the change it rides on. A line leaves the list when its improvement lands in the owning skill, doc or command (the implementing leaf deletes it and dates the history file) or when the operator prunes at chart open; no numeric cap. plan-issue and chart-issues read the list as one resource beside the reference index, never as a rule; implement, check and merge do not read it. Performance-log analysis happens on demand. The old lessons folder moves to `learnings/history/` unchanged in the last bootstrap leaf, relative links fixed, no active lines derived.

Why: the intake wants one or two lines per lesson, always updated, pruned, about mechanisms already running, and history kept. Two files give a short list that shapes work and a record that never shrinks, and the line leaving the list when applied is what keeps the list from becoming instructions.

Forecloses: lessons as canon or as a gate, a numeric cap, a lessons pass at every leaf end, every pass reading the list, distilling the old folder into active lines, a separate learning review.

### # Busy Pane Prompting

Herdr does not refuse prompts to a working pane, it types them in, and the agent may drop the earlier instruction. 'done' means the pane stopped, not that the work finished. The driver must check idle before every prompt and must read completion from the phase, never from the pane state. Forecloses relying on herdr for never-stack.

### # Model Tiering

Slot A and slot B always run their configured strong model for every pass; no pane changes model between phases. akrogon is aware of the two slot models only, because it launches the panes; worker subagents, the broadcast writer, their models, effort and any override are configured and chosen inside each harness, and the implement skill says only "delegate the sub-brief to a subagent". The `workers` key leaves the global config (correction to # Config Shape). The repair cap and the last-round-by-B rule stay in the command. A worker earns its keep by subscription allowance plus paid overage per completed leaf, failed leaves counted, measured from the performance log: `akrogon phase` appends one JSON line per phase move to `issues/log.jsonl` with the mechanical fields listed in Findings, no tokens, no prose; token usage is joined later from harness session files by an analysis agent. Why: the machinery holds one lever, the slot model, and cannot push a wrong one for workers; the log is one write in code that already runs and gives the data the intake's stall analysis needed by hand. Forecloses: a `workers` map, worker effort keys, a spawn table in skills, cost estimates written by agents, prose in the log.

From # Status View 2026-09-09: status shows minutes since the leaf's last log line for the current phase, or "unavailable"; no stuck verdict.

Operator 2026-09-10: advice, not a lock. Slot B on a subscription-capped frontier model (Fable 5.1 on a Max plan, GPT-6 Astra by API) is the cost driver of a delegated leaf, about two thirds of spend (Cursor 2026-07-20). Slot B stays never cheap; when the budget is the constraint, pick the cheapest model that still plans well (Opus 5, GPT-5.6 Luna medium) before switching a repo to `implement: inline`.

### # Repeat Safety

Safe twice by construction: `akrogon phase` is compare-and-set on phase, fix round and attempts, so a repeated or late move is refused; a merge that landed without the phase written is detected by ancestry and set to `merged`. Concurrency is serialized by a kernel `flock` on `<leaf>/.lock` around every state read-modify-write and around the whole `next` pass for that leaf; skills never call `next`, the herdr hook is the only caller. A stalled prompt is resent once, then handed to the peer; a re-prompted pass inspects the worktree and finishes what remains, rerunning checks only on changed code, missing evidence or a concern. Broadcast is one message per issue, sent by the merge skill when the command reports the issue's last leaf merged, one immediate retry, no success record. State is authoritative and the log is diagnostic; state is written first, a log failure never reruns a move. Retry policy is # Next Command Owner's: same slot twice, peer once, then failed; blocked or unknown panes go to the peer. Why: compare-and-set and one kernel lock cover every duplicate without a process, a timer or a second store, and the operator ranks speed above the sequential alternative. Forecloses: invocation ids, a herdr idempotency feature, per-leaf broadcasts, the term "category" (retired), recoverable logging, any operator wait.

Operator confirmation 2026-09-09: "When we say issue series ... consists of more issues that are sub issues, they are the categories ... broadcasting happens when the entire issue is done, which in the simple issue is just one issue, one category, and with the series it's as many broadcasts as there are issues that are part of it." Confirmed by slot A: series folder, one folder per sub-issue (the category), leaves inside; one broadcast per sub-issue when its last leaf merges; a simple issue is one category.

Operator correction 2026-09-09: the category is the issue. A series is a group of issues; an issue has one or more leaves; the broadcast for an issue fires when its last leaf merges, so a series broadcasts once per issue, and a simple issue broadcasts once. "Category" in this file means "issue".

Operator, 2026-09-09, locked vocabulary: "the category doesn't even have to exist as a term ... It's either one issue or a series of issues if it's a complex thing that we are doing. And every issue has either one leaf or multiple leaves." Three terms only: series, issue, leaf (series renamed epic later the same day in # Multi Chart Layout). Every earlier "category" in the chart files was rewritten to "issue" the same day.

From # Multi Chart Layout 2026-09-09: the term "series" is retired for "epic". The merged transition holds `<issue>/.lock` around the state write, the completion check and the move to issues/closed; a failed move is retried by the next run.

From # GitHub Intake 2026-09-09: GitHub close runs inside the owner-close transition under the issue lock, checks the issue state before acting, one retry, so a repeated transition never double-comments.

### # Driver State

State lives in the issue's own `state.yaml`: `phase`, `attempts`, `done`, `slot` and `pane` hints. `akrogon next` finds the issue from the pane's cwd, which herdr restores across restarts, or from the folder the operator names. Tabs and panes are created and named automatically by the command from the slug, one tab of two panes per leaf, never reused. Slot is text in the prompt. The phase-to-skill-and-slot table is a constant in the command. Work starts only when the operator runs `akrogon next` on a leaf, an epic folder or `--all`; a merge closes the tab and starts what it unblocked, bounded by `max_active`. Blocked or unknown panes go to the peer wake-up path from # Next Command Owner. Auto-approval per harness is a fact, not a setting: Claude `--dangerously-skip-permissions`, Codex `-a never -s danger-full-access`, pi `-a`. Why: cwd is the one fact herdr owns and restores, so no mapping file, no registry, no program to maintain. Forecloses: a pane registry, tab renaming by hand, a separate `start` verb, pane reuse across issues, marker files for slot, any auto-start after the chart.

From # Config Shape 2026-09-08: `akrogon next` starts a slot by filling the harness launch line from config with the slot model and effort and handing it to herdr; `akrogon config` prints the effective config for a repo.

From # Model Tiering 2026-09-09: `akrogon phase` also appends one JSON line to `issues/log.jsonl` per move, from data it already holds plus `git rev-parse HEAD` and `git diff --shortstat $AKROGON_BASE` in the worktree.

From # Repeat Safety 2026-09-09: `next` and `phase` take `flock` on `<leaf>/.lock` (gitignored) around state read-modify-write; `next` prompts with `--wait --until working` and a short timeout; a `working` event never counts an attempt.

From # Multi Chart Layout 2026-09-09: "series" is now "epic" (two or more issues); the command moves a finished issue or epic to issues/closed under the issue lock; `hand_built: true` leaves are skipped by `next` and `--all`; the authoritative state is the registered checkout, never a worktree copy.

From # GitHub Intake 2026-09-09: state.yaml gains an optional `sources` list; `akrogon phase merged` closes the listed GitHub issues when the owner folder moves to closed, state check first, one retry, failure printed.

### # Multi Chart Layout

Charts live at `issues/chart/<chart-slug>/` with CHART.md, INTAKE.md (source text verbatim plus scope) and decisions/, always a subfolder, never moved; a handed-off chart gets one "Handed off <date>" line. The work tree is `issues/open/<epic>/<issue>/<leaf>/` or `issues/open/<issue>/<leaf>/`: a leaf is any folder holding state.yaml, an issue is the folder holding leaves, an epic is a folder holding two or more issues; a single issue has no epic. Plain slugs, unique within the repo, enforced at handoff; commands take the bare slug; no order or mode markers in names; order lives only in each leaf's blocked-by. An index file per container (EPIC.md listing issues, ISSUE.md listing leaves, one line each with purpose), written by the handoff, never read by the command. A leaf's issue is its parent folder; the merged transition holds `flock` on `<issue>/.lock` around the state write and the "every sibling merged" check and reports completion only from the transition that made it true, so one broadcast per issue. Authoritative state is the registered repo checkout from global `repos`; worktree copies of issues/ are inert. `hand_built: true` in leaf state makes `next` and `--all` skip the leaf. The handoff writes directly into issues/open in one attended pass; a leaf whose blocked-by names a missing folder is refused. A finished issue, or a finished epic as a whole, is moved by the command to `issues/closed/` under the issue lock right after the completion check; a failed move is retried by the next run. One log file, `issues/log.jsonl`. Why: every fact the command needs is a folder or a state field, every fact a person needs is one short index file beside the thing it describes, and one rename closes work. Forecloses: the term "series", July 28 markers and series-wide state, an explicit issue reference in state, a state copy in worktrees, per-leaf broadcasts, staged publishing, issue records that never close.

From # Status View 2026-09-09: operator dropped the `hand_built` marker from status rows ("useless"); the flag still skips `next`.

From # GitHub Intake 2026-09-09: `issues/seeds/` is a gitignored derived mirror of open GitHub issues, the one folder outside leaf folders, deletable at any time; leaf state.yaml gains `sources: [owner/repo#n]` written by the handoff; the transition that moves an owner issue or epic to issues/closed also closes those GitHub issues.

From # Lessons 2026-09-09: `learnings/LESSONS.md` and `learnings/history/` are per-repo tracked files beside issues/, the only prose read outside the leaf by plan-issue and chart-issues.

### # Merge Without Approval

Yes. After the door, no approval step exists anywhere in the loop. The operator answered 3-A on 2026-09-08 because the August stall was operator availability, and the two-door rule means the operator is only at intake. This forecloses a merge-ready wait, an approval gate at P-synth as July 28 had, and any hold state.

### # Command Tests

Separate test files, one per subcommand, run by bun test as the akrogon repo's `checks.test`; the shipped command carries no test code. The tests are a handful of command-level scenarios on a temp repo with real files and real processes: a stale phase move refused, the same command run twice, two processes racing on one leaf, pull adding and deleting seeds, status on a fixture tree. Herdr and gh are substituted at one thin boundary. The Bootstrap takeover stays the live integration proof. A test exists only for an observable contract: a state transition, a file shape, a refusal, or a defect that happened; never for prose or output wording, except text that runs as written (commands, numbers, fixed references); no coverage target; check-issue treats a wording test as a maintainability defect under # Quality Layers. Routine tests never touch the operator's real panes, install roots, GitHub issues, or the herdr socket. New tests need a contract or a defect behind them, never coverage, and the akrogon repo's briefs say so; the operator's rule is that the suite stays small.

Forecloses: inline `--self-test`, a line budget for tests, tests that restate the routing table, and any test that drives real herdr or GitHub.

### # First Pair

Claude Code in slot A, Codex in slot B, as config already states. Operator answered 5-A on 2026-09-08 because it is the pair in use and the pair this session exercised. Vendors stay swappable by config edit. This forecloses nothing about later pairs. It notes that 'done' for both is a screen guess.

### Decisions not binding this leaf

- # GitHub Intake: seed-issue and chart-issues are later leaves; merge-issue never closes GitHub issues
- # Status View: check-issue leaves review-A.md and review-B.md as the operator record and records the verdict with --verdict; the status command is leaf status
- # Command Tests: binding here only as the brief rule implement-issue carries for this repo; the tests themselves are leaf command

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

One folder per skill under `skills/<name>/` with `SKILL.md` and its references beside it; the harness roots get symlinks from `akrogon install`. Shared rules once at the top of each file, phase sections never restate them. Prompt line `<skill> <slug> slot=<A|B> phase=<phase>` is the only routing input; slot A is strategist, positions, review, merge; slot B is implementation synthesis and execution; any harness in any slot. Workers: "delegate the sub-brief to a subagent", no model names. Peer questions: prompt the peer through herdr with the instruction to write `<leaf>/questions/<id>.md`, `herdr agent wait`, read the file. Footer: `Last operation: ...` and `Next: <skill> <slug> slot=<A|B> phase=<phase>` or `Next: none <reason>`, printed only. Leaf file names, fixed for every leaf: `positions-A.md` and `positions-B.md` (blind positions), `rebuttal-A.md` and `rebuttal-B.md`, `plan.md` (the synthesis; slot A's diagnosis paragraph is appended to it after `failed`), `implementation/brief.md` (the worker brief), `review-A.md` and `review-B.md` (each reviewer's findings; A's re-check notes and merge findings append to `review-A.md`), `questions/<id>.md` (peer answers), `.lock` (gitignored). State fields written by the handoff: `slug`, `phase`, `created`, `priority`, `repo`, `debate`, `blocked-by`, `sources` (optional), `hand_built` (only when true). A pane runs one turn at a time and is prompted again only after a phase move, so the `done` guard is the whole stale-call defence. Fields written by the command: `attempts` (map slot to count for the current phase), `done` (list of slots done in the current phase), `fix_rounds`, `verdict` (map slot to word), `tab`, `worktree`. Log line fields (one JSON object per phase move): `ts`, `repo`, `slug`, `from`, `to`, `slot`, `attempts`, `fix_rounds`, `verdict`, `head`, `diff` (shortstat against `AKROGON_BASE`), `session` (the harness session id from the pane, when known). Phase names: `plan.positions`, `plan.rebuttal`, `plan.synthesis`, `implement`, `check.review`, `check.fix`, `merge`, `merged`, `failed`; a leaf with `debate: no` starts at `plan.synthesis` and slot B writes the plan alone. Handoff answer 4-A binds: check.review is two verdicts (each slot calls `akrogon phase` once and the command advances on the second), re-check after check.fix is slot A only. Ownership: `skills/plan-issue`, `skills/implement-issue`, `skills/check-issue`, `skills/merge-issue`, `skills/broadcast-issue`, deletion of `skills/consult-issue` and `skills/explain-issue`. Built in parallel with leaf `command` against the names above; the two leaves' combined live run is leaf `status`. The operator drives this leaf by hand in its own tab with both slots guiding and finishes it by hand.

From # Config Shape, Operator 2026-09-10 (1-A): per-repo key `implement: subagents | inline`, default `subagents`. `inline` means slot B writes the same brief as its own plan and implements it in order itself, `test_changed` as it goes, the full suite once, repairs itself, no sub-briefs, no worker, no mismatch return; chosen for a repo whose work cannot be split into bounded pieces (visual feedback loops such as 3D work) or whose log shows inline cheaper. Read by implement-issue through `akrogon config`; nothing else changes. Evidence: Morph routing benchmark 2026 (small tasks: Opus alone $2.78 vs planner plus Flash $3.18, same pass), Cursor 2026-07-20 (large project: 8x cheaper delegated), theinfinity.dev 2026-08-19 (delegate above about 250k main context), Co-Coder 2026-05-31 (cross-piece dependencies cost context transfer). `remote` and `default_branch` are the merge target: every `origin/main` in # Parallel Merge and # Repeat Safety reads as `<remote>/<default_branch>` from `akrogon config`, origin/main being the defaults.
