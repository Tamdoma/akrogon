# Plan: budget-rules

Slot A, plan.synthesis, 2026-11-22. Leaf folder: `issues/open/ai-budgets/budget-rules`.
Worktree: `/home/ivan/.akrogon/worktrees/akrogon/budget-rules`. Base `d8957dad` already contains
session-ceiling: `run-check --sessions` (src/run-check.ts:303+), `paid_budget` (src/config.ts),
`budget.jsonl` in `copiedEntries` (src/state-home.ts:18), `AKROGON_SESSIONS`/`AKROGON_SESSION_MINUTES`
in the `constructed` set and absent from `copied` (src/config.ts:98-99, src/run-check.ts:41-49).
Correction 9' is already code; this leaf plans no `src/` change.

Operator state noted: `~/.akrogon/config.yaml` has no `paid_budget` yet. No proof below needs it
(see D11): criterion-4 invocations inject `AKROGON_SESSIONS` through `env` inside the checked
command, and run-check's `constructedEnv` never copies it from the caller. No `Missing:` blocker.

## Read-first paths

- `skills/lifecycle-rules.md` — `## Grant reuse and count lines` is the section being replaced.
- `skills/chart-issues/SKILL.md` — `## Open` needs paragraph (:47), `## Take` grant (:73) and
  proof (:69) paragraphs, `## Handoff` (:81).
- `skills/chart-issues/assets/standing-design.md` — recorded-output :16 (trigger half moves),
  chain-trigger :17, slow-run :18, model-choice :11.
- `skills/chart-issues/assets/shapes.md` — `### readiness.yaml` grants example (:344+),
  `## Preflight and validation` (:410).
- `skills/chart-issues/assets/autopilot.md` — waits paragraph :9.
- `skills/check-issue/SKILL.md` — shared-context lines :20, operator-only :31, `## check.review`
  count paragraph :69, `## check.repair` recorded-output citations :79,:91.
- `skills/implement-issue/SKILL.md` — :27, :52,:56,:62,:77,:83 (worker count line, recorded-output).
- `skills/plan-issue/SKILL.md` — :31, :41.
- `skills/watch-issues/consultant-brief.md` `## Limits` (:25-31),
  `skills/mine-issues/SKILL.md` `## Sources` (:21-32), `skills/AREA.md` (:18).
- `docs/reference/limits.md` (:24-25), `docs/reference/checks.md` (run-check env :50),
  `docs/reference/files.md`, `docs/use/autopilot.md` (:21,:37), `docs/use/plan-work.md` (:32),
  `docs/use/quick-fix.md` (:17).
- `tests/docs-links.test.ts` (symlink test), `tests/chart-shapes.test.ts` (readinessBlock).
- `tests/e2e/{kinds,watch-stop,watch-consults,watch-live,window,notices}.e2e.ts`,
  `tests/e2e/tier.ts` (guard helper home).
- `src/readiness.ts` `grantSchema` (`by: text`, no schema change), `design.md` items 1-9, 2'-9'.

## Decisions

- **D1 — lifecycle-rules section rewrite.** `## Grant reuse and count lines` becomes
  `## Grant reuse and paid sessions`. Removed verbatim: the count-line sentence, the warn-past-
  bound sentence, the unknown-prior-use clauses, the closing "This changes no count line or
  repeat-bound rule." New text holds, in order: (a) standing scope — paid launches on the logged-
  in `harnesses` accounts, local writes cleaned after, no other account, provider or outside
  write (item 1); (b) the `--sessions <n>` reservation: every covered launch runs
  `akrogon run-check --sessions <n>`, the seat writes n and its reason in its record file, a
  reservation counts whatever the outcome (items 2, 6); (c) the kept red-launch paragraph
  unchanged (kept brake, item 6); (d) a ceiling refusal is the operator-blocker stop with the
  existing one notice per stopped leaf, no dedupe (item 7); (e) the moved fresh-call trigger with
  the 8' floor wording: a fresh paid run is needed only when no recorded green on the current
  model-facing inputs covers the property and the change can reach it, or the seat cannot show
  why it cannot; a red caused by product behavior never passes; a run cut short by the ceiling or
  time limit is judged on the evidence already recorded; a wording-only change the seat judges
  cannot reach the proven property needs no fresh run, reason recorded.
