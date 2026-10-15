# Plan: issue-flow-report

`akrogon timing --flow --since <YYYY-MM-DD>`: a read-only report over `sources` carried by leaves in `issues/open`, `issues/closed` and `issues/parked`, plus the origin repository's own open issues. Debate is off (`debate: "no"`); this synthesis derives directly from brief and design. The design has no `Open for the plan:` questions.

## Decisions

- D1 Row schema. Carried: `<owner/repo#n> filed <ISO> handoff <YYYY-MM-DD> merged <ISO|open> wait <int>d total <1dp>d leaves <n>`. Uncarried open: `<owner/repo#n> filed <ISO> uncarried <age 1dp>d`. Carried identity missing from its repo's listing: `<owner/repo#n> not in listing` and the command still exits 0. `filed`/`merged` print GitHub `created_at`/latest merge `ts` normalized to UTC ISO without milliseconds.
- D2 Carrier set. `allLeaves(repo)` covers `open`+`closed`; this report additionally calls `leavesUnder(issues/parked, issues/parked)` so parked leaves count as carriers. A leaf with no `sources` carries nothing. Rows group by identity; `leaves` counts distinct slugs.
- D3 Merged time. A carrier leaf is merged when its last log move for that slug has `to: 'merged'`; the issue's merged time is the latest such `ts` across carriers, `open` when any carrier lacks it.
- D4 Handoff and split. Handoff = minimum `created` (`YYYY-MM-DD`) among carriers. Lexicographic compare with `--since`: handoff >= since lands in the `since` group, so same-day counts as since.
- D5 Spans. Wait = `handoff - filed(UTC date)` in whole days. `total` and uncarried `age` = `(merged ?? now) - created_at` in days, one decimal.
- D6 GitHub reads. Distinct repositories = unique carrier `owner/repo` plus the origin, sorted ascending; one `retryCommand` each of `gh api --hostname github.com repos/<r>/issues?state=all&per_page=100 --paginate --slurp`. New listing schema `{number, created_at, state, pull_request?}` parsed once; PRs dropped. A read that still fails after the existing retry propagates `CommandError` (command+output) and exits non-zero. pull.ts keeps its own `state=open` schema and `parseListing` untouched.
- D7 CLI. `timing` options gain `flow: boolean`. Shapes: `<slug>` | `--cohort --since <iso datetime>` | `--flow --since <YYYY-MM-DD>` (`z.iso.date()`); `--cohort`/`--flow` exclusive; every shape violation throws `Usage: akrogon timing <slug> | --cohort --since <iso> | --flow --since <YYYY-MM-DD>`; a malformed date keeps the existing raw-zod behavior. `timingCommand` arg becomes a three-way union.
- D8 Origin. `pull.ts` exports the origin-to-`owner/repo` parse (now inline in `pullRepo`) as `originSource`; the flow report reuses it. Behavior of `pullRepo` unchanged.
- D9 Ordering. Carried rows sorted by filed `created_at` then identity; `not in listing` rows after, by identity. Then uncarried open rows (same sort). Then four summary lines: `summary before: <n> merged <m> wait <med>d total <med>d`, `summary since: ...`, `summary backlog: <n> median <med>d oldest <d>d`, `summary uncarried closed: <n>`.
- D10 Docs and contract. README row becomes `akrogon timing [<slug>\|--cohort --since <iso>\|--flow --since <YYYY-MM-DD>]`; `tests/command-reference.test.ts` contract updated to that form in the test commit; `docs/guide/files.md` gains a `--flow` paragraph stating leaf-carried coverage and the handoff split; `src/AREA.md` timing line mentions the flow report.
- D11 Medians. Sorted numeric list; even count = mean of middle two; empty = `-`. Summary medians print days with one decimal; `oldest` whole days. `not in listing` carried issues count in group `n`/`merged` but contribute nothing to medians (no filed time).

## Read-first

