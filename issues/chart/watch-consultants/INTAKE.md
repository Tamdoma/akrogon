# Intake: watch-consultants

## Scope

One destination, akrogon: `/watch-issues` starts consultant agents over hc when a leaf failure has no obvious fix, acts on their answer, and asks the operator only for what truly needs the operator; the consultant recipe lives in `~/.akrogon/config.yaml`. Grouping pending the map.

## Provenance

- GitHub: Tamdoma/akrogon#146
- Operator: 2026-11-21 door t126

## Source: Tamdoma/akrogon#146

# watch-issues has no way to consult another agent on a hard failure, so it stops and asks the operator

Source: Tamdoma/akrogon#146
URL: https://github.com/Tamdoma/akrogon/issues/146

Origin repo: Tamdoma/akrogon

Unverified intake.

## Operator decision (Ivan Juras, 2026-11-20)

- `/watch-issues` can start consultant agents when a leaf breaks or fails and the fix is not obvious, and acts on their answer instead of asking the operator.
- The watch asks the operator only for what truly needs the operator.
- Consultants are hc terminals. Questions and answers go both ways over `hc send` (Herdr Core), the way chart-issues talks to its consultants.
- The consultant's harness, model and effort (and the other launch settings) are set in the akrogon state folder (`~/.akrogon/config.yaml`), following the existing `slots:` + `harnesses:` convention, so the operator can change them without editing the skill.

## Observation

On 2026-11-20 in framework, a `/watch-issues` watch (cron, hc session `infra`) hit two failures it could not move alone:

- `repeats-move-to-verify` failed `blocked@implement` with a reason naming an operator step (chart an inputs leaf, then a new capture grant). The watch took no action for several ticks and asked the operator. When the fix leaf was charted, the leaf stayed `failed` until the operator said "move it so it doesn't fail".
- `domain-ready-command` failed at merge: `test:satellite-fixture-network` halts `RENDERER_RUNTIME_UNTESTED` because the host Bun moved 1.4.4 -> 1.4.5 (Tamdoma/tamdoma-framework#768). This red is on the base, so every later merge fails too. The watch could only relay the fix to the chart door and wait.

The operator then said: "do everything you can in order to fix them without asking me for permissions or what to do. If you need to consult on a harder problem, you can always spawn consultant sub agents like Fable 5.2 Medium to give you the solution by using the HC command from Herdr and the send functionality."

The watch skill has no rule for doing that.

## Location

- `skills/watch-issues/SKILL.md`: the Judge rule "Failed on a human prerequisite" (never recover, notify only) and the Never list ("Answer a seat", "Edit `state.yaml`, worktrees or `issues/`").
- `src/akrogon.ts:133-164`: `akrogon seat --slot <x>` already starts a consultant as a child of the calling hc terminal, but only with `--harness`, `--model` and `--effort` given as flags. Nothing reads a default from config.
- `src/seat.ts` `startConsultant`: launches the consultant from a `SlotConfig` through `harnessArgv`.
- `src/config.ts:17-37`: `slots.a` / `slots.b` hold `{harness, model, effort}` and are checked against the `harnesses:` templates. There is no consultant entry.
- `skills/chart-issues/SKILL.md:27`: door-created consultants ask the operator once for model and effort each session, with harness `pi` as a default for C.

## Reproduction

Run `/watch-issues` on a repo where a leaf fails on a cause that needs judgment (a base red, or a blocker naming an operator step). The watch notifies and waits on every tick. Seen every time this session.

## Expected behavior

See the operator decision above. Not provided beyond it.

## Urgency

High while the operator is away: one hard failure stops the leaf and anything blocked behind it until the operator returns. Today a host Bun upgrade blocked every merge in framework. Workaround: the operator reads the failure and tells the watch what to do.

## Suspected cause

The watch skill was written as a notify-only observer for any failure that needs judgment, and akrogon has no consultant recipe in config. Main condition: the Judge rules send every judgment case to `akrogon notice`, with no step that asks another agent. Contributing condition: `akrogon seat --slot` needs the recipe on the command line, so a skill can only use it by hard-coding or asking for a model.

- Whose view: reporter and agent.
- Files read: `skills/watch-issues/SKILL.md`, `src/akrogon.ts:128-175`, `src/seat.ts:335-380`, `src/config.ts:15-40,215-235`, `skills/chart-issues/SKILL.md:25-29`, installed `~/.akrogon/config.yaml` (`slots`, `harnesses`).
- Not inspected: how a cron-run watch (not inside a door) would be the parent terminal for `akrogon seat --slot`, which needs `HC_TERMINAL_ID`. Not inspected whether the Never list items should change or only gain a consult step.
- Related reports: Tamdoma/akrogon#33 (watch idles on a failed leaf whose blocker names a fixable owner, closed), Tamdoma/akrogon#135 (watch cannot confirm prompts, so work stalls, closed), Tamdoma/akrogon#35 (watch cannot restart a hung seat, closed). Searched Tamdoma/akrogon, all states: "watch consultant" (limit 10), "watch-issues" (limit 15), and my reports since 2026-11-18 (limit 30). None covers consultants.

## Source: operator 2026-11-21 door t126

"ok, chart it out. slot b consultant: codex astra 6.2 high, slot c consultant: agy neon high."

"Full autopilot mode."

"I'll do the signposts myself, ok"

## Agent findings

- Decision section `## Operator decision (Ivan Juras, 2026-11-20)` counts: author ivanjuras reads `admin`, no body edits (totalCount 0, lastEditedAt null), pull at 2026-11-21T17:11:18Z. Written as forks/seed-decision.md.
- The watch now runs from its own conversation through `skills/watch-issues/scripts/timer.ts` (watch-any-harness, merged 1502fbdf); the watching conversation is an hc terminal, so `HC_TERMINAL_ID` is set there. The seed's "cron-run watch" question predates that change.
- `src/akrogon.ts` `seat` case: `--slot` requires `--harness`, `--model`, `--effort` flags; nothing reads a consultant default. `src/config.ts` `globalSchema.slots` is a strict object holding only `a` and `b`.
- `skills/watch-issues/SKILL.md` Judge "Failed on a human prerequisite" never recovers and notifies; Never list forbids "Answer a seat" and "Edit `state.yaml`, worktrees or `issues/`".
- Grounding index: none configured (`akrogon config` grounding: none), reported as a gap.
