# Design: busy-age-label

## Binding decisions, verbatim

### Status age (akrogon chart stuck-seat-recovery, operator 2026-09-28: "1a")
Answer: A. watch-issues labels the existing age as busy time (`A=<pane>/<status> busy=<h>h<mm>m`). No new state.
Reason: the number is total busy time, and a label says so with no new data.
Foreclosed: B, a recorded status-change time.

### Excluded decisions
- Restart hung seat Q1 and fault status 1a belong to pi-extensions leaves same-repo-worktree-cwd and admission-fault-no-block.
- Restart hung seat Q2 (no time limit, no restart verb): this leaf adds neither, and the watch-issues Never list is unchanged.

## Standing design

`/home/ivan/.claude/skills/chart-issues/assets/standing-design.md`

- Auth, backend mutations and secrets: not applicable.
- No vanity tests: tests assert the printed observer line for set, unset, unparsable and future `busy_since`.
- End-to-end: done-criterion 4 runs the observer script and records its output as the artifact.
- No human-only prerequisite and no credentials.

## Leaf architecture

Owned surfaces:
- `skills/watch-issues/scripts/observe.ts`: `ageSuffix` returns ` busy=<h>h<mm>m`.
- `skills/watch-issues/scripts/observe.test.ts:128-129` and any other expected lines.
- `skills/watch-issues/SKILL.md:28` format line.

Exclusions:
- No change to `busy_since`, `busy_notified` or `src/next.ts`.
