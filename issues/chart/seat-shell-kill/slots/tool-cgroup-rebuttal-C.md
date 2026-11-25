# Rebuttal, slot C: tool-cgroup

Date: 2026-11-25  
Source: `slots/tool-cgroup-merged.md`, plus differing sections of `slots/tool-cgroup-B.md` and `slots/tool-cgroup-D.md`.

---

## Point 1 — Q1: `a` (A, C, D) vs `b` (B)

**Pick: Keep `a`.**

### Answer to the Claude P1/P1b masking question
- **Which case breaks delivery (stalls the advanced-to phase)**: When the calling seat starts a background shell in the *same* tool command as `akrogon phase` (e.g. `sleep 600 & akrogon phase ...` with stdio detached so the tool call returns), **and** the calling seat is required by the advanced-to phase (`plan.synthesis -> implement` for A; `implement -> check.review` with `fix_rounds === 0` for A; or any phase where the calling slot is in `requiredSlots`). Under Q1a, that `tools/t-caller` survives; under P1/P1b Claude stays `working` ("1 shell still running") and `turn` does not advance. Even if the other seat finishes and records `done`, the phase cannot advance without the masked seat (`src/phase.ts:transition`), so **no next advance arrives** and delivery stalls indefinitely.
- **Which case does NOT break delivery (bounded by next advance or leaf close)**: When the calling seat is *not* required by the advanced-to phase (`check.review -> check.repair` after A reports last; `check.repair -> check.fix` after B reports; `check.review -> merge`; or any move to `failed`/`merged`). There, the other seat or merge/reconcile advances or closes the leaf without waiting on the masked seat, and the next advance (different or no caller) kills the old `t-caller`.

### Why this still decides for `a` over `b`
B's objection is real for that narrow same-command case, **but `b` breaks normal moves** because of how `akrogon phase` actually finishes:
1. **`phaseWake` and `mergeWake` run inside the `akrogon phase` process after `commitMove` returns** (`src/akrogon.ts`, `case 'phase'`). `phaseWake` -> `dispatchLeaf` -> `startSeat` can legitimately run for up to `START_PROOF_MS` (60 s) + `PANE_WAIT_MS` (15 s), and `mergeWake` can run `selfUpdate` and `buildStack`. Throughout that entire window, `akrogon phase` has not exited, so the caller tool shell has not exited either. Under `b`, any short timeout backstop on the detached helper fires mid-`phaseWake`/`mergeWake` and kills the caller's tool shell (degrading `b` into `c`), while a long backstop leaves a live orphan killer process hanging around for > 75 s.
2. **Cross-phase kill race on a single `shells/` cgroup**: Under `b`, once the caller shell exits, the seat can finish its turn, receive the next phase prompt via `listen` -> `next --wake`, and spawn its first tool shell for the *new* phase into `shells/` before the detached helper's poll wakes and writes `shells/cgroup.kill` — killing a live tool shell of the new phase. (B's note treats post-exit shells as "contract-conformant", which is false once the next phase has already been dispatched.)
3. By contrast, `a`'s gap only fires on the contrived pathology of starting a detached background loop inside the *exact same* shell invocation as `akrogon phase` (not the incident's earlier-tool-call loop), while `a` keeps zero detached helpers, zero timers, and zero cross-phase kill races.

---

## Point 2 — Q3 wiring: per kind (A, B, C) vs per kind + `BASH_ENV` base layer for all (D)

**Pick: Keep per-kind wiring (A, B, C) — and explicitly do NOT put `BASH_ENV` on `agy`.**

- **Where D's evidence updates my view**: D's paid probe `P-claude` showed that `BASH_ENV` does *not* break Claude 2.1.332 Bash tool execution today (my binary finding `!j_("BASH_ENV")` gates a specific built-in `Stop` hook fast-path, not normal Bash tool calls). I acknowledge that correction plainly.
- **What still decides against a universal `BASH_ENV` base layer**:
  1. **Unproven hazard on `agy`**: In `agy` 1.5.16's binary, `BASH_ENV` appears next to `PERL5LIB` and `GEM_PATH` (security/env denylist strings), and D's `P-agy` never reached a tool call. Setting `BASH_ENV` on `agy` without a passing tool probe risks silently tripping `agy`'s own env filter or command guard.
  2. **Unnecessary scope bleed on `claude`**: With `CLAUDE_CODE_SHELL` proven to work (`P-claude`), `BASH_ENV` adds no value on working Claude builds while bleeding into non-Bash-tool `bash -c` subprocesses (Claude hooks and stdio MCP servers spawned from `<seat>.scope`), pulling them into `tools/t-*` and killing them at advance. If the door still wants `BASH_ENV` as a fallback *on `claude` only* (trading hook/MCP hygiene for decay resilience), that narrow choice is at least empirically tested by `P-claude`; putting `BASH_ENV` on `agy` before `P-agy` passes is not.

