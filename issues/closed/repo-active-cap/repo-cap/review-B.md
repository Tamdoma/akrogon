# Review B: repo-cap

Base: c090787a05e86d1a32418e21b5b10161fd501efc. Reviewed head: fc1a64b. Worktree clean, no issues/ files on the branch.

## Verification

- `bun test`: 215 pass, 0 fail (evidence/cli-verification.log, authoritative leaf).
- `bun run format`, `bun run typecheck`: exit 0, run by B during implementation.
- Diff inspected in full against plan D1–D6 and brief criteria 1–8.

## Findings

None.

- D1/D4: `repoSchema` gains the optional positive integer; `effectiveConfig` emits `repo_max_active` only when set, keeping the global `max_active` line visible. Rejection of 0, -1, 1.5 is covered through the real `akrogon config` exit code.
- D2/D3: one inventory pass produces `{ total, perRepo }`; the repo gate sits inside the existing `matches.length === 0` check, so live tabs bypass it. `perRepo.get(repo.name) ?? 0` is safe: an unregistered-repo gap implies `registered.unknown`, which saturates `total` and refuses through the global check.
- Tests are real CLI invocations against fake-herdr; no mocks of the unit under test, no prose-wording assertions. The unreadable case correctly asserts leaves-plus-unreadable charging (0 tabs at cap 3, 2 tabs at cap 4) rather than mark-full, matching the revised criterion.
- Six guide pages state ceiling plus optional share; setup.html shows the commented key. The stale `max_active: 0` pause advice remains per plan limitation R1.
- No AREA.md files in the diff; the area path check does not apply.
- Worker 2's missing report is not material: all six doc edits are present and verified in the committed diff.

## Verdict

ready
