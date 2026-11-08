# Round 12 B

## Q1: mechanism

Confirmed. `hc schema` defines `Terminal.turn` as increasing whenever status leaves `working`. `SendResult.turn` is the counter when text went in, and `started` only means working was observed. Neither identifies which command caused that work. `send --wait` uses the same status-based contract and is not a causal acknowledgement.

The helper accepts any later idle turn (`skills/chart-issues/scripts/door-reset.ts:110–121`). The incident log, `/home/ivan/Work/infra/tamdoma/framework/issues/chart/link-plan-drift/slots/door-reset.log:5–7`, shows it accepting turn 18 at 13:27:50.176 and failing lookup at .183. The new transcript `~/.claude/projects/-home-ivan-Work-infra-tamdoma-framework/1ae36dec-522d-45b2-88df-3d9fbe510d51.jsonl:7–10` records `/clear`, then the warm-up user message only at **13:27:50.221**. Its assistant acknowledgement is line 41, **13:27:53.871**. The helper exited before even the warm-up input was recorded. The counter advance therefore cannot prove that input finished.

The other harnesses do not guarantee an identical reset turn:

- **Pi 1.5.0:** normal `/new` calls `handleClearCommand()` → runtime replacement → `rebindCurrentSession()` → `programStatus.reset()`. Reset reports idle, without first setting working. Installed binary `/home/ivan/.local/share/mise/installs/pi/1.5.0/pi/pi` contains `dist/modes/interactive/program-status-reporter.js` at byte 121071030: embedded lines 21, 46 and 63–68 distinguish agent work from reset. Thus a mandatory extra reset turn would hang this normal case.
- **Codex 0.167.0:** `/new` starts/adopts a fresh session, rather than necessarily running a model turn. Startup work can also affect OSC status: [chatwidget.rs:19–23](https://github.com/openai/codex/blob/rust-v0.167.0/codex-rs/tui/src/chatwidget.rs#L19), [status_surfaces.rs:335–350](https://github.com/openai/codex/blob/rust-v0.167.0/codex-rs/tui/src/chatwidget/status_surfaces.rs#L335), [session_lifecycle.rs:1037–1081](https://github.com/openai/codex/blob/rust-v0.167.0/codex-rs/tui/src/app/session_lifecycle.rs#L1037). An extra startup work/idle cycle is possible, not an invariant of `/new`. I did not reset a live Codex or pi seat.

## Q2: smallest shared fix

Keep one warm-up protocol and make its existing nonce the completion evidence. Reuse the asynchronous predicate of `waitFor()` (`src/hc.ts:444–469`): on the initial snapshot and subsequent hc events, look for the nonce in an **assistant reply**, then confirm the terminal is currently idle/done. A missing reply means pending until another event or the existing deadline, not immediate `reset unconfirmed`. Retain the differing-path check before labeling and sending the start prompt. This needs no new production files, polling or filesystem watchers.

Do not merely move `transcriptByCode()` into the predicate unchanged: `src/transcript.ts:216–217` matches raw text, including the warm-up **user** message. That proves receipt, not completion. After checking the reply, read current terminal status rather than trusting an idle snapshot captured before an asynchronous lookup.

A plain settle wait after keys can return the pre-reset idle snapshot. Requiring two counter advances breaks harnesses without a reset work cycle. Claude's changed native sessionId is valid reset evidence and could remove its warm-up, but adds a separate path while leaving the shared counter assumption for the other harnesses. The nonce already exists across all three, so use it to remove that assumption.

## Test correction

`tests/door-agent.ts:128–132` currently only sets `pendingSwitch`. For Claude, make reset itself emit working, update the native record, accept/queue the warm-up while reset is working, and emit reset idle **before** processing the warm-up. Gate those transitions through test control, not elapsed sleeps. Assert the helper neither exits nor sends the start prompt on reset idle, or when only the warm-up user record exists. Release the assistant nonce reply and its idle status, then require successful handover. Keep coverage for a reset without a work cycle. `tests/door-reset.test.ts:203–206` must identify the warm-up completion explicitly rather than assuming `turnEnds[1]` is it.

Read-only investigation. No live input, label changes or implementation edits.
