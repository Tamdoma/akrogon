# Plan: worker-stash-rule

One prose change split across two homes in `skills/implement-issue/`. No mechanical behavior changes, so per the design's standing-design interpretation no test is added: criteria 1, 2 and 4 are read by the reviewing seat and criterion 3 is the existing link test.

## Decisions

- D1. One unit owns both files and the run is serial-solo (every wave holds one unit): A edits directly, no sub-briefs or worker worktrees. Splitting two coordinated prose edits across paid workers adds launches for no path or resource reason.
- D2. `brief-template.md` section 5 (`## 5. Do-not, reasons and exceptions`) gains, for every sub-brief: never run any `git stash` subcommand, with the reason (every worktree of a repo shares one `refs/stash`, so a pop can lift a sibling worker's edit) and the replacement for checking behaviour on the base: use a second worktree of the base.
- D3. In a delegated leaf sub-brief only, section 5 additionally carries the WIP-commit replacement: set work aside as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once, so A's cherry-pick of that one commit carries all the work. A standalone sub-brief gets no reset step. Section 4 records, for a delegated leaf unit, the commit A created the worker worktree at, and the template says A fills it when it creates that worktree at its wave, never when it writes the sub-briefs, because later waves start after earlier cherry-picks (fork file leaf-review correction). A relaunched worker reads the same brief.
- D4. `SKILL.md` Shared-context refresh paragraph (the `A refreshes the leaf branch` paragraph) is extended in place: A never runs `git stash` in a leaf or worker worktree, at a refresh or at any other time, since leaf worktrees of different leaves share the stash. The existing refresh mechanics, including the never-discarding clause, stay untouched.
- D5. Scope stays the two owned files. `worker-protocol.md` is not edited (design: same reader chain). `src/sync.ts` `rebase --autostash` and `docs/use/save-records.md`'s `gacp` are excluded by the design (not worker paths).
- D6. No model-choice criteria exist here; criteria judge prose records and one existing mechanical check, no count or similarity gate is involved. No credentials are named by the design and `akrogon status` prints no `Missing:` lines.

## Brief/design reconciliation note

The brief reads "section 4 records ... (D)" where section 5 carries the WIP/reset text; the design resolves this as two homes — section 5 carries the rule and both replacements, section 4 records only the creation-commit value. No conflict; the split is the locked shape.

## Read-first paths

- `skills/implement-issue/brief-template.md` — edit target, sections 4 and 5.
- `skills/implement-issue/SKILL.md` — edit target, Shared-context refresh paragraph.
- `skills/implement-issue/worker-protocol.md` — consumer only: `## Launch and return` (worktree creation at `<worktree_store>/<slug>-u<N>`, cherry-pick of one returned commit) and the provider-error relaunch (worker re-reads its brief).
- `/home/ivan/Work/infra/tamdoma/framework/learnings/history/2026-10-16-stash-shared-across-worker-worktrees.md` — the case criterion 1 is judged against.
- `issues/chart/consumer-lesson-fixes/forks/worker-stash.md` (registered checkout) — Taken decisions and readiness proofs.

## Needed interfaces

- Template anchors `## 4. Change list and needed interfaces` and `## 5. Do-not, reasons and exceptions`; section 5's closing restatement line keeps its role. Sections 1–3 and 6–8 are unchanged.
- `<creation commit>` is a new fill-in the template defines; its only consumer is the worker reading its own sub-brief, including a relaunched worker.
- No code interfaces, no new files, no new links planned; any link added during drafting must resolve.

## Checklist

Wave 1 (one unit — serial-solo):

- U1 `prose-stash-rule` — owns `skills/implement-issue/brief-template.md` (sections 4 and 5 edits per D2/D3) and `skills/implement-issue/SKILL.md` (refresh paragraph edit per D4). Shared test resource: none. Prerequisites: none. Criteria: 1–4.

Docs: affected docs are the two owned files only. `skills/AREA.md` line descriptions are generic and stay accurate; `worker-protocol.md`, `ponytail.md`, `docs/` and `learnings/` need no change (verified: no `stash` mention in owned files except the refresh line; worker-protocol excluded by design). No human doc is affected.

## Criterion proofs

### Criterion 1 — template instructs never-stash with replacements (seat-read record)

- Boundary: `brief-template.md` sections 4 and 5 text on the leaf head. Before: the file contains no `stash` mention today (grep-verified). After: D2/D3 content present, delegated-vs-standalone distinction explicit, creation-commit fill-in at worktree-creation time.
- Product failure it catches: Tamdoma/akrogon#141 / `learnings/history/2026-10-16-stash-shared-across-worker-worktrees.md` — a worker stashes in a detached worktree and a sibling's pop lifts it.
- Observation: the reviewing seat reads the template against that history file, as the criterion names. `grep -n stash skills/implement-issue/brief-template.md` bounds the read. Size: seconds. Rerun trigger: any edit to sections 4 or 5.
- Conditions trace: the criterion's conditions — every sub-brief carries rule+reason+base-worktree replacement; delegated also carries WIP-commit, `git reset --soft <creation commit>` and one-commit return; standalone carries no reset step; the creation commit is filled when A creates the worktree — are carried by D2/D3. No mechanical case can observe a violation: the template is prose read by model seats, not executed state; the seat read is the observation. No test planned. The readiness probe (git 2.56.1, second pop applied w1's edit) already proves the mechanism the reason cites; what stays unproven is worker compliance, which prose cannot mechanically enforce — recorded as the leaf's open limitation.

