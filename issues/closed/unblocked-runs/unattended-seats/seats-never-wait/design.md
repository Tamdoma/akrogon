# Design: seats-never-wait

## Binding decisions, verbatim

### Seats never wait on a human approval (seed decision) — forks/approval-decision.md


## Operator decision (Ivan Juras, 2026-11-25)

- Seats must never depend on a human approving a command. Autopilot means no manual approvals, ever.
- The fix is valid across all harnesses — pi, codex and agy as well as claude code — not a claude-only patch.
- Achieve it without complicating the system or increasing complexity.

seed decision from Tamdoma/akrogon#161, taken at import on 2026-11-25, not asked, decided by ivanjuras

### How seats never wait on a human for a command (#161) — forks/seat-unattended.md


A's pick (full autopilot), 2026-11-25:

Q1: the fix is one shared seat rule in `skills/lifecycle-rules.md`, reached by plan-issue, implement-issue and check-issue through their existing links and by implement workers through a standing do-not in `skills/implement-issue/brief-template.md` § 5, plus one sentence in `docs/reference/config.md` (`harnesses` row) naming each harness's no-wait control. No code changes. Reason: every harness on this host already ends a would-be approval without a human (claude denial by code, codex `-a never`, pi no layer, agy host `always-proceed`, observed); what stalled or killed leaves was seat behaviour (a poll loop, a denial treated as an operator blocker), which only seat instructions reach; the lock's "no added complexity" and signposts 1a, 2a. Rejected: appending `--dangerously-skip-permissions` to agy in `harnessArgv` (duplicates a setting the host already holds; C rebuttal F2 notes it would also widen consultant launches); a watch-side answerer or command linter (new machinery); text only without the docs line (leaves the per-harness contract unstated).

Q2: no hand-written poll or sleep loops; a slow command runs once in the foreground with the tool timeout above its expected run time and the seat waits on its exit inside the turn, never ending the turn to wait. The implement-issue "Wait on exit" wording moves into the shared rule and implement-issue keeps a pointer, so the rule lives once. Reason: LESSONS "background wait fails the leaf"; the intake's "harness-native background tasks" wording is rejected for the same reason.

