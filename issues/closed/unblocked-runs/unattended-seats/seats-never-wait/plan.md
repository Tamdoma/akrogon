# Plan: seats-never-wait

Delivers Tamdoma/akrogon#161. Skill text only. Base `15582bcdcfd1f14ab30f11fee4333a7da6a4871d`.

## Read first

- `docs/reference-index.md` (grounding index) and `skills/AREA.md` (lines 18 and 29 summarize lifecycle-rules and the `.env` rule)
- `skills/lifecycle-rules.md` (header line 3, `## Environment files and producer keys` line 15)
- `skills/implement-issue/SKILL.md` line 35 (seat-stop), line 48 (proof-order item 3 "Wait on exit")
- `skills/plan-issue/SKILL.md` line 29 (seat-stop), `skills/check-issue/SKILL.md` line 31 (seat-stop)
- `skills/implement-issue/brief-template.md` § 5 (lines 23-29, the `git stash` standing exclusion)
- `issues/chart/unblocked-runs/forks/approval-decision.md`, `forks/seat-unattended.md` in the registered checkout (the binding decisions)
- `learnings/LESSONS.md` line 57 "background wait fails the leaf" (the reason for the no-wait rule)
- `src/run-check.ts` constructedEnv, `src/next.ts` emitEnvFile (what akrogon guarantees for env values; read only)
- `tests/docs-links.test.ts` lines 255-284 (asserts `skills/lifecycle-rules.md` keeps `akrogon verify --known-red`, `(script)`, `(no test name)` and 5 symlinks), `tests/run-units.test.ts` lines 1002-1015 (asserts lifecycle-rules and brief-template keep the run-check, log, verify, merged, fetch words)

Gaps: none. No credential is named, `akrogon status` prints no `Missing:` line, readiness has no inputs, produces or grants.

## Decisions

- D1. One new section `## Unattended commands` in `skills/lifecycle-rules.md`, placed after `## Kept command output` and before `## Red check with no cause in the leaf's diff`. Its first sentence says it applies to every lifecycle seat (plan-issue, implement-issue, check-issue) and to implement workers through their brief. It states, in this order:
  - (a) a seat writes no command that waits on a human (no prompt, confirmation, editor or pager it must answer).
  - (b) no hand-written poll or sleep loop (no `while ... sleep`, no fixed sleep then a log read). A slow command runs once, the exact printed command, in the foreground with the tool timeout set above its expected run time. The seat waits on its exit and status, waits again when a wait returns before the command has exited, treats the exit status as the result and never a quiet log, and never ends the turn to wait.
  - (c) a harness denial of a command is a formulation problem, not by itself an operator blocker. The seat re-expresses the same operation inside the same grant and identity: a simpler single command, the configured runner, or the harness's own read or edit tool. It never routes around a secret, `.env` or grant rule. Only when no permitted formulation can answer the same criterion does the seat's operator-blocker stop apply, with the denial text verbatim in its record file. Whether a formulation answers the same criterion is the seat's judgment, recorded with the denial text.
  - (d) a command line names no env file path. Values reach a command only from the process environment `akrogon run-check` passes (declared `env` and `pass_env` names) or from the leaf worktree's `.env` written from declared `env` names, which the program reads itself. A needed value that is not declared is a missing input under the `Missing:` rule of `## Environment files and producer keys`. No runtime loader (Bun, Node) is named.
