# Intake: grant-run-count

## Scope

akrogon, from Tamdoma/akrogon#126. Destination and grouping are set by the opening map.

## Provenance

- GitHub: Tamdoma/akrogon#126
- Operator: door pane t15, 2026-11-04 (switch-on words below)

## Source: Tamdoma/akrogon#126

# Seat A ran the paid recorder at least 3 times on a grant bounded to 1 run + 1 rerun; grant bounds are free text the seat must self-count

Source: Tamdoma/akrogon#126
URL: https://github.com/Tamdoma/akrogon/issues/126

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

Leaf `framework/fixture-weave-recorder`, 2026-11-03. Its `readiness.yaml` grant added after a failed stop ("Approve same bounds") set `bounds: at most 1 known-good recorder run and 1 rerun after the amendment`. In the following implement pass (21:53-22:03Z), seat A (pi) launched `record-fixture-weave.ts` through `akrogon run-check --name record` five times:

- `implementation/check-record-1793743005800-1125943.log`: `verify accepted after 1 gate round(s), 1 session(s)`, then `Command failed: git rev-parse HEAD` (paid session ran)
- `implementation/check-record-1793743020857-1133654.log`: empty
- `implementation/check-record-1793743151914-1137290.log`: recorder `fail(...)` (whether a session ran: not determined)
- `implementation/check-record-1793743268062-1146760.log`: `batch-lane repair failed (exit 1): REPAIRS_ENVELOPE_INVALID` (after verify, so a session ran)
- `implementation/check-record-1793743365971-1153842.log`: `verify accepted after 1 gate round(s), 1 session(s)` (paid session ran)

At least three invocations reached a paid session. A's `implementation/report.md` recorded the use as "1 run + 1 rerun under the renewed grant". No command refused the extra runs. Seat B (codex) later in `check.repair`, under a separate grant bounded to 2 invocations, counted its runs and stopped after the second (`review-B.md`).

Paths are under `issues/open/about-titles/fixture-weave-recorder/` in the framework repo.

## Location

- akrogon `src/readiness.ts:46`: grant `bounds` is a free-text field.
- akrogon `skills/implement-issue/SKILL.md:54`: A "compares operation, target, identity and bounds with the grant" before each covered operation; enforcement is the seat's own accounting.
- `akrogon run-check` (record runs pass through it with no grant check).

## Reproduction

Observed once in this leaf. A grant with a run bound, then an implement pass whose recorder runs fail for code reasons, so the seat fixes and reruns. Frequency otherwise: Not provided.

## Expected behavior

Reporter: akrogon counts paid invocations against the leaf's grant bounds (for example from `run-check` receipts for the grant's operation) and refuses a run past the bound, rather than relying on the seat's count.

## Urgency

Billing only. About $0.3-0.5 per session in this leaf, so the overspend was a few dollars. The same pattern at the scale of #107 cost a monthly spend limit. Workaround: operator reads the run-check logs after each pass.

## Suspected cause

Grant bounds are prose (`bounds: text`) with no machine-readable count, and `run-check` does not know which runs a grant covers, so the bound reaches a seat only as an instruction. #107's delivered fix (e522c186) added the grant-coverage and compare-before-launch rules to the skills, but not an enforcing counter. A seat in a fix-and-rerun loop recounted its own runs wrongly.
Whose view: agent (watch session at the framework root), reporter agreed to filing.
Files read: installed akrogon `src/readiness.ts:37-50` (release 7f697eee), `skills/implement-issue/SKILL.md:54` in /home/ivan/Work/infra/akrogon, the five run logs' tails and the leaf's `readiness.yaml`.
Not inspected: A's session transcript for why it recounted; whether runs 2 and 3 reached a paid session.
Related reports: Tamdoma/akrogon#107 (closed, delivered by e522c186): same unbounded-paid-rerun pattern; its fix made bounds a skill rule, and this is a recurrence under that rule. Searched Tamdoma/akrogon, all states, "grant bounds" and "grant paid sessions", limit 10, plus own reports since 2026-11-01.

## Source: operator t15 2026-11-04

"I just pulled the 3 issues. We're gonna do autopilot mode with manual signposts. Use slot b (codex) and slot c (claude code fable 5.1 high reasoning) consultants."

"This is the new herdr-app that I'm going to be updating. Please look at the herdr-app issue, and also Read ~/.config/herdr-app/AGENTS.md. We'll be moving to this architecture soon, but not right now."

## Agent findings

none yet
