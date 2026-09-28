# Design: owner-defect-stop

## Binding decisions, verbatim

### Fix routing (akrogon chart failed-leaf-routing, operator 2026-09-28: "1a | 2a")
- Q1-A: the watch recognizes a failure that names a defect in another leaf's merged work, notifies once with the owner and the next step (chart a fix leaf, then resume the failed leaf at its failure phase), and stops once every remaining leaf is that failure or only waits on it. The operator charts the fix. Reason: the failed seat could not settle the fix itself (`live-replay/implementation/report.md:81`), so a human decides. Foreclosed: a watch repair door for settled fixes (B), and the watch charting unattended (1c).
- Q2-A: a defect in merged work becomes a new fix leaf. Merged stays terminal (`src/phase.ts:186`). Foreclosed: an `akrogon reopen` verb.

### Carried locks
- No time limit, tick counter or restart verb (stuck-seat-recovery, restart-hung-seat Q2-A).
- The watch never edits `issues/` (`SKILL.md:53`).

## Standing design

`/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`

- Auth, backend mutations and secrets: not applicable.
- No vanity tests: this is a skill prose change. Evidence is the done-criterion 5 walkthrough against real observer output.
- Negative and edge cases: a runnable independent leaf, an unknown `blocked-by` slug, an unreadable inventory, a busy seat, a merged leaf still under open, an unmerged or ambiguous owner, a credential failure with a blocked dependent.
- End-to-end: done-criterion 5 records the observer output and resulting action as the artifact.
- No human-only prerequisite and no credentials.

## Leaf architecture

Owned surfaces:
- `skills/watch-issues/SKILL.md` Judge (Waiting and failed-on-human-prerequisite bullets) and Stop section.

Exclusions:
- No change to `src/`, the observer script or its line format, `busy_since`, or the Never list.
- No failure-record schema field (`--owner`). The reason text is the input.
- Rewording framework `live-replay/design.md:46` is a consumer-repo edit, off route.
