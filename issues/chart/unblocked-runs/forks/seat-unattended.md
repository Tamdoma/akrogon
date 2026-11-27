# How seats never wait on a human for a command (#161)

## Question

Q1. Where does the fix live so it holds on claude, codex, pi and agy without adding complexity?
Q2. How do seats wait on slow commands?
Q3. What does a seat do when its harness denies a command?

### Carries

Lock: forks/approval-decision.md (seats never depend on a human approving a command; valid on pi, codex, agy and claude; no added complexity). Signposts 1a, 2a, 4a, 5a.

## Findings

- Merged notes `slots/forks-merged.md` § Fork seat-unattended.
- Per harness, how a command needing approval ends (2026-11-25):
  - claude 2.1.332: `src/seat.ts` harnessArgv merges `permissions.denyInsteadOfPrompting: true` into every claude launch (commit 32bdee31, 2026-11-16), so a would-be prompt returns a denial to the model ([settings reference](https://code.claude.com/docs/en/settings-reference), read 2026-11-25). Both Himne claude transcripts show returned denials ("Permission to use Bash with command ... has been denied.") under `permissionMode: bypassPermissions` (A, transcripts `-home-ivan--akrogon-worktrees-Himne-wrangler-remote-bindings/de2206e3...jsonl` records 228/234/652; chord-tap-editor `137d1477...jsonl` records 853/855). Deny rules hold in every mode ([permission modes](https://code.claude.com/docs/en/permission-modes), read 2026-11-25); the operator's `~/.claude/settings.json` denies `Read(**/.env.*)`; the denied wrangler command named `--env-file=/home/ivan/Work/personal/Himne/.env.local`. That the deny rule is what matched is a hypothesis (C rebuttal F4): Anthropic does not document how `node --env-file` is classified.
  - codex 0.172.0: recipe `-a never`; policy rejections return errors, never a prompt (B, C; [Codex CLI reference](https://developers.openai.com/codex/cli/reference), read 2026-11-25).
  - pi 1.6.0: no built-in approval layer; the installed `tamdoma-env-guard` returns a block. An extension that awaits a UI choice (pi's `permission-gate.ts` example) could wait (C rebuttal F5). Limit, below.
  - agy 1.5.17: docs say `--mode auto` asks on some outside-sandbox actions (B, C). This host's `~/.gemini/antigravity-cli/settings.json` sets `toolPermission: "always-proceed"`. Charting proofs below: with that setting and `--mode auto` alone, a command matching the host's own agy `ask` rule (`rm -rf` outside the workspace plus a network call) ran with no pause.
- The 25-minute poll loop was written by an implement worker subagent (`.../chord-tap-editor/137d1477.../subagents/agent-ac1a9a43b5cb3af0f.jsonl` record 190, `wait-run.sh` with `while ss -xl ... sleep 10`). No transcript shows a dialog; the "behind the dialog" claim is unverified.
- `skills/lifecycle-rules.md` § Environment files teaches `bun --env-file=<file> <script>`; `skills/AREA.md` repeats it (B rebuttal 2). `src/next.ts` writeLeafEnv/emitEnvFile write declared `env` names into the worktree `.env`; Bun loads `.env` from its working directory.
- `skills/implement-issue/SKILL.md` § Shared context item 3 "Wait on exit" already says run a slow command once in the foreground and never sleep-poll; plan-issue, check-issue and implement workers carry no such rule. LESSONS "background wait fails the leaf" (2026-11-15): ending a turn to wait fails the leaf after 3 turns.
- Implement workers receive only their sub-brief; standing exclusions reach them through `skills/implement-issue/brief-template.md` § 5 (B rebuttal 1).
- `skills/implement-issue/SKILL.md` § Shared context seat-stop: "a permission A cannot grant" ends the leaf `failed`, which the wrangler seat applied to a harness denial.

## Charting proofs

Budget: one agy session per run, 5 to 7 minutes, `AKROGON_SESSIONS=1 AKROGON_SESSION_MINUTES=<5|6|7>` in the run-check argv; reason: one short interactive turn. Standing grant (signposts 3b standing approval), no operator approval.

1. `akrogon run-check --name agy-skip-probe --holder <chart>/direct -- ... sh direct/agy-probe.sh ...` (2026-11-25): inconclusive, the `-i` prompt never ran (terminal idle at turn 0). Log `direct/check-agy-skip-probe-1795646954927-1087196.log`. Cleanup: terminal absent.
2. `agy-skip-probe-2`: agy 1.5.17, `--mode auto --dangerously-skip-permissions`, identity: the logged-in agy account of this host, cwd /home/ivan/Work/infra/akrogon; task `curl -sI https://example.com | head -1 ; printf ok > /tmp/akr-agy-probe-<pid>.txt`; result: turn ended `done` "finished", file written. Cleanup: file removed, terminal absent. Log `direct/check-agy-skip-probe-2-1795646989959-1116656.log`. Limits: not an approval boundary on its own (C rebuttal F3).
3. `agy-boundary-auto`: same identity and version, `--mode auto` only (host `toolPermission: always-proceed`); task `rm -rf /tmp/akr-agy-boundary-<pid> && curl -sI https://example.com | head -1`, which matches the host's agy `ask` rule `rm\s+.*-[a-zA-Z]*[rRfF]`; result: ran with no pause, turn `done`, directory deleted. Cleanup: terminal absent, directory absent. Log `direct/check-agy-boundary-auto-1795647188940-1439295.log`. Limits: proves this host's settings with agy 1.5.17 only; artifact review (`artifactReviewPolicy`) not exercised; an agy `deny` rule match not exercised.

## Taken

A's pick (full autopilot), 2026-11-25:

Q1: the fix is one shared seat rule in `skills/lifecycle-rules.md`, reached by plan-issue, implement-issue and check-issue through their existing links and by implement workers through a standing do-not in `skills/implement-issue/brief-template.md` § 5, plus one sentence in `docs/reference/config.md` (`harnesses` row) naming each harness's no-wait control. No code changes. Reason: every harness on this host already ends a would-be approval without a human (claude denial by code, codex `-a never`, pi no layer, agy host `always-proceed`, observed); what stalled or killed leaves was seat behaviour (a poll loop, a denial treated as an operator blocker), which only seat instructions reach; the lock's "no added complexity" and signposts 1a, 2a. Rejected: appending `--dangerously-skip-permissions` to agy in `harnessArgv` (duplicates a setting the host already holds; C rebuttal F2 notes it would also widen consultant launches); a watch-side answerer or command linter (new machinery); text only without the docs line (leaves the per-harness contract unstated).

Q2: no hand-written poll or sleep loops; a slow command runs once in the foreground with the tool timeout above its expected run time and the seat waits on its exit inside the turn, never ending the turn to wait. The implement-issue "Wait on exit" wording moves into the shared rule and implement-issue keeps a pointer, so the rule lives once. Reason: LESSONS "background wait fails the leaf"; the intake's "harness-native background tasks" wording is rejected for the same reason.

Q3: a harness denial of a command is a formulation problem, not by itself an operator blocker: the seat re-expresses the same operation inside the same grant and identity (a simpler single command, the configured runner, the harness's own read or edit tool) and never routes around a secret, `.env` or grant rule. Only when no permitted formulation can answer the same criterion does the seat's existing `failed` stop apply, recording the denial text verbatim. Commands never name an env file path: values reach a process through the worktree `.env` akrogon writes from declared `env` names, loaded by the process itself (Bun loads `.env` from its working directory); the `bun --env-file=<file>` example is replaced in `skills/lifecycle-rules.md` and `skills/AREA.md`.

Standing dissent (C): the claude deny-rule match is a hypothesis; Q3 keeps the distinction C asked for (reformulate only when a permitted equivalent exists, else the failed stop).

Stated limits (not fixed here, recorded in Off route): host `ask`/`deny` rules and extensions remain the operator's (a pi extension that awaits a UI choice, a claude `ask` rule, which `denyInsteadOfPrompting` turns into a denial, an agy `ask` rule on a host without `always-proceed`); agy `artifactReviewPolicy` is not a command approval and no stall from it is observed; the chord-tap-editor dialog claim is unverified.

Correction (A, 2026-11-25, before handoff): (1) the `docs/reference/config.md` harnesses sentence is cut. It would name codex `-a never` and the agy controls as a contract, codex has no observation run at charting, and the seat rule alone carries the fix (signpost 1a). It lands in Off route. (2) The env form names no runtime loader. A free observation of Bun loading the worktree `.env` was refused by this door's harness classifier when the probe wrote a `.env` file, and that refusal was not worked around. The rule states only what akrogon already guarantees: declared `env` names are written into each leaf worktree's `.env` (`docs/reference/config.md` `env` row, `src/next.ts` emitEnvFile). The program reads that file itself, and the command line names no env file path.

Correction (A, 2026-11-25, from leaf review B 4, B 5, C F4 to F7): (1) evidence wording: agy was observed with a raw `hc run` launch on this host's settings; claude rests on `src/seat.ts` and the Himne transcripts; codex and pi rest on vendor docs. The leaf's claim is scoped to these launch profiles and host settings, a stated precondition. (2) Env form: values reach a command only through akrogon's declared names, either the process environment `akrogon run-check` passes (declared `env` and `pass_env` names from the shell) or the leaf worktree's `.env` written from declared `env` names. A value a command needs that is not declared (the Himne `.env.local` case) is a missing input under the existing `Missing:` rule, not a formulation to work around. (3) The brief-template rule reaches newly written worker briefs. A brief retained from before the release keeps its old text until rewritten. (4) The no-env-path check is `git grep -n -- '--env-file' -- skills` printing nothing (tracked files only, no `node_modules`), and the no-new-file check is `git diff --name-status "$AKROGON_BASE"...HEAD` showing only `M` rows of `.md` files under `skills/`.
