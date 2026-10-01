# Review A: wave-table

Base: 2b796e98a2da6f914332e736974b93a0bc645715. Reviewed head: a055f6417629f2d6b79fa9f870303a7d2f2bdf18. Worktree clean. No file under `issues/` in the diff.

Verdict: nits

## Fixes

None.

## Criteria

1. Met. `skills/plan-issue/SKILL.md:55` states the wave-grouped checklist, per-unit owned paths, shared test resource, prerequisites, the shared-wave condition, later-wave placement, same-prerequisite sharing and the cap of 3. The affected-docs sentence is unchanged.
2. Met. `worker-protocol.md:11` runs each plan wave whole, lists the only reasons a unit leaves a wave, groups an unwaved plan from sub-brief records and keeps the standalone clause. `SKILL.md:44` adds whole-wave runs and inline wave order. `brief-template.md:21` carries wave values and groups only without a plan grouping. `grep -rn "one at a time when unsure" skills docs` finds nothing (exit 1).
3. Met. The check.fix paragraph groups repair sub-briefs by the same rule. The existing last-round self-repair rule is intact.
4. Met. `skills/AREA.md:21`, `docs/guide/phases.md:77` and `:87` agree with items 1-2. No other page under `docs/` or `skills/` describes the checklist or waves (grep).
5. Met per the report: format, typecheck, `bun test` (353 pass) and the changed-tests command (148 pass) all exit 0. Not rerun: the diff since the report is unchanged and the report is by the same head.

The branch also carries operator commit `2dd1106` (removes one TMPDIR assertion in `tests/next.test.ts`) from the earlier recovery. It is outside the leaf's owned paths and is the reason `bun test` is green.

## AREA.md path listing

`skills/AREA.md` names paths that all exist except `scripts/observe.ts` (line 15, not in this diff). Bare command words (`bun`, `test`, `install`) are not paths.

## Docs

`docs/guide/phases.md` was opened for the changed behavior and now matches the skills. Plan decision D10 shared-file note: this leaf edited only the named sentences, so `proof-order` rebases cleanly in principle.

## Nits

- N1. `skills/AREA.md:15` points at `scripts/observe.ts`, which does not exist in the checkout. Reproduction: `ls scripts` fails. Deferred: the line predates this leaf (not in its diff) and the `watch-issues` area is excluded by the design. Promote to a Fix with evidence that watch-issues routes an operator to that path today, or a done-criterion naming it.
- N2. The check.fix sentence is long because the grouping clause sits mid-sentence. Deferred: it reads correctly and the dense paragraph style matches the file. Promote with a reviewer misreading it.
