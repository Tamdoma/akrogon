# Report: skill-links-in-folder

Base a33d967b5dd07829b81b9dd87802c8a72f8effbd. Committed head 0bc7d2e91f05cd72682ea94322e0dcc50fe1d368 (amended for a `Test-Change` trailer on tests/AREA.md; tree identical to verified head 2d2082565546d391136bb6eab66880eaee883149). Serial-solo run (one unit, one wave), implemented by A. No delegation, no paid or live operations.

## Changed files

- `tests/docs-links.test.ts` (commit 6e8fbced, planned): skills scan reads every tracked markdown via `git ls-files -s skills/`; `brokenLinks` gained a `bound` that reports links escaping a skill's folder; `proseOnly` strips fenced blocks for links and headings; `diskResolver` dereferences committed git links (ls-tree mode 120000 → blob as target path). Two unit cases added.
- `skills/{plan-issue,implement-issue,check-issue,learn-issues,chart-issues}/lesson-rule.md` (commit 2d208256): new git links, mode 120000, target `../lesson-rule.md` — verified via `git ls-files -s` and `readlink` per file.
- The five `SKILL.md` files (commit 2d208256): seven `../lesson-rule.md` sites → `lesson-rule.md`.
- `skills/lesson-rule.md` (commit 2d208256): Seed and Home links → references in words (`skills/learn-issues/SKILL.md`, `skills/seed-issue/SKILL.md`); only those two lines changed.
- `skills/AREA.md` (commit 2d208256): shared-file-by-link-file mechanism stated once on the lesson-rule bullet.
- `tests/AREA.md` (commit 2d208256): docs-links line updated to the widened set.

## Commands and results

- Criterion 1 + 3 proof: `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts` on 2d208256 → `check docs-links: 0`, `implementation/check-docs-links-1794392702210-2541327.log`. All 10 tests pass; the widened scan accepts the delivered tree and reports nothing.
- Criterion 2 proof: `git ls-files -s skills/` → five 120000 `lesson-rule.md` entries plus one 100644 `skills/lesson-rule.md`; `readlink` per file → `../lesson-rule.md`; `git diff` on lesson-rule.md shows only the two link→word rewrites.
- Criterion 4 proof: AREA.md diff one line; `docs/reference/skills.md` and `docs/use/learn-from-work.md` unchanged and their `../../skills/lesson-rule.md` links pass the green check.
- Deliberate break was shown red at planning (recorded in plan.md): escaping links from SKILL.md and assets/, missing-file links, traversal through an in-folder link file, HEAD dereference of a disk-absent git link, fenced and untracked exemption.
- `akrogon verify` on head 2d208256: first run red — one flaky test `agy: the reset helper runs its stages in order and fresh A gets the start prompt on a new transcript` (`check-test-1794392775525-2550097.log`, ~60 s). Retry of the same `test` command → `check test: 0`, `check-test-1794392837570-2863615.log` (~60 s): marked **inconsistent**, no cause in this diff (markdown and test-helper changes only). Second `akrogon verify` → `verify leaf 2d208256: green`, `check-test-1794392957569-3198809.log` (~60 s).

## Known limitations

- None open. The first verify's agy reset-helper red is recorded inconsistent above; unrelated to this leaf.

## Unverified criteria

- None.
