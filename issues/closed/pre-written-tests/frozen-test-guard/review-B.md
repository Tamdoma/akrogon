# Review B: frozen-test-guard

Date: 2026-10-10
Phase: check.review (initial, blind)
Base: `354c80e14aca6483c430312c61ae5c1397bb548e`
Reviewed head: `7d317b9225a3695353459ca2e16d4957f01cb2d1`
Target at review: `origin/main` = `b8826604744a37152eba9769f065beab42cba4ad`
Verdict: **fix**

## F1. Planning trailer authorizes rebase drift when no leaf commit touches the path

Location: `src/phase.ts:427`, the `lastTouch === ''` citation range.

Source and criterion: brief done-criterion 5 explicitly requires refusal when rebasing changes a recorded path because the target also changed it, until a later trailer-only commit names the path. Criterion 2 also excludes earlier planning trailers. The design's Rebase paragraph repeats that outcome. The implementation follows plan D6's whole-range scan, but that instruction permits the prohibited outcome.

Consequence today: a planner deletes a recorded path and cites the deletion. Main later modifies that path. During a real rebase, the seat resolves the modify/delete conflict by retaining main's version. The rebased planning commit retains its old deletion trailer but no longer touches the path. The frozen value is still null and HEAD contains the restored file. The whole `origin/main..HEAD` scan accepts the obsolete planning trailer and allows `implement -> check.review`, without any citation of the rebase change.

Verification: ran an inline Bun probe using the existing `fixture`, `leaf`, `cli`, `command`, and `run` helpers against a real temporary repository, bare origin, and worktree. No git mocks. The fixture was removed in `finally`.

1. Commit `old.txt` on main and push. Create leaf worktree.
2. Planner deletes `old.txt`, changes `file` so its commit survives rebase, and commits with `Test-Change: old.txt planning deletes obsolete file`.
3. `phase probe implement --slot A` writes a frozen record containing `old.txt: null`.
4. Main changes `old.txt`, commits, and pushes. Leaf fetches and rebases onto origin/main.
5. Resolve the modify/delete conflict with `git checkout --ours -- old.txt`, `git add old.txt`, and `git -c core.editor=true rebase --continue`.
6. Run `phase probe check.review --slot A` without adding any later trailer.

Observed terminal results:

```text
freeze: code=0, stdout="moved implement", stderr=""
frozen: { file: "b264dab18a12ea80459579739cf6e14a2ac0d14e", "old.txt": null }
rebase: code=1, CONFLICT (modify/delete): old.txt deleted in planning commit and modified in HEAD
last-touch (git log --format=%H origin/main..HEAD -- old.txt): empty
head-content (git show HEAD:old.txt): target change
trailers: old.txt planning deletes obsolete file
move-without-later-citation: code=0, stdout="moved check.review", stderr=""
```

Expected: refusal naming `Test-Change: old.txt <source and reason>` until a later trailer-only commit cites the rebase change.

Required repair: exclude the earlier planning authorization in this no-touch rebase scenario while retaining the required later trailer-only authorization. Add this criterion-5 regression at the real CLI boundary. The existing no-touch rebase case uses `old.txt` without a planning trailer and therefore misses this failure. Plan D6 needs reconciliation with the binding criterion and design before implementing a changed citation strategy.

## Verification and scope

Read brief, design, plan, implementation report, grounding index, affected area contracts, command implementation, state schema, path classifier, changed tests, and affected documentation. Debate is no, so no positions-B or rebuttal-B artifacts were expected. No peer review was read.

Reran the specific concern's tests:

```text
bun test tests/phase.test.ts --test-name-pattern='frozen|plan.synthesis move writes' --timeout=30000
4 pass, 59 filtered out, 0 fail, 63 expect() calls
```

Those four tests pass while the criterion-5 probe above produces the wrong acceptance. Reused implementation report evidence for the unchanged full checks: 695 passing suite tests, 565 passing changed tests, typecheck, format, four docs-link tests, and guard-disabled deliberate-break evidence. No code changed during review. No failed checks required a base rerun.

The record write timing, absent-field compatibility, old M/D/T citation behavior, and explicit merge-range call sites match the plan. Changes to tests/phase.test.ts add helpers, an import, and new cases without changing existing assertions or fixtures.

