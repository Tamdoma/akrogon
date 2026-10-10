# Plan: lesson-write-rule

Debate off (`debate: no`); synthesis directly from brief, design and live surfaces. `seed-owner-routing` is merged (`phase: merged`), and its seed-issue surfaces are live in this worktree: the owner test at `skills/seed-issue/SKILL.md:24-28` and the covering-report URL outcome at the Submit section.

## Decisions

- D1: The rule lives in one new file `skills/lesson-rule.md`, a sibling of the skill folders like `skills/AREA.md`, owned by no one skill. Exact name decided by this plan; write sites link `[lesson rule](lesson-rule.md)` (or `../lesson-rule.md`-style relative paths from docs).
- D2: The rule file holds exactly three rules, in this order:
  1. Match: before adding a line, check the active list for a lesson with the same failure cause and scope; shared keywords are not a match, and an unsure match gets a new line. On a match, append the new case to that lesson's history file and add no line.
  2. Seed: a lesson whose mechanism a command could detect as a fixed pattern — the first clause of `learn-issues`' Checkable definition, referenced to `learn-issues/SKILL.md`, never copied; whether a running guard already covers it is left to charting — new or matched, gets `/seed-issue` run for it unless its history already links a report; the created or returned report URL is appended to the history file. A judgment lesson files nothing.
  3. Home: a lesson about akrogon's own skills or command is written into akrogon's `learnings/`, with the root located by seed-issue's owner rule (`command -v akrogon` → `readlink -f` → git root), left for the operator to commit; when the root cannot be found the seat says so and writes locally.
- D3: Each of the five write sites replaces its lesson-writing clause with one sentence pointing at the shared file; format details each site already states (one line naming mechanism/date/history path, history file with case/evidence/learning, `learnings/LESSONS.md` and `learnings/history/<date>-<slug>.md` locations) stay as they are where they add site context, but the three rules above are stated nowhere else.
  - `skills/plan-issue/SKILL.md:39` (Shared context paragraph).
  - `skills/implement-issue/SKILL.md:31` — the writing half only; the "applying a lesson" half stays per design exclusion (belongs to guard-retires-lesson).
  - `skills/check-issue/SKILL.md:59` (both sentences: the "found here" recording and the pre-verdict Nit recording) and `skills/check-issue/SKILL.md:89` (pre-merge Nit recording).
  - `skills/chart-issues/SKILL.md:31` (the "Reusable findings" clause; the "historical lessons as observations" clause stays).
- D4: `skills/AREA.md` gains one Key files line for `skills/lesson-rule.md`, since a new shared key file is added and five skills read it.
- D5: `docs/guide/learn.md`: the lesson paragraph's "Run `/learn-issues` …" sentence is replaced by a link to `../skills/lesson-rule.md` naming its outcome (match before adding, checkable lessons get a seed filed by the seat, akrogon lessons land in akrogon's learnings). `/learn-issues` keeps its role as the backlog triage named in the text, no longer presented as the only lesson outlet.
- D6: `docs/guide/cheat.md:150` (the `learn-issues` table row): reword so triage is scoped to the existing/guarded backlog rather than being the lesson outlet. README.md:195's skill table line is a plain skill description, not an "only outlet" claim; leave it.
- D7: `skills/learn-issues/SKILL.md` is unchanged (design exclusion). `src/`, tests harness, config: unchanged. No new command, pass, state or format.
- D8: Acceptance proof for criterion 5 is a fresh subagent deciding verdicts only — never running `gh`, `/seed-issue` or any write — against recorded case files under `<leaf>/cases/`. One run on the shipped rule, one run on a deliberately broken variant (the Match clause changed so a shared keyword counts as a match). Verdicts use a fixed per-case line `verdict | append-case | new-line | seed | no-seed | akrogon-learnings | local+notice` so comparison is mechanical.
- D9: Structural tests added to `tests/docs-links.test.ts`: each of the five SKILL.md files contains a link to `lesson-rule.md` (criteria 1 and 6 covered by the existing resolver plus this check). No test asserts rule wording (standing design).

## Read-first

- `docs/reference-index.md` → `skills/AREA.md`, `docs/guide/`
- `skills/seed-issue/SKILL.md` — owner routing (lines 14-28), covering-report URL outcome (Submit section); consumed by rule clauses 2 and 3.
- `skills/learn-issues/SKILL.md` — the referenced Checkable definition; do not copy it.
- `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/chart-issues/SKILL.md`, `skills/plan-issue/SKILL.md` — the five write sites.
- `docs/guide/learn.md`, `docs/guide/cheat.md:150` — lesson prose and triage row.
- `tests/docs-links.test.ts` — link resolver and sweep coverage (skillsDir SKILL.md files are swept; a `skills/*.md` resource file is not swept, so links from it are not covered — the write-site links are the covered direction).
- `learnings/LESSONS.md` — active-line format the rule preserves.
- `/home/ivan/Work/infra/tamdoma/framework/learnings/history/2026-10-08-manifest-determinism-rewrites-checksums.md` — case-1 evidence.

## Interfaces

- Rule file: three clauses (Match / Seed / Home) as in D2; the only artifact of the leaf.
- Write-site pointers: `[lesson rule](lesson-rule.md)` markdown links so `docs-links.test.ts` resolves them.
- seed-issue outcomes consumed: created-issue URL or covering-report URL printed on `Last operation:`; the URL lands in the lesson history file, never on the LESSONS.md line (line format unchanged).
- Case record shape (criterion 5): per case, LESSONS.md excerpt or new-lesson draft, history file text, named failing path(s), declared checkable/judgment note hidden from the decider, expected verdict.

