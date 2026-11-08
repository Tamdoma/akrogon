# Review A: chart-door-on-hc (check.review, initial, blind)

- Base: `e3202dff` (`AKROGON_BASE`, equal to `origin/main`). Reviewed head: `064dd523` (same tree as `22e923c4`).
- Verification evidence: `akrogon verify` green on `22e923c4` (`verify test: 0 .../check-test-1794108194417-3105124.log`, 1161 tests, 84.38 s), which runs the criterion 1, 3 and 5 test files; `check c8: 0 .../check-c8-1794108105142-3105003.log` on `22e923c4`. No check rerun in this pass (no code change since, no specific concern about the checks).
- AREA listing (one command over the paths `src/AREA.md`, `skills/AREA.md`, `tests/AREA.md` name, resolved against their folders): every path the diff adds exists (`skills/chart-issues/scripts/{chart-usage,direct-guards,door-reset,transcript}.ts`, `skills/chart-issues/assets/{questions,shapes,standing-design}.md`, `tests/door-exchange.test.ts`, `tests/door-reset.test.ts`, `tests/door-agent.ts`). The two names the listing could not resolve (`.d.ts`, `reconcile-host.json` in `src/AREA.md`) are not in this diff.
- Docs: `docs/reference/skills.md` (consultant definition) matches the new behavior. `docs/use/plan-work.md:26`, `docs/use/autopilot.md:9,29`, `docs/use/a-working-day.md:28` still say Herdr or "helper panes" (Nit N1).
- Live surface: the handover literal `hc run ... -- bun <skill-folder>/scripts/door-reset.ts` needs `bun` on a new terminal's PATH in the operator's real session; the infra core (pid 933463) has `/usr/bin` on its PATH and `bun` is `/usr/bin/bun`. Terminals get the login session's environment (`hc --skill`).

## Fixes

### F1: the skill gives consultant C no model, which the start verb requires

- Where: `skills/chart-issues/SKILL.md` `## Open`: "asking once for the harness, model and effort of each created consultant except C, which defaults to `pi` with the lowest effort its template takes". The start verb refuses an empty model (`src/akrogon.ts:163`, `model: z.string().min(1).parse(values.model)`), and the `pi` template needs one (`pi --model {model} --thinking {effort} ...`, `~/.akrogon/config.yaml`).
- Realistic source: the operator opens a door and asks for consultants without naming terminals, the usual way doors get consultants (signposts: keep today's behavior; today C is `pi` with empty argv and pi picks its own default model).
- Consequence today: a door following the text has no model for C and must invent one (or ask, against "except C"); "the lowest effort its template takes" names no value either. The invented model is then recorded as C's restart recipe.
- Gap: brief What ("consultants are started and restarted through the engine's start verb"); design start-and-pane Q4 (the verb derives the launch from what it is given) and the signposts correction to keep today's behavior. Repair is skill text: give C's model and effort a defined source (for example, ask once for every created consultant's model and effort, with C's harness defaulting to `pi`).

### F2: criterion 2's proof predates a change to the exchange text the door followed

- Where: both criterion 2 rounds ran on `afd49c99` (door t1f, 04:02-04:14). `22e923c4` (04:20) then changed `skills/chart-issues/assets/questions.md` Asking (pre-send status source) and Waiting (state read only from the wait's JSON, no `hc get` between waits), the sections the door was told to follow (`implementation/door-round/door-prompt.txt`). plan.md criterion 2: "Rerun: skill text change in collection or drop rules".
- Realistic source: the next real door session follows the changed Waiting and Asking text, which no real door has run.
- Consequence today: the criterion's live property (a real door judging a real silent consultant under the ported text) is unproven on the reviewed head; the report states it was not rerun because the grant's 9 sessions were used.
- Criterion: brief criterion 2 (attended paid run under this leaf's grant). The rerun needs sessions beyond the grant's bound, so it is recorded under Operator actions; the proof itself is a check.repair live proof once approved.

## Operator actions

- OA1 (gates criterion 2): approve a renewal of `readiness.yaml` `grants[0]`: "2 more harness sessions after `22e923c4`" (one Claude door in auto mode, one claude-haiku-5-5 consultant, same targets, cleanup and stop line), so the criterion 2 round reruns on the repaired head. Tried: none (check.review launches no covered operation). Identity: operator user ivan. Observed: `implementation/report.md` count lines reach 9 of 9 ("Bound reached: 9 of 9 sessions; no further launch").

## Nits

- N1: `docs/use/plan-work.md:26`, `docs/use/autopilot.md:9,29`, `docs/use/a-working-day.md:28` say Herdr or "helper panes". Deferred: the design's exclusions give wording outside the chart skill to herdr-sweep, and the plan lists them as handed over. Promote if herdr-sweep is dropped or merges without them.
- N2: consultants B and C were launched by the door's own `akrogon seat` calls, not through `akrogon run-check`; they are counted (launches 8 and 9) and the door launch itself ran through run-check (`check-c6-door-start-*`). Deferred: criterion 6 requires the door itself to start them. Promote if a count line or launch were missing.
- N3: `door-reset.ts` checks its preconditions (known transcript, supported kind) after A's turn has moved on, so a refusal reaches only the log, where today's helper refused before forking. No realistic source reaches it: a claude, codex or pi door at handover has run shell commands and resolves (report F3), and the skill keeps other kinds out of handover. Promote on a real door whose handover log ends at `started` with a refusal.

## Grant audit

Count lines 1-9 match the launches in the artifacts: `check-c4-start-*` (3 sessions), `check-c4r2-start-*` (3), `check-c6-door-start-*` (1), consultants t1g and t1h started by the door (2). Prompts per session at most 4. No unexplained paid activity. Cleanup and absence check recorded; `retained` holds the one Claude trust entry.

## Verdict

fix (F1, F2; OA1 gates criterion 2)