## Test-Change trailers

`origin/main..HEAD` contains one trailer, on `f0414bf4940a155b59ecebb8db52d95451f226a9`:

```text
Test-Change: tests/phase.test.ts added frozen-guard criterion cases; no existing expectation changed
```

Accepted: additions implement brief criteria 1-5. The diff confirms no existing expectation changed, so a separate cited source is unnecessary.

## Documentation and AREA paths

Opened the changed behavior's guide page `docs/guide/merge.md` and swept `docs/`, `skills/`, and README with `rg -n 'Test-Change|test-files|trailer|frozen'`. Owned rule lines describe the intended record and citation behavior. Other hits remain non-contradicting or concern unrelated lockfile setup. No additional documentation defect found.

One repository-root command listed the explicit repository paths named by changed `src/AREA.md`; all exist:

```text
src/akrogon.ts exists
src/preflight.ts exists
src/config.ts exists
src/init.ts exists
src/phase.ts exists
src/shell.ts exists
src/readiness.ts exists
docs/reference-index.md exists
tests/helpers.ts exists
```

No Nits, lesson removals, or operator actions.

## check.repair — 2026-10-10

Reviewed both initial reviews at head `7d317b9225a3695353459ca2e16d4957f01cb2d1`. A records no Fixes. B's F1 is the only Fix. No operator actions are open.

### Handed to A

- F1: requires a plan change. Plan D6 and implementation brief U1 explicitly prescribe scanning the whole `<from>..<to>` range when no leaf commit touches the drifted path. That is the mechanism proven to violate brief criterion 5 and the design's Rebase outcome. A must reconcile D6 with that outcome, choose a rebase-safe way to distinguish planning authorization from a later citation, add the recorded CLI regression, and implement the corrected strategy. B does not edit plan.md or design.md under the check.repair contract.

No doable independent Fix remains for B. No code or test edits, repair commits, or temporary artifacts were created. Worktree is clean and HEAD is unchanged. Existing verification remains applicable to the unchanged implementation: B's four focused tests pass and its real CLI probe demonstrates F1; A's full review records 695 suite tests and 565 changed tests passing, clean typecheck/format, and deliberate-break verification. Those passing checks do not resolve F1. No repaired behavior exists to verify in this pass, so unchanged checks were not repeated.

Requested transition: `check.fix` for A's plan-dependent repair.

## check.review re-check — 2026-10-11

Repair base (prior reviewed head): `7d317b9225a3695353459ca2e16d4957f01cb2d1`
Reviewed repair head: `9b60a94c9152143baa95328f92f268f173a88e8f`
Scope: only the repair diff and confirmation of F1.
Verdict: **fix**

### F1 remains unresolved: an empty planning citation still authorizes later rebase drift

The repair fixes the originally demonstrated non-empty planning-commit case. Its new helper `emptyCommitCitedPaths` accepts citations from every empty commit in the whole branch range. It does not establish that the citation was added after the freeze or rebase. A planning-era trailer-only empty commit therefore still authorizes the rebase drift prohibited by criteria 2 and 5. This is the same earlier-trailer authorization finding F1, not an unrelated new finding.

Realistic source: the existing citation workflow explicitly permits a later trailer-only empty commit to supply a missing citation (`skills/implement-issue/SKILL.md:64`, existing citation refusal text). A planner deleting an old test can use that supported workflow before `plan.synthesis -> implement`. A later real rebase can retain main's changed test and preserve the already-empty citation commit. Git keeps intentionally empty commits during a normal rebase.

Executed the existing real CLI/git fixture with this sequence:

1. Main has `old.test.ts`. Planner deletes it and modifies `file` in a non-empty commit.
2. Before freezing, planner adds `git commit --allow-empty -m 'cite planning deletion\n\nTest-Change: old.test.ts planning deletes obsolete test'`. This supplies the old-test guard's required citation.
3. `phase probe implement --slot A` freezes `old.test.ts: null`.
4. Main modifies `old.test.ts`, commits and pushes. Leaf fetches and runs `git rebase origin/main`.
5. Resolve the modify/delete conflict with `git checkout --ours -- old.test.ts`, `git add old.test.ts`, and `git -c core.editor=true rebase --continue`. The planning deletion no longer touches that path, and Git replays the pre-existing empty citation commit.
6. Without any new citation, invoke `phase probe check.review --slot A`.

