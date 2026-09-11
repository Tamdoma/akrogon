# Review B

Verdict: ready
Base: a4f0b5d88080026860be4837f97f6a89a7c52a1c
Reviewed head: eff9c92e8b478596b10a5af6105557f27b42edad

## Scope and findings

Reviewed all seven changed files against plan D1–D4 and brief C1–C4, including exclusions and the implementation report. The reviewed head is one commit ahead of the configured base. `git status --porcelain` is empty. No issue artifacts are included in the commit.

No Fixes or Nits.

- C1: Directory validation precedes Git cwd probing. Files and file symlinks are rejected without dispatch or state mutation. Existing slug lookup, directory/worktree targeting and hook ownership branches remain intact. Moving the guard before commonDirectory follows the live implementation of the locked design.
- C2: The shared Herdr boundary wraps JSON and Zod failures with argv, cwd, stdout, error text and native cause. Command execution stays outside the guard, preserving nonzero CommandError behavior. Tests use real subprocesses and replace only the external Herdr executable.
- C3: Only logMove is wrapped. Saved state and the destination remain committed, the original error remains visible and attached as cause, and ordinary completion failures are not relabeled when logging succeeds. Append and diagnostic-collection failures and no-replay behavior are covered.
- C4: Reviewed retained fail-first, changed-test and full-suite transcripts and the recorded successful blocking checks. Tests exercise the CLI and persistent effects, with diagnostic-content assertions tied to this leaf's explicit error-reporting contract rather than whole-message snapshots. No unit under test is mocked.

Followed REFERENCE.md pointers and relevant docs/next.html and docs/problems.html content. No documentation change is required within this leaf's ownership. The preexisting guide wording for repeated transitions is outside this diff.

## Verification evidence

- Clean worktree and reviewed base/head confirmed during this review.
- Changed tests: 162 pass, 0 fail, exit 0. `/tmp/argument-and-response-errors-evidence/cli-tests.log`.
- Full suite: 162 pass, 0 fail, exit 0. `/tmp/argument-and-response-errors-evidence/full-tests.log`.
- Formatting and typecheck: exit 0 in the implementation report, with retained `format.log` and `typecheck.log` under the same evidence directory. No code has changed since those checks.
- Additional review probe: real CLI in an isolated Git fixture with successful fake Herdr stdout of empty string, `null`, and `{}`. Each invocation exited 1, retained exact normalized stdout and `herdr pane list` argv, and included the parse/schema error. Probe assertions exited 0. Artifact: `/tmp/argument-and-response-errors-evidence/review-B-edge.log`. Fixture resources were removed.

Blocking checks were not repeated because the reviewed commit is unchanged and their evidence is present. The additional probe resolves the untested empty/missing-envelope edge cases without modifying code.

## Remaining limitations

Plan R1 and R2 remain: this change does not repair missing log records, and simultaneous completion/log failures retain the existing finally-block error precedence. Neither is introduced by this diff or required to change by this leaf.
