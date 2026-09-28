# Leaf draft review C

Checked against pi-extensions HEAD 1e35078 (`~/.pi/agent/extensions`) and akrogon working tree, 2026-09-28. Only disagreements listed.

## same-repo-worktree-cwd

**D1. Criterion 5 "all admitted" is undefined under capacity limits.** `manager.spawn` returns a queued snapshot when capacity is used (`manager.ts:336-380`, scheduler admits by capacity at `:1264-1290`), and `manager.test.ts:1684-1686` shows three of nine spawns `starting` and six `queued` at the current concurrency. Three parallel spawns may therefore land as `starting`, `running` or `queued`, and a test asserting one state would fail for the wrong reason.
Replacement for criterion 5: "Through the registered `subagent_spawn` tool in a fresh extension session with UI present, three parallel spawns into three sibling worktrees of the same repository each return a child snapshot (state `starting`, `running` or `queued`), none throws, and zero confirm calls are observed. The test writes the observed child states to a file under the OS temp dir, and the implementation report records that path."

**D2. Criterion 7 names a check that is not the configured one.** The extension repo's `issues/config.yaml:7-8` defines `checks.test` as the four-package `node --experimental-strip-types --test *.test.ts` chain and `checks.test_changed` with `AKROGON_BASE`. There is no `checks.typecheck`, and `npm run typecheck` (`tamdoma-subagents/package.json:30`) is not configured.
Replacement for criterion 7: "`cd tamdoma-subagents && npm run typecheck` passes, and the configured `checks.test` and `checks.test_changed` commands from `issues/config.yaml` pass."

No other disagreement: `tools.ts:96-104`, `tools.test.ts:76-77`, `manager.test.ts:1684-1686`, `canonicalizeExistingPath` realpath at `paths.ts:25-27`, and git 2.55.0 support for `--path-format=absolute` all check out. Q1-A's "any remaining confirm" is vacuous after this leaf because `tools.ts:98` is the only `ctx.ui.confirm` in the extension (grep), so the design's interpretation is consistent with the Taken text.

## admission-fault-no-block

**D3. Criterion 3 is a guess for the implementer: the real `herdr-agent-state.ts` handlers do nothing under a plain test.** `herdr-agent-state.ts:19-21` `enabled()` requires `HERDR_ENV=1`, `HERDR_SOCKET_PATH` and `HERDR_PANE_ID`, read at module load (`:12-15`); the default export returns before registering anything when disabled (`:180-182`). Every state report goes over a unix socket with a 500 ms then 1500 ms attempt (`:23-55`), and `rootSession` is set only by `session_start` with `ctx.mode === "tui"` (`:229-235`), otherwise `herdr:blocked` and `agent_start`/`agent_settled` handlers return early (`:212-214`, `:243-246`). The criterion as written does not say how the test gets past any of this.
Replacement for criterion 3: "After the fault, with the parent idle, the state reported by the installed `herdr-agent-state.ts` handlers is idle, not blocked. The test sets `HERDR_ENV=1`, `HERDR_PANE_ID`, and `HERDR_SOCKET_PATH` to a unix socket server it owns before importing `../herdr-agent-state.ts`, sends `session_start` with `ctx.mode === "tui"`, drives the extension's events through the same `pi.events`, and asserts the last state request received on the socket is `idle`. It writes the received requests to a file under the OS temp dir, and the implementation report records that path."

**D4. Criterion 4 replacement text should keep the sibling extension's claim.** `docs/overview.md:37` is one sentence covering both extensions, and `tamdoma-request-user-input/index.ts:827-828` still emits `herdr:blocked`.
Replacement for the line: "`tamdoma-request-user-input` emits `herdr:blocked` events consumed by `herdr-agent-state.ts` as one counted active/inactive pair per pending unit; `tamdoma-subagents` reports an admission fault only through a one-shot `herdr notification show`."

**D5. Criterion 5 same as D2.** Replacement: "`cd tamdoma-subagents && npm run typecheck` passes, and the configured `checks.test` and `checks.test_changed` commands from `issues/config.yaml` pass."

No other disagreement: `index.ts:133-142` matches (emit at `:134`, notification at `:136` on `event.active`), the transition guard at `manager.ts:1236-1241` makes "exactly once per episode" hold, `session_shutdown` at `index.ts:262-272` emits nothing itself, and `index.test.ts:222-232` / `:396-410` are the listeners to rewrite.

## busy-age-label

No disagreement. `observe.ts:207-216` returns `''` for unparsable and clamps a future time to zero, `:224-227` builds the line, `observe.test.ts:128-129` and `SKILL.md:28` are the lines named, and akrogon `issues/config.yaml` defines `checks` format, test, typecheck and test_changed.
