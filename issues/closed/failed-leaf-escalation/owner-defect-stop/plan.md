# Plan: owner-defect-stop

Direct synthesis (`debate: no`). Source: `brief.md`, `design.md`, live `skills/watch-issues/SKILL.md`, `src/next.ts`, `src/phase.ts`.

No brief/design conflict. Design wins on any future conflict. No credentials named by brief or design, so no env presence check applies.

## Read-first

- `skills/watch-issues/SKILL.md` (Judge Waiting, Failed-on-human-prerequisite, Stop, Never)
- `skills/watch-issues/scripts/observe.ts` (line format, `blocked`, `failed`, `delivery`, `reason`)
- `skills/watch-issues/scripts/observe.test.ts:32-38` (stub pattern for `OBSERVE_AKROGON` / `OBSERVE_HERDR`)
- `src/next.ts:536-539` (explicit `next` throws on unmerged `blocked-by`)
- `src/phase.ts:186` (merged is terminal)
- `docs/reference-index.md`, `skills/AREA.md`, `tests/AREA.md`
- `learnings/LESSONS.md` (stale-rule-in-docs, lock-vs-criterion, uncommitted-handoff)

## Decisions

- D1: Owner-defect class is a subset of "failed on a human prerequisite". It matches only when `failure.reason` text names a defect in another leaf's merged work and the named owner slug resolves in the readable leaf inventory (`issues/open/*/*/state.yaml`) to `phase=merged`. A merged leaf is never reopened. A reason attributing the defect to an unmerged owner does not enter this class and falls through to the existing failed-otherwise recovery path. Missing owner name or ambiguous candidates is reported as unresolved, never assigned by the watch.
- D2: Ownership resolution uses reason text plus the readable inventory only. No new `state.yaml` or failure-record field (no `--owner`). Unreadable inventory means the ownership question stays unresolved and the leaf still counts as failed on a human prerequisite for notice purposes but blocks the Stop rule per D4.
- D3: Waiting guard runs no `akrogon next <slug>` (and excludes the leaf from `next --all`) when the observer `blocked=` list names an unmerged leaf, because explicit `next` throws (`src/next.ts:536-539`) and the command-error rule would end the fire. The fire reports the leaf as waiting on that prerequisite. Unknown `blocked-by` slug is reported as a gap, never assumed merged or unmerged.
- D4: Stop fires when the inventory was readable and every remaining leaf is in one of these states: failed on a human prerequisite (including the D1 class) with shown evidence, or merged, or waiting whose every unmerged prerequisite or sibling it waits on leads directly or through other waiting leaves to such a failed leaf. Shown evidence means original `failure.delivery=shown` or a notice shown this fire. Any of these prevents stopping: unreadable inventory, unknown `blocked-by` slug, a runnable leaf (required unfinished seat idle or absent with all prerequisites merged), a busy seat. Busy-seat and runnable checks use the observer `A=`/`B=` statuses and the required-seats table, not pane contents.
- D5: First fire that recognizes a D1 failure sends exactly one `herdr notification show` whether or not the watch can stop. Body names failed leaf, failure phase, owner or unresolved owner candidates, waiting dependents, and the next step: settle any ownership question, chart a new fix leaf, then run `akrogon phase <slug> <failure.phase>` after the fix merges and the required seats of the failure phase are idle or absent. It also says the watch stops once nothing else can run and restarts with `/watch-issues`. This notice replaces the generic `:38` notice for that failure, so one failure gets one notice. Original `failure.delivery=shown` does not count as this notice. Repeat suppression uses existing watch context only; the existing allowance after context loss stays; no persistent state is added. Credential, permission and other human-prerequisite failures keep their current notice with no fix-leaf instruction.
- D6: Only `skills/watch-issues/SKILL.md` Judge (Waiting, Failed-on-human-prerequisite bullets) and Stop section change. Never list, `src/`, `skills/watch-issues/scripts/`, and observer line format are unchanged. `docs/guide/in-practice.md:89` prose stays valid as written (waiting leaves transitively blocked on a reported human prerequisite still read as "waiting on a human prerequisite that has been reported"), so no human-doc edit.
- D7: Walkthrough evidence uses real observer output from fixture repos with `OBSERVE_AKROGON` and `OBSERVE_HERDR` stub binaries per `observe.test.ts:32-38`. Three cases each with shown and unshown original delivery: owner-defect failure with blocked dependent, same plus an independent runnable leaf, credential failure with blocked dependent. Observer output plus decided actions are saved to one file under the OS temp dir; the implementation report records that path.

