# Brief 1: frozen-test-guard — record and guard

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/frozen-test-guard-u1`

## 1. Goal

Implement the `frozen` planning-file record and the citation guard from plan.md decisions D1-D7 (and D8's call-site rule). A `plan.synthesis`→`implement` move records every path the leaf branch changed against the target with its blob id; a later phase move refuses a recorded path whose content drifted, or a newly added test-rule path outside the record, unless a `Test-Change` trailer names it in the last commit touching the path or a later commit.

## 2. Numbered acceptance criteria

From brief.md done-criteria 1-6, each proven by one CLI-level case in `tests/phase.test.ts` driving `akrogon phase` in the real fixture repo (no git mocks; herdr only via `fakeHerdr` where a move needs it):

1. A leaf at `plan.synthesis` with a worktree branch that modified a file, added `plan.test.ts`, added `scripts/proof.sh` and deleted `gone.test.ts` gets `frozen` written into `state.yaml` on `phase <slug> implement --slot A`: each path maps to `git rev-parse HEAD:<path>` output and `gone.test.ts` to `null`. A no-change branch gets `frozen: {}` (assert the key exists and equals {}). A leaf whose `state.yaml` carries no `frozen` key moves under today's guard unchanged (one case: seed `frozen` via the `leaf()` extra with the path's real blob id, verify the guard applies; the existing no-frozen cases already prove absence). Re-seeding a record and moving `failed`→`plan.synthesis`→`implement` rewrites the record from the newer tree.
2. With a record, editing a recorded path then moving `implement`→`check.review` is refused, stderr naming the path and `Test-Change: <path> <source and reason>`; a trailer on the planning commit does NOT cite the later edit; the editing commit's own trailer, or a later trailer-only `--allow-empty` commit, does. A recorded-`null` path reappearing, and a recorded path deleted or renamed (rename is refused on the old name), both refuse. After the move lands, `frozen` is still present in `state.yaml`.
3. A newly added path matched by `src/test-files.ts` (e.g. `extra.test.ts`) absent from the record refuses identically and is accepted with the trailer.
4. A recorded non-test path (`scripts/proof.sh`) refuses and accepts identically.
5. After `git fetch` and a real `git rebase` onto the advanced `origin/main` in the worktree, the criteria-2/3 refusals behave identically; and when the target's own change to a recorded path leaves HEAD differing while no leaf commit in `target..HEAD` touches that path, the move refuses until a trailer-only commit names it. (Fixture recipe: leaf edits `file`; push a main change to `file`; `git fetch origin`; `git rebase origin/main`; resolve the conflict to a third content; `git rebase --continue`; then the refuse→trailer→accept sequence. Cover the second half the same way in the recorded-`null`+target-add or the no-leaf-touch shape: a recorded path the target changed and no `target..HEAD` commit touches, refuse until trailer.)
6. Existing `M`/`D`/`T` trailer cases in the file stay green; merge-path calls keep today's semantics (no state passed).

## 3. Read-first list

- `src/phase.ts` — `transition` (:225-311), `requireTestChangeCitations` (:342-367), `commitMove` (:132-183), explicit-range call sites (:421,427,904).
- `src/state.ts` — `stateSchema`, `readState`, `saveState`.
- `src/test-files.ts` — `testFile()`.
- `src/config.ts:248` — `target(repo)` returns `<remote>/<default_branch>`.
- `tests/helpers.ts`, `tests/phase.test.ts:1600-2027` — `fixture`, `leaf` (takes `frozen` through `extra`), `oldFileBranch`, `commitAll`, `cli`, `fakeHerdr`, `readState`/`bytes` usage; copy the existing trailer-test style exactly.
- `skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/state.ts`, `src/phase.ts`, `tests/phase.test.ts`. No shared test resource. No prerequisite unit — wave 1 with U2 (docs).

- `src/state.ts`: add to `stateSchema`: `frozen: z.record(z.string(), z.string().nullable()).optional()`. `zod` is `^4.1.5`. Do not add it to `readState`'s filtered keys.
- `src/phase.ts`, in `transition`: call the new guard on the line after `requireTestChangeCitations` (:282), only when `state.worktree !== undefined && state.frozen !== undefined`, passing `state.frozen`. Then, only on a real move (after the `checkOnly` return and after the incomplete-slot `recorded` save, inside the object given to `commitMove`), when `state.phase === 'plan.synthesis' && requested === 'implement'`, set `frozen` on that state to the computed record (`{}` when `state.worktree` is undefined).
- New private helpers in `src/phase.ts`: a `git ls-tree -r --full-tree <rev>` parser → `Map<path, sha>` (sha is third whitespace field before the tab); a `frozenRecord(repo, worktree)` builder → `git diff --no-renames --name-status <target>...HEAD` paths mapped through the tree map, absent → `null`; and extract the trailers→cited-paths parsing out of `requireTestChangeCitations` into a shared helper taking a rev range, reused by both guards (existing function's behavior stays byte-identical).
- `requireFrozenCitations(repo, worktree, frozen, from = target(repo), to = 'HEAD')`: violating paths = (a) record keys whose `to` blob differs from the record (record `null` vs existing, record id vs absent, or id mismatch) plus (b) `A`-status paths in `git diff --no-renames --name-status <from>...<to>` where `testFile(path)` and `frozen[path] === undefined`. A violation is cited only when a `Test-Change` trailer names it in `lastTouch^..<to>`, where `lastTouch` is `git log --format=%H -1 <from>..<to> -- <path>`; with no `lastTouch` the scan is the whole `<from>..<to>` (the citing commit need not touch the path, so never pass `-- <path>` to the trailer scan). Throw the same error shape as `requireTestChangeCitations`: `Changed test files need a citation:\n` then `Test-Change: <path> <source and reason>` per missing path, then the trailer-block/empty-commit sentence.
- Call sites at :421, :427, :904 keep calling `requireTestChangeCitations` only — no state, unchanged.

## 5. Do-not, reasons and exceptions

- Do not change `requireTestChangeCitations`'s range semantics, error text or call sites beyond the internal parser extraction — criterion 6 pins today's guard.
- Do not write `frozen` on any move other than `plan.synthesis`→`implement`, and never on `--check` or the incomplete-slot save — criterion 1 pins when.
- Do not record only test-matched paths — criterion 4 needs `scripts/` paths.
- Do not scan `lastTouch..<to>` with a `-- <path>` filter — a trailer-only commit does not touch the path and would be invisible.
- Do not write worker commits without the required `Test-Change:` trailer (see §8) — the lane's later phase move refuses otherwise.
- No mocks of git; no `.env` reads; no edits outside owned paths — docs belong to U2.
- Return a mismatch with evidence instead of widening scope or changing an interface; the exception is a revised brief from A.
- Reasons restated: criterion 6 pins the old guard, criterion 1 pins write timing, criterion 4 pins record scope, the unfiltered `^..` scan pins citation semantics, the trailer pins the lane move; a mismatch goes back, never a self-decided change.

## 6. Ordered steps

1. `cd` worktree, `bun install`. Write the criterion-1..5 tests first in `tests/phase.test.ts` (extend the existing trailer-test block's style; use `git rev-parse HEAD:<path>` in the worktree for record expectations). Run `bun test tests/phase.test.ts -t frozen` (or by name filter); confirm the new cases fail for the right reason (no `frozen`, no refusal).
2. `src/state.ts`: the schema line (criterion 1).
3. `src/phase.ts`: helpers + `requireFrozenCitations` + the two `transition` hooks (criteria 1-5).
4. Rerun the new tests green, then the whole `tests/phase.test.ts` file (criterion 6).
5. Commit once: message `feat: freeze planning-time test and file record at implement` (or similar) with final trailer block `Test-Change: tests/phase.test.ts added frozen-guard criterion cases; no existing expectation changed`.
- Advisory size: about 3 files and under 40 turns; beyond that return a mismatch with evidence, not a hard cutoff.

## 7. Commands

`bun test --changed=354c80e14aca6483c430312c61ae5c1397bb548e --timeout=30000` run in the worktree (AKROGON_BASE = 354c80e14aca6483c430312c61ae5c1397bb548e); also `bun test tests/phase.test.ts` while iterating.

## 8. Done-when, evidence and report

Every acceptance case green; file suite green; red-before/green-after observed per criterion; commit id returned. Report below:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
