# Design: skills-never-ask

## Binding decisions, verbatim

### forks/ask-tool-availability.md
2026-09-19 operator: "4a". Q1 taken: `--exclude-tools request_user_input` is added to the pi harness template in akrogon config; no pi-extensions change; rule recorded that execution processes never chart; existing idle execution panes are relaunched once at rollout. Foreclosed: a per-pass switch in pi-extensions, prose-only. (The config change is an operator step; this leaf carries the prose half.)
2026-09-19 operator: "1a" on the reshaped Q2 (originally Q5). A seat at a human-only blocker writes the blocker and the exact operator action into its current pass artifact, runs `akrogon phase <slug> failed --reason <text>` referencing it, and ends the pass without a question. Return path: `akrogon status` shows the cause and text; the operator fixes the prerequisite and runs `akrogon phase <slug> <interrupted phase>`; the next herdr event or `akrogon next <slug>` redispatches. Contract additions: the move out of `failed` with cause `blocked` skips requireClean; `failed -> check.fix` is legal; failed leaves do not count toward max_active. No automatic resolution of a human-only prerequisite. Foreclosed: report-only without the stop; counting failed leaves toward capacity. (Contract additions are owned by failed-with-cause.)

### forks/blocked-ends-attempt.md
2026-09-19 operator: "1a | 2a | 3a". Q1: `akrogon phase <slug> failed --reason <text>` becomes legal from every active phase. (Owned by failed-with-cause; this leaf's prose points at it.) Correction 2026-09-19 after Tamdoma/akrogon#21, verbatim: "The herdr blocked cannot work like this. The child asking the parent is not a blocking event." The seat-declared stop is the only entry; no event-driven stop exists. Q2 and Q3: excluded here.

### forks/push-notification.md
2026-09-19 operator: "2a" and "7a": excluded here, owned by failure-attention.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation: "An unforeseen physical blocker ends the attempt and informs the operator" becomes the stop command; "Credential access alone never qualifies" means a seat reads .env itself, and only a value that is absent and unobtainable is a blocker.

## Leaf architecture
Owned: skills/plan-issue/SKILL.md, skills/implement-issue/SKILL.md, skills/check-issue/SKILL.md, skills/merge-issue/SKILL.md, skills/broadcast-issue/SKILL.md, skills/AREA.md. Prose only.
Interfaces: `akrogon phase <slug> failed --reason <text>` from failed-with-cause. The pass artifact is the one the skill already writes (plan.md, report.md, the review file); the reason names it.
Exclusions: chart-issues (installed under ~/.claude/skills, attended, asks by design); the harness template (operator config).
Dependencies: failed-with-cause.
