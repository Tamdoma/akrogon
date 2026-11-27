# Review B: charting-guide (check.review, round 1)

- Base: `5d425ea8381036e9ae0fa87ef91d7da9d0254a06` (`origin/main`, re-fetched at review, unchanged)
- Reviewed head: `e59b9a4cef82b581dbc492fd39e815ece3752403`
- Diff: `docs/README.md` (+10), `docs/guide/04`–`08` (new, 473 lines). No code, test, skill or AREA.md file changed.

## Verification evidence

- `akrogon verify` receipt `3f4ccffa-cb1a-4222-aee7-283c98a3ef1d` on `e59b9a4c`: green (format 0, typecheck 0, test 0, 1550 pass). Kept log `implementation/check-test-1795776389212-2064839.log`.
- `docs-links` on `e59b9a4c`: 13 pass, 0 fail (`implementation/check-docs-links-1795776271592-2063844.log`).
- Head and base are the same as the receipt's, so no check was rerun.
- `Test-Change:` trailers in `5d425ea8..HEAD`: none. No test file is changed, so none is required.
- AREA.md files in the diff: none.
- Documented behavior: no product behavior changed. The diff only adds docs.
- Retired-phrase scan of `docs/guide/` (`manual`, `quick fix`, `autopilot signposts`, `the door`, `chart door`): no matches.
- `docs/README.md` `## Charting` links 04 → 08 in order. Every page's previous/next line names only pages that exist. There are no image links and no links to 01–03 or 09–13.

## Criterion 4: cold-reader record

A fresh subagent inside this session was given only the five paths `docs/guide/04`–`08` and the seven questions. Line numbers below are per file.

| Q | Cold-reader answer | Quoted line | Expected | Verdict |
|---|---|---|---|---|
| 1 | Charting mode decides who answers the questions while charting. Build route decides who builds once every question is answered. | 06:5 "**Charting mode decides who answers the questions while the work is charted. [Build route](07-build-route.md) decides who builds the work once every question is answered.**" | same | match |
| 2 | No autopilot with Direct, subject to the eligibility checks | 07:26 "…new CSV export button built fast today… This fits **No autopilot** with **Direct**." and 07:31 "**Direct is offered only under No autopilot…**" | No autopilot + Direct, Direct only under No autopilot | match |
| 3 | Semi-autopilot: you answer the signposts once and the agent answers the forks. Full autopilot: you answer neither. In both you still answer the needs-sheet rows. | 05 table "Semi-autopilot / You (once, for the whole session) / The charting agent", "Full autopilot / The charting agent"; 06:44, 06:65 | Semi: you answer signposts, agent answers the rest. Full: agent also answers signposts. | match (the needs-sheet addition is correct per SKILL.md `## Open`) |
| 4 | Ranked priorities, hard limits and the order of the session's charts, asked once per session before any territory map | 05:7 "**Signposts are your ranked priorities, hard limits, and the order of the session's charts… They are asked once per session, before any territory map.**" | same | match |
| 5 | No, every Semi-autopilot chart uses Lifecycle | 06:80 "**Direct is offered only under No autopilot. Semi-autopilot and Full autopilot always use the Lifecycle build route…**" | No, only Lifecycle | match |
| 6 | Written task contracts under `issues/open/` for a fresh slot A and slot B. It does not start them. | 08:51 "**At the end of a Lifecycle chart, the charting agent hands off written task contracts under `issues/open/` for a fresh slot A (the builder) and slot B (the reviewer). It does not start the work.**" | same | match |
| 7 | They map and answer independently. The charting agent merges their views with agreement tags, then each consultant sends one rebuttal. | 04:39 "**consultants map the codebase and answer each open question independently, and the charting agent merges their views.**" | same | match |

All seven answers match and quote a supporting line. The cold reader reported no contradiction between the pages.

## Criterion 5: behavior claims

I checked the report's `## Behavior claims` rows and the page prose against `skills/chart-issues/SKILL.md` (`## Open`, `## Drain`, `## Take`, `## Handoff`, `## Direct route`, `## Autopilot`, `## Handover`), `assets/questions.md`, `assets/autopilot.md`, `assets/handover.md`, `assets/shapes.md`, `scripts/door-reset.ts` (`resetWord`: claude/agy `clear`, codex/pi `new`), `src/status.ts` (`chartHeader` CHART/TAKEN/FOG/STAGE/AGE, `chartRow`, `lastStage`), `src/direct.ts` (`liveSeat` probes, `phase: 'implement'`, `direct: true`, drop rename), `src/preflight.ts` (C1 remote, C2 remote branch, C3 tracking ref) and `src/hc.ts` (`repoSpace`). Every row has a real supporting path. Except for F1 below, no claim contradicts a source.

## Criterion 7: tone reading (model choice)

Reading: passes. The pages read as a plain how-to guide built around one made-up example. They contain no marketing words. Each page opener has at most one practical soft-sell sentence (04:3, 05:3, 06:3, 07:3 "ship small, settled changes in minutes…", 08:3 "A clean hand-off is where charting pays off…"). Git and Akrogon terms are explained on first use: repository, worktree, branch, commit, default branch, seeds, fork, Fog, leaves, done-criteria, `.env`, harness, compaction, `plan.synthesis`, epic. `hc` is described as herdr's background controller. Reason: the stated reader can follow every page without outside docs, and the cold reader answered every question from the pages alone. The density of 06 "What still waits" and 08 "safeguards" is high but accurate, and the reader needs those lists. The running example `client-portal` / weekly client report export is carried on all five pages and names no real client.

