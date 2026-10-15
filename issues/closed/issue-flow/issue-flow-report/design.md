# Design: issue-flow-report

## Binding decisions, verbatim

### Flow view (issues/chart/system-flow/forks/flow-view.md)
Question: Add one derived issue-to-merged view to `akrogon timing` (3a), or keep measuring by hand (3b)? And pause factory rule changes until about 20 leaves run under today's rules?
Taken: Operator 2026-10-15: "3a". Small akrogon lifecycle leaf. No new factory rule changes until about 20 leaves run under today's rules, then compare with `akrogon timing --cohort --since 2026-10-15T07:25:26Z` (ed0a05d, the last Q1 landing).
Reason (M2, slots/map-merged.md, A,B,D): one derived table, no new state; gain 0 h directly, it aims the next change at the real constraint.
Foreclosed: 3b, measuring by hand.

Excluded: forks delivery-order (door behavior, landed in skills) and repair-loop (landed) do not apply to this leaf. The pause applies to factory rules, not to this read-only report.

## Standing design
Installed path: /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf:
- Each criterion is proven at the CLI boundary with the existing test helpers (`tests/helpers.ts`) and the existing fake gh (`tests/fake-gh.ts`) in `tests/timing-report.test.ts`; no unit test beyond what a criterion needs, no new test machinery. (A,B,E)
- The real GitHub read is the behavior under criterion 4, so one real run in this repo is the outside-call evidence, recorded in the implementation report, not a test.
- New behavior shows one deliberate break turning its test red, recorded in the implementation report.
- No test copies another file's entries; expected values come from the fixture records the test writes.
- Auth, secrets, server and browser lines do not apply: the command reads the operator's existing `gh` login and local records.

## Leaf architecture
Owned surfaces: (A,B,D,E)
- `src/timing-report.ts`: a new flow report beside `slugReport` and `cohortReport`, with its own listing schema (`number`, `created_at`, `state`, optional `pull_request`) parsed once at the boundary; `timingCommand` gains a third argument shape.
- `src/pull.ts`: export only the origin-to-`owner/repo` parse now inline in `pullRepo`, as a function both use. Its issue schema, `parseListing` and `state=open` query stay unchanged, so `akrogon pull` output and `tests/pull.test.ts` stay unchanged. (D)
- `src/akrogon.ts` `timing` case: `--flow --since <YYYY-MM-DD>` parsed with `z.iso.date()`; `--flow` and `--cohort` are exclusive; `--cohort --since <iso>` keeps its datetime parse; usage errors name all three forms. (D,E)
- `README.md` command table row and `docs/guide/files.md` `## akrogon timing` section, including that the report covers leaf-carried issues only and splits on the handoff date. (B,D)
- `tests/command-reference.test.ts`: its `timing` contract string changes to the new README form. This is a correction of a test expectation, so the commit carries the `Test-Change:` trailer (`src/phase.ts`). (B,D,E)
- `tests/timing-report.test.ts` for criteria 1-4.

Literal interface:
- `akrogon timing --flow --since <YYYY-MM-DD>`, read-only, prints lines and exits 0; a failed GitHub read exits non-zero with the command and output.

Inputs and consumers:
- Leaves: `allLeaves(repo)` in `src/state.ts` reads `issues/open` and `issues/closed`; parked leaves live in `issues/parked` (`src/park.ts`) and are read with `leavesUnder` on that folder by this report only; `allLeaves` keeps its meaning. A missing `sources` field carries nothing. (B,D,E)
- Moves: `readLog(repo.root)` in `src/log.ts`; merged is a move with `to: 'merged'`.
- Retry: `retryCommand` in `src/shell.ts`, as `pullRepo` uses it.
- Identity parse: `sourcePattern` in `src/state.ts`.
- One listing per repository: an identity can be carried by many leaves and a leaf can carry many identities (shapes.md completion-owner rule), so rows group by identity and leaf counts count distinct slugs. (B,E)

Day handling: `created` is a `YYYY-MM-DD` handoff date. Wait is that date minus the UTC date of `created_at`, in whole days. The before/since split compares `created` with the `--since` date, so a same-day handoff counts as since. (D,E)

Exclusions:
- Fix rounds, blocked-by and chart stage: lifecycle data already in `akrogon timing <slug>`, `--cohort`, `akrogon status` and `akrogon status --charts`; not repeated. (D)
- Issues no leaf carries are counted, not timed: GitHub closure is not proof of delivery. (B)
- No new record, file or state field; nothing under `issues/` is written.
