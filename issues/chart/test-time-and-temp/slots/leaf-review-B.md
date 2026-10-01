# B leaf-writing disagreements

Draft paths below are relative to `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/ace3864f-5e68-450b-bbee-dd3157464ebc/scratchpad/drafts`. Repository evidence is relative to `/home/ivan/Work/infra/akrogon`.

## R1. The allocation criterion assumes two splits on initial dispatch

Evidence: `leaf-temp/leaf-temp-dir/brief.md:10` asks one dispatch to show tab creation and both pane splits. `src/next.ts:323-338` uses the new tab's existing root pane for A and splits only B. Both replacement splits are exercised on an existing tab with missing recorded seats (`tests/next.test.ts:1784-1814`). Making two initial splits would alter allocation outside this leaf's scope.

Replace criterion 1 at `leaf-temp/leaf-temp-dir/brief.md:10` with:

```text
1. Tests in `tests/next.test.ts` show that fresh allocation carries `--env TMPDIR=<leaf temp folder>` on tab creation and the B-pane split, and recovery on an existing tab carries it when replacing either recorded seat. The folder exists with mode 0700 before each herdr creation or split call that uses it. Extend the existing missing-seat scenarios instead of changing allocation topology.
```

## R2. Independent base-red execution needs a concrete system-temp interface and both log paths

Evidence: `base-red/base-red-exit/design.md:20,38` explicitly permits execution before leaf-temp-dir, with TMPDIR unset. However, `brief.md:6` and `design.md:34` specify a path under `$TMPDIR` without resolving that allowed case. `src/next.ts:302-309` currently exports no TMPDIR. An unset variable cannot supply the required absolute worktree parent. Also, `forks/check-proof.md:27` requires both log paths, while `brief.md:6` specifies only names and tails. The leaf-temp carry adds inline evidence to the path requirement rather than replacing it (`base-red/base-red-exit/design.md:17`).

At `base-red/base-red-exit/brief.md:6`, replace:

```text
in a detached worktree under `$TMPDIR`, installing dependencies there as the leaf does, and removes it with `git worktree remove` afterwards
```

with:

```text
in a detached worktree at a unique path allocated by `mktemp -d`, which uses the exported leaf TMPDIR or the system temp directory when TMPDIR is unset, installing dependencies there as the leaf does. Preserve the comparison result and diagnostic evidence, then remove the worktree with `git worktree remove` before taking the red-on-base exit or green-on-base repair path
```

On the same line, replace:

```text
records the base SHA, the failing test names and log tails from both runs
```

with:

```text
records the base SHA, both log paths, and the failing test names and log tails from both runs
```

Replace the second sentence of `base-red/base-red-exit/design.md:20` with:

```text
This leaf allocates its base worktree path with `mktemp -d`, using the leaf TMPDIR when exported and the system temp directory otherwise, so it has no dependency on leaf-temp-dir.
```

Replace the `Base worktree:` passage at `base-red/base-red-exit/design.md:34` with:

```text
Base worktree: allocate `base_worktree=$(mktemp -d)`, then run `git worktree add --detach "$base_worktree" "$AKROGON_BASE"`. Preserve the result, both log paths, failing names and log tails before `git worktree remove "$base_worktree"`; then take the specified red or green outcome. `mktemp -d` uses the exported TMPDIR or the system temp directory when it is unset.
```

## R3. Existing command usage is not the required recorded operation proof

Evidence: `base-red/base-red-exit/design.md:38` substitutes prior skill usage for probes of `akrogon phase ... failed --reason --slot` and detached base-worktree creation/removal. `forks/check-proof.md` contains no operation record for these calls. `skills/chart-issues/SKILL.md:53` requires a real call before handoff, recorded in the fork with inputs, identity reference, version, date, observed result, cleanup and limits. `skills/chart-issues/assets/shapes.md:168` holds handoff when that proof is absent. Handoff approval does not establish the call's result.

Replace the `Operation proofs:` passage at `base-red/base-red-exit/design.md:38` with:

```text
Operation proofs: not yet recorded. Handoff is held until the charting door records real throwaway invocations of `mktemp -d`, `git worktree add --detach`, `git worktree remove`, and `akrogon phase <slug> failed --reason "<command> red on base <sha>" --slot <A|B>` in forks/check-proof.md. Each record includes the exact command and inputs, the operator-user identity reference without secrets, tool version, date, observed result, verified cleanup and limits. Exercise the phase command against a throwaway registered fixture rather than an active leaf. Replace this hold with the actual recorded proof references after the calls and cleanup succeed.
```