Criteria 1, 2, 3 and 6 are met, apart from the example defect in F1.

## Fixes

### F1: the worked signposts example shows a round shape the skill forbids and the page itself contradicts

- Where: `docs/guide/05-signposts.md:65-88` (the example round) against `05-signposts.md:17-19`.
- Defect: the page says a signposts round has "**4 to 7 questions**" and keeps "the reply key and challenge check". The one worked example then shows a round with 3 questions and no challenge check. `skills/chart-issues/assets/questions.md` (signposts paragraph) requires "Four to seven questions" and says "the reply key and the challenge check stay".
- Realistic source: the page content itself, read by the stated reader. This is the chapter's only picture of what a signposts round looks like.
- Consequence today: a reader learning what to expect is shown a round the charting agent never produces, two paragraphs after a rule that rules it out. The reader cannot tell whether the rule or the example is right.
- Criterion hit: 5 (a depiction of charting behavior that does not match `skills/chart-issues/`) and 3 (the signposts example).
- Repair: add at least one more steering question to the example, for example the date window or timezone for the weekly report. Add a short `Challenge check` line before the reply key. Keep the rest of the example unchanged.

## Nits

- N1, `06-charting-mode.md:100`: "If a consultant errors out, blocks, or stops replying twice…" can be read as needing two of each. `autopilot.md` drops a consultant on its first block, error or exit, and only on a second silent stop. Deferred because the outcome (dropped and logged) is stated correctly. It becomes a Fix if a reader or the operator acts on the two-strike reading.
- N2, `07-build-route.md:14` (table): each Lifecycle seat is "in its own tab". A leaf has one tab (`src/state.ts` `tab:` field), which line 64 states correctly ("their own dedicated herdr tab"). Deferred because this is lifecycle behavior outside criterion 5's charting scope, and guide-chapters owns the lifecycle page. It becomes a Fix if 09-lifecycle.md repeats it.
- N3, `07-build-route.md:53`: "If Discord announcements are configured, … then marks `CHART.md` as `Closed`" ties `Closed` to Discord. SKILL.md `## Direct route` step 6 appends `Closed` either way, and 08:67 states it without the condition. Deferred because 08 gives the correct reading. It becomes a Fix if a reader reports a chart they expected to be `Closed`.
- N4, `05-signposts.md:75-84`: signpost 2a picks "zero new paid APIs", while the needs sheet asks for a Postmark key. That works only if Postmark is already in the stack, which the example does not say. Deferred as illustrative detail. It would be fixed together with F1 if the writer chooses.

## Verdict

`fix` (F1).

## check.repair (2026-11-27, B)

Fixes read: F1 (review-B). review-A has no Fix.

### F1 repaired

- Commit: `4aff0f68` `docs: give the signposts example four questions and a challenge check`. Head moved `e59b9a4c` → `4aff0f68`. Only `docs/guide/05-signposts.md` changed.
- Before: the example round had 3 questions (speed vs polish, paid-service limit, chart order), a reply key `1a 2a 3a` and no challenge check.
- After: the example has 4 questions. The new question 3 asks "Which timezone should report dates and sync times use?" and steers all three charts. Chart order moved to question 4, now with a Steers line under 4a. The reply key is `1a 2a 3a 4a`, followed by a `Challenge check` line naming consultant B's dissent. The operator reply and the closing account were updated to match.
- This now matches `skills/chart-issues/assets/questions.md` ("Four to seven questions… the reply key and the challenge check stay") and the page's own 05:17–19.
- First repair commit `3f41db48` put the order question's Steers line under 4b. The cold-reader rerun flagged it as reading like a note on 4b alone, so I moved it under 4a and amended the commit before handing off. `3f41db48` was verified green but is replaced by `4aff0f68`.

### Reruns on the repaired head

- `akrogon verify` on `4aff0f68`: green (setup 0, format 0, typecheck 0, test 0). Log: `implementation/check-test-1795777023701-2789017.log`.
- Criterion 4 cold-reader rerun: a fresh subagent given only `docs/guide/04`–`08` answered all 7 questions matching the expected answers. The quoted lines are the same as round 1 (05:7, 06:5, 06:80, 07:26, 07:31, 08:51, 04:39). It judged the example consistent with the round rules (4 questions, 2 options each, one recommendation, no research block, reply key, challenge check).
- Criterion 7 tone: the added lines are plain, so my round-1 reading stands.
- The configured `format` check (`prettier --check src tests skills/chart-issues/scripts`) does not cover `docs/`. Prettier would also reflow 05's pre-existing table, so that is not caused by this repair.

### Nits still held

N1–N4 from round 1 stand. The cold reader added two more:
- N5: example questions 1 and 2 steer only the export chart, against "only choices that steer several later decisions across the session's charts".
- N6: the "two-sentence account" quoted at 05:107 is one sentence.

All six are wording or illustration issues tied to these pages. None is a reusable mechanism, so no lesson line is written.

Handed to A: none. Operator actions: none.