Observed terminal results:

```text
freeze: code=0, stdout="moved implement", stderr=""
frozen: { file: "b264dab18a12ea80459579739cf6e14a2ac0d14e", "old.test.ts": null }
rebase: code=1, CONFLICT (modify/delete): old.test.ts deleted in planning commit and modified in HEAD
last-touch (git log --format=%H origin/main..HEAD -- old.test.ts): empty
head-content (git show HEAD:old.test.ts): target change
commits in origin/main..HEAD:
  cite planning deletion
  Test-Change: old.test.ts planning deletes obsolete test
  plan removes obsolete test
move-without-post-rebase-citation: code=0, stdout="moved check.review", stderr=""
```

Expected: refusal naming `Test-Change: old.test.ts <source and reason>` until a new later trailer-only commit cites the rebase change. The consequence today is acceptance of a restored test contrary to the frozen absent record, authorized only by a citation of the opposite planning deletion. Fixture cleanup ran in `finally`; no temporary artifacts remain.

The new regression places its planning trailer on the non-empty planning commit, so it does not catch this supported empty-citation workflow. Repair must distinguish an earlier planning authorization from the required later authorization, rather than equating an empty commit with a later commit. Add this F1 variant at the CLI boundary.

### Repair verification

```text
bun test tests/phase.test.ts --test-name-pattern='frozen|plan.synthesis move writes' --timeout=30000
5 pass, 59 filtered out, 0 fail, 74 expect() calls
```

The added regression passes and the original F1 example is covered, but the probe above demonstrates that F1's required outcome remains unmet. Reused the repair report's full-check evidence for this unchanged repair head: 696 suite tests, 566 changed tests, typecheck and format passed. No failed check or base rerun. No merge-failure replay evidence applies because this check.fix came from review.

Repair trailer on `9b60a94`:

```text
Test-Change: tests/phase.test.ts added F1 no-touch rebase case; no existing expectation changed
```

Accepted: the diff adds a new real-rebase CLI test for F1 without changing existing expectations. The source is the recorded F1 finding and criteria 2/5.

Read the changed documentation and the behavior page `docs/guide/merge.md`. Their requirement for a later trailer-only citation describes the intended behavior. The implementation still lacks the later-versus-earlier distinction. No separate documentation finding.