## Needed interfaces

- Observer line: `slug= phase= attempts= blocked= A=<pane>/<status>[ busy=] B=... notified= [failed=<cause>@<phase> delivery=<value|-> reason="<reason>" | failed=unknown]`.
- `state.yaml`: `phase`, `blocked-by`, `failure.{reason,phase,delivery}`; inventory root `issues/open/<owner>/<slug>/state.yaml`.
- `herdr notification show "<repo>/<slug> needs you" --body "<reason>" --sound request` (D1 body per D5).
- `akrogon next <slug>`, `akrogon next --all`, `akrogon phase <slug> <failure.phase>` (resume only after fix merges and required seats idle or absent).

## Concrete scenario

Framework `live-replay` failed at implement with reason naming a defect in merged sibling work; dependent `update-replay` has `blocked-by: [live-replay]` and is otherwise runnable. Before: watch ran `next update-replay`, hit the explicit-dependency throw, ended the fire under command-error, and never stopped. After: `live-replay` matches D1, one D5 notice fires, `update-replay` matches D3 (reported waiting, no `next`), and Stop per D4 fires once no other leaf is runnable or busy.

## Acceptance criteria

- C1 (brief 1): SKILL Failed bullet covers merged-owner-defect reasons; resolution against readable inventory; operator charts new fix leaf and resumes failed leaf after fix merges; merged never reopened; unmerged-owner attribution excluded; missing/ambiguous reported unresolved.
- C2 (brief 2): SKILL Waiting bullet runs no `next` for leaves blocked on unmerged leaves; reports them as waiting on that prerequisite.
- C3 (brief 3): SKILL Stop bullet fires on the D4 closure; unreadable inventory, unknown slug, runnable leaf, or busy seat prevents stopping.
- C4 (brief 4): first recognizing fire sends one D5 notice; replaces generic notice for that failure; original `delivery=shown` does not satisfy it; no new persistent state; non-defect human-prerequisite notices unchanged with no fix-leaf instruction.
- C5 (brief 5): walkthrough covers the D7 matrix, shows one notice per newly recognized failure, no stop while independent work runs, no fix-leaf instruction for credential case; artifact under OS temp dir with path in implementation report.
- C6 (brief 6): Never list, `src/`, `skills/watch-issues/scripts/`, observer format unchanged.
- C7 (brief 7): configured `checks` pass.

## Checklist (ordered; walkthrough depends on edited rules)

1. `skills/watch-issues/SKILL.md` Judge Waiting bullet: add D3 guard and waiting report. Covers C2.
2. `skills/watch-issues/SKILL.md` Judge Failed-on-human-prerequisite bullet: add D1 class, D2 resolution, D5 single notice with fix-leaf next step. Covers C1, C4.
3. `skills/watch-issues/SKILL.md` Stop section: add D4 transitive closure and stop blockers. Covers C3.
4. Agent/human docs: `skills/watch-issues/SKILL.md` is the only affected doc; `docs/guide/in-practice.md:89` verified still accurate, no other agent or human doc affected.
5. Walkthrough per D7: build fixture repos, stub binaries, run observer, judge each output against edited rules, save output plus actions to `$TMPDIR/owner-defect-stop-<stamp>.md`. Covers C5.
6. Exclusion sweep: `git status --porcelain` plus `git diff --stat` shows only `SKILL.md` under code; grep confirms Never list, `src/`, `scripts/`, line format untouched. Covers C6.
7. Run configured checks (`bun run format`, `bun test`, `bun run typecheck`) from repo root. Covers C7.

## Verification

- `git --no-pager diff -- skills/watch-issues/SKILL.md src skills/watch-issues/scripts` shows SKILL.md only.
- Walkthrough artifact exists under OS temp dir and records all six runs (3 cases x shown/unshown) with observer lines, per-leaf judgment (notice / waiting / stop), and stop/no-stop outcome.
- `bun run format && bun test && bun run typecheck` all pass.
- Docs sweep `grep -rn "human prerequisite" docs/ skills/watch-issues/SKILL.md` reviewed; only `in-practice.md:89` hit stands as still accurate.

## Open limitation

Reason-text ownership parsing is heuristic by design (no `--owner` field); adversarial or vague reason text stays unresolved and needs the operator to settle ownership before charting the fix.
