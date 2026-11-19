# Review A: seed-decisions

Base `5efc625d`. Reviewed head `781b7204` (worktree clean).

## Evidence

- `akrogon verify` on `781b7204` is green: setup, format, typecheck and test, with 1227 pass (`implementation/check-test-1795048444598-1827968.log`). An earlier verify on the same head was red on `tests/hc-identity.test.ts` "dispatch never adopts another session terminal after the repo core changes". The leaf has no code path to that test, and `akrogon flaky` lists it failing on 2026-11-17. The same-command retry was green, so the report records the check as inconsistent with both logs. I agree: the diff is Markdown rule text plus one added test case.
- C1: the marker test fails on a deliberate break (`check-marker-deliberate-break-…-1300921.log`, output `"differing": ["## Operator Decision ("]`) and passes after the revert (`check-marker-agreement-…-1301493.log`). The planning-time condition cases are in plan.md. The test reads both files and compares against the independent literal from marker decision 1. No mock and no wording match beyond a literal that runs as written.
- Structure: in shapes.md the fences open and close in pairs, and `## Held disagreements` sits inside the design-shape fence (line 302, inside the fence at 292–309). It is not a real heading of shapes.md. `grep "## Operator decision (" docs README.md skills/chart-issues/assets` finds nothing, so the literal has two copies.
- No grant, no covered operation, no count lines. That matches readiness `grants[0]`, which expired at charting.

## Criteria

- **C1** holds; evidence above.
- **C2** cases, read against `skills/seed-issue/SKILL.md`:
  - (a) The `## Report` exception lets the agent infer points from words that refer to a fix settled earlier in the session, with no confirmation and no display. The heading uses `git config user.name` and the date, and the template places the section after `Unverified intake.`. The `Last operation:` clause `; operator decision section written` names the section without its text. Holds.
  - (b) "I think we should do X" is named as writing no section. Holds.
  - (c) A named report goes straight to the edit route: `gh issue view … --json body`, insert after `Unverified intake.`, `gh issue edit <n> -R "$repo" --body-file -`, then read back and compare outside text and section, ignoring trailing whitespace. A mismatch is printed as a failure with the URL. Holds.
  - The ban on fixes is kept for every other report, and `## Lifecycle filing`, lesson-triggered reports and requestless passes write neither section. Holds.
- **C3** cases, read against chart-issues SKILL.md and its assets:
  - (d) The heading line matches outside a fence. Author `dlee` reads `write` with 0 edits, so the section counts. That gives one fork in the shapes.md seed-decision shape: `## Taken` holds the section verbatim plus the label line, and `## Findings` holds the check record. It is shown first in the opening map, CHART.md Forks taken points to it without restating, and `Not in scope:` goes to Off route. Holds.
  - (e) #144's mention appears only in prose inside quotes, and Open says "A mention in prose is not a marker". No taken fork. Holds.
  - questions.md "The one exception is an autopilot session…" and autopilot.md "this is the one exception to…" are unchanged and still true, because the new definition sentence makes a counting section an operator answer, not an exception. shapes.md's "operator answer" lines are unchanged and true. Holds.
  - Marker 1–2, door-record 1–4, finding-against 1–4 and leaf-carry 1 are each present in the files named by the design's Leaf architecture.
- **C4**: "never proposes a fix" now reads "never proposes a fix of its own…". The every-fork sentences in plan-work.md and autopilot.md gain the every-mode qualifier, and the six-section list gains the optional sections. `docs/reference/skills.md` is qualified. No new docs file. Holds.
- **C5**: docs-links is green inside verify `test`. Holds.

Docs: I opened the pages for the changed behavior (`docs/use/report-an-observation.md`, `docs/use/plan-work.md`, `docs/use/autopilot.md`, `docs/reference/skills.md`). Beyond the edits, `docs/reference/words.md` Seed and `docs/use/a-working-day.md` step 1 still read true. No `AREA.md` is in the diff.

## Fixes

None.

## Nits

- **N1** `skills/seed-issue/SKILL.md` edit route: the rule refuses a closed report, but the read it names, `gh issue view <n> -R "$repo" --json body`, does not return `state`. An agent that follows the command literally cannot see that a named report is closed. Deferred because no run exists: an agent would normally add `state` to the read. To promote it, show a real seed-issue run that edited a closed named report, or show that the read a covering report goes through also lacks state. The lookups do return `state`.
- **N2** `docs/use/autopilot.md` § What the door does, "A decision counted from a seed stays yours.": a colleague's counting decision is the colleague's, not the operator's. The rule (finding-against 4) says it holds until the operator next opens the door. Deferred because the sentence's point, that A never overrides it, is true. To promote it, show an operator reading this line as "only my own seeds count" and skipping a colleague's decision.

## Verdict

nits