## Checklist and waves

### U1 — Shared rule file and skill write sites (wave 1)
- Owns: `skills/lesson-rule.md` (new), `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/chart-issues/SKILL.md`, `skills/AREA.md`.
- Write the three clauses of D2; replace the five write-site clauses with pointers per D3; add the AREA.md Key files line.
- No shared test resource. Depends on: nothing.

### U2 — Guide prose (wave 1)
- Owns: `docs/guide/learn.md`, `docs/guide/cheat.md`.
- Apply D5 and D6; keep the issues_repo seed paragraph as-is (it describes seed-issue, not the lesson rule).
- No shared test resource. Depends on: nothing.

### U3 — Acceptance cases and fresh-agent proof (wave 2)
- Owns (artifacts, not committed to the branch): `<leaf>/cases/*.md` — five case records plus the expected-verdict table.
- A authors the case files, then runs the fresh-agent decision twice (shipped rule, then broken variant per D8), records verdicts/reasons and the subagent identity in the implementation report.
- Depends on: U1 (the shipped `skills/lesson-rule.md` is the input under test).

Wave 1 runs U1 and U2 in parallel (disjoint paths, no shared fixture, no dependency). Wave 2 is U3, sequential after U1.

## Verification

| Criterion | Proof | Failure caught | Size | Rerun trigger |
|---|---|---|---|---|
| 1 rule exists once, sites point, no restated copy | `grep -rn "same failure cause" skills/ docs/` and `grep -rn "Checkable" skills/ docs/` — hits only in `skills/lesson-rule.md` and `learn-issues/SKILL.md`; `bun test tests/docs-links.test.ts` plus the new write-site-link test | a second copy of a clause, a missed write site, a dead pointer | seconds | any edit to skills/ or docs/ |
| 2 match appends, unsure/new cause adds line | fresh-agent case run (U3): case 1 expects `append-case` + no line; case 2 expects `new-line` | broken Match clause | minutes | rule file changes |
| 3 checkable-unseeded gets one seed run, linked/judgment file nothing | same run: case 1 expects `seed`, case 3 expects `no-seed` (judgment), case 5 expects `no-seed` (linked report) | missing or over-eager seed clause | minutes | rule file changes |
| 4 akrogon lesson lands in akrogon learnings; root missing → local + notice | same run: case 4 expects `akrogon-learnings` (`/home/ivan/Work/infra/akrogon/learnings/`) + seed routed to Tamdoma/akrogon | wrong home rule | minutes | rule file changes |
| 5 five cases decided without posting; broken variant fails case 2 | subagent return recorded with verdicts, reasons and harness; second run on the keyword-variant of the Match clause must produce `append-case` on case 2, proving the clause carries the weight | vacuous proof, leaked posting | minutes | cases or rule change |
| 6 learn.md links rule and names outcome; cheat.md no longer sole outlet; every relative link resolves | `bun test tests/docs-links.test.ts` (README + guide + SKILL.md sweep); manual read of the two edited paragraphs | dead links, stale sole-outlet claim | seconds | docs edits |
| checks | `bun run format`; `bun test --changed="$AKROGON_BASE" --timeout=30000` plus `bun test tests/docs-links.test.ts` explicitly; `bun run typecheck` | formatting drift, red changed tests, type errors | seconds–minutes | any commit |

All checks `bun test`, `bun run format`, `bun run typecheck` block. `merge_checks` is empty; nothing added.

## Docs affected

- `skills/plan-issue/SKILL.md` — lesson line points at shared rule.
- `skills/implement-issue/SKILL.md` — writing half points at shared rule.
- `skills/check-issue/SKILL.md` — two recording sites point at shared rule.
- `skills/chart-issues/SKILL.md` — reusable-findings clause points at shared rule.
- `skills/AREA.md` — new Key files line for `skills/lesson-rule.md`.
- `docs/guide/learn.md` — lesson paragraphs link the rule and name outcomes.
- `docs/guide/cheat.md` — triage row rescoped to the backlog.
- `skills/learn-issues/SKILL.md` — read for the referenced definition; unchanged.
- `docs/reference-index.md`, `README.md` — reviewed; no change needed (no restated rule, no sole-outlet claim).

## Open limitations

- Concurrent writers can add one extra line or seed; the next match folds it in (design Interface note, accepted).
- The "checkable" call is seat judgment guided by the learn-issues clause, not a mechanical gate; false positives land as intake seeds charting can close.
- Case evidence is fabricated except case 1's real history excerpt; the subagent decides on text, so this tests the rule's decidability, not live filing.

## Notes

- Case 1's `manifest-determinism` lesson has no report link in its framework history file; the run expects `seed`. Case 4's expected seed destination is `Tamdoma/akrogon`: the akrogon repo has no `akrogon.yaml`, so seed-issue falls to the akrogon root's `origin` (verified live: `https://github.com/Tamdoma/akrogon.git`); the lesson itself lands under `/home/ivan/Work/infra/akrogon/learnings/` via `command -v akrogon` → `readlink -f` → `/home/ivan/Work/infra/akrogon`.
- No credentials are named in the design and `akrogon status lesson-write-rule` prints no `Missing:` lines; no human-only blocker.
