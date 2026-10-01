# Intake: check-reruns

## Scope
Stop slow checks from rerunning across seats and repair rounds without letting untested code merge. Destination: akrogon (registered key `akrogon`).

## Provenance
- GitHub: Tamdoma/akrogon#48
- Operator: 2026-10-01 door message "I pulled the new issue. use slot b which is already active (codex), and let's get this fixed."

## Source: Tamdoma/akrogon#48
# The same slow check reruns in every seat and round because check evidence is prose, not a record tied to a commit

Source: Tamdoma/akrogon#48
URL: https://github.com/Tamdoma/akrogon/issues/48

Unverified intake.

## Observation
On tamdoma/framework leaf `emdash-conversion`, the same full-suite check (`bun run framework:verify`, 72 steps, about 15 minutes when green) ran at least 6 times across seats and rounds between 2026-10-01 02:51Z and 07:00Z. Nearly every run was on code whose untouched areas had not changed:

1. Implement (seat A) before handoff: exit 2.
2. Review B, initial review: exit 1 (`review-B-evidence/framework.log`).
3. check.fix round 1 (seat A): exit 2.
4. Operator-directed C1 attempt (seat A): exit 1 after 1m46s.
5. Seat A after rebase, killed by its own 600 s tool timeout before finishing.
6. Seat A rerun with no timeout: exit 0, 901 s (`implementation/report.md`).

Review B's repair recheck also reran checks. The framework had also just added `framework:verify` to `merge_checks`, which would have added one more full run at merge. The leaf has spent most of a day in check.review and check.fix, and a large share of the wall time is repeated full-suite runs.

Three rules drive the repetition:

- **Evidence is prose, so it cannot be trusted.** The only record of a check run is a sentence in `report.md` (for example "framework:verify exit 0, wall 901s"). Nothing ties it to a commit, an exit code or a log written by a tool. B cannot tell whether a claim covers the head it reviews, so it reruns. `check-issue` line 51 already says to rerun "only for a code change, missing evidence or a specific concern", but prose evidence always counts as missing.
- **implement-issue forces a full-suite rerun after every repair.** Line 52: "a full-suite rerun follows a repair rather than an unchanged successful run". A one-file repair in one area pays for every area.
- **Done-criteria may name repo-wide suites.** `emdash-conversion` C1 is "framework:verify exits 0". Every pass of every seat must prove the whole repository green for a change confined to one skill area. (Related: #45 leaf size and #47 C1 red attributed to base.)

## Location
- `skills/check-issue/SKILL.md` line 51 (rerun rule).
- `skills/implement-issue/SKILL.md` lines 52 and 62 (full-suite rerun after repair).
- `skills/merge-issue/SKILL.md` line 33 (`checks` then `merge_checks` at merge).
- Chart-time done-criteria authoring (chart-issues).
- `src/config.ts` (`checks`, `test_changed`, `merge_checks`).

## Reproduction
Chart a leaf whose done-criterion names a slow repo-wide suite, then let it go through implement, review and one repair round. Count the full-suite runs across seats. Observed on `emdash-conversion`: 6 or more runs, each about 15 minutes when green.

## Expected behavior
Run each check once per commit, and never let untested code merge.

1. **Machine-recorded check evidence.** A runner (for example `akrogon check <name>`) executes a configured check and writes a record under the leaf: check name, command, commit SHA, exit code, wall time and log path. Agents cite the record and do not restate results in prose.
2. **Reuse by commit.** A seat skips a rerun when a passing record exists for the exact head it is judging, unless it names a specific concern. Any code change since the record means a rerun. Records from another SHA never count.
3. **Merge stays the hard gate.** merge-issue always runs the blocking checks on the final rebased commit before pushing, and refuses to push without a passing record for that SHA. Nothing that has not passed can merge, so reuse speeds up the A and B seats without lowering the bar.
4. **Repairs rerun only affected checks.** Replace "a full-suite rerun follows a repair" with running the changed-area tests plus the fast blocking checks. The full suite runs once at merge or in a scheduled main run, not after every repair.
5. **Criteria name area checks, not repo-wide suites.** Chart audit rejects done-criteria like "the whole framework is green" and asks for the checks of the areas the leaf touches. Repo health belongs to a post-merge main run (see tamdoma/framework#115).

Risk to avoid: trusting an agent's written claim. Reuse must depend only on the tool-written record matching the exact SHA, never on report prose.

## Urgency
High. Every leaf in a repo with a slow suite pays 15 minutes or more per seat per round, plus timeouts and reruns, and `emdash-conversion` blocked 6 dependent leaves for most of a day. Workaround: the operator manually tells seats to skip reruns and removes slow suites from `merge_checks`, as was done on 2026-10-01.

## Source: operator 2026-10-01
I pulled the new issue. use slot b which is already active (codex), and let's get this fixed.

## Agent findings
See slots/map-A.md, slots/map-B.md and slots/map-merged.md.
