# Positions A: chart-issues

Blind position, slot A, 2026-09-11. Written from `brief.md`, `design.md`, the current `skills/chart-issues/` folder, the sibling rewritten skills, `src/state.ts`, `src/pull.ts`, `src/next.ts`, `tests/helpers.ts` and `learnings/LESSONS.md`. `akrogon config` reports `grounding: none`, so there is no reference index to read; that is a gap, not content.

## Recommendation

Replace the 418-line skill (about 7.6k tokens) with one `SKILL.md` of roughly 200 lines in the sibling shape (frontmatter `name` and `description` only, compaction line, title, prompt line, shared context, one section per door step, printed footer) plus two assets beside it with explicit read-when triggers:

- `assets/questions.md`: the Question/Option teaching form, batch opening paragraph, reply-key rules, evidence line, tags `(A)`, `(B)`, `(both)`, the `Slot B disagrees:` block, the challenge check, the territory map shape, the optional prototype question. Trimmed from the current 158 lines to about 90 by deleting the pane-read paragraph, the budget-check paragraph and the "partner batch read from its pane" rule, all foreclosed by the design.
- `assets/shapes.md`: every file the door writes, as templates with the field list: `CHART.md`, `INTAKE.md`, `decisions/<slug>.md` (Status open / blocked-by / resolved / out-of-scope, no Type), `EPIC.md`, `ISSUE.md`, `brief.md`, `design.md`, `state.yaml`, and the standing creation-locked design lines verbatim as the block `design.md` copies. This one file replaces `materialization-contract.md`, `seed-shapes.md`, `standing-design.md` and the archive rule.

Delete `fixtures/`, `scripts/`, `tests/` under the skill and the three skill folders `create-issue`, `braindump-issues`, `consolidate-issues`. No install script survives; `akrogon install` already symlinks whatever folders exist under `skills/` (`src/install.ts:11`).

Door steps in `SKILL.md`, in order: Open, Drain, Decide, Handoff. The single fuzzy issue is not a lane; it is the Drain result "one destination" plus a map that surfaces nothing unspecified, which lets the same session continue from Drain into Handoff.

## Concrete changes

### SKILL.md sections and budgets

