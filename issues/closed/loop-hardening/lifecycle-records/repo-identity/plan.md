# Plan: repo-identity

Direct slot B synthesis. The authoritative state has `debate: no`, so there are no position or rebuttal artifacts to integrate. The locked design governs scope.

## Read first

- `issues/open/loop-hardening/lifecycle-records/repo-identity/brief.md` and `design.md` in the registered main checkout.
- `REFERENCE.md`, `README.md` configuration paragraphs under Install and Initialize a repository.
- `src/state.ts`: `allLeaves`, `findLeaf`, state schema.
- `src/status.ts`: `scanRepo`, its specific error handling, and `statusCommand`.
- `src/next.ts`: `discover`, `ensureWorktree`, dispatch error reporting.
- `src/config.ts`: `currentRepo`, `readRepo`, `worktree_root`; `src/phase.ts`: phase lookup through `findLeaf`.
- `tests/helpers.ts`, `tests/status.test.ts`, `tests/next.test.ts`, `tests/phase.test.ts`.
- `learnings/LESSONS.md`: use real CLI scenarios to verify behavior, and report remaining limitations. No history claim needs further investigation for this plan.

All required grounding resources exist. Inspect code in this leaf worktree and keep lifecycle artifacts in the authoritative leaf directory.

## Decisions and needed interfaces

- D1: Retain exact registration-key enforcement. A mismatch identifies the leaf path, stored key, and registered key. Do not rewrite state, drop enforcement, or add rename support.
- D2: Define a small exported `RepoMismatchError` in `src/state.ts`, taking `path: string`, `stored: string`, and `registered: string`. Its constructor owns the diagnostic text. Use existing explicit comparisons in `allLeaves` and `next.discover`, and replace `status.scanRepo`'s literal parse with the same comparison and error. Add only this specific error type to the scanner's existing handled errors, preserving its structured unreadable result and healthy-repository output. No generic catch expansion or new schema/configuration interface.
- D3: Preserve `ensureWorktree`'s equality check and execution order. Its error identifies recorded and expected absolute paths and tells the operator to move the worktree to the expected location or restore the previous repository/worktree root. Do not perform relocation or overwrite the recorded path on failure.
- D4: Add one paragraph alongside the README's existing configuration explanation under Initialize a repository. Explain that the registration key is persistent identity, its registered directory path may change independently, and recorded worktrees require separate reconciliation after a root change. Do not change the command table or intake instructions.
- D5: Verify through the existing isolated CLI fixtures using real Git repositories and the established fake Herdr transport. No authentication is involved or mocked. Assert diagnostic content and observable outcomes, not entire sentence wording.

Review note: the design's surface list names `allLeaves` and `scanRepo`, but current `next` uses a separate `discover` check at `src/next.ts:89`. Updating that check is necessary for the explicitly required `next` diagnostic. Preserve the current per-leaf skip behavior and healthy dispatch, rather than changing discovery policy. The README has no Configuration heading, so use its existing configuration paragraph without adding a section.

## Acceptance criteria

- C1: With registered key `repo` and leaf `repo: other`, `status`, `status <slug>`, `next <slug>`, and a valid `phase <slug> implement --slot B` invocation fail nonzero and expose the leaf path plus both labeled keys. The mismatched leaf remains unchanged and receives no dispatch. Use a leaf in `plan.synthesis` so phase failure is an identity failure, not an invalid transition.
- C2: An overview containing one mismatched repository and one healthy repository retains the existing structured unreadable diagnostic (including the failing state-file path), shows the healthy repository, and exits nonzero. `next --all` retains healthy dispatch and reports the mismatched leaf with both keys. Duplicate-slug behavior remains covered by existing tests.
- C3: Dispatch of an eligible leaf with an old recorded worktree path fails with recorded and expected paths plus actionable move-or-restore guidance. Cover both changed `worktree_root` and changed repository root. The recorded value remains unchanged, no replacement worktree is created, and no agent is prompted for that leaf.
- C4: Moving a fixture's main repository directory and updating only the registered path under the same key continues to support status, phase progression, and dispatch for a leaf without a recorded worktree. Dispatch creates its worktree under the new root. This does not promise automatic repair of an existing linked worktree.
- C5: The README paragraph accurately distinguishes persistent key identity from a movable directory path. Required formatting, typecheck, and complete test commands pass.

## Ordered file/criterion checklist

1. A1: Update `src/state.ts`, `src/status.ts`, and the identity check in `src/next.ts` following D1–D2. Extend `tests/status.test.ts`, `tests/next.test.ts`, and `tests/phase.test.ts` for C1–C2. Reuse existing fixture and diagnostic parsing helpers. Keep closed-leaf enforcement through `allLeaves` intact.
2. A2: Update only the worktree mismatch diagnostic in `src/next.ts`. Add isolated next scenarios for C3 and the successful move scenario in C4, using the moved root as CLI cwd and preserving fixture configuration. A real directory rename is required for the successful move case. Keep state/log snapshots around rejected phase requests and state/worktree/prompt assertions around rejected dispatch.
3. A3: Add the README paragraph described in D4 and review it against C5.
4. A4: Run focused CLI scenario tests and the required checks below. Record commands, exit codes, and artifact paths in implementation evidence. Inspect the final diff for unintended formatting changes and ensure only requested surfaces changed.

No sibling execution dependency is needed. All steps are agent-owned.

## Concrete verification

From the leaf worktree, run the following with `set -o pipefail` in the shell so captured output cannot hide a failed command. The absolute evidence directory below is the authoritative leaf, outside implementation source files.

```sh
mkdir -p /home/ivan/Work/infra/akrogon/issues/open/loop-hardening/lifecycle-records/repo-identity/implementation
set -o pipefail
bun test tests/next.test.ts tests/status.test.ts tests/phase.test.ts 2>&1 | tee /home/ivan/Work/infra/akrogon/issues/open/loop-hardening/lifecycle-records/repo-identity/implementation/identity-cli-tests.log
bun run format
bun run typecheck
bun test
```

The focused command exercises actual CLI processes through `tests/helpers.ts:cli`, with real Git and isolated registration files, and leaves the required user-visible-flow artifact. Tests must explicitly check nonzero child exits for negative cases, so passing tests prove rejection rather than merely recording error text. The implementation report records the focused artifact and each check's exit code. Remove iteration-created temporary helpers and fixtures.

## Open limitation

Changing a repository/worktree root while a leaf already records a worktree remains a manual recovery operation. The diagnostic does not move directories, repair Git worktree metadata, or reconcile `state.worktree`. Moving a directory alone does not update that recorded value, so the guidance must not claim an automatic recovery. No rename/relocation command, tree-depth validation, broader discovery change, or adjacent README work is included.
