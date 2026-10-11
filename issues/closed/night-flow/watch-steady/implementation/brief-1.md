# Sub-brief 1: watch-steady U1 — SKILL.md edit

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/watch-steady-u1`

## 1. Goal

Apply plan decisions D1–D4 to `skills/watch-issues/SKILL.md`: the watch never deletes or declines its own job, and every check gates on pause before observing or acting.

## 2. Acceptance criteria

1. `skills/watch-issues/SKILL.md` contains no rule, check or notice by which the watch deletes or declines its own job; the only CronDelete text left is the `/watch-issues stop` bullet.
2. The file states the watch never self-deletes and ends only on `/watch-issues stop`, session loss or the job's own expiry. No expiry warning; the existing creation report "reports its id and 7-day expiry" stays.
3. `## Observe` opens with the pause gate: a check begins by running `akrogon status` at `<root>`; when it reports the repo paused (`<repo> (paused)` list mark or `paused: <name>` slug line), that check observes nothing and acts on nothing and reports paused.
4. `/watch-issues` still runs its CronList/CronCreate step after a paused check; creation is not an act on a leaf.
5. No other file changes; `scripts/`, `package.json`, `tsconfig.json`, `bun.lock` untouched.

## 3. Read-first list

- `skills/watch-issues/SKILL.md` (the owned file)
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- Leaf plan for the wording contract: `/home/ivan/Work/infra/akrogon/issues/open/night-flow/watch-steady/plan.md` (D1–D4)

## 4. Change list and needed interfaces

Owned path: `skills/watch-issues/SKILL.md`. Chunks landing first: none. Shared test resource: none.

Edits, against the file's current text:

- Remove from the `/watch-issues` bullet: "If that check already satisfies the stop rule, report it and create nothing. " Keep the rest, including the id/7-day-expiry report.
- Remove from the `/watch-issues tick <root>` bullet: " It may delete through the stop rule." Keep "It never creates a job, even when zero match."
- In the `## Judge` "Failed on a human prerequisite" bullet, remove ", and that the watch stops once nothing else can run and restarts with `/watch-issues`" from the notice-body sentence. Keep the rest of that clause.
- In the same bullet, remove the sentence "Delivery `shown` and a notice shown this fire both count as shown for the stop rule." Keep every other `delivery`/`shown` judgment ("when `failure.delivery` is not `shown` and this fire has not yet shown it, run `herdr notification show …`" stays).
- Delete the whole `## Stop` section (the CronList/CronDelete paragraph between `## Judge` and `## Never`). `/watch-issues stop` under Invocations keeps its delete path; `## Never` keeps "Create a job from a tick."
- Add the never-self-deletes statement (criterion 2): one line in the `## Invocations` block covering that the watch never deletes itself and ends only on `/watch-issues stop`, session loss or the job's own expiry. Place it with the job-identity/lifecycle statements; "never self-deletes" wording, not "runs forever".
- Add the pause gate (criterion 3) as the first content under `## Observe`, before the observe-script paragraph.

Interfaces: `akrogon status` at a repo root prints `<name> (paused)` for a paused repo and `paused: <name>` with a slug; `akrogon next <slug>` typed ignores pause, which is why the gate is in the skill text.

## 5. Do-not, reasons and exceptions

- Do not edit `docs/guide/in-practice.md`, `README.md`, `skills/AREA.md` or any file besides `skills/watch-issues/SKILL.md`: the plan owns exactly one file and out-of-scope hits are reported, not edited. Exception: a revised brief from A.
- Do not touch `skills/watch-issues/scripts/` (observe.ts, log-tail.ts, tests, fixtures): the design keeps this leaf to skill text only. Exception: a revised brief from A.
- Do not remove the `/watch-issues stop` bullet, "Create a job from a tick" under Never, or the 7-day-expiry creation report: the design keeps operator stop, the no-create tick rule and expiry as end conditions. Exception: a revised brief from A.
- Do not add an expiry warning or text stating the watch is required: the design forbids both. Exception: a revised brief from A.
- Return a mismatch with evidence rather than changing scope or inventing different semantics; the exception is a revised brief from A authorizing it.

Restated: one file, text only; operator stop, no-create tick and the expiry fact all stay; no expiry warning, no requirement claim; any conflict returns as a mismatch unless A revises the brief.

## 6. Ordered steps

1. Read `skills/watch-issues/SKILL.md` whole. (criteria all)
2. Apply the five removals from section 4. (criterion 1)
3. Add the never-self-deletes line and the `## Observe` pause gate. (criteria 2, 3)
4. Re-read the file and verify: no self-delete/self-decline path remains; `/watch-issues stop` and "Create a job from a tick" intact; the gate precedes every observe/judge/action instruction. (criteria 1–4)
5. Install dependencies and run the section-7 command. (criterion 5)
6. Commit the single file with message `docs: watch never self-deletes; tick gates on pause` (or equivalent content-wise) and record the commit id.

Advisory size: 1 file, under 8 turns.

## 7. Commands

```sh
flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
```

with `AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c`, run in the worktree. A markdown-only change likely runs 0 tests; paste the real output either way.

## 8. Done-when, evidence and report

Done when the file shows all four criteria, the section-7 command output is pasted, and the commit id is returned. A planned test wrong or red is a mismatch, not a test fix — none exist for this leaf.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
