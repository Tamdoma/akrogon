# Merged notes: unblocked-runs forks (from blind maps A, B, C)

The three opening maps were written blind to each other and carry pick, rejected options, evidence, pitfalls and open questions per fork, so they serve as the blind fork notes. Tags name the slots whose map holds the point.

## Fork split · how many leaves

- Pick: one epic `unblocked-runs`, two issues, one leaf each: `direct-lookup` (#162 + #163, both precede any write in `akrogon direct`, share `tests/direct-create.test.ts`) and `seats-never-wait` (#161, skill text plus `src/seat.ts`). (A,B,C)
- Rejected: three leaves (a full lifecycle cycle for a two-line `issueFolders` reuse) (A,B,C); one leaf for all (mixes two domains, delays the direct unblock) (B).
- Epic `slots: a: {harness: claude, model: claude-opus-5-5, effort: medium}` per the operator. (A,C)

## Fork direct-session · #162

- Pick caller: seat A = `{HC_SESSION, HC_TERMINAL_ID}`, live-checked with `terminalIfPresent` (`src/hc.ts`), refusing when `HC_SESSION` is blank or the terminal is not live there; `probeExactlyOne` deleted. (A,B,C)
- Pick reviewer: `--reviewer` resolved in the caller's `HC_SESSION` only. (A,B) Cost: a reviewer in another session cannot be named; no skill uses that today (`skills/chart-issues/SKILL.md` Direct route).
- Differing: C keeps bare reviewer addresses globally unique (O1) or adds an explicit session qualifier (O2), because defaulting to the caller's session could bind a same-named terminal when the intended peer is elsewhere. (C)
- Rejected: `repoSpace(repo)` for the caller (wrong-terminal binding when the door runs outside the repo's session; refuses when the repo has no space) (A,B,C); fallback scan when `HC_SESSION` is unset (keeps the fragile probe, silent misbinding) (B,C).
- Evidence: `src/direct.ts` probeExactlyOne; `src/AREA.md` says direct seat refs may live outside the repo's session; this door's env carries `HC_SESSION=infra` (A); `tests/hc-fixture.ts` blanks `HC_SESSION` so existing direct tests need it set (B,C); use `terminalIfPresent`, not `probeTerminal` (which hides every HcError) (C) and not `terminal` (boots a dead core) (B).
- Pitfalls: stale "exactly one live session" text in `src/AREA.md`, `docs/reference/commands.md` (B); the existing ambiguity test can pass because A fails first (C).

## Fork owner-walk · #163

- Pick: `slugLeafFolders` walks owners through the existing `issueFolders` (`src/park.ts`, already imported in `src/state.ts`), which skips plain files. (A,B,C)
- Rejected: catching ENOTDIR (still traverses files, can hide a bad area root) (C); full inventory (needs draft support) (C).
- Evidence: every other owner walk already filters directories (`readInventory`, `leafFolders`, `isParked`, `status.ts`) (A,B,C). Symlinked owners stop being followed, matching neighbouring walkers (B,C).

## Fork seat-unattended · #161 mechanism

- Facts: claude seats already get `permissions.denyInsteadOfPrompting: true` (`src/seat.ts` harnessArgv, commit 32bdee31, 2026-11-16), so a claude prompt returns a denial (A,B,C). Himne transcripts show the two denials as returned denials, `permissionMode: bypassPermissions` (A). The wrangler denial matches the operator's user-level `Read(**/.env.*)` deny rule, which holds in every mode, against `node --env-file=<path>/.env.local`; `lifecycle-rules.md` itself teaches `bun --env-file=<file> <script>` (A). codex `-a never` never asks; policy rejections return errors (B,C). pi has no built-in permission layer; extension guards return blocks (B,C). agy `--mode auto` still pauses on risky outside-sandbox, web, MCP and non-workspace access by design, and has no deny-instead option (B,C). The 25-minute loop ran inside an implement worker subagent (A).
- Pick: (1) one shared rule section in `skills/lifecycle-rules.md`: commands run unattended; no hand-written poll or sleep loops, a slow command runs once in the foreground (the existing implement-issue "wait on exit" rule, promoted, never ending a turn to wait, per LESSONS "background wait fails the leaf"); a harness denial is a formulation problem, re-expressed inside the same grant and identity, never an operator blocker by itself, never routed around a secret or grant rule; the env example stops naming an env file path. Reaches implement workers through `worker-protocol.md`. (A,B; C's O5 is the same rule) (2) `harnessArgv` appends `--dangerously-skip-permissions` to agy when absent, parity with the claude merge, docs row updated. (A,B)
- Differing: C names no agy argv change and prefers an existing deny-on-prompt setting or bounded stop (O6), noting blanket approval changes authorization. (C) Counter: agy has no deny option (B's settings-key search), claude seats already run bypass and codex danger-full-access, so approve-all is the existing authorization level. (A,B)
- Rejected: text only (fails the lock on agy) (B); watch-side answering or a command linter (adds machinery, against the lock) (B,C); intake's "harness-native background tasks" wording (contradicts LESSONS line 57) (B).
- Charting proof: agy 1.5.17 `--mode auto --dangerously-skip-permissions` ran `curl -sI https://example.com | head -1 ; printf ok > /tmp/...` with no prompt, status done, file written, terminal removed (A, `direct/check-agy-skip-probe-2-*.log`).
- Open: the chord-tap-editor "dialog" is not shown in any transcript; claude 2.1.332's behavior on that loop is unverified (A,B,C). Host `ask`/`deny` rules still apply and must be stated as a limit (B).
