# Slot C — Bun Code Cache (`footprint`)

## 1. Who fills `~/.cache/bun/@t@` (and why it hits 7.0 GB)

- **Mechanism (`node_modules/bun-types/docs/runtime/environment-variables.mdx:212-234` + probe):** Bun caches transpiled `.pile` bytecode for every source file **> 4 KB**, keyed by **content hash** (verified: two identical 6 KB files at different paths wrote **1** file, 6.1 KiB total — path changes alone do **not** multiply entries), and **never evicts**.
- **Who writes to it today:** every Bun process without `BUN_RUNTIME_TRANSPILER_CACHE_PATH` set:
  1. **Checks (`run-check` / `verify`)** — `constructedEnv` (`src/run-check.ts:41-49,62-78`) copies `HOME` and `XDG_CACHE_HOME`, so every `bun test` / `bun run` writes to `~/.cache/bun/@t@`.
  2. **Seats (`src/seat.ts:299`)** — agents run `bun test`, `bun -e`, `bun src/akrogon.ts` directly in their shell outside `run-check` while iterating on edits.
  3. **`land` and `verify-pass` systemd units (`src/land.ts:40-44`, `src/verify.ts:939-940`)** and **release / operator CLI runs** — every deployed release under `~/.akrogon/releases/` changes `src/*.ts` (~83 files / ~971 KiB per `akrogon config` run).
- **Why 223,542 files / 6.59 GiB (+11,758 files / +388 MiB in the last 24 h):** content-addressing without eviction keeps **every historical edit** of every >4 KB `.ts`/`.js` file, generated test fixture, and bundled artifact forever. Sampling `~/.cache/bun/@t@`: 7 of the 10 newest entries are repeated 142 KiB / 47 KiB edits of `tests/*.test.ts` and `src/*.ts`; the 30 largest files alone total **169 MiB** (max single `.pile`: 17.27 MiB, Playwright/bundled JS).

## 2. Best option + benchmark

Measured in `/tmp` on `akrogon` (Bun 1.4.5, `NODE_DISABLE_COMPILE_CACHE=1`):

| Command | `='0'` (disabled) | Fresh dir (`runRoot`) | Warm dir | Cache written |
|---|---:|---:|---:|---|
| `bun src/akrogon.ts config` (single process) | 67–82 ms | 66 ms | 65 ms | 83 files / 971 KiB |
| `bun test tests/run-check.test.ts` (multi-spawn) | 1,524–1,527 ms | **1,446 ms** | 1,452 ms | 109 files / 1.45 MiB |
| `bun test tests/phase.test.ts` (heavy multi-spawn) | 3,432–3,458 ms | **2,940 ms** | 3,007 ms | 111 files / 1.61 MiB |

- **Takeaway:** A fresh per-run cache saves **5–15%** on subprocess-heavy test runs, matches warm-cache speed within noise, costs only **~1.5 MiB** of ephemeral temp, and Bun auto-creates the target folder (`nested/bun-cache` worked without pre-`mkdir`). A shared bounded dir adds no measurable speed over per-run and violates M8 (unsafe to evict while concurrent Bun processes run).
- **Recommended split:**
  1. **Checks (`src/run-check.ts:62-78` — A1):** set `env.BUN_RUNTIME_TRANSPILER_CACHE_PATH = join(runRoot, 'bun-cache')` after the `env`/`pass_env` loop (alongside `NODE_DISABLE_COMPILE_CACHE = '1'` at `:76`). Lives and dies with `runRoot` (`:471`).
  2. **Seats, `land`, and `verify-pass` (`src/seat.ts:299`, `src/land.ts:44`, `src/verify.ts:940`):** set `BUN_RUNTIME_TRANSPILER_CACHE_PATH=0` alongside `NODE_DISABLE_COMPILE_CACHE=1`. Single-process `land`/`verify-pass` see ~0 ms penalty (and `verify-pass`'s child checks still get A1's per-run cache via `constructedEnv`). On seats, `'0'` closes the biggest leak outside `run-check` (ad-hoc edits + `bun test` / `bun -e`) with zero extra dirs, while any `akrogon run-check` called by the seat overrides it with A1's per-run folder.

## 3. What A1 could break

- **Immediate test break:** `tests/run-check.test.ts:167-185` asserts an **exact `allowed: Set<string>`** of env var names inside `constructedEnv`; adding `BUN_RUNTIME_TRANSPILER_CACHE_PATH` fails line `185` until added to `allowed` (and add an override test mirroring `tests/run-check.test.ts:213-241`).
- **`pass_env` precedence:** setting `BUN_RUNTIME_TRANSPILER_CACHE_PATH` **after** the `repo.config.env` / `pass_env` loop (`src/run-check.ts:70-76`) ensures a repo's `pass_env` cannot leak back into `~/.cache/bun/@t@` (matching `NODE_DISABLE_COMPILE_CACHE`). Neither `akrogon` nor `framework` currently references it in `issues/config.yaml` or `.claude/`.
- **Incomplete boundary if A1 stops at `constructedEnv`:** without also setting `=0` in `src/seat.ts:299`, `src/land.ts:44`, and `src/verify.ts:940`, seats editing TS files and running ad-hoc `bun` commands will keep growing `~/.cache/bun/@t@` without bound. (The existing tests at `tests/next.test.ts:2622`, `tests/hc-start.test.ts:106`, `tests/green-merge.test.ts:143` use `toContain`/`.get()` so adding it won't break them.)
- **Nested `run-check`:** safe — each inner `run-check` builds its own `runRoot` and overwrites `BUN_RUNTIME_TRANSPILER_CACHE_PATH`.

## 4. A2 and A3 safety

- **A2 (one-time delete of `~/.cache/bun/@t@`):**
  - **Nothing irreplaceable lost** (purely regenerable bytecode cache).
  - **One safety tweak (M8):** rather than `rm -rf ~/.cache/bun/@t@` in place while any Bun process could be writing to it, atomically `mv ~/.cache/bun/@t@ ~/.cache/bun/@t@.dead && rm -rf ~/.cache/bun/@t@.dead` (or run when idle; newest file was ~4 h old at `02:57Z`).
- **A3 (remove `/var/tmp/akr-1000/5d20/1f23ef6e/eoh-base` and `/var/tmp/akr-1000/5d20/1f23ef6e`):**
  - **Safe, 76 MB total, 0 open files (`lsof`), nothing of value lost:** `eoh-base` is a clean detached checkout of `99a256a8` (already in `akrogon` history) and the sibling files in `1f23ef6e/` are Nov 7–8 debug dumps (`*.bak`, `*.out`, `p1-block*.ts`, `jiti`, `eoh-base/.evidence/install-prune-links`).
  - **Must clean git worktree registration:** `eoh-base` is still registered at `/home/ivan/Work/infra/akrogon/.git/worktrees/eoh-base` (`git worktree list` shows it). Run `git -C /home/ivan/Work/infra/akrogon worktree remove --force /var/tmp/akr-1000/5d20/1f23ef6e/eoh-base` before `rm -rf /var/tmp/akr-1000/5d20/1f23ef6e` (or `git worktree prune` right after) so `.git/worktrees/eoh-base` is not left dangling.
