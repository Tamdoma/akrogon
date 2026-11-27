# Sub-brief 3: check.fix repair of findings F1, F2, F3

Commit A created the worker worktree at: `6d8f1ee0` (confirmed). The reproduction tests for all three findings are committed there and currently RED by design — your job is the product fix that turns them green. You write and edit no test.

## 1. Goal

Repair review-B findings F1, F2, F3 in `src/next.ts` only. All three findings are defects of the dispatch-time setup step the leaf added.

## 2. Numbered acceptance criteria

- **F1**: with setup due, a live run-check of the leaf and no live seat, and capacity filled by a sibling (`max_active: 1`), a dispatch records no capacity wait for the leaf, exits 0, runs no setup; `akrogon seat` refuses naming the run id, not capacity. Proven red→green by the test `criterion 4: a live run-check holds the due setup with capacity full and no live seat` in `tests/setup-busy.test.ts` (currently red: a capacity wait row is recorded).
- **F2**: with `CLAUDECODE` set in the caller and listed in the repo's valid `env` and `pass_env` config, the setup child still sees `cc=unset` (and `run=unset`). Proven red→green by `criterion 1: env and pass_env entries cannot forward CLAUDECODE or AKROGON_RUN into setup` in `tests/setup-dispatch.test.ts` (currently red: `cc=1`). The check-side behavior of `constructedEnv` (`src/run-check.ts`) and the `env`/`pass_env` schema (`src/config.ts`) must not change — `CLAUDECODE` remains valid config and keeps forwarding into check commands.
- **F3**: when the own-modules guard refuses after a successful setup, the per-leaf report's error payload carries the guard's exit code 1. Proven red→green by the strengthened assertions in `criterion 5: the own-modules guard failure is reported and the adopted worktree is kept unmarked` (currently red: the report is only the plain refusal text, no `\"code\":1` in the JSON-escaped stderr).

The rest of both test files must stay green unchanged.

## 3. Read-first list

In your worktree:

1. `src/next.ts` — `allocate` (capacity refusal ordering), `ensureWorktree` (the setup step), `busyDetail`/`busySeat`, `capRefusal`.
2. `src/run-check.ts` — `constructedEnv` (understand what it copies; do not change it).
3. `src/config.ts` — the `env`/`pass_env` schema refinement (understand why `CLAUDECODE` is valid and `AKROGON_RUN` is reserved; do not change it).
4. `src/shell.ts` — `CommandError` shape.
5. The two failing test cases and the strengthened assertions (your ground truth).
6. `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/next.ts` only. If you find the honest fix needs another file, return a mismatch instead.

**F1 repair shape** (the design's semantics): the capacity refusal exists to avoid over-committing seats; a leaf that is busy on a due setup cannot dispatch this pass at all, so the capacity question is moot for it and must not mask the busy outcome. Implement: compute `busy` right after `leafSeats` (it depends only on `found` and `liveRuns`, both available before the capacity check) and pre-compute whether setup is due without mutating anything — the due test is `repo.config.setup !== undefined` and the marker at the worktree's git path missing or differing; a worktree that does not exist yet has no marker, so setup is trivially due. When busy is non-null and setup is due, skip the capacity short-circuit and let `ensureWorktree`'s existing gate return the busy outcome. When busy is null or setup is not due, keep today's exact ordering and behavior (capacity refusal before `ensureWorktree`). Do not restructure `ensureWorktree`'s internals beyond sharing the due computation — extract a small helper for the due test rather than duplicating it, and keep the marker resolution in one place. Edge note: a commit-free leftover with a matching marker that gets replaced mid-pass may flip due inside `ensureWorktree`; the pre-computation ordering you implement governs the common case the finding proves, and the in-`ensureWorktree` gate remains the authority for the actual busy return.

**F2 repair shape**: at the setup spawn in `ensureWorktree`, remove `AKROGON_RUN` and `CLAUDECODE` from the env `constructedEnv` returns before passing it to `spawnCaptured` — those names can only arrive through `env`/`pass_env` forwarding, since `constructedEnv`'s copied list never includes them. One or two lines at the call site, nothing else.

**F3 repair shape**: the own-modules refusal currently throws `new Error(refusal)`. Throw a `CommandError` instead so the report carries the command shape: a synthetic result `{ code: 1, stdout: '', stderr: refusal }` with argv describing the conceptual command (`['akrogon', 'guard', 'own-modules']`) and the worktree as cwd. Check `Result`'s exact shape in `src/shell.ts` first.

## 5. Do-not, reasons and exceptions

- Do not edit any test file or fixture. The reproductions are locked proofs; a red or wrong one after your correct fix is a mismatch returned to A. Exception: none.
- Do not change `src/run-check.ts` or `src/config.ts` — check-side env behavior and the schema are locked design (Q4a) and the finding explicitly keeps them. Exception: none.
- Do not weaken the busy gate, the removal-on-failure behavior or any criterion. Exception: none.
- Do not change scope or interfaces; return a mismatch with evidence instead. Exception: a revised brief from A authorizing the change.
- Never run any `git stash` subcommand: every worktree of the repo shares one stash. To set work aside: commit it as a WIP commit and, before returning, `git reset --soft 6d8f1ee0` and make the unit's returned commit once.
- Do not stop processes by command-line pattern; use `akrogon stop-run <run-id>`.
- Restated: tests locked, run-check.ts and config.ts frozen, no stash, WIP squashes into one commit.

## 6. Ordered steps

1. Install dependencies: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
2. Read the three failing reproductions and the read-first list.
3. Implement F2 and F3 (small, independent of each other), then F1 (the ordering change). You may commit them as separate WIP commits and squash at the end, or build one diff — the final return is one commit.
4. Run the targeted tests (section 7) until green.
5. Squash into one commit. Commit message: `fix: busy outcome precedes capacity, setup env scrubbed, guard failure reports exit code` or similar honest summary.

Advisory size: 1 file, under 40 turns. Beyond that, return a mismatch with evidence.

## 7. Commands

Run each through `akrogon run-check` and cite the printed `check <label>: <exit> <path>` lines:

- `akrogon run-check --name u3-dispatch -- bun test tests/setup-dispatch.test.ts --timeout 180000`
- `akrogon run-check --name u3-busy -- bun test tests/setup-busy.test.ts --timeout 180000`
- `akrogon run-check --name u3-typecheck -- bun run typecheck`

Both test files must be fully green (not only the new cases). Never run `akrogon verify` or the full suite.

## 8. Done-when, evidence and report

Both files green and typecheck green on your one commit, cited with `check <label>: <exit> <path>` lines. Read back cited logs with `akrogon log`; paste at most short excerpts.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