| Section | Lines | Content |
| --- | --- | --- |
| Frontmatter, compaction line, title, prompt | 12 | Prompt is `chart-issues <notes, seed numbers or chart slug>`, typed by the operator, `slot B pane: <name>` optional. Dependency named: the installed `akrogon` command in a registered checkout. |
| Shared context | 25 | Read `akrogon config`; the cwd must be the registered checkout, not a worktree. Pocock's four lines. Read `learnings/LESSONS.md` and the `grounding.index` top file as resources, report a missing one as a gap. Reusable lesson rule (one line plus history file). B channel: A prompts B's named pane through herdr after idle, B writes `issues/chart/<slug>/slots/<name>.md`, A waits with `herdr agent wait` and reads the file; no pane read. Stamp line `Chart skill version: 7` copied into every file the door writes, as a YAML comment in `state.yaml`. |
| Open | 35 | First reply says single slot or names B's pane. Run `akrogon pull`; a non-zero exit (unregistered checkout, non-GitHub origin, `gh` failure) is quoted in the first reply and the door continues with what `issues/seeds/` holds. Offer the LESSONS.md prune as one question listing the lines. Blind map: A writes its own; when B is named, B writes `slots/map-B.md` from the intake alone, A merges with tags. Existing charts under `issues/chart/` without a "Handed off" line are listed; a chart slug in the prompt resumes that chart from `CHART.md`. |
| Drain | 40 | Inputs: `issues/seeds/<n>-<slug>.md` (its `Source: owner/repo#n` line is the identity), legacy proposal seeds at `issues/open/<slug>.md`, operator notes. Skip a seed whose `owner/repo#n` appears in any `state.yaml` under `issues/open` or `issues/closed` or in any `issues/chart/*/INTAKE.md`, one `grep -rl`. Group by destination: two groups are separate when finishing one would not change the other. Inside a group, seeds sharing a destination and no dependency become parallel leaves; independent issues run side by side; only a named dependency orders leaves. Show the split as a table (destination, seeds, leaves, parallel or blocked-by, which finishes first) and take the operator's reply before writing. Write one `issues/chart/<slug>/` per destination with `CHART.md`, `INTAKE.md` (seed text verbatim under one heading per source, then scope) and empty `decisions/`. Two or more destinations: stop with `Next: none pick a chart`. One destination: continue. |
| Decide | 45 | One decision at a time from `CHART.md`, the one that unblocks most. Per decision: A writes B's prompt with the intake path, the Question section with carries, related decision paths, the locks and the operator's corrections verbatim, never A's draft or Findings; B runs in the background while A writes its view; A merges with tags; B rebuts once into `slots/<decision>-rebuttal.md` on the merged file with disagreements only; A presents one batch with `Slot B disagrees:` under the challenge check. Operator letter is the answer. An added mechanism or changed contract in chat gets one B check of the final shape before A records; a restatement does not. Write Resolution (answer, one paragraph of why, forecloses), append one line to Decisions So Far, unblock, reshape open Questions, graduate Not Yet Specified. Research is Findings with source tier and date, never a decision. Human-only steps: warn when seen, add a question for who does it and when, and record completion in Findings. Termination: nothing open, nothing material unspecified. |
| Handoff | 45 | One batch: locks table (repo from cwd, priority `n`, `debate` with a recommendation from the settled design, default `no`, very small issue means `no`; `hand_built` only when the operator names it), the tree to write (epic when two or more issues, else issue), human steps still open (none allowed), and one confirmation. Before writing: read every brief as a fresh implementer, fix a done-criterion that depends on a later leaf or a claim no leaf owns. Slug rules: lowercase words and hyphens, unique across `issues/open` and `issues/closed` state files. Refuse a `blocked-by` naming a folder that neither exists nor is written by this handoff. Write `EPIC.md`, `ISSUE.md`, `brief.md` (What, Why, Done-criteria), `design.md` (Binding decisions verbatim, standing lines, Leaf architecture), `state.yaml` (slug, phase `plan.positions` or `plan.synthesis` when `debate: no`, created, priority, repo, debate, blocked-by, sources when GitHub-sourced, hand_built when true). Run `akrogon status` once as the schema check. Delete a legacy seed file whose text now lives in `INTAKE.md`. Write `Handed off <date> into <path>` into `CHART.md`. |
| Printed footer | 10 | Shape from `# Handoff Location`; at the door always `Next: none <reason>`; backup pane read paragraph. |

