# Brief 2: U2 start verb and delivery on hc (engine-on-hc, wave 2)

## 1. Goal

Seats start and get prompted through herdr-core (`hc`) instead of herdr panes. Add `akrogon seat` (start verb), the transcript resolver, and rewrite the start and delivery path of `src/next.ts` onto `src/hc.ts` (landed in wave 1). Plan decisions D4, D5, D6, D8, D9, D10, D11, D13, D14, D17 (schema part only), D18, implementation notes I1-I4, notes N3, N5, N6 in `plan.md` (leaf folder `/home/ivan/Work/infra/akrogon/issues/open/herdr-app/hc-engine/engine-on-hc`). I4 defines exactly what this unit owns; U3 (next wave) owns legacy refusal, teardown, reconcile, containment removal and the remaining herdr cleanup.

## 2. Acceptance criteria

1. `akrogon seat <slug> <A|B> [--task <text>]` (leaf form) runs the same allocation as dispatch (I2: one allocation function in `src/next.ts` used by both): worktree, `.env`, `state.tab = leafTab(repo, slug)` when unset, then `startSeat`. Default task is the prompt `next` builds for the leaf's phase and slot (today's `promptFor`-style text, e.g. `plan-issue <slug> slot=A phase=plan.synthesis leaf=<path>`); `--task` replaces it. Consultant form `akrogon seat --slot <letter> --harness <h> --model <m> --effort <e> [--task <t>]` refuses without `HC_TERMINAL_ID` and follows D8's consultant rules (parent, caller tab labels from `docGet`, caller cwd, `env -u` only).
2. `startSeat` (in `src/seat.ts`, D8): `hc run --bg --json --no-parent --name seatName(...) --cwd <worktree> --label ...` with exactly the D4 labels (`akrogon=1`, `akrogon.repo`, `akrogon.leaf`, `akrogon.seat` lower-case `a`/`b`, `herdr.space` = the repo space id, `herdr.tab` = state.tab) and argv `systemd-run --user --scope --quiet --expand-environment=no --unit=<slice base>-<name>-<8 hex>.scope --slice=<leaf slice> -p TimeoutStopSec=5 -p CollectMode=inactive-or-failed -p SendSIGHUP=yes -- env -u CLAUDECODE -u CLAUDE_CODE_CHILD_SESSION -u CLAUDE_CODE_SESSION_ID -u CLAUDE_CODE_ENTRYPOINT -u CLAUDE_CODE_EXECPATH -u CLAUDE_CODE_MESSAGING_SOCKET -u CLAUDE_CODE_MESSAGING_TOKEN -u CLAUDE_CODE_SESSION_ATTENDED -u CLAUDE_PID -u CLAUDE_EFFORT AKROGON_BASE=<base> GIT_EDITOR=true TMPDIR=<leaf temp> NODE_DISABLE_COMPILE_CACHE=1 <harness argv> [<task>]` (harness argv from today's `launch()`; pi gets `--session-id <uuid>`; agy gets no task in argv). Records `state.seat.<slot> = {session, address}`. Prints the address.
3. Start proof D9: follow events up to `AKROGON_START_PROOF_MS` (default 60000, read once): `working` or `turn >= 1` → `state.prompted.<slot> = {turn, address}`; `finished` or status `error` → non-zero exit printing the address and the screen; no proof → exit 0, stdout `started, not confirmed <address>` plus the screen, `state.delivery_error.<slot> = {code: 'not_confirmed', address, turn, screen, at}`. Nothing is sent before the proof (C1.1). Then one `/proc/<pid>/cgroup` read confirms the leaf scope (leaf seats).
4. agy D10: wait for idle turn 0 or the trust dialog (`blocked`, kind `permission`); one `hc keys <t> enter` on the dialog; wait idle; one `send`; a send refused `unavailable` (HcError kind) is resent once on the seat's next status event within the start budget; then the proof.
5. Placement D11: `windowOpen(session)`; open → wait (doc events/`doc.get`, bound `AKROGON_PANE_WAIT_MS`, default 15000) until the document shows the terminal inside tab `state.tab`; timeout → `end()` the terminal and exit non-zero with the address; then `renameTab(tab, slug)` (`<slug> failed` for a failed leaf). Closed → return after the proof. A failed rename warns and leaves the seat running. Each `next` pass with the window open renames every recorded leaf tab of the repo whose document name differs from the expected name.
6. Delivery D13 in `dispatchSlot` (replaces the herdr `agent start`/`agent prompt`/`sessionFile` path): steps 1-6 exactly as plan D13, `state.attempts` is the `prompts` counter (reset by `commitMove`, which already zeroes it); third silent stop → `failed` with cause `attempts` and reason `seat <X> ended <n> turns without reporting`. A dead or finished seat terminal: `hc rm` then start again by `startSeat` under the same name. Ownership (D4): a terminal counts as the leaf's seat only when labels match repo/leaf/seat and its address equals `state.seat.<slot>.address`.
7. D14: after `phase` commits, `akrogon.ts` runs `mergeWake` as today, then one automatic dispatch of the leaf's own repo/leaf (the caller seat is `working`, so D13 step 1 refuses it).
8. `stateSchema` (D17 schema part): adds `seat: {A?: {session, address}, B?: ...}`, `prompted` accepting the new `{turn, address}` object and the old string, `delivery_error` accepting the new shapes (`not_confirmed`, `not_started`: `{code, address, turn, screen?, status?, at}`) and the old shape. Legacy refusal itself is U3's.
9. `src/transcript.ts` D18: `transcriptFor({session, address}): Promise<string | null>` (claude, codex, pi, agy rules in D18; label `akrogon.transcript` saved with `hc label`; a recorded label is returned without re-resolving). `src/session-file.ts` deleted; `logMove`/timing write `session: <path|null>` from it.
10. Planned tests green: `tests/hc-start.test.ts`, `tests/hc-delivery.test.ts`, `tests/hc-window-calls.test.ts` except the `status ... tab unnamed` assertion of "a failed rename leaves the seat running" (status is wave 4; that case may stay red only on that assertion — report it). `tests/hc-identity.test.ts -t "pinned copy"` stays green. `bun run typecheck` clean for every `src/` file you touch (test files importing not-yet-existing exports, if any, are not yours).
11. Old suites that drive herdr panes (`tests/next.test.ts`, `batch-*`, `green-merge`, etc.) are expected to go red; A ports them later (D26). Do not edit them and do not keep old herdr paths alive for them.

## 3. Read first

- `plan.md`: L1-L10, D4-D18, N3, N5, N6, I1-I4. `brief.md` criteria 1, 2, 4, 5, 7.
- `src/hc.ts` (the module you build on; do not change its interface without a reason in your report), `src/next.ts` (`launch`, `allocate`, `dispatchSlot`, `observeBusy`, `dispatchLeaf`, prompt text builder), `src/phase.ts` (`commitMove`), `src/state.ts`, `src/scope.ts` (`leafSlice`, leaf temp helpers), `src/akrogon.ts`, `src/session-file.ts`, `src/log.ts`, `src/timing.ts`.
- Tests: `tests/hc-start.test.ts`, `tests/hc-delivery.test.ts`, `tests/hc-window-calls.test.ts`, `tests/hc-fixture.ts` (core env given to akrogon, test seams), `tests/stand-in.sh`, `tests/hc-shim.sh`, `tests/fake-herdr-app.ts`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- New `src/seat.ts`: `startSeat(...)` (leaf and consultant), start proof, agy flow, placement.
- New `src/transcript.ts`: `transcriptFor`.
- `src/next.ts`: hc allocation shared by dispatch and `seat` (I2), D13 `dispatchSlot`, `observeBusy` on `Seen` (busy = status `working`/`blocked`), D11 per-pass rename.
- `src/state.ts`: schema additions.
- `src/phase.ts`, `src/akrogon.ts`: D14; `seat` case in `akrogon.ts`.
- `src/log.ts`, `src/timing.ts`: `session` from the resolver.
- Delete `src/session-file.ts`.
- `docs/reference/commands.md`: add the `akrogon seat` row in the table's style (A edits the contract test).
- Owned paths: the files above. Must land first: U1 (landed). Shared test resource: none (each test file starts its own fixture core).
- Do not remove `adoptShell`/`paneShell`/`inOwnScope`/busctl from `src/scope.ts`/`src/shell.ts` (U3); just stop calling them from the paths you rewrite.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test, fixture, stand-in or shim (tests are locked after planning). A planned test you believe wrong is a mismatch returned to A with real output.
- Do not call hc for a session not known live (L2); go through `src/hc.ts` only (D1).
- No sleeps or polling loops; wait on hc events (`waitFor`/`follow`). Test seams `AKROGON_START_PROOF_MS`/`AKROGON_PANE_WAIT_MS` are the only timing knobs.
- Do not touch U3's surfaces (legacy refusal, `stop.ts`, `reconcile.ts`, `land.ts`, `scope.ts` deletions, notice sends `observeBusy` uses for herdr notices stay as they are: D25).
- Never stop processes by pattern; stop your ad-hoc cores with `HC_SESSION=<yours> hc server stop`. Never touch the operator's sessions (`default`, `infra`, `personal`, `mdconsultingny`). No paid harness: only the stand-in and `cat`.
- Do not mutate `process.env`.
Reasons: locked tests, core auto-start, no-polling direction, unit ownership, cross-leaf safety, the grant (paid runs are A's attended tier). Exception: a revised brief from A.

## 6. Ordered steps

1. Schema additions (criterion 8).
2. `src/seat.ts` leaf start + proof (criteria 2, 3); allocation shared with `next` and the `seat` CLI case (criterion 1). Run `hc-start`.
3. agy flow (criterion 4); placement (criterion 5). Run `hc-window-calls`.
4. D13 delivery and D14 (criteria 6, 7). Run `hc-delivery`.
5. Transcript resolver and log/timing session field; delete `session-file.ts` (criterion 9).
6. Consultant form (criterion 1). commands.md row.
7. Typecheck, prettier, the three targeted test files.
Advisory size: about 9 files, under 60 turns.

## 7. Commands

Install deps first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
- `akrogon run-check --name u2-start -- bun test --timeout=30000 tests/hc-start.test.ts`
- `akrogon run-check --name u2-delivery -- bun test --timeout=30000 tests/hc-delivery.test.ts`
- `akrogon run-check --name u2-window -- bun test --timeout=30000 tests/hc-window-calls.test.ts`
- `akrogon run-check --name u2-schema -- bun test --timeout=30000 tests/hc-identity.test.ts -t "pinned copy"`
- `akrogon run-check --name u2-typecheck -- bun run typecheck`
- `akrogon run-check --name u2-prettier -- bunx prettier --check <your changed files>`

## 8. Done-when, evidence and report

Criteria 1-11 hold; one commit (message `seat: start and deliver through hc`, no co-author line); return the commit id. Keep output only via `akrogon run-check`, citing the `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
