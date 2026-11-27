# Unit U5: removal-failure warnings and xtrace-safe entry scripts (review findings F1 and F5)

## 1. Goal

Repair two proven defects in `src/tool-cgroup.ts`, the leaf's kill/entry module:

- F1: a removal (rmdir) failure of a tool cgroup is silent today. It must warn as one structured JSON line on stderr and count into the scope row's `errors`, exactly like kill-write and spawn failures — but only when the failure cannot be the kernel's asynchronous reaping race.
- F5: the entry scripts leak their own trace lines onto stderr when a harness tool command runs `bash -x`, violating the never-change-output contract. The wiring must add nothing to a traced shell's stderr.

## 2. Numbered acceptance criteria

1. `bun test tests/tool-kill.test.ts -t "failed removal"` passes: a fake-tree `t-` that reads populated 0 and cannot be removed produces a structured warning (`leaf`, `unit`, `t`, `error`) on stderr of a committed move, and the scope's `tool_kill` row counts it in `errors` — while the move commits and exits 0.
2. `bun test tests/tool-entry.test.ts -t "exactly once"` passes: the `x` and `w` cases — byte-identical stderr with and without the wiring for `bash -ex` through BASH_ENV and through the executed wrapper.
3. The existing tests in both files keep passing unchanged (`bun test tests/tool-kill.test.ts` and `bun test tests/tool-entry.test.ts` whole files, except the two criterion cases whose proofs belong to other units — those fail for unrelated handed findings: run them and note any failure not named "open but undrained").

## 3. Read-first list

- `src/tool-cgroup.ts` — the whole module; the sweep (`sweepScope`, `rmdirBestEffort`, `populated`, `warn`, `fail`), the helper (`toolKillHelper`), the entry text (`placementShell`, `entryTemplate`).
- `tests/tool-kill.test.ts` — the "failed removal" test (fake-tree construction, warning shape) and the existing kill/spawn failure cases beside it.
- `tests/tool-entry.test.ts` — the scope script and the `x`/`w`/`xref`/`wref` assertions.
- `issues/chart/seat-shell-kill/direct/probe-entry/place.sh` — the original probe placement text the entry derives from.
- This skill folder's `ponytail.md`.

## 4. Change list and needed interfaces

Owned paths: `src/tool-cgroup.ts` only. You write and edit no test — tests are committed and red on the head you start from; a test you believe is wrong is a mismatch returned to A.

Creation commit: `d68b053ede946295287f4faadc107ee6787a919f`.

Changes:

**F1 — removal failure visibility.** Implement this reading (recorded in plan.md): a rmdir failure is the expected reaping race exactly when the cgroup reads populated 1 at that moment; it warns and counts when the cgroup reads populated 0 (nothing left to reap, so the failure is real). Concretely:

- Replace the silent `rmdirBestEffort` usage in the sweep with logic that, on a failed rmdir, reads the target's `cgroup.events` populated state (the existing `populated()` helper — absent or unreadable reads unpopulated). Populated 1: silent, removal converges on a later commit. Populated 0 (or absent/unreadable): warn through the existing `fail(t, error)` shape and count into `errors`. This applies to the kill-path rmdir of `t-` dirs AND the best-effort cleanup loop removals of `akrogon/<t>` and `helpers/<t>` dirs (their populated read is on the directory being removed).
- The helper `toolKillHelper`'s rmdir retry loop gets the same treatment on its final failure: when the deadline passes with removal still failing, the `tool_kill_deferred` row carries the failure — outcome stays as written/killed-already for the kill write itself; if the kill was written but removal ultimately failed with the cgroup populated 0, record it in the row's `error` field (the schema already allows an optional `error` string) — do not add schema fields.
- Never warn for a directory that no longer exists (ENOENT — already removed by a concurrent pass) — removal succeeded in effect.

