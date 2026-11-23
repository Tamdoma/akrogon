# Review A: budget-rules

Base `d8957dad` (AKROGON_BASE, = origin/main at implement). Reviewed head `c46ca96c`.
Diff scope: 24 files, prose and test code only; no `src/` change. Report:
`implementation/report.md`.

## Criterion 1 reading (model-choice read, recorded per the proof)

I read `skills/lifecycle-rules.md` `## Grant reuse and paid sessions` against items 1, 6, 7, 8 and 8':

- Item 1 scope: "Paid launches covered by a `by: standing` grant entry run on the logged-in
  `harnesses` accounts, with local writes cleaned after; no other account, provider or outside
  write is covered" — matches the decided scope verbatim, held in this file once.
- Item 6: no per-leaf cap appears; "the seat writes n and its reason in its record file, and a
  reservation counts whatever the outcome"; "every covered launch runs
  `akrogon run-check --sessions <n>`" — I read "covered launch" as the paid launch the
  section's grant-reuse sentence covers, consistent with "no paid test session runs outside
  the ceiling". The red-launch paragraph is kept verbatim minus the removed closing clause.
- Item 7: "A reservation refused for the ceiling ends the pass `failed` with the existing one
  notice per stopped leaf, the reason naming the ceiling; no dedupe state" — the decided stop.
- Items 8+8': the third paragraph is the trigger with the floor: fresh run only when no
  recorded green on current model-facing inputs covers the property and the change can reach
  it (or the seat cannot show why it cannot); product red never passes; a cut-short run is
  judged on recorded evidence (which under 8' means it passes only when the floor is met —
  evidence short of the floor is not a pass); wording-only change needs no fresh run; the
  check-issue Fix-only clause is the last sentence.
- Removed: no count-line, warn-past-bound, unknown-prior-use or "changes no count line"
  sentence remains in the section or the file.

Reading: the section carries every named item and nothing removed. Criterion met.

## Criterion 2 reading (each surface vs the binding decisions, plus the grep)

