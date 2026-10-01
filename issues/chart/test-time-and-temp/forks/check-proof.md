# Check proof

## Question
Q1. Build the check-record runner #50 asks for (SHA records, reuse, merge refusal), or keep check-scheduling Q1 1a?

Q2. When a test or check fails during implement or check.fix, what does the seat do about base?

Q3. May plan-issue add a whole-suite or `merge_checks` requirement the brief does not have?

### Carries
- check-reruns/forks/check-scheduling.md Taken 2026-10-01: Q1 1a no runner; Q2 2a schedule; Q3 3a chart audit refuses `merge_checks` and repo-health criteria.
- leaf-run-stalls/forks/red-criterion.md Taken 2026-10-01: Q2 2a a criterion that cannot pass within owned surfaces ends the pass `failed`, never handed off as pre-existing.
- realistic-fix-bar/forks/test-bar.md, cross-leaf-proof/forks/proof-selection.md.
- Related: forks/leaf-temp.md (a base copy would live under the leaf temp folder).

## Findings
Source map: ../slots/map-merged.md F1-F5. Rebuttals: ../slots/map-rebuttal-B.md R1, ../slots/map-rebuttal-C.md.

- Q1: all slots keep no runner. Every run in the #50 case was red, so SHA reuse saves nothing, and SHA alone misses browser profiles, deps and env (Bazel test encyclopedia and remote caching docs, read by B 2026-10-01). merge-issue/SKILL.md:33 already runs `checks` and `merge_checks` before every push (Hoare, not-rocket-science rule). (A,B,C)
- Q2: C withdrew per-test subtraction because it reopens red-criterion Q2 2a. B: base run only when it answers an attribution question, never automatically after every failure; two red exits are not proof of the same failure (framework report.md:60-63: 1 base failure vs 38 head failures that pass alone). Merged proposal: one same-mode base run only when the failure has no cause in the leaf's diff; red there ends the pass `failed` with both logs, which is the existing red-criterion exit made cheap. (A,B,C after rebuttal) Practitioner contradiction: John Micco (Google, 2016) separates pre-existing failures from new ones before blocking; that model needs a team that owns main health, which akrogon has only as the operator.
- Q3: plan-issue/SKILL.md:55-59 maps criteria to proofs but has no rule against adding a whole-suite requirement; IN5 (framework emdash-content-fixes plan.md:111) was plan-authored. shapes.md:132,170 holds the chart rule. (A; B,C silent)

## Taken
Operator 2026-10-01, verbatim: "1a | 2a | 3a |"

- Q1 1a: no check-record runner; check-scheduling Q1 1a stands. Reason: every #50 run was red, so SHA reuse saves nothing, and SHA misses outside inputs. Foreclosed: 1b runner with records, reuse, base diff and merge refusal.
- Q2 2a: when a red test or check has no cause in the leaf's diff, the seat runs that same command once, in the same mode (whole folder or single file), at `AKROGON_BASE` in a detached worktree under the leaf temp folder. Red there too: end the pass `akrogon phase <slug> failed --reason "<command> red on base <sha>"` with both log paths in the report. Green there: the leaf's own failure, repaired as today. Never run automatically after every failure. Applies in implement-issue (implement and check.fix) and check-issue. Refines red-criterion Q2 2a; does not reopen it. Foreclosed: 2b base-red failures recorded and only new failures block; 2c no rule.
- Q3 3a: plan-issue gets the chart rule: a plan proves the brief's criteria with the leaf's own tests and `checks` commands and adds no `merge_checks` or whole-suite requirement the brief does not name. Foreclosed: 3b plans unchanged.

## Operation proofs

2026-10-01, operator user ivan (uid 1000), git 2.55.0, akrogon at 88f252f, run by A at `/home/ivan/Work/infra/akrogon`.

- `mktemp -d` with `TMPDIR=<scratchpad>` returned `<scratchpad>/tmp.NzuDzjlSan`. With TMPDIR unset it returned `/tmp/tmp.WV9EceXNVG`, removed with `rmdir`.
- `git worktree add --detach "$w" "$(git rev-parse HEAD)"` printed `HEAD is now at 88f252f`, the worktree HEAD was 88f252f0 and status was clean. `git worktree remove "$w"` exited 0, the folder was gone and `git worktree list` no longer named it.
- With an untracked `stray.log` in a second detached worktree, plain `git worktree remove` exited 128 ("contains modified or untracked files, use --force"). `git worktree remove --force` exited 0 and the folder was gone. So the leaf prescribes `--force`.
- `akrogon phase <slug> failed --slot A --reason x` from `check.review`: `bun test tests/phase.test.ts -t "stops land in failed immediately"` passed (1 test, 13 expects). It runs the real CLI against a throwaway fixture repo with `AKROGON_HOME` set and fake herdr, printing `moved failed` and recording failure `{cause: blocked, phase: check.review, slot: A}`. Fixture removed by the test.
- Limits: no dependency install or real suite ran in the base worktree, and the phase call ran in a fixture, not a live leaf tab.