**F5 — xtrace-safe entry.** The leak mechanism: bash xtrace prints simple-command traces before applying redirections, so `f 2>/dev/null` leaks `+ f` — but commands *inside* a function/group trace after its redirection applies. The fix shape (verify it yourself with real `bash -ex` experiments before writing — this is the subtle core of the unit): restructure the placement text so that as its very first executed effect it disables xtrace (`set +x`), remembers whether xtrace was on (`case $-` or `$SHELLOPTS` before disabling), runs the placement body, then re-enables xtrace exactly when it was on. All of the disable/remember/reenable logic must sit inside a group whose stderr is redirected to /dev/null (the function body qualifies — traces of commands inside the function print only after the function's own redirection is applied; verify this in your probe). Nothing the entry does may appear on the traced stderr: not the function invocation trace, not the disable, not the re-enable. The user's own commands must still trace exactly as without the wiring — byte-identical stderr. The executed wrapper has the additional subtlety that the final `exec bash "$@"` line itself traces if xtrace is re-enabled before it (bash forks+execs for the traced command, so its trace would print) — the wrapper's re-enable must therefore happen through the exec form (e.g. re-enabling inside the group then tracing is suppressed because the group redirects stderr… probe this carefully: `exec` inside the redirected group would leave stderr redirected in the final shell, which is wrong; find the arrangement — proven possible with `-x` passed through argv, or another shape your probes verify — that yields byte-identical stderr in both the `bash -ex script` BASH_ENV case and the `bash -c 'set -x; exec wrapper script'` case). Exit-status and output preservation rules from the original design are unchanged: the sourced form always ends true-equivalent, the wrapper always execs real bash with `"$@"` intact.

Both repairs are small; the difficulty is verification, not volume.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file: they are A's reproduction proofs; a wrong or impossible expectation is a mismatch with evidence returned to A. Exception: none.
- Do not change the placement semantics (exact scope-root match, minted `t-` name shape, fail-open behavior, the never-change-output/exit contract): criterion 3 pins them. Exception: the stderr content of the entry scripts themselves in the specific traced case, which is this unit's subject.
- Do not make a populated-1 rmdir failure warn: it is the routine reaping race and noise there defeats the visibility purpose (recorded reading in plan.md). Exception: none.
- Do not warn for ENOENT removals: the directory is already gone, which is success in effect.
- Never run any `git stash` subcommand in the worktree: leaf worktrees of a repo share one stash. To set work aside, commit it as a WIP commit and, before returning, `git reset --soft d68b053ede946295287f4faadc107ee6787a919f` and make the unit's single returned commit.
- Never stop a process by command-line pattern (`pkill -f`, `killall`); use `akrogon stop-run <run-id>` for runs.
- Return a mismatch with evidence instead of changing scope or interfaces; the exception is a revised brief from A.

## 6. Ordered steps

1. Read everything in section 3. Reproduce the xtrace leak yourself with real bash (small scripts in $TMPDIR): `bash -ex` with a BASH_ENV file modeled on the current entry text, observing which lines leak and which don't; probe the group-redirection trace behavior and the exec-trace behavior until you can predict them. (criterion 2)
2. Repair the entry text in `src/tool-cgroup.ts` per your verified arrangement. (criterion 2)
3. Run `bun test tests/tool-entry.test.ts -t "exactly once"` — green. Iterate on the arrangement until byte-identical. (criterion 2)
4. Repair the removal-failure handling in `sweepScope` and `toolKillHelper` per section 4. (criterion 1)
5. Run `bun test tests/tool-kill.test.ts -t "failed removal"` — green; then the whole `tests/tool-kill.test.ts` file — every test passes except "a run-check writer with open but undrained pipes…" (another unit's finding; it may fail). (criteria 1, 3)
6. Run the whole `tests/tool-entry.test.ts` — green (criterion 3).
7. Commit once with the repair, run `git reset --soft` discipline if you made intermediate commits.

Advisory size: 1 file, under 30 turns.

## 7. Commands

- `bun install --frozen-lockfile --backend=copyfile` first in your worktree if `node_modules` is absent.
- `akrogon run-check --name u5-entry -- bun test tests/tool-entry.test.ts --timeout=120000` for evidence of the entry repair (fall back to the bare `bun test` command if run-check fails to resolve the leaf in your detached worktree).
- `akrogon run-check --name u5-kill -- bun test tests/tool-kill.test.ts --timeout=120000` for the removal repair evidence.
- Never `akrogon verify` — that is A's.

## 8. Done-when, evidence and report

Both reproduction tests green on your single commit, the rest of both files green except the named other-unit case. Report with the commit id and these four lines filled:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
