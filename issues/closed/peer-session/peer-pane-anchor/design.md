# Design: peer-pane-anchor

## Binding decisions, verbatim

From issues/chart/peer-session/forks/peer-anchor.md `## Taken`. These are A's picks under autopilot, 2026-10-29 (1a 2a), not operator words.

- Q1 · 1a: a shared helper in skills/chart-issues/scripts runs `herdr pane process-info --pane $HERDR_PANE_ID` over the inherited env and returns only when that pane's `shell_pid` is an ancestor of the calling process. Otherwise it refuses, naming `HERDR_PANE_ID`, `HERDR_SOCKET_PATH` and herdr's answer. peer-ask, peer-wait, peer-restart, peer-create and door-reset call it before their first herdr call. peer-restart, peer-create and door-reset also refuse when their A-pane argument differs from the verified pane. door-reset's detached child and the peer-wait started by peer-ask inherit the verified env, and the detached child does not re-verify. Every herdr call keeps its current form, with no `--session`, no argv change and no prose change. Reason: the process tree is the one value a stale spare cannot fake. One check removes the wrong-session class for every call after it, with the least code. Rejected: 1b explicit `--session` everywhere (every call site, rerun and prose example changes, and it still needs 1a to learn the session); 1c unique-id discovery (a decoy passes when the real pane is gone, and ids collide today); 1d A's harness session id (needs a trusted first read, goes stale on reset).
- Q2 · 2a: every consultant shares A's herdr session. Reason: peers are created beside A or named in A's tab, which is today's only layout, at no extra code. Rejected: 2b a per-seat address (plumbing for an unused layout).
- Refusal under autopilot: a non-zero script exit under the existing rule, which drops no consultant.
- Out: a herdr server replaced under the same session name. Cross-session consultants.

Recorded proof (fork Findings, 2026-10-29T07:37:53Z, herdr 0.9.1, local user ivan, read-only): `herdr pane process-info --pane "$HERDR_PANE_ID"` over the door's inherited socket returned `shell_pid 8969`, an ancestor of the door's tool shell. A codex pane's `shell_pid` is an ancestor of its codex processes. With `HERDR_SOCKET_PATH` naming another running session, the call returned `pane_not_found`. Limits: no pi door observed, and no server replacement covered.

Standing design: /home/ivan/.akrogon/current/skills/chart-issues/assets/standing-design.md. How it applies here: criteria 1 to 3 are proven at the script CLI boundary in the existing `tests/peer-*.test.ts` and `tests/door-reset.test.ts`, run by the repo's `test` check. Criterion 1 is the bug fix: a decoy-pane test is shown red on the base, where the scripts prompt without checking, and green after. Criterion 2 gets one deliberate break (skipping the argument comparison) that turns its test red. Criterion 4 is a real read-only herdr call, the cheapest proof of the real ancestry that no fake can show. It needs no grant, because it is a local read with no mutation. No new runner or harness is built.

## Leaf architecture

Owned surfaces:

- A new helper module in `skills/chart-issues/scripts/` (name chosen by the plan). It reads `HERDR_PANE_ID`, calls `herdr pane process-info --pane <id>` with the inherited env, and walks `/proc/<pid>/stat` parents from `process.pid` up to pid 1, looking for `shell_pid`. It returns the verified pane id or throws the refusal. The parent walk reads field 4 after the last `)`, as `src/scope.ts` `startTime` does for field 22.
- `peer-ask.ts`, `peer-wait.ts`, `peer-restart.ts`, `peer-create.ts`, `door-reset.ts`: call the helper at entry, before the first herdr spawn. peer-restart, peer-create and door-reset compare their A-pane argument with the returned pane. door-reset's detached child path skips the call. Open for the plan: how door-reset distinguishes its child path (argv or env it already sets), confirmed in `door-reset.ts` before choosing.
- `tests/fake-herdr.ts` `pane process-info` branch: return a configured `shell_pid` (for example from a fixture env value) when one is set, keeping today's hashed `tests/fake-proc.ts` `shellPid` as the default, so the src lifecycle tests (`adoptShell`, `inOwnScope` callers) stay unchanged. Open for the plan: list the src tests that read this branch and confirm that the default path is untouched.
- The five peer/door test setups: set `HERDR_PANE_ID` to the fixture's caller pane and its configured `shell_pid` to a real ancestor of the spawned script, such as the test process's own pid. They stop inheriting the machine's `HERDR_PANE_ID`.

Consumers of changed state: the door (SKILL.md, questions.md) already treats a non-zero script exit as a reported stop, so no prose changes. `seats.yaml` and the outcome lines are unchanged.

Exclusions: no `--session` routing in the scripts, no use of `src/shell.ts` `repoSession` or `sessionPanes`, no change to `src` lifecycle callers, `chart-usage.ts` or `direct-guards.ts`.