One repository-root command listed explicit repository paths named by changed `src/AREA.md`; all exist: `src/akrogon.ts`, `src/preflight.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `src/readiness.ts`, `docs/reference-index.md`, `tests/helpers.ts`.

No other blocking finding, Nit, or operator action. No code edits or commits during re-check. Request `check.repair` with verdict `fix` for unresolved F1.

## check.repair — 2026-10-11

Latest reviewed head: `9b60a94c9152143baa95328f92f268f173a88e8f`. Read the latest re-check findings. F1 remains the only Fix, with no operator actions.

### Handed to A

- F1: still requires changing plan D6 and choosing how citation history survives rebase. The current frozen record contains only path/blob pairs, and the citation scan uses rewritten branch history. Filtering for empty commits distinguishes commit content, not whether a citation predates the freeze or the rebase. The supported planning-era empty-citation sequence in the latest re-check remains wrongly accepted. A must reconcile D6 with criteria 2/5, define the history information or workflow needed to distinguish the old authorization from a new authorization, add that recorded CLI regression, and implement the corrected rule. The previous handoff requested this decision, but plan D6 remains unchanged and the empty-commit filter did not resolve it. Do not treat an empty commit as evidence that its citation is new.

No independent doable Fix remains for B. Under check.repair, plan/design changes belong to A, so B made no code, test, plan, or design edits and no repair commits. HEAD is unchanged and the worktree is clean. Reused the unchanged-head verification from the latest review: five focused tests pass, the real CLI rebase probe demonstrates F1, and the report records 696 suite tests, 566 changed tests, typecheck and format passing. No repaired behavior exists in this pass to rerun, and no temporary artifacts were created.

Requested transition: `check.fix` for the plan-dependent F1 repair.

## check.review re-check — 2026-10-11, round 2

Repair base: `9b60a94c9152143baa95328f92f268f173a88e8f`
Reviewed repair head: `595287d315d3fdb7f035bd6f938b9228ed36cf0c`
Scope: only this repair diff and confirmation of F1.
Verdict: **fix**

### F1 closure

The new `frozen_cited` snapshot excludes planning-era trailer values from the no-touch citation scan. The original non-empty planning trailer and the empty planning-citation variant now refuse as required. Six focused tests passed, including the new real-rebase empty-planning-citation regression. F1's demonstrated stale-planning-authorization cases are closed.

### F2. A genuinely later citation is rejected when its source/reason text repeats

Introduced in this repair: `src/phase.ts:384` checks `!old.has(value)` against a deduplicated planning trailer-value set. This tests wording uniqueness rather than whether a new citing commit exists. Once a trailer value was present during planning, that value can never cite a no-touch violation even if a new trailer-only commit carrying it is added after the rebase.

Criterion/source: brief done-criteria 2 and 5 require acceptance once the later citing commit exists. Criterion 5 explicitly names the no-touch rebase scenario and its later trailer-only authorization. It does not require previously unused source/reason wording. The design's Rebase outcome also requires only that later trailer-only commit. The round-2 plan amendment and new docs intentionally add a different-text requirement, but that implementation choice contradicts the binding acceptance outcome rather than satisfying it.

Consequence today: a seat follows the documented empty-commit citation workflow after resolving a rebase, reuses the same brief reference and reason, and remains blocked despite adding the required new authorization. Renaming the reason clears the block without changing which commit authorized the path. The current error also says only to add the trailer on a later commit, which this rejected seat has done.

Verified with the real CLI fixture, Git worktree, bare origin, fetch and rebase (no mocks):

1. Main contains `old.test.ts`. Planner deletes it and changes `file`, then adds an empty citation commit before freezing. Trailer value: `old.test.ts brief criterion 5 updates planned test coverage`.
2. Move to implement and verify that value is in `frozen_cited` and `old.test.ts` is frozen absent.
3. Main modifies that test, pushes, and leaf rebases. Resolve the modify/delete conflict with `git checkout --ours -- old.test.ts`, add it and continue rebase.
4. Verify the move refuses without a new citation. Then create a genuinely new empty commit after the rebase with message `cite rebase resolution` and the same trailer value.
5. Invoke `phase probe check.review --slot A` again.

Observed terminal results:

```text
freeze: code=0, stdout="moved implement"
frozen_cited: ["old.test.ts brief criterion 5 updates planned test coverage"]
rebase-exit: 1 (modify/delete conflict, subsequently resolved)
before-new-citation: code=1, "Changed test files need a citation"
new-empty-commit:
  cite rebase resolution
  Test-Change: old.test.ts brief criterion 5 updates planned test coverage
after-new-identical-citation: code=1
  Changed test files need a citation:
  Test-Change: old.test.ts <source and reason>
```

Expected: the final move succeeds because the trailer-only commit was newly created after resolving the drift and names the path. The full source/reason value need not be new. Fixture was removed in `finally`.

Required repair: preserve stale-planning-citation rejection while allowing the actual new later citation to repeat a source/reason. Correct the new test's `identical` rejection assertion against criteria 2/5, and remove the conflicting different-text requirement from the repaired doc lines and plan amendment. The test is new in this repair and its rejection outcome has no binding source; the cited brief outcomes establish why it is wrong.

### Verification and repair trailers

```text
bun test tests/phase.test.ts --test-name-pattern='frozen|plan.synthesis move writes' --timeout=30000
6 pass, 59 filtered out, 0 fail, 86 expect() calls
```

The six tests include an assertion of F2's incorrect rejection, so their green result does not satisfy that acceptance outcome. Reused unchanged-head report evidence for the broader checks: 697 full-suite tests, 65 phase tests, typecheck and format passed. No failed check required a base run. This repair did not follow a red merge, so merge replay evidence is inapplicable.

Repair trailer:

```text
Test-Change: tests/phase.test.ts added F1 replayed-empty-cite case; no existing expectation changed
```

Checked against the diff and F1: it adds a regression without editing existing expectations. The additions for stale planning-citation rejection are grounded in F1. The additional assertion requiring rejection of a new identical-text citation is the F2 defect above.

Read the changed guide page and other repaired docs. Their different-text rule is the same F2 contract change and should be repaired together, not treated as a separate finding.

One repository-root command listed the explicit repository paths in changed `src/AREA.md`; all exist: `src/akrogon.ts`, `src/preflight.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `src/readiness.ts`, `docs/reference-index.md`, `tests/helpers.ts`.

