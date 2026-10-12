# Report: main-step-rules

Prose-only leaf. Three commits on the leaf branch (base 013f7c3, head d637cf4), one per wave-1 unit, delivered by three workers in detached worktrees and cherry-picked serially.

## Changed files and reasons

- `skills/chart-issues/assets/shapes.md` (d637cf4) — CHART.md template: `## Off route` comment now bars a needed main step and names the door's make-and-verify duty; new `## Pending steps` section carrying exact edit, owner, prerequisite leaf and check (D1, D3). One-completion-owner paragraph gained the stated exception: identity withheld from `sources` of every leaf whose completion could close it, stays open under `akrogon pull`, door later makes/verifies the edit and runs `akrogon close <id> --by <text>` (D2). `issues/` refusal tail reroutes main-step work to the door pass or Pending steps, never Off route. Fork-rules sentence at :92 checked and left unchanged — it covers ruled-out work only, not waiting steps.
- `skills/chart-issues/SKILL.md` (d637cf4) — source-close paragraph (:35) gained the D2 exception; `## Handoff` gained one sentence routing needed main steps and waiting edits through the door and the shapes.md records.
- `skills/init-akrogon/SKILL.md` (b748f77) — proposal paragraph: each check proposed as a repo-owned entry point (package script or repo file run by its native tool) when one exists, otherwise the runner command; stored entries not migrated; setup/flock/run-check wrapping stays (D4). Verification sentence at :82 defines verified `test_changed`: changed test seen selected and run against a base with changes, or the full suite ran; clean exit alone does not count; base may be read inside the entry-point script (D5).
- `docs/guide/chart.md` (e3e3430) — Off route paragraph now states all three rules in guide language: needed main steps are never Off-route work, merge-blocked edits keep the report out of `sources` until the door closes it, unsourced charts list waiting edits in CHART.md as pending operator steps (D6/criterion 6).

## Commands run

- `bun test --changed=013f7c3...` in each worker worktree and on the lane: 0 tests affected (prose-only diff), exit 0.
- `checks.format` (`akrogon run-check`): prettier clean, tree unchanged.
- `checks.typecheck`: `tsc --noEmit` clean.
- `checks.test`: `bun test` 843 pass / 0 fail, 75.29s (minutes-sized, wall time recorded).
- Stale-rule grep (`docs/`, `skills/` for "operator step on main", "Off route", "verified test_changed"): no unowned hits; shapes.md:92 sentence verified non-contradicting (ruled-out work only).

## Criterion proofs

| # | Proof | Result |
|---|-------|--------|
| 1 | Readback shapes.md `## Off route` comment + SKILL.md Handoff | Present: never Off route; door makes and verifies during pass when precondition exists, config via `akrogon config` at registered root |
| 2 | Readback shapes.md completion-owner paragraph + SKILL.md :35 | Stated exception present; withheld from every closing leaf's `sources`; `akrogon pull` + `akrogon close <id> --by <text>` named |
| 3 | Readback CHART.md template `## Pending steps` | Present with exact edit, owner, prerequisite leaf, check |
| 4 | Readback init-akrogon proposal paragraph | Entry-point-first and no-migration stated; wrapping noted as staying |
| 5 | Readback init-akrogon :82 | Real-run definition present; clean exit does not count |
| 6 | Readback chart.md :128 | All three rules in guide language, existing sentences kept |
| 7 | `git diff --name-only 013f7c3...HEAD` | Only the four owned files; no src/, tests/, issues/, config, or other-skill diffs |

## Refreshes

Opening Shared-context refresh: branch already at origin/main (013f7c3), no rebase needed. No mid-pass refresh required; no conflicts.

## Known limitations

None known. Prose rules have no mechanical test by standing-design ("no vanity tests"); proof is readback plus blocking checks, all green.

## Unverified criteria

None.