Total about 212 lines. Rule sentences (must, never, refuse) kept under 20: blind (B never sees A's draft), no pane read, skip on `sources`, stop after writing charts, refuse a missing `blocked-by`, refuse a human step left open, stamp copied, verbatim intake, chart never moved, footer printed. Everything else is steps.

### Deletions and references

- `git rm -r skills/chart-issues/{fixtures,scripts,tests,assets}` then add the two new assets.
- `git rm -r skills/create-issue skills/braindump-issues skills/consolidate-issues`.
- After the rewrite, `grep -rn "create-issue\|braindump-issues\|consolidate-issues\|consult-position\|SERIES-\|issues/chart/archive\|parking\|per-leaf confirmation" skills/` must return nothing in owned skills. Today no other skill references the three names; `README.md`, `reference/` and `new-beginning/` do, and those belong to `retire-old`, so the implementation report names them as out-of-scope hits (the 2026-09-10 core-skills lesson).

### What the cap removes

Portability and versioning (stamp comparison with a canonical checkout), the routing table, the Type table (`prototype` becomes one optional question shape in `questions.md`, `setup` becomes the human-step rule, `debate` type is replaced by the per-decision blind pass), `claimed` status (A owns the interview, nothing runs the same chart in parallel), source tiers as prose (kept as one line: practitioner, better-than-training, model-knowledge, newer wins, name the tier and date), the App-Scale lane and the Spec migration, mode check and proposal seeds (the door runs only in the registered checkout; a colleague files through `seed-issue`), the pre-handoff audit as a 200k-token subagent fan-out (kept as one read-through sentence), destination preflight (replaced by the slug uniqueness check), archive move.

## Risks

- R1 Cap against breadth. Criterion 2 lists thirteen behaviors a dry read must find. The table above budgets them at about 212 lines; the implementer must measure with `wc -l` and a token count after each section rather than at the end.
- R2 B's return channel. The design forecloses pane reads and says peer answers return as files under the leaf. A chart has no leaf, so I place them under `issues/chart/<slug>/slots/`. These are tracked chart files; that is consistent with "never moved" and with `decisions/` being the record. B must be told the exact path in every prompt.
- R3 Legacy seeds have no `sources` identity. A `issues/open/<slug>.md` file would re-drain at every open. Deleting it at handoff after its text is copied verbatim into `INTAKE.md` is the smallest rule. Until handoff, the intake heading naming the path is the skip key.
- R4 `akrogon pull` runs against `process.cwd()` through `requireRepo`. The door must run in the registered checkout, so the shared context says so once and the failure text is quoted rather than interpreted.
- R5 `sources` accepts only `owner/repo#n` at close time (`closeSource` regex). The skill must never put a legacy path into `sources`; those seeds are evidence in `INTAKE.md` only.
- R6 Stamp drift. Handoff files today carry `Chart skill version: 4` while the skill says 6. One stamp, one place in `SKILL.md`, copied; the number moves to 7 with this rewrite and no comparison rule survives.

## Simpler alternative

One asset instead of two, `assets/reference.md`, holding questions and shapes together. Fewer files, but the read-when triggers differ: questions are read before every batch, shapes only at Drain and Handoff. A merged file makes every batch reread 250 lines it does not need. Two files, each with one trigger, is the smaller cost per pass. Rejected also: no assets at all, since the question form alone needs about 90 lines and would leave under 120 for the door.

## Acceptance evidence

1. Criterion 1: `wc -l skills/chart-issues/SKILL.md` under 300; token count under 4k (`wc -c` divided by four is a proxy, a tokenizer run is the evidence); a reader counts must/never/refuse sentences under 20; `ls skills/chart-issues` shows `SKILL.md` and `assets/` only; the skill names `akrogon` as its dependency.
2. Criterion 2: a fresh subagent given only the Open, Decide and Handoff sections answers a checklist of the thirteen behaviors with the line that carries each. Record the answers under `verification/dry-read.md` in this leaf.
3. Criterion 3: on a temp repo built like `tests/helpers.ts` (`AKROGON_HOME`, fake herdr on `PATH`, `FAKE_HERDR` db), follow the Handoff section by hand to write `issues/open/<issue>/<leaf>/` with `EPIC.md` where two issues exist, `ISSUE.md`, `brief.md`, `design.md`, `state.yaml`; `akrogon status` parses it; `akrogon next <leaf path>` records a prompt whose text is `plan-issue <slug> slot=B phase=plan.synthesis` (or `slot=A phase=plan.positions` with `debate: yes`); a second leaf with `blocked-by: [missing]` is refused before any file is written, transcript kept under `verification/handoff.md`. No real herdr, GitHub or install root.
4. Criterion 4: `ls skills/` lacks the three folders; the grep in "Deletions and references" is empty over `skills/`.
5. Criterion 5: `grep -rn "issues/chart/archive\|SERIES-\|consult-position\|parking\|per-leaf confirmation" skills/chart-issues` is empty.
6. Repo checks: `bun run format`, `bun test`, `bun run typecheck` green; `git status --porcelain` empty and the commit ahead of `AKROGON_BASE` before review (2026-09-11 lesson).