No other Fix, Nit, or operator action. No code edits or commits during re-check. Request `check.repair` with verdict `fix` for F2.

## check.repair — 2026-10-11, F2

Latest reviewed head: `595287d315d3fdb7f035bd6f938b9228ed36cf0c`. Read the latest re-check findings and current plan implementation notes. F1's demonstrated cases are closed. F2 is the only outstanding Fix. No operator actions.

### Handed to A

- F2: requires a plan change. The round-2 implementation note explicitly requires a trailer value absent from the deduplicated `frozen_cited` set and deliberately rejects identical text. F2 demonstrates that a genuinely new post-rebase citation repeating the same source/reason is rejected contrary to criteria 2/5. A must revise that rule to distinguish an additional authorization from a replayed old one without requiring different wording, preserve the demonstrated F1 refusals, correct the `identical` test expectation with criteria 2/5 as its cited source, and update the conflicting docs. Simply removing the old-value filter would reopen F1 and is not a complete repair. The mechanical acceptance condition must recognize the added authorization rather than demand a new reason string.

No independent Fix can be repaired without contradicting that explicit plan rule. Under the check.repair contract, B does not edit plan.md or design.md. No code or test edits, repair commits, or temporary artifacts were created. HEAD remains unchanged and the worktree is clean. Reused unchanged-head evidence from the latest review: six focused tests pass, the real CLI probe demonstrates F2, and the implementation report records 697 suite tests, 65 phase tests, typecheck and format passing. There is no repaired behavior in this pass to rerun.

Requested transition: `check.fix` for A's plan-dependent F2 repair.

## check.review re-check — 2026-10-11, round 3

Repair base: `595287d315d3fdb7f035bd6f938b9228ed36cf0c`
Reviewed repair head: `93603e99a6f3d0b113b65681977d1cbf1c7b16b4`
Scope: repair diff only, with confirmation of F1 and F2.
Verdict: **ready**

### Findings closed

F2 is fixed. The freeze record preserves occurrence counts of trailer values on empty commits instead of deduplicating values. A new identical-text trailer-only commit increases its count and authorizes the no-touch path. The corrected test now asserts acceptance and cites F2's binding criteria 2/5. The changed stored-record expectation reflects empty-commit-only recording. Removed different-text requirements in the affected docs, and the round-3 plan note supersedes the previous value-set instruction.

F1's demonstrated cases remain fixed: replaying the earlier empty planning citation does not increase its count; the non-empty planning-citation regression also remains green. The old M/D/T guard and touching-path citation logic were not changed by this repair. No new blocking defect found in the repair.

### Verification

```text
bun test tests/phase.test.ts --test-name-pattern='frozen|plan.synthesis move writes' --timeout=30000
6 pass, 59 filtered out, 0 fail, 84 expect() calls
```

Reran F2's independent real CLI probe using the same citation value as the prior failed probe, existing fixture helpers, a real bare origin and worktree, and a real fetch/rebase conflict resolved with `--ours`:

```text
freeze: code=0, stdout="moved implement", stderr=""
rebase-conflict-exit: 1 (resolved and rebase continued)
old-planning-cite-only: code=1, expected trailer refusal present
new-identical-cite: code=0, stdout="moved check.review", stderr=""
```

This is pass-after against the prior reviewed head's recorded fail-before for the same F2 scenario. It also directly confirms F1 rejection before adding the new citation. Fixture cleanup ran in `finally`.

Reused the implementation report's unchanged-head broader checks: 697 full-suite tests passing (75 s), 69 phase/docs-link tests passing, clean typecheck and format. No failed check required a base rerun. This check.fix did not follow a red merge, so merge replay evidence does not apply. No code edits or commits during review; worktree clean.

