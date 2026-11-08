# Signposts angles — Slot E

## Settled in intake (skip asking)
- One cutover: zero `herdr` calls, plugin, fake-herdr, fallback, or docs wording remain (`INTAKE.md:4-8`).
- Every agent terminal gets a visible pane on start and restart via the start helper (`INTAKE.md:84,104`).
- Chart layout: A takes left 50%; consultants stack vertically on the right in order (`INTAKE.md:80-84`).
- Consultant names: `<repo prefix>-slot-<letter>`, enforced by the start helper (`INTAKE.md:119-123`).
- Chart folders exist at open under `issues/chart/<slug>/`; no `/tmp` briefs or returns (`INTAKE.md:133`).
- Consultant reset is `hc kill` + `hc run` from `seats.yaml`, never `/clear` or `/new` (`INTAKE.md:50,74`).
- No polling: slots push completion via `hc send` / phase commands (`INTAKE.md:73,187`).
- Sandboxed Codex argv includes `sandbox_workspace_write.network_access=true` (`INTAKE.md:180-181`).
- Tasks board row click jumps to the seat's pane via `pane.focus` (`INTAKE.md:171`, `herdr-app/tasks/main.js:249`).

## Questions

1. **Leaf handoff & wake architecture** *(angle doors miss: `akrogon phase` still relies on `plugin/herdr-plugin.toml:13-27` events to trigger the next slot)*
   How should leaf slots wake the next step when a turn finishes or a terminal exits?
   - **1a (Recommended):** Command-driven handoff + minimal exit watcher. `akrogon phase` (`src/akrogon.ts:76-99`, `src/phase.ts:879-947`) dispatches the next slot directly (via `hc run`/`hc send`), and a lightweight `hc events` listener (or mod) only handles startup `--resume` and abnormal exits/blocks. *Reason:* matches the no-polling `<hc>` push model (`INTAKE.md:187`) while still catching crashed terminals.
   - **1b:** Pure command-driven (`akrogon phase` + `hc send` between slots), no background event listener at all; crashes wait for manual `akrogon next` or `watch-issues`.
   - **1c:** Replace `plugin/herdr-plugin.toml:1-27` 1-to-1 with an `hc events` daemon driving all `src/next.ts:1604-1792` dispatches.
   - *Steers:* `plugin/` deletion vs daemon replacement, `src/akrogon.ts:76-99`, `src/next.ts:679-842,1604-1792`, and leaf skill completion steps.

2. **Teaching agents about `hc` and `herdr-app` without polluting non-herdr runs** *(angle doors miss: skills load on demand, while global `CLAUDE.md`/`AGENTS.md` load in every session outside herdr-app)*
   Where should `hc` / `herdr-app` awareness live so agents inside herdr always know it without bloating outside sessions (`INTAKE.md:187`)?
   - **2a (Recommended):** Replace `~/.claude/skills/herdr` (and all 4 harness skill roots in `src/install.ts:25`) with the `hc`/`herdr-app` skill, put a 2-line `$HC_TERMINAL_ID` env-gated rule in global `CLAUDE.md`/`AGENTS.md` pointing to that skill and `~/.config/herdr-app/AGENTS.md`, and inject the `hc` report rule in akrogon's start helper. *Reason:* zero noise when `$HC_TERMINAL_ID` is unset, guaranteed awareness when set.
   - **2b:** Only replace the global `herdr` skill and akrogon's start prompts; never touch global `CLAUDE.md`/`AGENTS.md`.
   - **2c:** Inline full `hc` and `herdr-app` instructions directly in global `CLAUDE.md`/`AGENTS.md`.
   - *Steers:* `src/install.ts:19-50`, `~/.claude/skills/herdr` replacement (`INTAKE.md:37`), global agent instructions, and start prompts in `src/next.ts:776-780` and `skills/chart-issues/`.

3. **Cut depth on `agent_session` transcript parsing and systemd pane boxing** *(angle doors miss: porting `agent_session` and `shell_pid` heuristics instead of deleting them)*
   Old herdr needed JSONL byte-offset checks (`src/session-file.ts:11-76`, `src/next.ts:773-785,817-839`, `skills/chart-issues/scripts/peer-wait.ts:158-234`, `door-reset.ts:39-138`), `observe.ts` log lookup (`skills/watch-issues/scripts/observe.ts:122-181`), and `pane process-info` systemd boxing (`src/scope.ts:121-208`, `src/next.ts:541-550,618-637`). Do we delete these or rebuild them on `hc get`?
   - **3a (Recommended):** Delete them. Key `state.yaml` (`src/state.ts:99-102`), `log.jsonl` (`src/log.ts:36-51`), and `timings.jsonl` (`src/timing.ts:31`) on `hc` terminal names/IDs; use `hc read` in `watch-issues`; let `hc kill`/`hc rm` own terminal processes (keep systemd slices only for `run-check`/`verify` units in `src/scope.ts:42-97`). *Reason:* follows "removing over adding" (`INTAKE.md:10-12`) since `hc` holders and `<hc>` messages replace them.
   - **3b:** Keep leaf-pane systemd boxing (`src/scope.ts:147-208`) via `hc get` foreground PID, but delete JSONL session-file parsing (`src/session-file.ts`, `peer-wait.ts`).
   - **3c:** Rebuild both `agent_session` JSONL discovery and `adoptShell` by walking `/proc` from `hc get`.
   - *Steers:* deletion vs rewrite of `src/session-file.ts`, `src/scope.ts:121-208`, `src/next.ts:541-550,618-637,773-785`, `src/log.ts:36-51`, `skills/chart-issues/scripts/*`, and `skills/watch-issues/scripts/observe.ts:122-181`.

