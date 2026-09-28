# Review B: owner-defect-stop

Base: `d5b27353fd3ecd3fb59325fb94e6547c85e6893b`. Reviewed head: `758039c`. Worktree clean, head ahead of base, no files under `issues/` on the branch. Blind review; no peer review read.

## Diff

`skills/watch-issues/SKILL.md` only, 3 lines changed: Waiting bullet, Failed-on-human-prerequisite bullet, Stop section. `git diff` on `src` and `skills/watch-issues/scripts` is empty; Never section byte-identical. No `AREA.md` in the diff. Design exclusions hold: no `--owner` schema field, no observer or line-format change, no consumer-repo edit.

## Criteria check

- C1: Failed bullet admits defect-in-merged-work reasons, resolves the named owner against readable `issues/open` inventory (merged only, never reopened), carves unmerged-owner attribution out to failed-otherwise, and reports missing/ambiguous ownership unresolved without assignment. Operator fix-leaf plus resume step present in the notice body.
- C2: Waiting bullet runs no `next` for leaves blocked on unmerged leaves, reports them as waiting on that prerequisite, reports unknown slugs as gaps, and scopes `--all` to unblocked leaves. The `next --all` non-throw claim matches `src/next.ts` explicit=false behavior.
- C3: Stop closure covers merged, failed-with-shown-evidence (defined as `delivery=shown` or notice shown this fire), and waiting chains to such failures; all four blockers (unreadable inventory, unknown slug, runnable leaf, busy seat) are named.
- C4: First recognizing fire sends one owner-defect notice naming failed leaf, failure phase, owner or unresolved candidates, waiting dependents, the settle/chart/resume next step, and the stop/restart note; it replaces the generic notice, original `delivery=shown` does not satisfy it, no persistent state is added, and other human-prerequisite failures keep the generic notice with no fix-leaf instruction.
- C5: Walkthrough artifact `/tmp/owner-defect-stop-4wDXq7/owner-defect-stop-walkthrough.md` holds all six runs with verbatim observer output and per-leaf judgments showing one notice per newly recognized failure, no stop while runnable work remains, and no fix-leaf instruction for the credential case. I re-ran the observer against the preserved case-a and case-c fixtures with the preserved stubs; output matches the artifact's unshown variants exactly.
- C6: verified by the exclusion sweep above.
- C7: report pastes format/test/typecheck passes on this head (306 pass, 0 fail); head unchanged and tree clean, so no rerun per the rerun rule.

## Docs

`docs/guide/in-practice.md:89` still reads correctly at guide abstraction: waiting leaves chained to a reported human-prerequisite failure are waiting on a reported human prerequisite, and merged leaves under open complete via the Merged-still-under-open rule rather than block. No documented behavior changed at guide level; no doc edit needed per plan D6.

## Findings

No Fixes. No Nits.

## Verdict

`ready`