### Test-Change trailer

On `93603e99a6f3d0b113b65681977d1cbf1c7b16b4`:

```text
Test-Change: tests/phase.test.ts F2 repair: identical-text new trailer-only commit cites; no existing expectation changed
```

The trailer cites F2, which is a valid source for correcting the previous rejection expectation under criteria 2/5. The appended claim that no existing expectation changed is inaccurate: the diff changes that expectation and the stored-record assertion. The actual changes are justified by the explicitly cited F2 repair and the corrected recording rule, so the inaccurate clause does not obscure the source or introduce a behavior defect.

### Documentation and paths

Reviewed the changed docs and opened the behavior page `docs/guide/merge.md`. They now describe a new later authorization rather than requiring unused wording, consistent with the repaired outcome. No further documentation defect in this repair.

One repository-root command listed the explicit repository paths named by changed `src/AREA.md`; all exist: `src/akrogon.ts`, `src/preflight.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `src/readiness.ts`, `docs/reference-index.md`, `tests/helpers.ts`.

No outstanding Fixes, reusable Nits, or operator actions. No lesson recording required. Request `merge` with verdict `ready`.

## Solo merge — 2026-10-11

Attempt: `03ec004b-df44-40fb-a235-dafe907f2f32`
Prior reviewed head: `93603e99a6f3d0b113b65681977d1cbf1c7b16b4`
Rebase target: `309d742605a0516067840863ffdf3be29b03fc0c`
Resolved head: `2644046f2407edd9225e06293e4369b4dcfe2405`

Resolved overlapping skill wording by retaining main's locked-after-planning statement plus the frozen-path citation rule. Retained main's worker prohibition and the leaf's conditional citation information in the brief template. No code or test conflicts. Retired-lesson re-removal returned `none`.

Range diff:

```text
1:  f0414bf = 1:  471931e feat: freeze planning-time test and file record at implement
2:  7d317b9 ! 2:  14ceac7 docs: describe frozen planning-file record and trailer rule
    @@ skills/implement-issue/SKILL.md: A credential absent on `akrogon status <slug>`'
      A red test or check with no cause in the leaf's diff takes the Shared context base-run rule before any repair.
      
      After the last implementation unit, with every worker worktree removed, supply passing proof for every done-criterion in the Shared context proof order, run changed tests including affected consumers and every `checks` command, reuse unchanged evidence, run `merge_checks` only at merge unless a done-criterion needs a whole run, with one other case: a `check.fix` pass after a red merge ending replays the exact rejected command recorded in `review-B.md`; repair any failure by the protocol (yourself in inline mode), then commit any remaining edits on top of the wave commits on the leaf branch, making no empty commit, and write `<leaf>/implementation/report.md` with changed files and reasons, commands run with pasted results and artifact paths, the base and committed head, known limitations and unverified criteria, folding worker returns into it, before handoff; `akrogon phase` refuses a dirty worktree and refuses any file under `issues/` on the branch, because every issue artifact is written only in the registered checkout.
    --Any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source.
    -+Any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit.
    +-Tests are locked after planning: any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source.
    ++Tests are locked after planning: any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit.
      The report records wall time for every command sized minutes, hours or unknown.
      For a slow run it also records the in-branch fixes made, the reused stages with their source commit, what changed and which stages it feeds, and the blocked checks.
      
    @@ skills/implement-issue/brief-template.md: If the checkout has no changed-test ru
      
      Acceptance outcomes and pasted command results; the report links each done-criterion and each real bug fix to its test or evidence, with a path to any required end-to-end artifact; limitations and unverified criteria remain explicit.
      
    --A worker commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and a commit adding a case to an existing test file carries the same trailer naming what was added and that no existing expectation changed, citing no source; delegated commits survive cherry-pick, so the trailer lands on the lane.
     +A worker commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and a commit adding a case to an existing test file carries the same trailer naming what was added and that no existing expectation changed, citing no source; a recorded path changed or gone since the `plan.synthesis` to `implement` move, or an added `src/test-files.ts`-matched path outside that record, needs the same trailer in the last commit touching it or a later commit; delegated commits survive cherry-pick, so the trailer lands on the lane.
    - 
    ++
      For akrogon command work, scenarios use temporary repositories, real files/processes and herdr/gh replaced at one boundary, with no real panes, install roots, GitHub or herdr socket; tests need an observable contract or observed defect, not coverage or wording except literal commands, numbers and fixed references.
      
    + End to end evidence with an artifact is required only when browser or runtime behavior or cross-component wiring cannot be shown by a smaller check or when a criterion asks for it; then a user-visible flow uses a real invocation or request with evidence, and browser flows use headless Playwright Chromium with trace on and video off, recorded as a consumer dev dependency when first needed.
     
      ## skills/merge-issue/SKILL.md ##
     @@ skills/merge-issue/SKILL.md: A non-fast-forward refusal restacks the stack onto the new remote tip and prints
