# Review B: merged-siblings-rule

Blind initial review; peer review not read. `debate: no`, so no debate artifacts expected.

## Scope

- Base: `20926c68f7664015b23ea0224147f69059d5b881` (`20926c6`).
- Reviewed head: `045dd11` on branch `merged-siblings-rule`, one commit ahead of base.
- Diff: exactly `skills/watch-issues/SKILL.md`, 1 insertion, 1 deletion. No file under `issues/` on the branch. Worktree clean.

## Checks against plan, design and live contracts

- Bullet content and order match the design's literal interface verbatim: owner-folder read → any-unmerged branch → all-merged branch (`next` once, re-observe, command-error rule, open-alone-not-error) → unreadable-gap branch. AC1 holds.
- Wording names "the leaf's top-level owner folder under `issues/open`, an issue or an epic", covering the epic grouping case. AC2 holds. Concrete scenario walks correctly: epic E with L1 merged / L2 open → watch reads states beneath E, finds L2 unmerged, reports L1 waiting on siblings with no `next`; after L2 merges → single `next`, re-observe, command-error rule on failure.
- One file differs from base; observe format, `src/`, `tests/`, `docs/`, other skills untouched. AC3 holds.
- No new heading, field, command or file; single-line diff leaves the Never list byte-identical; the prose performs a read-only tree read, no `issues/` edits. AC4 holds.
- Changed behavior's doc page is the skill itself (the changed file), opened and verified above. No other doc states the rule: `grep "Merged still under open" docs/` empty, and the old wording "report the completion error" is gone from `docs/`, `skills/` and `src/`. No other documented behavior changed.
- No `AREA.md` in the diff, so no path-existence sweep applies.

## Verification evidence

- Report evidence complete: root `bun test` 287 pass / 0 fail, skill suite 20 pass / 0 fail, docs-links 3 pass, typecheck clean, format unchanged.
- Reviewer reran independently: `bun test tests/docs-links.test.ts` → 3 pass, 0 fail. Full-suite rerun not needed: prose-only change, no code touched, report evidence complete and current.

## Observation (no verdict impact)

B executed `brief-1.md` inline after `subagent_spawn` failed twice with an immutable session-settings error (`unsupported-effort`). The report records this with the exact error. The diff is byte-identical to the briefed work and no done criterion, blocking check or contract is affected, so this is neither a Fix nor a Nit.

## Findings

None.

## Verdict

`ready`
