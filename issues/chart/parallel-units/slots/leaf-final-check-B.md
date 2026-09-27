R1. Cleanup order conflicts. Draft `parallel-chunks/brief.md:10` requires worktree removal before lane checks, while `design.md:32` runs changed tests before removing each worktree and leaves siblings present. Choose one explicit order. Otherwise done-criterion 1 and the binding execution rule cannot both be followed literally.

R2. The ignore guarantee is false for supported custom configurations. `src/init.ts:53–55` ignores the configured worktree root, not always `issues/worktrees/`. Draft `design.md:12` assumes the latter universally. Keep the selected path, but specify ignore handling within the owned skill prose instead of relying on initialization.

R3. Mandatory checkpoint and final commits fail on clean lanes. Draft `design.md:31,35` requires both even when worker cherry-picks already contain all changes. Say to commit pending accepted edits when present and otherwise reuse HEAD. Do not require empty commits.

R4. Dependency recording contradicts the chart. `issues/chart/parallel-units/CHART.md` says the akrogon leaf depends on pi-extensions#4 and dispatch is operator-ordered. Draft `design.md:37` says “Dependencies: none.” Record the external operational prerequisite explicitly, distinguishing independently deliverable prose from actual three-worker execution.
