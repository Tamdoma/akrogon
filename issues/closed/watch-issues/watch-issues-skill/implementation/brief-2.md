# Brief 2: SKILL.md and install test assertion

Worktree: `/home/ivan/Work/infra/akrogon/issues/worktrees/watch-issues-skill`

## 1. Goal

Write `skills/watch-issues/SKILL.md` — the complete operator-facing watch procedure an agent can follow without the chart — and add one assertion to `tests/install.test.ts`. Plan decisions D6–D8, D10; brief done-criterion 3 and 4.

## 2. Acceptance criteria

1. SKILL.md carries, in prose an implementer can follow without the chart: the three invocations with their zero/one/several job behavior; the judgment rules for waiting, merged-under-open, failed human prerequisite, failed otherwise, busy, looping or off-scope seat (evidence, the stop-and-resteer sequence with the pane read before prompting, the once-per-seat bound, subagents through the parent, all harnesses), and command error; the recovery bound computed from `issues/log.jsonl`; the notification evidence rule; the quiescence prerequisite with a fresh state read; the stop rule with one `akrogon next` for a merged leaf under open and the error reported when it stays; the Claude Code requirement and the refusal to claim a watch elsewhere; the Bash timeout rule; and the never list.
2. `bun test tests/install.test.ts` passes with `expect(skills).toContain('watch-issues')` added to the first test.
3. SKILL.md frontmatter has `name: watch-issues` and a description naming the operator-invoked purpose; the reply contract is at most five lines per fire.
4. Every command string in SKILL.md is literal and correct against the interfaces in section 4.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Leaf `design.md` — the `SKILL.md sections` paragraph is the authoritative content spec; copy its rules faithfully.
- Leaf `plan.md` — D5 line format, D6 required-seat table, D7 recovery-bound algorithm, D8 command cwd rules, implementation notes (`OBSERVE_AKROGON`, `--lines 80` everywhere).
- `issues/chart/watch-issues/forks/watch-policy.md` and `forks/seat-loops.md` `## Taken` blocks — verbatim operator intent behind each rule.
- `skills/broadcast-issue/SKILL.md` — frontmatter and prose conventions.
- `skills/plan-issue/SKILL.md` — example of a phase-skill voice (do not copy its footer; this skill has none).
- `src/routing.ts` — `requiredSlots` incl. `check.review` A-only when `fix_rounds > 0`.
- `src/log.ts` — `log.jsonl` record fields for the recovery bound.
- `skills/watch-issues/scripts/observe.ts` — the actual line format and env overrides to document verbatim.
- `tests/install.test.ts` — insertion point for the assertion.

## 4. Change list and needed interfaces

- `skills/watch-issues/SKILL.md` (new). Required literal commands: `bun <skill-folder>/scripts/observe.ts <root>`; `herdr agent read <pane> --lines 80`; `herdr agent send-keys <pane> esc`; `herdr agent wait <pane> --timeout 10000`; `herdr agent prompt <pane> "<evidence>; the brief wants <target>; next: <step>"`; `herdr notification show "<repo>/<slug> needs you" --body "<reason>" --sound request`; `akrogon next <slug>`; `akrogon next --all`; `akrogon phase <slug> <failure.phase>` (no `--slot`); CronList/CronCreate/CronDelete with job identity the exact prompt `/watch-issues tick <root>` and schedule `*/20 * * * *` recurring. Document `OBSERVE_HERDR`/`OBSERVE_AKROGON` as test-only overrides in one line. All akrogon commands run with cwd `<root>`; only read-only commands sit under a Bash timeout, `next`/`phase` never do, and an interrupted mutation is re-read before anything else.
- `tests/install.test.ts`: inside the first test (`install creates all four absent harness roots...`), add `expect(skills).toContain('watch-issues');` near the top. Nothing else changes.

SKILL.md structure: frontmatter; `## Invocations` (three forms; zero jobs → create on `/watch-issues` only when the check did not already satisfy the stop rule, report id and 7-day expiry; one → report; several → report, never create or delete; `tick` never creates; `stop` deletes the one, zero reports already stopped, several reported without deleting; Claude Code only — when CronCreate is absent say so in one sentence and claim no watch); `## Observe` (script under Bash timeout, env overrides, `agent read` when evidence warrants, `issues/log.jsonl` filtered by repo+slug for the bound); `## Judge` (one rule per case exactly as design lists them, including: waiting → `next <slug>`, several → `next --all` from root; merged-under-open → one `next`, report the completion error if it stays; failed with human-prerequisite reason or `unknown` record → never recover, notify when `failure.delivery` is not `shown` and this fire has not shown it, either evidence counts for the stop rule; failed otherwise → fresh state read, every required seat of `failure.phase` idle or absent, cycle count from the log where a `failed -> P` whose next record for that slug is `P -> failed` is unproductive, two consecutive cycles → notify-only, missing/malformed log → unknown → notify-only, else `phase` then `next`; busy → 80-line read per busy seat judged against the brief, working/long-command → nothing, loop evidence (same command or edit 3+ times same result, 3+ consecutive errors, edit-undo) or concrete off-scope action or hung tool with concrete evidence → `esc`, `agent wait --timeout 10000`, pane read confirming idle seat + empty input + same session else notify, one corrective prompt naming evidence/brief target/next step and a looping subagent by name so the parent corrects it; mid-turn steer only when tools visibly complete; same seat looping next fire → notify with evidence, never a second stop; insufficient evidence → say so, no action; `next`/`phase` error → re-run observe, report, no further mutation this fire); `## Stop` (after judging: observe prints no leaf, or every leaf failed on human prerequisite with shown evidence → CronList, delete the one exact-prompt job, say so; several matches reported, none deleted); `## Never` (kill an agent process, close a pane, `esc` twice on one seat per watch, `phase failed`, edit `state.yaml`/worktrees/`issues/`, open `.env`, answer a seat, create a job from a tick, Bash timeout on `next`/`phase`); `## Reply` (≤5 lines per fire). Include the required-seat table (D6) and the observe line format (D5) verbatim.

## 5. Do-not, reasons and exceptions

- Do not edit `scripts/observe.ts`, `observe.test.ts`, package files, or any `src/` file — unit 1 owns the script, `src/` is excluded by the design; if the observe line format in the script disagrees with D5, return a mismatch with evidence instead of editing either side.
- Do not add a footer section, phase calls, or lifecycle duties to SKILL.md — this skill is operator-invoked, not a phase skill; no exception.
- Do not invent commands or flags not listed in section 4 — every string must be literal; no exception.
- Do not weaken any rule to shorten the file — completeness is criterion 1; the exception is none.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B.

Restated: only the two named files change, no invented commands, no weakened rules, no lifecycle machinery; conflicts come back as a mismatch.

## 6. Ordered steps

1. Read observe.ts's final output format and confirm it matches D5 (criterion 4).
2. Write `skills/watch-issues/SKILL.md` (criteria 1, 3).
3. Add the assertion to `tests/install.test.ts` (criterion 2).
4. Run `bun test tests/install.test.ts` from the worktree root (criterion 2).

Advisory size: about 2 files and under 10 turns.

## 7. Commands

- `bun test tests/install.test.ts` (from worktree root)
- Root changed-tests: `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE"` with `AKROGON_BASE=e7d74ae70bb8a412c9f7f25e4f31c5aa6486a901`

## 8. Done-when, evidence and report

SKILL.md complete against criterion 1; install test green with the assertion; pasted outputs. Report any design rule you could not express faithfully as a limitation.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