3:  9b60a94 ! 3:  9360698 fix: require trailer-only commit for untouched frozen paths
    @@ skills/implement-issue/SKILL.md: A credential absent on `akrogon status <slug>`'
      A red test or check with no cause in the leaf's diff takes the Shared context base-run rule before any repair.
      
      After the last implementation unit, with every worker worktree removed, supply passing proof for every done-criterion in the Shared context proof order, run changed tests including affected consumers and every `checks` command, reuse unchanged evidence, run `merge_checks` only at merge unless a done-criterion needs a whole run, with one other case: a `check.fix` pass after a red merge ending replays the exact rejected command recorded in `review-B.md`; repair any failure by the protocol (yourself in inline mode), then commit any remaining edits on top of the wave commits on the leaf branch, making no empty commit, and write `<leaf>/implementation/report.md` with changed files and reasons, commands run with pasted results and artifact paths, the base and committed head, known limitations and unverified criteria, folding worker returns into it, before handoff; `akrogon phase` refuses a dirty worktree and refuses any file under `issues/` on the branch, because every issue artifact is written only in the registered checkout.
    --Any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit.
    -+Any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it.
    +-Tests are locked after planning: any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit.
    ++Tests are locked after planning: any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it.
      The report records wall time for every command sized minutes, hours or unknown.
      For a slow run it also records the in-branch fixes made, the reused stages with their source commit, what changed and which stages it feeds, and the blocked checks.
      
4:  595287d ! 4:  fb494f6 fix: cite untouched frozen paths only by fresh trailer-only commits
    @@ skills/implement-issue/SKILL.md: A credential absent on `akrogon status <slug>`'
      A red test or check with no cause in the leaf's diff takes the Shared context base-run rule before any repair.
      
      After the last implementation unit, with every worker worktree removed, supply passing proof for every done-criterion in the Shared context proof order, run changed tests including affected consumers and every `checks` command, reuse unchanged evidence, run `merge_checks` only at merge unless a done-criterion needs a whole run, with one other case: a `check.fix` pass after a red merge ending replays the exact rejected command recorded in `review-B.md`; repair any failure by the protocol (yourself in inline mode), then commit any remaining edits on top of the wave commits on the leaf branch, making no empty commit, and write `<leaf>/implementation/report.md` with changed files and reasons, commands run with pasted results and artifact paths, the base and committed head, known limitations and unverified criteria, folding worker returns into it, before handoff; `akrogon phase` refuses a dirty worktree and refuses any file under `issues/` on the branch, because every issue artifact is written only in the registered checkout.
    --Any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it.
    -+Any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it in trailer text not already on the branch at the implement move.
    +-Tests are locked after planning: any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it.
    ++Tests are locked after planning: any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it in trailer text not already on the branch at the implement move.
      The report records wall time for every command sized minutes, hours or unknown.
      For a slow run it also records the in-branch fixes made, the reused stages with their source commit, what changed and which stages it feeds, and the blocked checks.
      