- D2. The header of `skills/lifecycle-rules.md` changes "The five rules below" to six and adds that `## Unattended commands` also reaches implement workers through `brief-template.md` § 5. merge-issue and the chart door are not named as bound by the new section (merge holds no seat).
- D3. `## Environment files and producer keys` drops `such as bun --env-file=<file> <script>` and says values are consumed only inside a run process that reads them itself, in the form `## Unattended commands` (d) states, printing only results. The env-path rule lives once, in (d). The never-open, presence-through-`Missing:` and producer-key text stays unchanged.
- D4. `skills/implement-issue/SKILL.md` item 3 becomes a pointer: "3. Wait on exit: A waits on a slow command's exit as `## Unattended commands` in [lifecycle-rules.md](lifecycle-rules.md) states." Every clause of the old item (wait on exit and status, wait again on early return, no fixed-interval sleep then log read, exit status is the result, exact printed command once, foreground, timeout above expected run time) is carried by D1 (b). Check on landing: each of those 7 clauses has a counterpart in D1 (b).
- D5. Each seat-stop paragraph (`plan-issue` line 29, `implement-issue` line 35, `check-issue` line 31) adds one sentence after the parenthesized example: a harness denial of a command is not by itself such a step; the seat first takes `## Unattended commands` in lifecycle-rules.md and reaches this stop only when that rule sends it here. The link text matches each skill's existing link style (`[lifecycle-rules.md](lifecycle-rules.md)`). The existing "a permission this seat cannot grant" example stays, since a real grant gap is still a blocker.
- D6. `skills/implement-issue/brief-template.md` § 5 adds a second standing exclusion after the `git stash` paragraph. The worker writes no command that waits on a human, writes no poll or sleep loop and runs a slow command once in the foreground with the tool timeout above its expected run time, waiting on its exit inside the turn; it re-expresses a harness denial inside the same grant and identity (simpler single command, configured runner, its own read or edit tool), never around a secret, `.env` or grant rule; it names no env file path on a command line. When no permitted formulation answers, it returns a mismatch to A with the denial text verbatim (a worker has no `failed` stop). Reason stated: a worker reads only its brief, so the rule reaches it only here. Exception: none.
- D7. `skills/AREA.md` line 18 adds "unattended commands" to the list of lifecycle-rules topics. Line 29 replaces `through bun --env-file=<holder file> <script>` with "only inside a process that reads them itself from akrogon's declared names, never naming an env file path on the command line".
- D8. No test is added (design interpretation). Criteria 1-4 are read by the reviewing seat. Criteria 5 and 6 are literal commands with one right answer. Existing `tests/docs-links.test.ts` and `tests/run-units.test.ts` assert words this leaf must keep and links it adds, so they run as regression.
- D9. Serial-solo: one unit. The six files must use one wording for the same rule and D4 must be checked against D1 as a whole, so a split saves nothing and risks drift.
- D10. `learnings/LESSONS.md` line 57 stays. A text rule is not a removal, a loud refusal or a mechanical guard, so the lesson rule does not retire it, and criterion 6 forbids touching files outside `skills/`.

Brief/design conflicts: none. Design `Open for the plan:` questions: none.

## Interfaces

Only Markdown section names: `## Unattended commands` in `skills/lifecycle-rules.md`, referenced by name from the three seat skills, `brief-template.md` (by content, since a worker has no link to it) and `skills/AREA.md`.

## Checklist

### Wave 1

- U1 (serial-solo, A implements). Owns: `skills/lifecycle-rules.md`, `skills/implement-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/implement-issue/brief-template.md`, `skills/AREA.md`. Shared test resource: none. Prerequisites: none.
  - [ ] D1, D2, D3 in `skills/lifecycle-rules.md` (edit the target, never a `skills/<seat>/lifecycle-rules.md` symlink)
  - [ ] D4, D5 in `skills/implement-issue/SKILL.md`
  - [ ] D5 in `skills/plan-issue/SKILL.md` and `skills/check-issue/SKILL.md`
  - [ ] D6 in `skills/implement-issue/brief-template.md`
  - [ ] D7 in `skills/AREA.md`

Docs: agent doc `skills/AREA.md` (D7). No human doc under `docs/` is affected (`git grep` for `--env-file`, `sleep`, `foreground` in `docs/` and `README.md` finds nothing; `docs/reference/config.md` is excluded by the design).

## Criteria and proofs

