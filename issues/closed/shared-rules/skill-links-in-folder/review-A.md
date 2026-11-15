# Review A: skill-links-in-folder

Base a33d967b5dd07829b81b9dd87802c8a72f8effbd. Reviewed head 0bc7d2e91f05cd72682ea94322e0dcc50fe1d368 (two commits: widened check, then links + wording). Verdict: **nits**.

## Evidence

- `git diff a33d967b..HEAD`: 14 files — test widening, five 120000 link files, seven same-folder link rewrites, lesson-rule Seed/Home link→words, two AREA.md lines. Diff matches plan.md D1–D8 exactly; no excluded surfaces touched (chart-issues SKILL.md changed only at its lesson-rule site).
- `git ls-files -s skills/ | grep lesson-rule`: five `120000` in-folder links + one `100644` shared file; `readlink` per link → `../lesson-rule.md` (criterion 2 observed).
- `check docs-links: 0` (`implementation/check-docs-links-1794392702210-2541327.log`): widened scan green on the delivered tree — covers criteria 1 and 3 accept-side; seven escapes + traversal/deref/fence/untracked reporting were shown red at planning (plan.md logs cited).
- `verify leaf 2d208256: green` (`check-test-1794392957569-3198809.log`); first verify red on `agy: the reset helper runs its stages in order...` — retried green, marked inconsistent with both logs in report.md; no plausible cause in this diff (markdown + test helpers).
- AREA.md live listing: every named path resolves from the repo root against its area directory (`skills/chart-issues/assets|scripts/*`, `tests/e2e/watch-*.ts`); `issues/*` and `direct/` entries are runtime-generated, not checkout paths — no dead pointer.
- Docs pages: `docs/reference/skills.md` and `docs/use/learn-from-work.md` unchanged; their claims about `skills/lesson-rule.md` still true; links covered by the green check (criterion 4). No other documented behavior changed.

## Findings

N1 — `proseOnly` closes a fence on a closer of the same character but shorter than the opener (e.g. a ```` ``` ```` fence closed by `` ``` ``). CommonMark requires the closer to be at least as long as the opener, so a renderer keeps fencing while the check resumes link-reading — a false "missing file" report or a missed heading would result only inside a file authored with mismatched fence lengths, which none has today. Deferred: no tracked file exhibits it; a handmade reproduction exists but is not a realistic source by itself. Promotes to Fix when a real authored doc with mixed-length fences produces a spurious report or hides a real broken link.

## Covered-operation count

None launched; artifacts carry no unexplained paid activity.