- chart-issues SKILL.md: `## Open` needs list drops paid-launch grant rows (keeps "paid
  budget" as the sheet row) and gains the reservation line naming the record file
  (fork `## Charting proofs`) and stop (Needs wait on `paid_budget`); `## Take` proof
  paragraph replaces "operator-approved paid test budget" with the `--sessions` reservation;
  grant paragraph drops repeat-bound/renewal/count-unit/"never warns and runs" text and adds
  the `by: standing` entry rule with "a session count in an old entry is information only"
  (item 4/4'); `## Handoff` marks standing entries door-written; the live-run estimate line
  stays information-only (item 4' forbids no count *requirement*; the estimate remains
  information, criterion 2 met).
- autopilot.md: paid-probe wait moved to the `paid_budget` Needs row; standing entry stated
  door-written.
- standing-design.md: `:16` keeps the replay half and points the trigger at the new section;
  `:17`/`:18` cite replay to standing-design and the fresh-call half to lifecycle-rules
  (item 8'/B P2).
- shapes.md: second grant entry `approved.by: standing` with `bounds: sessions under
  paid_budget` (design 4' fields); `## Preflight and validation` makes standing entries
  door-written and keeps every other approval operator-only.
- check-issue SKILL.md: `## Shared context` operator-only rule keeps paid launches inside the
  standing scope out of `Operator actions`; `## check.review` count audit replaced by the
  reservation/ledger audit; `## check.repair` replay citations split replay (standing-design)
  from fresh-call trigger (lifecycle-rules) per item 8'.
- implement-issue SKILL.md: section reference renamed; worker sentence is now the
  `--sessions` reservation with n+reason in `implementation/report.md`; implement-end cites
  the moved trigger.
- plan-issue SKILL.md: section reference renamed; record-file line now "kept output and
  launch reservations".
- consultant-brief `## Limits`: standing-scope launch named covered, out-of-scope spend stays
  an operator stop.
- mine-issues `## Sources`: report description now reads session reservations and reasons.
- skills/AREA.md: entry names the new section title and the door's read.
- docs: limits.md names `paid_budget` as the operator's one-time job and standing scope;
  checks.md names the two env exports with a pointer to the commands.md contract; files.md
  gains `budget.jsonl`/`budget.lock` rows; docs/use/autopilot.md and plan-work.md drop
  paid-launch approvals while keeping live-change grants; watch-while-away.md and
  quick-fix.md verified unchanged — their remaining grant/spend words still read true.
- Repo grep for `count line`, `count so far`, `repeat-count`, `repeat bound`, `renewal`,
  `warn-past`, `prior use`, `operator-approved paid`, `paid test budget` across skills/ docs/
  src/ tests/: only `tests/pause-next.test.ts` comment (unrelated evidence-window phrase).
- AREA.md paths: the diff names no new path; `skills/chart-issues/lifecycle-rules.md` exists
  as a symlink to `../lifecycle-rules.md` and every asset file the AREA.md entry names exists.

Reading: every named surface matches the decisions; nothing still requires a session count,
renewal, count line or per-launch operator approval inside the ceiling. Criterion met.

## Criterion 3 (mechanical, via `test`)

- `skills/chart-issues/lifecycle-rules.md -> ../lifecycle-rules.md` committed;
  `tests/docs-links.test.ts` enumerates the link set from `git ls-files -s` (reads the
  source, no hand-copied list); `tests/chart-shapes.test.ts` asserts a `by: standing` grant
  in the example. Verify log `implementation/check-test-1795369826060-2185505.log`:
  1335 pass, 0 fail at head. Both planned fail-first cases are green post-merge.

## Criterion 4 (free invocations, per the report matrix)

Spot-read of logs: `check-c4-kinds-unset` (exit 1, `refusing paid cell: plans 8 sessions,
AKROGON_SESSIONS=unset`, no tier output), the refusal family for kinds(8)/wstop(4)/
wconsults(2)/wlive root(2)/shell(1) each naming unset or the too-small value;
`check-c4-wconsults-nominutes` exits on the `AKROGON_SESSION_MINUTES` parse (deadline-source
proven); free cells `check-c4-wlive-preflight-claude`, `check-c4-window`, `check-c4-notices`
green; `check-c4-wlive-standin-root` runs ~140 s (starts without the variable) then red on
the `due=3` tick — pre-existing on base (issue #150), no cause in this diff.

The `reservedSessions(planned)` guard sits inside paid test bodies only
(`tier.ts:44`), so free cells are structurally unreachable by it. Criterion met.

## Whole-suite evidence

`verify leaf c46ca96c…: green` (1335 pass), log
`implementation/check-test-1795369826060-2185505.log`. Earlier reds in the report were
host-load timeouts resolved by the clean rerun; documented, not leaf-caused. Review ran no
checks (check.review launches none); receipt evidence accepted from the report.

## Reservation audit

No `--sessions` reservation was run during this leaf (criterion-4 proofs inject
`AKROGON_SESSIONS` via `env` inside run-check commands, so no `budget.jsonl` rows are
expected); the artifacts explain all activity. The reported rule violation — a worker's
transient `git stash`/`pop` while checking prettier provenance — is recorded in the report,
stash list verified empty; no state lost.

## Test-Change trailers

`5e749414` (docs-links, chart-shapes — planned cases), `75068275` (tier.ts + four e2e files),
`c46ca96c` (watch-consults reorder) each carry `Test-Change:` trailers naming the path and
that no existing expectation changed; consistent with `src/test-files.ts` matches.

## Findings

- N1 — `skills/chart-issues/SKILL.md:49` names the needs-sheet row "paid budget" (plain
  words) while the reservation-refusal text and config key are `paid_budget`. Reproduction:
  a door mapping "the `paid_budget` Needs row" back to a sheet literally listing "paid
  budget" must equate the two spellings itself. Deferred: the same paragraph carries the
  backtick spelling, and Needs rows are prose anyway. Promoted to a Fix if a door ever
  parks for a missing row it could not match, or if the row name gets mechanically checked.
- N2 — worker used `git stash`/`pop` to isolate pre-existing prettier warnings during
  implementation. Deferred: verified stash list empty afterward, no work lost, and it is
  already disclosed in the report rather than hidden. Promoted if a stash ever silently
  swallows worker output on this repo.
- N3 — `tests/e2e/watch-consults.e2e.ts:153` comment still says "(grant bound)" for a
  deadline now derived from `AKROGON_SESSION_MINUTES`. Deferred: comment only, the parse is
  correct, and criterion-4 proof is unaffected. Promoted if a future edit trusts the phrase
  and re-derives the deadline from a grant field.

No Fixes. Verdict: **nits**.