| # | Result | Proof | Size | Rerun when |
|---|---|---|---|---|
| 1 | One section with (a)-(d), scoped to lifecycle seats and implement workers | Reviewing seat reads `## Unattended commands` against `forks/approval-decision.md` and criterion 1 | minutes | the section changes |
| 2 | Wait rule stated once, nothing lost | Reviewing seat reads `implement-issue/SKILL.md` item 3 and D1 (b), checking D4's 7 clauses | minutes | either text changes |
| 3 | Denial goes to the section before any `failed` stop | Reviewing seat reads the three seat-stop paragraphs | minutes | any of them changes |
| 4 | § 5 carries the rule as a standing exclusion | Reviewing seat reads `brief-template.md` § 5 | minutes | § 5 changes |
| 5 | No `--env-file` in tracked skill text | `akrogon run-check --name c5-no-env-file -- git grep -n -- '--env-file' -- skills` exits 1, empty output | seconds | any `skills/` edit |
| 6 | Only `M` rows of `.md` under `skills/` | `akrogon run-check --name c6-name-status -- sh -c 'git diff --name-status "$AKROGON_BASE"...HEAD'` shows only `M\tskills/...md` rows | seconds | any commit |
| reg | Kept words, links and 5 symlinks hold | `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts tests/run-units.test.ts` exits 0 | seconds | any `skills/` edit |

Boundary and failure caught:
- C1-C4: the boundary is the seat or worker reading the text at its next pass after release. Before: a denial reads as an operator blocker (wrangler-remote-bindings ended `failed`), a worker writes `while ss ...; sleep 10` (chord-tap-editor). After: the wrangler command `akrogon run-check ... node --env-file=<repo>/.env.local ...` violates (d); its value is undeclared, so it is a `Missing:` input with an `add <VAR>` action, not a "permission A cannot grant". The chord-tap-editor loop violates (b) and the worker brief now says so. These are model-choice behaviours: no run proves a seat follows the text. Unproven: the effect on live seats, which needs the next akrogon release installed.
- C5: before, exit 0 with two hits (`skills/AREA.md:29`, `skills/lifecycle-rules.md:15`), recorded at planning: `check c5-no-env-file: 0 .../implementation/check-c5-no-env-file-1795648114065-1900176.log`. This is the planning red (target is exit 1). After: exit 1, empty.
- C6: before, empty diff (`check c6-name-status: 0 .../implementation/check-c6-name-status-1795648114262-1900624.log`). Catches a new file, a code change or a non-`skills/` edit.
- reg: green at planning (`check docs-links: 0 .../implementation/check-docs-links-1795648114498-1901008.log`, 13 tests in docs-links). Catches a broken pointer link, a lost `akrogon verify --known-red` / `(script)` / `(no test name)` / run-check word, or a symlink replaced by a file.

Conditions traced (fresh, retried, refused, not between): the decisions change instructions only and hold no runtime state, value or loop, so no decision can reachably break a freshness, retry or ordering condition in a running process. Criterion 1(c)'s "never routed around a secret, `.env` or grant rule" and 1(d)'s "undeclared value is a missing input" are stated conditions of the text itself and are read by the reviewing seat in C1. No red-shown case applies, and none is planned.

Model-choice reading: criterion 1(c)'s "no permitted formulation can answer the same criterion" is the seat's judgment, recorded with the denial text. No case holds an expected value for it.

No paid or live run. No grant used. No restart boundaries (no slow run).

## Open limitations

- Held disagreement (C, rebuttal F4): that the operator's claude `Read(**/.env.*)` deny rule matched the wrangler command is a hypothesis. Removing the env file path may not remove every such denial. 1(c) keeps the failed stop when no permitted equivalent exists.
- Host `ask`/`deny` rules and harness extensions that wait on a UI choice stay the operator's. agy `artifactReviewPolicy` is not exercised. The chord-tap-editor dialog claim is unverified.
- Precondition: current launch profiles and host settings (agy observed, claude from `src/seat.ts` and transcripts, codex and pi from vendor docs).
- Release reach: the text reaches seats only after the next akrogon release is installed. A worker brief written before that keeps its old text until rewritten.
