# Chart: akrogon

## Destination
A chart decision that needs an edit on main is delivered, not dropped. Check entries name repo-owned entry points so leaves change check behavior in code. Framework's `test_changed` runs its existing selector.

Route: lifecycle (debate no)

## Forks taken
- [Check entry points](forks/check-entry-points.md): 1d, config check entries name a repo-owned entry point; init proposes one where it exists.
- [Waiting edit](forks/waiting-edit.md): 1a, the original GitHub issue stays out of the leaf's `sources` and open until the door makes and verifies the edit, then closes it; unsourced charts name the edit as an operator step at handoff.
- [Framework switch](forks/framework-switch.md): 1a, done 2026-10-12; framework test_changed is `bun run test:changed` (break run failed in 8 s, main passed in 237 s).
- [Init verified](forks/init-verified.md): 1a, verified means a changed test was seen to run, or the full suite; a clean exit is not enough.

## Open forks
None.

## Pending operator steps
- Run `akrogon sync` in framework (owner: operator) so the `test_changed` switch in framework's registered root reaches origin. Check: `git show origin/main:issues/config.yaml` in framework shows `test_changed: bun run test:changed`. Pending.

## Fog
None.

## Off route
- merge_covers redesign and duplicate-check cleanup: not the cause; framework operator choices.
- #86 flake handling, run counts, check scheduling: changed-test-proof and check-reruns locks.
- Seed-issue reminders for waiting edits: operator wants GitHub issues to hold only actual issues.

Handed off 2026-10-12
