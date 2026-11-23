# Bun code cache B: footprint

Code read on main at b9fe5027. Bun 1.4.5. (H) marks what I measured on this host on 2026-11-23.

## Short answer

- Take A1. The cache helps only inside one run, and a per-run folder keeps all of that gain.
- Do not disable it. `0` costs 10 to 18% of wall time on two akrogon test files.
- A2 is safe at any time. A3 needs `chmod` first, and its worktree goes through `git worktree remove`.

## 1. Who fills `@t@`

- F1. Growth over the last 7 full days: 9,486 files and 298 MB a day (H).
- F2. Checks fill it. In a 1-in-16 sample (14,031 files, 453 MB), 68% of the files and 49% of the bytes are source text with a run folder path written inside it, like `/var/tmp/akr-1000/6855/<leaf>/run-<id>/...` (H).
  - Every one of these is under repo key `6855`, the framework. None is under akrogon's `5d20` (H).
  - Cause: framework tests write source files that hold their own temp path. The key is the file content, so each run makes entries no later run can hit.
- F3. Another 6% of files hold other temp paths (`/tmp/...`). These come from bun runs outside `run-check`: seats and hand runs.
- F4. The rest (25% of files, 43% of bytes) has no temp path. Part of it is still waste: one 151 KB output is stored 1,149 times under different keys (H). Cause not traced.
- F5. The path reaches checks because `XDG_CACHE_HOME` is copied into the check env (src/run-check.ts:44). The test children inherit it even with a fake `HOME`.
- F6. Bun facts (H):
  - The key is file content. The same file at a second path adds no entry.
  - Small files are cached too (a 6 KB file made an entry).
  - `0` disables the cache.
  - The operator CLI and release runs add an entry only when a source file changes. That is small.

## 2. Best option

Measured on akrogon, one test file per row, cache in a fresh folder (H):

| File | Cache off | Cold | Warm |
|---|---|---|---|
| `tests/status.test.ts` (36 tests) | 1.09 to 1.15 s | 0.92 s | 0.91 to 0.97 s |
| `tests/phase.test.ts` (70 tests) | 5.17 to 5.29 s | 4.73 s | 4.70 to 4.72 s |

- Cold equals warm. One run starts many bun processes on the same source, and the first one fills the cache for the rest. Nothing is gained from an earlier run.
- A bare CLI start is 67 ms without the cache and 65 ms with it.
- One file's cache is 111 entries and 1.9 MB. It does not grow on a rerun.

Options:

- O1. Per-run folder (A1): pick. Keeps the in-run gain, bytes end with the run at src/run-check.ts:471.
- O2. Disable with `0`: loses 10 to 18% on these files for no extra saving over O1.
- O3. Shared bounded folder: needs an eviction rule. Bun has none, so it is a new mechanism.
- O4. Leave as is: 7 GB now, about 0.3 GB more each day.

## 3. What A1 could break

- R1. `tests/run-check.test.ts:167-176` compares the check env against a fixed list of names. The new name must be added there.
- R2. Order against `pass_env`. Set it after the `pass_env` loop, next to `NODE_DISABLE_COMPILE_CACHE` (src/run-check.ts:76), or a repo that passes the variable sends checks back to the shared folder.
- R3. A cache write failure is not an error. With an unwritable cache path the CLI still exits 0 (H). So a missing or removed folder cannot fail a check.
- R4. Seats and hand runs outside `run-check` keep writing to the shared cache (F3, part of F4). A1 stops the largest source, not all of it.
  - The owner-named fix for seats is the same variable in the seat unit (src/seat.ts:299), pointing into the leaf temp folder. I would wait and measure first.
- R5. The run folder gets bigger while the run lives. For akrogon that is a few MB. For a framework check it is not measured.

What proves A1: after one day, `find ~/.cache/bun/@t@ -newermt <day> | wc -l` is far under 9,486, and no new entry holds a `/run-` path.

## 4. A2 and A3

- A2. Safe, also during runs. I deleted a cache folder in the middle of a test run: 70 pass, 0 fail, and Bun made the folder again (H). Lost: nothing but the first transpile of each file afterwards.
  - M8 says never clear during runs. That rule is about a recurring clear. A one-time delete on a quiet lane respects it.
  - Do A1 first, or the folder refills at 0.3 GB a day.
- A3. The worktree is safe to remove: clean, detached at 99a256a8 which is on main, no process inside, only `.evidence/` and `node_modules/` ignored (H). 52 MB.
  - Use `git worktree remove`, not `rm`. It is a registered worktree of the akrogon repo.
  - The folder `/var/tmp/akr-1000/5d20/1f23ef6e` (76 MB) holds Nov 7 to 8 debug output: `.out`, `.bak` and `p1-block*.ts` files. Lost: those notes. Nothing else reads them.
  - A plain `rm -rf` fails. Reconcile already tries each pass and reports `EACCES` for `run-m0Erb3` (`~/.akrogon/reconcile/akrogon.json`). One directory inside has mode 555. Run `chmod -R u+w` first.
  - Same failure, same cause, in the sibling `/var/tmp/akr-1000/5d20/0b69a262` (Oct 24, 6.9 MB, one 555 directory). Remove both in one go.
- Q1. Reconcile cannot delete a tree that holds a 555 directory, and it reports the same two paths every pass. Is that a known issue, or should it be seeded?
