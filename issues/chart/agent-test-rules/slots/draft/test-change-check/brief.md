# Brief: test-change-check

## What
`akrogon phase` refuses a move when the leaf branch changed an existing test file and no commit on the branch names that file with a cited source. Merge runs the same check before it pushes.

1. Test files. One built-in rule in akrogon source, with no config. A path counts as a test file when any path segment is `test`, `tests`, `__tests__`, `fixture`, `fixtures`, `__fixtures__`, `__snapshots__`, `e2e`, `spec`, `specs`, `testdata`, `golden` or `goldens`, or when its file name matches `*.test.*`, `*.spec.*`, `*.e2e.*`, `*_test.*` or `*.snap`.
2. Old test files. A test file with status `M`, `D` or `T` in `git diff --no-renames --name-status <target>...HEAD`, where `<target>` is `target(repo)` (`src/config.ts:144`). A rename counts as a delete of the old path plus an add of the new one. Added files need nothing.
3. Citation. Each old test file needs one commit trailer in `<target>..HEAD` whose value starts with that exact path, then a space, then non-empty text: `Test-Change: <path> <source and reason>`. The check verifies presence only. B judges whether the cited source is real. Extending an existing test file is a change to an old test file, so it also needs the line. Its text says what was added and that no existing expectation changed.
4. Where it runs. Every move that runs today's `requireNoIssueFiles` guard (`src/phase.ts:224`) also runs this check. A move to `failed` stays unchecked, so a seat can always stop. A refusal exits non-zero, leaves state unchanged and names each uncited file with the trailer line to add.
5. Check-only run. `akrogon phase <slug> <phase> --slot <A|B> --check` runs every check of that move without recording or moving. It prints `ok` and exits 0 when the move would be accepted. Otherwise it fails with the same error the move would give. `--check` with `failed` is refused.
6. Merge. `skills/merge-issue/SKILL.md` runs `akrogon phase <slug> merged --slot B --check` after green checks and right before the push (`:47`). After the push the diff is empty, so the `merged` move itself can no longer see the change. On a refusal, B adds the missing trailer to its own merge-time commit when the change cites a real source, or reverts the change, then reruns the checks and `--check` before pushing.
7. Writer text. `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` check.repair and `skills/merge-issue/SKILL.md` tell the seat to add one `Test-Change: <path> <source and reason>` trailer per old test file to the commit that changes it, and state the built-in rule by pointing to its source file. In check.review, B lists the `Test-Change:` trailers in `<target>..HEAD` and judges each one.

## Why
The operator wants seats forced not to change tests to fit their own findings, in every harness and on every write path (test-authority 2a). Skill text alone has not stopped it: in the past week codex B changed existing expectations in 5 leaves and the pi merger re-recorded tests in 10 framework leaves, with nothing recording why (`issues/chart/agent-test-rules/INTAKE.md`). A git check at `akrogon phase` sees every change, whatever tool made it. The citation rule itself is owned by `test-rules`. This leaf makes a missing citation impossible to merge.

## Done-criteria
1. On a leaf branch that modifies, deletes or changes the type of an existing file matching the rule, with no matching `Test-Change:` trailer, `akrogon phase` refuses the move, names the file and leaves state.yaml unchanged. The same branch with a matching trailer moves.
2. Each of these moves without a trailer: a branch that only adds test files, and a branch that changes only files outside the rule. Each of these is refused: a trailer naming a different path, and a trailer with the path but no text. A renamed test file needs a trailer for its old path.
3. `akrogon phase ... --check` prints `ok` and exits 0 when the move would be accepted, fails with the move's error otherwise, and in both cases leaves state.yaml and the git history unchanged. `--check` with `failed` is refused.
4. `skills/merge-issue/SKILL.md` runs `--check` right before the push. implement-issue, check-issue check.repair and merge-issue state the trailer rule. check-issue check.review has B list and judge the trailers. `README.md` and `docs/guide` show `--check` and the refusal.

Credentials: none. Human prerequisites: none.
