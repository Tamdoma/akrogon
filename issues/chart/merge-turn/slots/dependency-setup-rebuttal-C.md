# dependency-setup rebuttal, slot C

Read `slots/dependency-setup-merged.md`, `dependency-setup-A.md` and `dependency-setup-B.md`. Two small disagreements. The recommendations `1a` and `2a` stand.

## 1 · "Each dependency-using command" should be "every command"

The merged 1a puts the install in front of "each dependency-using command". That asks someone to judge which commands use packages, and a wrong guess brings the bug back for that line with no error. In akrogon even `format` uses a package: it runs `prettier` (`package.json:8`). A seat or worker can run any single line first in a new worktree (`skills/implement-issue/SKILL.md:55`). A repeat install costs 7 to 9 milliseconds by both measurements, so there is nothing to save by leaving lines out. The rule should be every line under `checks` and `merge_checks`, with no judgment.

## 2 · The parent-only package probe cannot pass, and should not be a gate

The merged probe says to "include a package present only in the parent to show the local install is found first". A package that exists only in the parent is not in the local install, so it will be found in the parent. That is how module lookup works, and B's own source says Bun checks parent `node_modules` (https://bun.sh/docs/runtime/auto-install, cited in `dependency-setup-B.md`). This is the leftover case already named under Q2 2a, not a test of 1a.

The probe should be split in two:

- A package present in both places with different versions resolves to the worktree's copy. This is the test of 1a and it should pass.
- A package present only in the parent resolves from the parent. This is expected, and it is recorded as the known cost of 2a. If the operator does not accept that cost, the answer is 2b, not a change to 1a.