4. **Repo isolation model in `herdr-app` and `hc`** *(angle doors miss: `src/shell.ts:379-422` assumes one herdr server per repo, whereas `herdr-app` shares one `hc` session across repo spaces)*
   How do repos map to `hc` sessions and `herdr-app` spaces?
   - **4a (Recommended):** One shared `hc` core session; one `herdr-app` space per repo (`herdr.space` / `herdr.tab` labels), with leaf terminals named `<repo prefix>-<slug>-a`/`b` (`src/next.ts:788`). *Reason:* matches how `herdr-app` works (`INTAKE.md:77,121`) and deletes cross-session discovery (`src/shell.ts:304-422`, `src/next.ts:471-511`).
   - **4b:** Separate `HC_SESSION` per repo, keeping `src/shell.ts:379-422` multi-session resolution.
   - *Steers:* `src/shell.ts:184-422`, `src/next.ts:435-589,788`, `src/reconcile.ts:404-431,713-775`, and `skills/watch-issues/scripts/observe.ts:222-224`.

5. **Handling `herdr-app` gaps: equal consultant heights and CLI notifications** *(angle doors miss: `herdr-app` has no CLI flag for pane weights or `notification show`)*
   When `herdr-app` lacks a CLI command—equal 33%/25% consultant heights (`INTAKE.md:84,111,147`) and `notification show` (`src/next.ts:251,1051`, `src/phase.ts:107`, `src/verify.ts:334,352`)—do we touch internal state/mods or stay strictly on public commands?
   - **5a (Recommended):** Public commands + existing `herdr-app/tasks` mod only. Do not mutate `~/.local/state/herdr-core/<session>/docs.json` for pane weights (Wait for upstream `herdr-app` weight support); drop CLI `notification show` calls in favor of `herdr-app`'s built-in `done`/`blocked` alerts and `herdr-app/tasks` red rows (`herdr-app/tasks/main.js:313-325`). *Reason:* avoids racing `herdr-app`'s live `docs.json` writer (`AGENTS.md:98`).
   - **5b:** Patch `size.weight` in `docs.json` after `terminal.keep` for equal heights, and emit toasts from `herdr-app/tasks` via `notify()`.
   - *Steers:* consultant start helper (`INTAKE.md:147`), `src/next.ts:248-259,1043-1086`, `src/phase.ts:98-134`, `src/verify.ts:325-361`, and `herdr-app/tasks/main.js`.

6. **Replacing `tests/fake-herdr.ts` across 48 test files** *(angle doors miss: real `hc` daemons vs fast fake binaries across 887 test lines)*
   How should the test suite replace `tests/fake-herdr.ts:1-524` (`INTAKE.md:31,167`)?
   - **6a (Recommended):** Small stateful `fake-hc` and `fake-herdr-app` scripts (`FAKE_HC`, `FAKE_HERDR_APP`) for unit/engine tests, plus deleting tests that only covered removed old-herdr mechanics. *Reason:* keeps `akrogon verify` fast, hermetic, and deterministic across all 48 test files (`tests/isolation.ts:64-78`, `tests/helpers.ts:132-146`).
   - **6b:** Spawn a real `herdr-core` per test under a scratch `HC_SESSION` and only fake `herdr-app`.
   - *Steers:* `tests/fake-herdr.ts`, `tests/isolation.ts:64-78`, `tests/helpers.ts:132-146`, and 48 files in `tests/`.

7. **Self-hosting cutover order** *(angle doors miss: `src/self-update.ts:283` and `src/next.ts` run live after each leaf merges)*
   Because `akrogon` dispatches and self-deploys its own leaves (`src/next.ts:1366`, `src/self-update.ts:283-288`), how should the epic's leaves be ordered?
   - **7a (Recommended):** Cut over engine (`src/`) + `install.ts`/`self-update.ts` + engine tests first so live `akrogon next` and `self-update` run on `hc`/`herdr-app` immediately, then port `skills/chart-issues` + `skills/watch-issues`, then `herdr-app/tasks` pane focus + docs/learnings. *Reason:* prevents a half-ported engine or broken `herdr plugin link` deploy mid-epic.
   - **7b:** Port `skills/chart-issues` and start helpers first, then `src/` engine, then docs.
   - *Steers:* leaf boundaries, dependency graph (`blocked-by`), and when `plugin/` is deleted.
