# Review B: signposts-references

Date: 2026-11-04. Initial blind review, slot B.

Base: `bfca777d2ae0921cc50e72a4e6f0c95c5c1388ef`
Reviewed head: `8c47e1e18eee90c31563857b69000a9b2886ffe5`
Verdict: **fix**.

## Fixes

### F1: Preserve the full-autopilot exception for signposts conflicts

`docs/use/plan-work.md:34` says an unresolved conflict between operator statements “is shown in one line and asked” without a mode qualification. The same section covers all three modes. `skills/chart-issues/assets/questions.md:41`, the design's named source, requires asking in manual and autopilot, but requires A to resolve the conflict under full autopilot.

Realistic source: an operator using the documented full-autopilot mode reads “Set the signposts” to learn which signposts decisions still need their reply. When earlier operator statements conflict, this new sentence incorrectly promises an operator question even though the door resolves it itself. This misstates the operator's involvement today and fails brief criterion 2's requirement to explain when a conflict is asked, against the design's source-of-truth contract.

Qualify asking as manual/autopilot and state that A resolves it under full autopilot. Keep the correction within this paragraph. No prose-pinning test is needed. Before evidence: `check review-b-proof-meta: 0 implementation/check-review-b-proof-meta-1793796915188-1382515.log`, read back with `akrogon log`, contains both numbered source passages.

## Verification

- Read the brief, design, plan, report and entire diff against chart-issues Open, Drain, Autopilot and Handover, shapes Chart records, questions signposts rules, and `src/status.ts:chartRow`. The other signposts record, folder, counter, session and autopilot facts match those sources. The affected pages and docs/index pointers were inspected. The remaining issue is F1.
- Scope: exactly the 11 What-listed files changed. No changes to `src/`, `tests/`, `issues/`, runner configuration or lockfiles. `check diff-scope: 0 implementation/check-diff-scope-1793796721042-921581.log`, read back with `akrogon log`. Worktree clean at the reviewed head.
- Links: the report ran the planned `bun test tests/docs-links.test.ts` after both implementation commits. `check docs-links: 0 implementation/check-docs-links-1793796720947-921400.log`, read back: 8 pass, 0 fail. The `set-the-signposts` heading remains. No proof-command correction or changed test requires a newer run.
- Required checks: completed leaf verify receipt `fb4025b0-75b2-47c9-b441-3a2858744212` matches the reviewed head and tree `9b497c6477e0407b2740a302fc7e7ea85a4822c7`. Setup, format, typecheck and test all exit 0. Test output records 1309 pass, 0 fail. Receipt evidence: `check review-b-verified-head: 0 implementation/check-review-b-verified-head-1793796959948-1405720.log`. Read it and the receipt's format/typecheck/test logs with `akrogon log`. Planned commands were neither skipped nor filtered. Existing green evidence remains current, so no suite rerun was needed.
- AREA paths: one shell command lists every concrete path named in `skills/AREA.md`, resolving `assets/` and its filenames under chart-issues and the watch scripts under watch-issues. All exist. `check review-b-area-resolved: 0 implementation/check-review-b-area-resolved-1793796975861-1413737.log`, read back with `akrogon log`. The earlier literal-token listing's `assets` and `scripts/*` misses are contextual shorthand, not dead pointers.
- SVG: rendered the actual changed SVG with `rsvg-convert` and inspected the image. “A answers the forks” fits on one line within the unchanged box. `check review-b-svg-render: 0 implementation/check-review-b-svg-render-1793796926426-1392896.log`, read back with `akrogon log`. Temporary PNG and directory removed.

## Test-Change trailers

None in `bfca777d2ae0921cc50e72a4e6f0c95c5c1388ef..HEAD`. Commits `1dd486de25bea50bd3a21cd537a1335cd59e549c` and `8c47e1e18eee90c31563857b69000a9b2886ffe5` change no path matched by `src/test-files.ts`. No existing assertions, fixtures or recorded outputs changed.

## Nits and operator actions

None. No grants, paid/live launches, fixture cleanup obligations or required environment values apply to this text-only leaf. No covered operations launched during review.

## 2026-11-04 check.repair

Reviewed both initial reviews at `8c47e1e18eee90c31563857b69000a9b2886ffe5`. A has no Fixes. B's F1 is repaired in commit `67f0b262f7a0c7dde48dc17fe0234befadad02cb` (`docs: clarify signposts conflicts under full autopilot`). Only the conflict wording in `docs/use/plan-work.md:34` changed.

Before: an unresolved conflict “is shown in one line and asked” without a mode qualification. After: it is asked “in manual and autopilot modes. Under full autopilot A resolves it.” This matches the design's `questions.md:41` source without changing the brief or design. Before/after and commit evidence: `check repair-b-commit: 0 implementation/check-repair-b-commit-1793797052134-1455619.log`, read back with `akrogon log`.

The plan's existing C2 proof was rerun by reading the repaired section against questions.md and SKILL.md Open/Autopilot. The manual, autopilot and full-autopilot conflict outcomes now agree. All other C2 facts remain present. C6 scope still lists exactly the 11 authorized files, and the repair diff contains only plan-work.md. Evidence: `check repair-b-proof: 0 implementation/check-repair-b-proof-1793797061025-1459143.log`, read back with `akrogon log`.

The planned docs-links test was rerun on the committed repair after the configured setup under the installation lock: `check repair-b-docs-links: 0 implementation/check-repair-b-docs-links-1793797061113-1459144.log`, read back with `akrogon log`: 8 pass, 0 fail. The existing planned proof and test were written before this repair pass. No prose-pinning test was added. No test files changed, so no Test-Change trailer applies.

Earlier C1, C3, C4 and C5 proof remains valid because their inputs are unchanged. B's initial rendered SVG inspection also resolves A's rendering concern. B holds no reusable Nit. No Handed to A items or operator actions remain.

For the merge move, `akrogon verify` completed green on repair head `67f0b262f7a0c7dde48dc17fe0234befadad02cb` (run `8aecd721-0625-48d6-b16d-26f53942754b`). Kept results: `verify format: 0 implementation/check-format-1793797072339-1463450.log`, `verify typecheck: 0 implementation/check-typecheck-1793797075621-1463450.log`, and `verify test: 0 implementation/check-test-1793797149533-1463450.log`. Read back all three with `akrogon log`: format and typecheck pass, 1309 tests pass, 0 fail. No merge_checks were run. F1 is closed, and the repaired leaf is ready for merge.
