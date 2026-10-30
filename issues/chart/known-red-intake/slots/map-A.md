# Map A: known-red-intake

Outcome asked (#121 Expected behavior, operator 2026-10-27): a red that is also red on main gets filed as a bug automatically.

## Forks

F1 · Who files, and on what trigger?
- (a, pick) The seat files through the existing `seed-issue` skill right after its known-red judgment agrees: a `verify --known-red` pass whose head and base logs it judged complete and causally matching (implement-issue Shared context, check-issue check.review, merge-issue red verify), or, for a command outside `checks` (done-criterion proof or ad-hoc suite), its own run of the same command on the base that fails the same test names. Reason: the judgment gate already decides "this is main's defect"; seed-issue already routes to the consumer repo (framework test -> framework `issues_repo`), dedupes with two read-only lookups and is linked into claude, codex and pi (`~/.{claude,codex}/skills/seed-issue`, `~/.pi/agent/skills/seed-issue`). Covers the #121 case (ad-hoc suite, no verify). Cost: skill text in three seat skills; filing quality depends on the seat.
- (b) `akrogon verify` calls `gh issue create` itself in place of the herdr notice. Rejected: only configured `checks` (the #121 suite was not one), files before the seat's causal judgment, re-implements seed-issue routing and dedupe in code, and adds a mutating outside call to a code path that tests must fake.
- (c) A local durable record (file under the consumer's `issues/`). Rejected: leaf branches cannot write `issues/` (`akrogon phase` rejects issues diffs), it is not "filed as a bug", and someone must still turn it into intake.

F2 · What does the filing hold, and how many?
- (a, pick) One filing per red command (all its failing test names together), naming the command, failing test names, head and base SHAs, kept log paths, and the leaf. Reason: the 38 #121 reds shared one cause; one report per command matches how verify identifies a unit and keeps the issue count small. Seed-issue's keyword lookup then searches on the failing test file path so the next leaf finds it.
- (b) One per failing test name. Rejected: 38 issues for one stub leak.

F3 · What happens when filing fails or finds a duplicate?
- (a, pick) A found covering report is recorded by URL in the report or review; a failed `gh` call is recorded with its command and error; the leaf continues either way. Reason: base-red lock says nothing waits or fails for a base red; seed-issue already prints the outcome lines.
- (b) Block the leaf until filed. Rejected: reintroduces a wait for main's defect, foreclosed 2026-10-10 and 2026-10-17.

## Off route (A)
- Removing the herdr main-red notice in `src/verify.ts` (`sendMainRedNotice`, `newRedUnits`): the filing does not need it gone; separate intake if wanted.
- Skipping the base comparison when a filed seed already covers the test: weakens detection of a new break inside a red unit; not asked.
- #120 (log loss, busy alert): owned by `killed-check-log`.

## Pitfalls
- Duplicate issues across leaves and days: seed-issue's lookups (own reports in two days, keyword search) remove most; naming the failing test file in the keyword search removes the rest. Stated limit: a red older than two days with an unusual name can still duplicate.
- Filing a leaf's own break as main's: removed by filing only after the existing judgment gate agrees.
- Wrong repo: seed-issue's owner test routes akrogon-owned paths to akrogon; a framework test path routes to framework.
- Direct route: the door's own landing known-red step (chart-issues `## Direct route` 5.3) has the same gap; include it so lifecycle and direct share one rule (base-red Taken: "One rule for lifecycle and direct").

## Question I would ask
- Should merge-issue's B file too, or only the seats before merge? Pick: all three, since a red first seen at merge is the same main defect.