### Criterion 2 — SKILL.md never-stash at any time (seat-read record)

- Boundary: `SKILL.md` Shared-context refresh paragraph. Before: line ~42 bans stashing only at refresh time in the leaf worktree ("never stashing or discarding it"). After: the ban covers leaf and worker worktrees at a refresh or any other time, with the shared-stash reason, and no sentence in either owned file permits stashing.
- Product failure: same shared-stash mechanism, A seat side.
- Observation: reviewing seat reads SKILL.md; `grep -n stash skills/implement-issue/brief-template.md skills/implement-issue/SKILL.md` enumerates every stash sentence in the owned files so the "no sentence left permits" half has a bounded read. Size: seconds. Rerun trigger: any owned-file edit.
- Conditions trace: "at any time" and "no sentence permits" are prose states on the same two files; D4 reaches them and no mechanical case can observe a violation. No test planned.

### Criterion 3 — links resolve (existing check)

- Boundary: `tests/docs-links.test.ts` link resolver run against the worktree containing the edited files.
- Before: head equals base (`39e203a7`); readiness.yaml records `bun test tests/docs-links.test.ts` green on base (12 pass, bun 1.4.4). After: green with the prose edits.
- Product failure it catches: a relative link or anchor added or invalidated by the edits.
- Command: `akrogon run-check --name link-check -- bun test tests/docs-links.test.ts` at implement end; the configured `test` check also covers it inside `akrogon verify` on the committed head. Size: seconds. Rerun trigger: any owned-file edit.

### Criterion 4 — report states prose-not-a-stop (seat-read record)

- Boundary: `implementation/report.md` and the leaf diff's path set.
- Before: the framework lesson `learnings/history/2026-10-16-stash-shared-across-worker-worktrees.md` is active in the `framework` repo; this repo holds no copy or line for it, so nothing in this branch can retire it. After: the report states the change is prose, which today's Retire rule does not count as a stop, so the lesson stays active.
- Product failure it catches: a false retirement claim — the over-retirement failure this chart (consumer-lesson-fixes) exists to stop.
- Observation: reviewing seat reads the report statement plus `git diff --stat "$AKROGON_BASE"...HEAD` showing only the two owned paths. Size: seconds. Rerun trigger: implement-end report write.
- Conditions trace: the only reachable violation is a wrong report sentence or an out-of-scope path; the seat read plus diff path set observes both. No test planned.

## Open limitation preserved

Prose instructs but does not mechanically prevent a worker or A from running `git stash`; the design rejected every mechanical alternative (clone, stash-list compare, blocked ref, hooks) and this leaf does not reopen them.