---

## Point 3 — Q4: `-p Delegate=yes` (A, C, D) vs none (B)

**Pick: Keep `-p Delegate=yes`.**

- **Deciding reason**: B's premise that omitting `Delegate=yes` would "fail loudly at `mkdir`" is false. On a user scope, `mkdir` succeeds without `Delegate=yes` only because `user@1000.service` owns its cgroupfs tree as the user (my Obs Q4, B's probe D). Without `Delegate=yes`, the failure mode under systemd's cgroup v2 single-writer contract (`systemd.io/CGROUP_DELEGATION`) is *silent* interference — systemd pruning, flattening, or migrating foreign sub-cgroups during `daemon-reload`, property updates, or a systemd upgrade — leaving `tools/` empty with zero `mkdir` error. Two static argv tokens (`-p Delegate=yes`) buy systemd's documented non-interference guarantee at zero runtime cost.

---

## Point 4 — Q6: enumerate leaf slice for `tools/` (A, C) vs record unit name in `state.yaml` (B, D)

**Pick: Keep enumerate `sliceCgroup(leafSlice)` for subdirs containing `tools/` (A, C).**

- **Why D's two objections against enumeration do not hold**:
  1. *Concurrent-dispatch overreach*: Cannot happen. `src/phase.ts:phaseCommand`, `src/next.ts:nextCommand`, `src/next.ts:phaseWake`, and `src/next.ts:seatCommand` all hold the home-wide `.lock` (`resolve(globalHome(), '.lock')`). No concurrent `startSeat` can run while `commitMove` holds `.lock`.
  2. *Unit-name scheme as permanent lookup key*: Removed by A's filter (`tools/` directory presence). Run scopes (`akrogon-run-*.scope`) and guard services never have a `tools/` directory, so scope discovery needs no unit-name pattern at all.
- **What decides against recording `unit` in `state.yaml`**:
  - **`akrogon rollback` hazard (`src/state.ts:seatRefSchema`, `src/akrogon.ts` `case 'rollback'`)**: `seatRefSchema` is a `z.strictObject`. Adding an optional `unit` field is forward-compatible (Signpost 6a), **but** rolling back to the previous release makes every active leaf whose seat started under the new release fail strict parsing (`inventory.unreadable` in `src/next.ts:activeCount`), blocking capacity and halting dispatch. Enumeration changes zero state schema, is 100% rollback-safe, and cleans replaced seats' orphan `tools/` scopes in one sweep site (`commitMove`) with no extra teardown path in `startSeat`.
  - *(Small concession)*: If `shell_sweep` timing rows need `slot` (`A`/`B`), parsing `-a-`/`-b-` from the unit name is best-effort metadata only (never the kill filter), or the row can carry `unit` directly with `slot` optional.

---

## Evidence still missing before handoff

1. **`pi` 1.6.0 end-to-end entry with final env**: Run one budgeted single-turn probe inside a throwaway `Delegate=yes` scope with `BASH_ENV` + `AKROGON_SEAT_CGROUP` + `AKROGON_TOOL_CGROUP_DIR` verifying that `pi`'s `bash` tool lands in `tools/t-*` while `pi` stays in `<seat>.scope`. (Low cost, closes the source-only gap.)
2. **`agy` 1.5.16 entry (`P-agy` blocked on OAuth inside `run-check`)**: `P-agy` hit OAuth because `src/run-check.ts:constructedEnv` cuts `DBUS_SESSION_BUS_ADDRESS` and strips environment variables, blocking `agy`'s keychain/auth lookup. Before handoff, determine whether `agy` can authenticate inside a probe with file-based credentials or required `pass_env`/home access; if `agy` cannot be probed through `run-check`, flag that explicitly to the door rather than assuming `PATH` (or `BASH_ENV`) works unverified.
3. **Final-env smoke probe for `claude` and `codex`**: Once Q1–Q6 settle the exact wrapper path and env (specifically including `CLAUDE_CODE_TOOL_MEMORY_LIMIT=none` for `claude`), run one budgeted probe per harness verifying:
   - `claude`: background loop lands in `tools/t-1`, second tool call lands in `tools/t-2`, writing `'1'` to `t-1/cgroup.kill` kills the loop and flips Claude from `working` to `done` while `t-2` lives (tying P1b directly to the new cgroup layout).
   - `codex`: `exec_command` tool shell lands in `tools/t-*` under the exact `startSeat` env while `node_repl` and `codex-code-mode-host` remain in `<seat>.scope` and survive `cgroup.kill`.