Q3: a harness denial of a command is a formulation problem, not by itself an operator blocker: the seat re-expresses the same operation inside the same grant and identity (a simpler single command, the configured runner, the harness's own read or edit tool) and never routes around a secret, `.env` or grant rule. Only when no permitted formulation can answer the same criterion does the seat's existing `failed` stop apply, recording the denial text verbatim. Commands never name an env file path: values reach a process through the worktree `.env` akrogon writes from declared `env` names, loaded by the process itself (Bun loads `.env` from its working directory); the `bun --env-file=<file>` example is replaced in `skills/lifecycle-rules.md` and `skills/AREA.md`.

Standing dissent (C): the claude deny-rule match is a hypothesis; Q3 keeps the distinction C asked for (reformulate only when a permitted equivalent exists, else the failed stop).

Stated limits (not fixed here, recorded in Off route): host `ask`/`deny` rules and extensions remain the operator's (a pi extension that awaits a UI choice, a claude `ask` rule, which `denyInsteadOfPrompting` turns into a denial, an agy `ask` rule on a host without `always-proceed`); agy `artifactReviewPolicy` is not a command approval and no stall from it is observed; the chord-tap-editor dialog claim is unverified.

Correction (A, 2026-11-25, before handoff): (1) the `docs/reference/config.md` harnesses sentence is cut. It would name codex `-a never` and the agy controls as a contract, codex has no observation run at charting, and the seat rule alone carries the fix (signpost 1a). It lands in Off route. (2) The env form names no runtime loader. A free observation of Bun loading the worktree `.env` was refused by this door's harness classifier when the probe wrote a `.env` file, and that refusal was not worked around. The rule states only what akrogon already guarantees: declared `env` names are written into each leaf worktree's `.env` (`docs/reference/config.md` `env` row, `src/next.ts` emitEnvFile). The program reads that file itself, and the command line names no env file path.

Correction (A, 2026-11-25, from leaf review B 4, B 5, C F4 to F7): (1) evidence wording: agy was observed with a raw `hc run` launch on this host's settings; claude rests on `src/seat.ts` and the Himne transcripts; codex and pi rest on vendor docs. The leaf's claim is scoped to these launch profiles and host settings, a stated precondition. (2) Env form: values reach a command only through akrogon's declared names, either the process environment `akrogon run-check` passes (declared `env` and `pass_env` names from the shell) or the leaf worktree's `.env` written from declared `env` names. A value a command needs that is not declared (the Himne `.env.local` case) is a missing input under the existing `Missing:` rule, not a formulation to work around. (3) The brief-template rule reaches newly written worker briefs. A brief retained from before the release keeps its old text until rewritten. (4) The no-env-path check is `git grep -n -- '--env-file' -- skills` printing nothing (tracked files only, no `node_modules`), and the no-new-file check is `git diff --name-status "$AKROGON_BASE"...HEAD` showing only `M` rows of `.md` files under `skills/`. (A,B,C)

### Leaf split — forks/split.md


A's pick (full autopilot), 2026-11-25: epic `unblocked-runs` with `slots: a: {harness: claude, model: claude-opus-5-5, effort: medium}`; issue `direct-route` holding leaf `direct-lookup` (#162, #163); issue `unattended-seats` holding leaf `seats-never-wait` (#161). Reason: signpost 3a; #162 and #163 share one verb, one test file and one pre-write path, #161 shares no surface with them. Rejected: three leaves (a full cycle for a two-line reuse); one leaf (mixes domains, delays the direct unblock). No standing dissent. The two leaves are independent: no blocked-by.

Correction (A, 2026-11-25, from leaf review B 1 and C F1): the first issue is named `direct-verb`, not `direct-route`, because `direct-route` is already a closed leaf folder (`issues/closed/direct-mode/direct-route`). Leaves and sources are unchanged. (A,B,C)

Excluded: forks/direct-session.md and forks/owner-walk.md belong to leaf direct-lookup and do not apply here.

Standing design: /home/ivan/.akrogon/releases/15582bcdcfd1f14ab30f11fee4333a7da6a4871d/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: the change is skill text, so no test is added; the done-criteria are read by the reviewing seat, except criteria 5 and 6, which have one right answer and are checked by the named commands. No paid or live run: this leaf changes no launch. Its precondition is the current launch profiles and host settings named in the correction above (agy observed, claude from code and transcripts, codex and pi from vendor docs). A model's choice (whether a formulation answers the same criterion) stays the seat's, recorded in its record file with the denial text; no keyword or count stands in for it. (A,C)

## Held disagreements

- not a decision, the decision stands. Against forks/seat-unattended.md Q3 evidence. Fact: that the operator's claude `Read(**/.env.*)` deny rule is what matched the wrangler command is a hypothesis; Anthropic does not document how `node --env-file` is classified. Consequence: removing the env file path from the example may not be the only cause of that denial. Criterion 1(c) keeps the distinction between a reformulation with a permitted equivalent and a required operation with none. Raised by C (rebuttal F4). State: unanswered (autopilot; A's pick stands).

## Leaf architecture

Owned surfaces: `skills/lifecycle-rules.md` (new section; § Environment files and producer keys example), `skills/implement-issue/SKILL.md` (§ Shared context proof-order item 3 and seat-stop paragraph), `skills/plan-issue/SKILL.md` and `skills/check-issue/SKILL.md` (§ Shared context seat-stop paragraph), `skills/implement-issue/brief-template.md` (§ 5, reaching newly written briefs), `skills/AREA.md` (the `.env` line's `bun --env-file=<holder file> <script>` example, and the lifecycle-rules summary if it lists sections). (A,C)

`skills/<seat>/lifecycle-rules.md` are symlinks to `skills/lifecycle-rules.md`; edit the target only.

Consumers of the changed text: plan-issue, implement-issue and check-issue seats read `lifecycle-rules.md` through their link and their own skill text; implement workers read only their sub-brief, which A writes from `brief-template.md`, so § 5 is how the rule reaches them. merge-issue links the same file and holds no seat, so the section names lifecycle seats and implement workers, not merge.

Env form: the replacement for `bun --env-file=<file> <script>` states only what akrogon guarantees: values reach a command through the process environment `akrogon run-check` passes (declared `env` and `pass_env` names, `src/run-check.ts` constructedEnv) or the leaf worktree's `.env` written from declared `env` names (`src/next.ts` emitEnvFile), which the program reads itself. A value a command needs that is not declared is a missing input under the existing `Missing:` rule. It names no runtime loader (no Bun or Node claim was observed at charting). The existing rules that a seat never opens, prints or writes `.env` and checks presence through `akrogon status <slug>` `Missing:` lines stay unchanged. (A,B,C)

Exclusions: no change to `src/seat.ts`, harness recipes, `~/.akrogon/config.yaml` or `docs/reference/config.md` (Off route in the chart). No watch-side answering, no command linter. `skills/watch-issues/` is unchanged.

Release reach: skill changes reach seats only after the next akrogon release is installed; the report states this and claims no effect before it.