5:  93603e9 ! 5:  2644046 fix: count trailer occurrences on empty commits for frozen citations
    @@ skills/implement-issue/SKILL.md: A credential absent on `akrogon status <slug>`'
      A red test or check with no cause in the leaf's diff takes the Shared context base-run rule before any repair.
      
      After the last implementation unit, with every worker worktree removed, supply passing proof for every done-criterion in the Shared context proof order, run changed tests including affected consumers and every `checks` command, reuse unchanged evidence, run `merge_checks` only at merge unless a done-criterion needs a whole run, with one other case: a `check.fix` pass after a red merge ending replays the exact rejected command recorded in `review-B.md`; repair any failure by the protocol (yourself in inline mode), then commit any remaining edits on top of the wave commits on the leaf branch, making no empty commit, and write `<leaf>/implementation/report.md` with changed files and reasons, commands run with pasted results and artifact paths, the base and committed head, known limitations and unverified criteria, folding worker returns into it, before handoff; `akrogon phase` refuses a dirty worktree and refuses any file under `issues/` on the branch, because every issue artifact is written only in the registered checkout.
    --Any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it in trailer text not already on the branch at the implement move.
    -+Any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it on a commit new since the record, a replayed planning-era trailer does not count.
    +-Tests are locked after planning: any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it in trailer text not already on the branch at the implement move.
    ++Tests are locked after planning: any commit that changes an existing file matched by the path rule in `src/test-files.ts` ends its message with a `Test-Change: <exact path> <source and reason>` trailer in the final trailer block, one per changed old test file, a later trailer-only empty commit is the allowed exception to the no-empty-commit rule, and the phase move is refused without it. A commit adding a case to an existing test file carries the same trailer, naming what was added and that no existing expectation changed, citing no source. The `plan.synthesis` to `implement` move records in state every path the branch changed against the target, its content id or absent for deletions; a later move refuses a recorded path changed or gone, or an added `src/test-files.ts`-matched path outside the record, until a `Test-Change:` trailer names it in the last commit touching it or a later commit; when no branch commit touches the path, a later trailer-only commit must carry it on a commit new since the record, a replayed planning-era trailer does not count.
      The report records wall time for every command sized minutes, hours or unknown.
      For a slow run it also records the in-branch fixes made, the reused stages with their source commit, what changed and which stages it feeds, and the blocked checks.
      

```

Merge check `test`: command `bun test --timeout=30000`; exit 0; 80.5 s; log `/home/ivan/Work/infra/akrogon/issues/open/pre-written-tests/frozen-test-guard/merge-test.log`.

```text
(pass) merge turn refusal names the holder for merged and check.fix while failed is never refused [782.39ms]
(pass) frozen record refuses drifted, reappearing, deleted and renamed paths until a citing trailer [1186.03ms]

 720 pass
 0 fail
 7633 expect() calls
Ran 720 tests across 36 files. [80.47s]
```

Merge check `typecheck`: command `bun run typecheck`; exit 0; 2.2 s; log `/home/ivan/Work/infra/akrogon/issues/open/pre-written-tests/frozen-test-guard/merge-typecheck.log`.

```text
$ tsc --noEmit
```

Merge check `test_changed`: command `sh -c : "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`; exit 0; 78.9 s; log `/home/ivan/Work/infra/akrogon/issues/open/pre-written-tests/frozen-test-guard/merge-test_changed.log`.

```text
(pass) merge turn refusal names the holder for merged and check.fix while failed is never refused [808.68ms]
(pass) frozen record refuses drifted, reappearing, deleted and renamed paths until a citing trailer [1189.12ms]

 575 pass
 0 fail
 5322 expect() calls
Ran 575 tests across 18 files. [78.89s]
```

`bun run format` exited 0. Its only rewrites were unrelated pre-existing formatting drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts`, both restored to the checked head before the suite. Worktree clean. No merge_checks or advisory commands configured. Completion owner `pre-written-tests` has only this open leaf; read ISSUE.md plus both frozen-test-guard and test-proof-rules briefs before landing. Test-proof-rules is already merged.

Merge guard: `akrogon phase frozen-test-guard merged --slot B --check --attempt 03ec004b-df44-40fb-a235-dafe907f2f32` returned `ok`.
Landing: same command without `--check` exited 0, printed `moved merged` and `issue complete pre-written-tests`. Remote main read-back (`git ls-remote origin refs/heads/main`) equals landed HEAD `2644046f2407edd9225e06293e4369b4dcfe2405`. Completion folder moved to issues/closed/pre-written-tests. Self-update skipped because the registered checkout diverged from origin/main (20 behind); the command instructs `akrogon sync`.
