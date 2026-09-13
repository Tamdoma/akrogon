# How do the other registered repos migrate and what about running work?

## Question
Q7 Who migrates the charts in framework (7 live, 4 closed) and pi-extensions (1 closed) once the command reads the new names?
Q8 Does anything wait for the running framework issue `legacy-scripts-retirement`?

### Carries
- Taken: rename on disk, status.ts follows, all akrogon charts migrate (disk-names.md).
- Skills are one global symlink, so every repo's chart door changes the moment the akrogon leaf merges and the command reinstalls.

## Findings
- (A) Leaves never read chart files. `retire-issue-scripts` in implement and `root-linter` in plan.synthesis are unaffected by the rename.
- (A) `blocked-by` resolves inside one repo only (src/state.ts:149), so cross-repo order is dispatch order, not a state field.
- (A) After the command reinstalls and before a repo migrates, `status --charts` there shows every chart as 0/0 empty. Nothing breaks, the count is wrong.
- (A) The chart folder moves at close (src/phase.ts:103) by owner name only, so folder contents are irrelevant to the move.
- (A) A leaf writes only in its own repo worktree, so the akrogon leaf cannot migrate framework.

## Taken
Operator, round 3: "7a | 8a | Keep in mind, this has to be done in pi-extensions and portal as well. The others don't have akrogon, yet."
Q7: one `migrate-charts` leaf per repo holding charts, dispatched after the akrogon leaf merges and the command reinstalls. Reason: no new code, the leaf leaves a record. Closed: a migrate subcommand, dual-format parsing.
Q8: nothing waits for `legacy-scripts-retirement`. Reason: leaves never read charts and that issue never touches issues/chart. Closed: waiting.
Portal correction: /home/ivan/Work/infra/tamdoma/portal has issues/config.yaml and issues/worktrees only, no charts, no open or closed leaves, and is not in `akrogon config` repos. There is nothing to migrate there and no registered destination for a leaf. It picks up the new format on its first chart. Repos with charts: akrogon (2 live, 8 closed), framework (7 live, 4 closed), pi-extensions (1 closed).
