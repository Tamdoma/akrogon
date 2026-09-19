# Where execution loses the ability to ask

## Question

### Q1 · Is the question tool removed from execution seats at the tool (pi-extensions honours a launch context akrogon supplies) or only by skill prose?
### Q2 · What does a seat do at a genuinely human-only blocker: end the pass with the operator step in report.md, or something else?

### Carries
- Operator 2026-09-19 verbatim: "No questions after chart-issues".
- Charting stays interactive: the same pane may run chart-issues, which asks by design.
- Related: `blocked-ends-attempt.md`.

## Findings
- (both) The policy is attached to the tool's promptGuidelines and "disappears automatically if you intentionally disable the tool" (~/.pi/agent/extensions/tamdoma-request-user-input/README.md, Default interaction policy, read 2026-09-19).
- (both) skills/implement-issue/SKILL.md:39 tells the seat to tell the operator and wait. skills/plan-issue/SKILL.md:55 records missing credentials under operator actions. Both need the no-questions rule.
- (B) Disabling the tool does not stop prose questions, so the skills must say it too. The exact pi activation API and session-reuse behaviour need verification in pi-extensions before a contract names it.
- (A) The harness template is one line (`pi --model {model} --thinking {effort} -a`, config harnesses); an env value set by allocate is the smallest interface, but the pi side owns whether it reads env or a flag.

- (A, from `pi --help` 2026-09-19) `--exclude-tools, -xt <tools>` disables named built-in, extension and custom tools at launch.
- (B rebuttal) `allocate()` reuses recorded panes and the harness template runs only when `pane.agent === null` (src/next.ts:389-404), so seats already running keep the tool until relaunched once. Rollout step, operator-owned.
- (B rebuttal) The carry "the same pane may run chart-issues" becomes a rule: akrogon-launched pi processes are noninteractive; charting uses a separate or restarted pi.

## Taken (partial)
2026-09-19 operator: "4a". Q1 taken: `--exclude-tools request_user_input` is added to the pi harness template in akrogon config; no pi-extensions change; rule recorded that execution processes never chart; existing idle execution panes are relaunched once at rollout. Foreclosed: a per-pass switch in pi-extensions, prose-only.
Q2 open. Operator 2026-09-19 verbatim: "5 - probably A, but How do I get back to it? And can it be automatically sold so that the whole thing keeps moving without waiting for me for hours or the entire night?"

### Q2 findings after B's focused check (slots/final-check-B.md)
- (B) `failed -> check.fix` is missing from src/routing.ts:35-38; every move runs requireClean (src/phase.ts:117), so a preserved dirty worktree cannot be resumed today; `phaseCommand` only moves state, redispatch comes from the next herdr event or `akrogon next <slug>`.
- (B) `activeCount` counts failed leaves whose tab or worktree still has a live pane (src/next.ts:264-274), so stopped attempts can hold every slot and block independent work.
- (A) Proposed: the move out of `failed` with cause `blocked` skips requireClean, since the dirty work is what the stop preserved; failed leaves do not count toward max_active; the interrupted seat is idle (no ask tool under 4a), so no pending session remains.

## Taken
2026-09-19 operator: "1a" on the reshaped Q2 (originally Q5). A seat at a human-only blocker writes the blocker and the exact operator action into its current pass artifact, runs `akrogon phase <slug> failed --reason <text>` referencing it, and ends the pass without a question. Return path: `akrogon status` shows the cause and text; the operator fixes the prerequisite and runs `akrogon phase <slug> <interrupted phase>`; the next herdr event or `akrogon next <slug>` redispatches. Contract additions: the move out of `failed` with cause `blocked` skips requireClean; `failed -> check.fix` is legal; failed leaves do not count toward max_active. No automatic resolution of a human-only prerequisite. Foreclosed: report-only without the stop; counting failed leaves toward capacity.
Together with the earlier "4a" every question in this fork is taken.

### Measurements 2026-09-19 (operator request: prove the API during charting)
- `pi -p --no-session --exclude-tools request_user_input "<list your tools>"` listed exec, wait, subagent_*, ffgrep, fffind, apply_patch, exec_command, view_image, write_stdin and no `request_user_input`. Control run without the flag listed `functions.request_user_input`. The flag removes the tool from a launched pi process as documented. Whether the promptGuidelines also vanish rests on the extension README; the model's self-report was NO in both runs, so that line is not measured.