- **D2 — section reference chase.** Every "grant reuse and count lines" pointer follows the new
  name: check-issue SKILL.md :20, implement-issue SKILL.md :27, plan-issue SKILL.md :31 (each
  also rewords "record file for grant count lines" → "record file"), skills/AREA.md :18 (plus
  chart-issues now reads it via the new link).
- **D3 — standing-design pointer.** Item :16 keeps the replay half (recordings, real consumers,
  re-record rules) and replaces its trigger half with a one-line pointer to lifecycle-rules'
  fresh-call trigger; :17 chain trigger and :18 slow-run cite "the recorded-output rule above"
  for replay and name lifecycle-rules for the fresh-call half (item 8', correction B P2).
- **D4 — chart-issues SKILL.md.** `## Open` needs paragraph drops paid-launch grant rows from
  the sheet list (paid launches are standing; `paid_budget` itself is a needs row) and the door
  reserves with `--sessions` for its own paid probes recording n and reason in the fork's proof
  record (`## Charting proofs`), its stop the Needs wait (correction 4'). `## Take` :69 replaces
  "within the one operator-approved paid test budget" with the `--sessions` reservation naming
  the door's record file and stop; :73 replaces the repeat-bound/renewal/count-line/never-warns
  sentences with: a paid-launch leaf carries one grant entry with
  `approved: {by: standing, date: <paid_budget.approved.date>, answer: "~/.akrogon/config.yaml
  paid_budget"}`, `bounds` holding non-count limits or "sessions under paid_budget"; outside live
  changes keep an operator `approved` entry; a leaf with both carries two entries; a session
  count in an old entry is information only. `## Handoff` :81 changes grant "confirmed" to name
  standing entries as door-written needing no operator approval, and keeps the live-run estimate
  line unchanged (information only, criterion 2 bans *requiring* a count).
- **D5 — shapes.md.** `### readiness.yaml` example gains a second grant entry with
  `approved.by: standing` (schema-free fields: `principal` the seat, `account` the logged-in
  harness account, `targets` the harness, `fixtures: []`, `bounds: "sessions under paid_budget"`);
  `grants[0]` keeps fixtures so `chart-shapes.test.ts` :31 still holds. `bounds` comment drops
  the repeat-unit phrasing. `## Preflight and validation` rewrites "grant approval … stay
  operator-only" so a `by: standing` entry is the door's to write and claims no operator
  approval; every other approval stays operator-only.
- **D6 — remaining prose surfaces.** check-issue :31 operator-only rule keeps paid launches out
  of `Operator actions` (inside the standing scope they are covered; outside stays operator);
  check-issue :69 count paragraph becomes: audit paid launches against `budget.jsonl` rows and
  reported n, unexplained paid activity is a Fix; check-issue :79/:91, implement-issue :62/:77/:83
  recorded-output citations split replay (standing-design) vs fresh-call trigger (lifecycle-
  rules); implement-issue :52 worker sentence becomes a reservation sentence (`--sessions` with n
  and reason in `implementation/report.md`); implement-issue :27 / plan-issue :31 record-file
  wording; watch-issues consultant-brief `## Limits` keeps "grant or permission" stops, removes
  nothing the standing scope covers only inside (out-of-scope spends still stop — text adjusted
  to point at the standing scope); mine-issues `## Sources` :30 drops "count lines" from the
  report description (reads reservations and ledger instead); docs pages mirror: limits.md :24
  (paid launches on logged-in accounts are standing under `paid_budget`, operator supplies the
  key once), checks.md :50 env paragraph names `AKROGON_SESSIONS`/`AKROGON_SESSION_MINUTES` as
  run-check-exported, files.md gains `budget.jsonl`/`budget.lock` rows, autopilot.md :21/:37 and
  plan-work.md :32 drop paid-launch approvals from needs-sheet/approval prose, quick-fix.md :17
  keeps the live-account grant clause.
- **D7 — fifth lifecycle link + docs-links test.** `skills/chart-issues/lifecycle-rules.md ->
  ../lifecycle-rules.md`; the `seat texts` test in docs-links.test.ts replaces its fixed four-
  link loop with `git ls-files -s -- 'skills/*/lifecycle-rules.md'` rows: every row mode 120000,
  count 5. SKILL.md gets a `lifecycle-rules.md` link line naming the door's record file (the
  fork's proof record) and its stop (the Needs wait) like the four seat skills.
- **D8 — shapes example assertion.** chart-shapes.test.ts adds
  `readiness.grants.some((g) => g.approved.by === 'standing')` in the existing parse test;
  placement of the new entry at index ≥1 keeps `grants[0].fixtures.length` green.
- **D9 — e2e paid-cell guard.** One helper `reservedSessions(planned)` in tests/e2e/tier.ts:
  parses `AKROGON_SESSIONS` and, when unset or `< planned`, prints
  `refusing paid cell: plans <planned> sessions, AKROGON_SESSIONS=<value>` and calls
  `process.exit(1)` — inside the paid test body after env checks, before any tier/harness call
  (never module scope or beforeAll, so free cells never reach it). Planned counts from each
  file's own header: kinds 8; watch-stop 4; watch-consults 2 (watcher + initial consultant;
  replacements uncappable, counted and reported — a count above n does not fail a green run);
  watch-live paid cell root shape 2 (watcher + post-/clear|/new session), shell shape 1.
  watch-consults takes its deadline from `AKROGON_SESSION_MINUTES` (`Date.now() +
  minutes*60_000`), refusing when it is unset and reporting the deadline it took.
- **D10 — criterion-4 proof without `paid_budget`.** `run-check` exports the variables only
  after a reservation, which needs `paid_budget` (absent). The cell guard reads the same
  variable, so invocations inject it inside the checked command: `env AKROGON_SESSIONS=<n>
  AKROGON_SESSION_MINUTES=<m> bun test …`. Absent-case invocations pass no variable (constructed
  env carries none). `env` injection into the command is the documented run-check env pattern
  (the files' own Run: lines use it).
- **D11 — no new proof machinery.** Proofs are: the existing `test` check (criterion 3), free
  e2e invocations on existing files (criterion 4), and reviewing-seat readings/search
  (criteria 1-2, model-choice per standing-design — no script check on prose).

## Interfaces needed (all exist)

`run-check --sessions` + env export (src/run-check.ts:319-335) · `required()` env helper
(tests/e2e/tier.ts:37) · `process.exit` refusal idiom (bun:test) · `readinessSchema` accepting
`by: standing` as plain text (src/readiness.ts:38) · `diskResolver` dereferencing git links
(tests/docs-links.test.ts).

## File/criterion checklist by wave

Wave 1 (3 units, disjoint paths):

- **U1 — lifecycle-rules.md rewrite** (D1, D2-partial). Owns: `skills/lifecycle-rules.md`.
  Criterion 1.
- **U2 — chart door surfaces** (D4, D5, D7-prose part). Owns: `skills/chart-issues/SKILL.md`,
  `skills/chart-issues/lifecycle-rules.md` (new symlink), `skills/chart-issues/assets/
  {standing-design,shapes,autopilot}.md`. Criterion 2 (door parts), 3 (symlink), and D3.
- **U3 — lifecycle skill surfaces** (D2, D6 skill half). Owns: `skills/check-issue/SKILL.md`,
  `skills/implement-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `skills/AREA.md`,
  `skills/watch-issues/consultant-brief.md`, `skills/mine-issues/SKILL.md`. Criterion 2.

Wave 2 (2 units, disjoint paths; after wave 1 because they cite the moved trigger):

- **U4 — human docs** (D6 docs half). Owns: `docs/reference/{limits,checks,files}.md`,
  `docs/use/{autopilot,plan-work,watch-while-away,quick-fix}.md`. Criterion 2.
- **U5 — e2e guards** (D9). Owns: `tests/e2e/{kinds,watch-stop,watch-consults,watch-live}.e2e.ts`,
  `tests/e2e/tier.ts` (helper). Criterion 4. These e2e files are the criterion's product surface,
  not proof tests — the `Test-Change:` trailer applies to their commits (path rule, e2e dir).
  Free cells `window.e2e.ts`, `notices.e2e.ts`, and watch-live's preflight/standin are proof
  inputs only, untouched.

Doc checklist (criterion's required line): affected agent docs — every file in U1-U5; affected
human docs — every file in U4 plus `docs/reference/checks.md`, `files.md`, `limits.md`. No other
agent or human doc is affected: seed-issue, learn-issues, watch-issues SKILL.md, mine-issues
rest, implement-issue brief-template/ponytail, merge-issue, chart-issues assets
{questions,direct-route,handover}, `docs/reference/commands.md`, `docs/use/learn-from-work.md`
checked and carry no removed-rule term; `akrogon-session.md` is a historical session record
(excluded, hit expected by the reviewer's search).

## Criterion observations

**C1** (lifecycle-rules text): proof is the reviewing seat's reading of the new section against
items 1, 6, 7, 8, 8' — a model-choice/reading criterion per the design's standing-design line;
no test written, nothing mechanically checkable beyond the diff. Size: seconds. Rerun trigger:
any edit to `skills/lifecycle-rules.md`.
- Checked condition "no surface still requires a paid session count / count line": decision D1
  is the rewrite; the removed sentences are gone by diff construction, and criterion 2's repo-
  wide search (reviewer-run) is the criterion's own observation — no seat-run case possible or
  designed.

**C2** (all surfaces match, nothing still requires count/renewal/count line/approval): proof is
the reviewing seat's per-surface reading plus its repo-wide search for the removed terms
(count line, renewal, warn-past-bound, prior use, paid session count, per-leaf paid approval)
recorded in the review file. Same model-choice basis; no script check on prose per design.
Size: seconds. Rerun: any prose edit.
- Checked condition "a kept surface still names a removed rule": traced — the diff is the
  complete named surface set, the reviewer's search is the observation; no script case (design
  forbids keyword checks on prose).

**C3** (fifth link + shapes example parses): proof is the repo `test` check, which runs
tests/docs-links.test.ts and tests/chart-shapes.test.ts. Planned cases (fail-first at planning,
committed before product code):
- `docs-links.test.ts`: the `seat texts` test enumerates `skills/*/lifecycle-rules.md` via
  `git ls-files -s`, expects 5 gitlink rows. Red at planning (check plan-c3-links: 1, log
  `implementation/check-plan-c3-links-1795366267382-3705681.log`): `Expected: 5, Received: 4`
  at docs-links.test.ts:280. Rerun: any skills-folder link change.
- `chart-shapes.test.ts`: parse test adds `grants.some(approved.by === 'standing')`. Red at
  planning (check plan-c3-shapes: 1, log
  `implementation/check-plan-c3-shapes-1795366268977-3706645.log`): `Expected: true, Received:
  false` at chart-shapes.test.ts:32. Rerun: any shapes.md readiness edit.
- Checked conditions: (i) link exists *and resolves* — symlink-mode assertion plus the existing
  brokenLinks pass over assets links (`../lifecycle-rules.md` resolves inside the bound via the
  real file, then the tree); the wrong-target case is covered by reviewer's read of the gitlink
  blob, noted. (ii) example parses *including a standing grant* — the assertion, shown red below
  without the entry. No other reachable condition (schema accepts `by: standing` by inspection,
  `by` is `text`).

**C4** (paid cells refuse unreserved/under-reserved before any launch; free cells start):
proof is free invocations, recorded in `implementation/report.md` with command, commit, exit,
refusal line, and "no session launched" observation. No committed test: e2e files are outside
the `bun test` glob and the criterion names invocation evidence. Each invocation:
`akrogon run-check --name <label> -- env AKROGON_E2E=<cell> AKROGON_E2E_ROOT=<fresh /var/tmp
mktemp> AKROGON_E2E_OUT=<leaf>/implementation/<label> [AKROGON_E2E_KIND=<k> AKROGON_E2E_SHAPE=<s>]
[WATCH_TICK_SECONDS=10] bun test --timeout=<file's> ./tests/e2e/<file>.e2e.ts [--test-name-pattern]`
- Refusal cases (expect non-zero exit + refusal line before tier output; log shows no harness
  launch): unset — kinds (8), watch-stop codex (4), watch-stop agy (4), watch-consults (2),
  watch-live ×8 (claude/codex/pi/agy × root=2/shell=1). Too-small — kinds `=7`, watch-stop
  codex `=3`, watch-consults `=1`, watch-live pi-root `=1`. watch-consults also unset
  `AKROGON_SESSION_MINUTES` with `AKROGON_SESSIONS=2` (deadline-source refusal). Total 16
  invocations, each seconds.
- Free cases (expect the cell to start past the env checks — reach tier setup — without
  AKROGON_SESSIONS; run to the natural outcome, green or recorded): window, notices,
  watch-preflight claude (harness launch, no prompt — free), standin root. 4 invocations,
  minutes each.
- Checked conditions: (a) unset refuses — the unset matrix; (b) below-plans refuses — the
  too-small set; (c) refusal is *before any session launch* — the invocation boundary itself
  (exit precedes startWatchTier/startTier output, recorded); (d) free cells unaffected —
  decision D9 places the guard inside paid test bodies only, proven by the free matrix; (e)
  deadline from MINUTES — the MINUTES-unset refusal plus the reported deadline line; the
  deadline's actual value is unprovable free (a paid session would be needed to observe it
  tick) — recorded as unproven with reason.
- Red demonstration at planning: no committed test exists to show red and an unguarded free
  run is the free-cell case (which stays green by design); an unguarded paid run would spend a
  real session — out of scope and impossible here (no paid grant, no `paid_budget`). Recorded:
  the cases are invocation proofs only; their red side is criterion 4's own missing behavior,
  exercised at implement.

## Proof-command notes

- Criterion tests run through `akrogon run-check --name <label>`; the two fail-first cases run
  `bun test ./tests/docs-links.test.ts` / `bun test ./tests/chart-shapes.test.ts` after the
  configured `bun install` flock prelude (node_modules absent in this worktree).
- Criterion 4 invocations run at implement on the committed head (guard must exist).
- No `checks` command proves criteria 1-2 by design; `test` (which runs docs-links +
  chart-shapes) proves criterion 3 and also covers the symlink/brokenLinks bound.
- No credential, grant, or `Missing:` value is needed: no paid launch is run, `env` injection
  replaces the reservation for proof purposes, `paid_budget` absence is stated for review.

## Implementation notes

- 2026-11-22: Slot B repair follows design 4′ with a pre-leaf chart holder for reservations, item 6 with a bound on live watcher activity through cleanup, and the Leaf architecture and 9′ with actual consultant-start evidence for the ledger audit.

- 2026-11-22: criteria 1 and 2 are recorded under the model-choice reading (design's standing-
  design line): rule-text correctness is a reviewing-seat reading recorded in its review file;
  no case or count stands in for it. Their function-check surface (links resolve, heading names,
  files changed) is covered by docs-links and the diff itself; the rest is read, not tested.
- 2026-11-22 (check.fix, handed F3): design 4′ leaves the standing entry's `approved.date`
  undefined while `paid_budget` is absent, and forbids handoff waiting on the key. Resolved:
  the entry writes `date: "pending"` while the key is absent — the truthful state, no approval
  date invented — in `skills/chart-issues/SKILL.md` and `assets/shapes.md`. Answer field still
  names the config path.

## Serial-solo check

Waves hold 3 then 2 units — not serial-solo. U5's implement-end invocations are A's own proof
runs, not worker work.

## Pass record

- Tests committed: `5e749414` on branch `budget-rules` (docs-links + chart-shapes cases, each
  `Test-Change:` trailer). No product code before them.
- Checks kept: `check plan-c3-links: 1`, `check plan-c3-shapes: 1` — both intended reds, cited
  above. No other check run red.
- No credential named by the design is missing (`akrogon status` shows no `Missing:` lines);
  `paid_budget` absent from `~/.akrogon/config.yaml` is noted for review, not a blocker — no
  proof here needs it (D10).
