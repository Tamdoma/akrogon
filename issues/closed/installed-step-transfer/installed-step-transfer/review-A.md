# Review A: installed-step-transfer

Initial check.review, slot A, blind of B. Base `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`, reviewed head `c127338e2188a4820b3c0560f82821588298b68d` (2 commits: `aed1ecb9` test, `c127338e` prose).

## Diff read

- `skills/lesson-rule.md` Transfer bullet: matches plan D1 — `realpath` classification, same-repo add + `Transferred ... to <file:line>`, installed step adds nothing, `§` history citation with `release <sha>` under `<akrogon home>/releases/` (else `HEAD <sha>`), rewrite + `rewritten against` history counted as stay, the script-check-on-model-output contradiction clause, exclusions (`Applied` ban, leaf/checkable never transfers) and Retire/Sort order untouched.
- `skills/learn-issues/SKILL.md` Sort bullet: matches D2 — installed step eligible, covering sentence quoted in sort output, unreached step stays naming repo or install. Apply bullet: matches D3 — same procedure and history formats as the rule, `git config user.name` for `<who>`, approve-completes/decline-reverts preserved.
- `docs/use/learn-from-work.md` Transfer bullet: matches D4 — same outcome in user terms.
- `tests/docs-links.test.ts`: adds the criterion-2 case, reads index mode via `git ls-files -s`, asserts 5 rows all `120000`; committed at planning with a `Test-Change` trailer.

## Verification

- `akrogon verify` green on `c127338e` (A's `check test: 0`, 1225 pass) — covers criterion 3 (links in the changed files resolve; the new text adds no relative links).
- `git ls-files -s skills/` confirms the five `skills/*/lesson-rule.md` entries are `120000` on the reviewed head.
- Criterion 1: `implementation/report.md` walks all ten named history files; each gets a Transfer, a rewrite against an installed citation, or a keep with a stated reason; the quoted deciding sentences exist in the leaf-head text and installed standing-design; `2026-10-16-stash-shared-across-worker-worktrees` stays checkable. Read as the model-choice criterion it is: the walk names who decides, on what evidence, and where it is recorded.
- Criterion 4: report states all three items (later framework `/learn-issues` pass under #650, source-naming stays framework work, orphaned transfers undetected).
- No `AREA.md` in the diff; `skills/AREA.md` and `docs/reference/skills.md` descriptions of `/learn-issues` remain true. No `learnings/LESSONS.md` line touched. No grants or paid operations in the leaf; nothing to audit.

## Findings

### Nits

- **N1**: `skills/learn-issues/SKILL.md` Apply bullet carries the rewrite mechanics but not the "script check on model output with no named one-right-answer source" example that `skills/lesson-rule.md`'s Transfer bullet states, although Apply is the bullet the sorting seat executes. Deferred: the lesson rule is linked from the skill and is authoritative for the classification, and Apply's procedure covers the case once sorted. Promote to a Fix only if a real `/learn-issues` pass is shown missing that classification.

## Verdict

`nits` — no Fixes; the diff implements the plan and design exactly, criterion proofs hold on the reviewed head.