- `brief.md`, `design.md` (authoritative rows, spans, exclusions)
- `src/timing-report.ts` (`slugReport`, `cohortReport`, `duration`, report placement)
- `src/akrogon.ts` (`timing` case, option table, usage errors)
- `src/pull.ts` (origin regex, `retryCommand` listing pattern to mirror)
- `src/state.ts` (`allLeaves`, `leavesUnder`, `sourcePattern`, `sources` schema)
- `src/log.ts` (`readLog`; merged = `to: 'merged'`)
- `src/park.ts` (`issues/parked` layout)
- `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `yaml`, `fakeGh`), `tests/fake-gh.ts` (step `args` pin, `.calls`)
- `tests/pull.test.ts` (fake-gh listing pattern, origin `set-url`)
- `tests/command-reference.test.ts` (README contract mechanism)

## Needed interfaces

- `export function originSource(repo: Repo): Promise<string>` in `src/pull.ts` (origin URL → `owner/repo`; same errors as today).
- `timingCommand(cwd, { slug } | { since } | { flow })` in `src/timing-report.ts`.
- Flow listing schema + `flowReport(repo, since)` inside `src/timing-report.ts`; no changes to `pull.ts` schema or `state.ts`.

## Units

| Unit | Wave | Owned paths | Depends on | Shared resource |
| --- | --- | --- | --- | --- |
| U1 Product | 1 | `src/timing-report.ts`, `src/pull.ts`, `src/akrogon.ts` | none | none |
| U2 Docs | 1 | `README.md`, `docs/guide/files.md`, `src/AREA.md` | none | none |

Two units, one wave, disjoint owned paths, no shared test resource, no ordering. Not serial-solo.

Affected docs checklist: `README.md` (command row), `docs/guide/files.md` (`## akrogon timing` paragraph), `src/AREA.md` (timing-report line). No skill, guide or AREA file beyond these is affected.

## Criterion tests (planned, committed red before product code)

All in `tests/timing-report.test.ts` unless noted; proof command `akrogon run-check --name 'test' -- sh -c 'bun test --timeout=30000 tests/timing-report.test.ts tests/command-reference.test.ts'`.

- C1 rows/format/sort: `flow report: carried issues print one sorted line each with day spans` — three merged issues across two carriers sharing `#1`; exact stdout equality.
- C2 uncarried lines + parked exclusion: `flow report: parked-carried issues stay carried while open uncarried issues print` — parked leaf under `issues/parked`; `#4` carried row plus `uncarried` lines for `#5`,`#6`; parked `#4` absent from uncarried block.
- C3 summaries/medians/`-`: summary lines asserted in both tests above; even-count median via since totals `[6.104,7.0]`→`6.6d`; empty backlog → `median - oldest -`; `not in listing` contributes to counts only.
- C4 one read per repo, PR drop, failure, not-in-listing: step `args` pin the `state=all` listing per repo; `other/repo#99` prints `not in listing` at exit 0; `flow report: a failed listing retries once then exits non-zero with command and output` — two failing steps, `calls` length 2, stderr carries the retry warning and final `CommandError`.
- C5 usage + docs: `flow report: usage errors name the three timing forms` (shape violations refuse naming all three forms; malformed date exits non-zero); `the files guide describes the flow report` in `tests/command-reference.test.ts` asserts `akrogon timing --flow --since <YYYY-MM-DD>` and carried-coverage wording; README contract via the updated contract string.
- C4 real run (not a test): `akrogon timing --flow --since 2026-10-01` run in `/home/ivan/Work/infra/akrogon` during implementation, output recorded in the implementation report.

## Verification map

| Criterion | Observation | Size | Rerun trigger |
| --- | --- | --- | --- |
| C1 | CLI stdout equals the pinned row block (boundary: `akrogon timing --flow` output vs fixture records) | seconds | `timing-report.ts` row/sort math |
| C2 | stdout has carried `#4`, uncarried `#5`/`#6` only (catches parked leaves wrongly excluded or included) | seconds | carrier-set or parked read |
| C3 | four `summary` lines exact (catches wrong split, median, `-` handling) | seconds | summary math |
| C4 | `.calls` count/args per repo; non-zero exit with command+output on failure; `not in listing` at exit 0 | seconds | gh read path |
| C4 real | real `gh api` run in the akrogon repo, recorded in report | seconds | listing schema/command |
| C5 | usage-error stderr; command-reference + files-guide assertions | seconds | CLI parsing, README/files.md |

## Known limitations

- Issues deleted from GitHub (`not in listing`) count in handoff groups but not medians.
- Transferred issues appear under their current repository listing only.

## Red evidence (2026-10-15)

`akrogon run-check --name 'test' -- sh -c 'bun test --timeout=30000 tests/timing-report.test.ts tests/command-reference.test.ts'` on the test commit: 12 pass, 6 fail.

- `flow report: carried issues print one sorted line each with day spans and the medians split on handoff` — exit 1, `TypeError: Unknown option '--flow'` (C1, C3, C4 listing path).
- `flow report: parked-carried and open-carried issues stay carried while open uncarried issues print` — same unknown-option failure (C2, C3 `-` medians).
- `flow report: a failed listing retries once then exits non-zero with command and output` — unknown option before any gh call (C4 failure path).
- `flow report: usage errors name the three timing forms` — stderr lacks `--flow --since` (C5 usage).
- `README covers every dispatched command and its argument contract` — README row holds 2 timing alternatives, contract requires 3 (C5 README).
- `the files guide describes the flow report` — guide lacks `akrogon timing --flow --since <YYYY-MM-DD>` (C5 guide).

Each failure names missing product/docs surface, never wrong-behavior drift.
