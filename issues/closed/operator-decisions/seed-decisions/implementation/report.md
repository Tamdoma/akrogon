# Implementation report: seed-decisions

Base `5efc625d` (unchanged at both refreshes: start of pass and before verify; no branch move). Committed head `781b7204`. Mode: `subagents`, delegated (wave 1 had two units).

## Commits

- `c07722ff` test: seed-issue and chart-issues share the operator decision heading start (planning; `Test-Change` trailer)
- `9e470848` skills: seed-issue writes operator decision sections from the person's words (U1, worker commit `2b50e15c`)
- `369e502c` skills: chart-issues takes counting operator decision sections in seeds (U2, worker commit `f3182542`)
- `781b7204` docs: seed decisions count as taken forks (U3, worker commit `390283fa`)

## Changed files and reasons

- `skills/seed-issue/SKILL.md` (U1; D1, D3, D4, D5): the `## Report` exception for the operator decision section and requested background, an optional decision block after `Unverified intake.` and a background block after `## Suspected cause` in the template, the edit route in the lookups paragraph and `## Submit and finish` (`gh issue view` read, insert or replace, `gh issue edit <n> -R "$repo" --body-file -`, read-back compare ignoring trailing whitespace, concurrent-edit limit), and the final-lines clauses `; operator decision section written` / `; background section written`.
- `skills/chart-issues/SKILL.md` (U2; D1, D6, D7, D8): two `## Open` paragraphs (counting test with the literal, fenced-block and `totalCount` door readings, graphql and per-login `permission` reads, one retry, admin-only limit, record step, not-counted handling, later-section compare), one `## Take` paragraph (finding definition, blocking and other findings, superseded A pick, round-reply clash, two readings in manual, person at the door wins), and the `## Handoff` clause "with every seed-decision fork".
- `skills/chart-issues/assets/questions.md` (U2; D9): the operator-answer definition sentence and the conflict-between-operator-answers clause.
- `skills/chart-issues/assets/autopilot.md` (U2; D9): one paragraph after the waits paragraph. Paragraph 1 is unchanged.
- `skills/chart-issues/assets/shapes.md` (U2; D10): the seed-decision fork shape with its label line and check record, optional `## Held disagreements` in the design shape, and the leaf-carry sentences.
- `docs/use/report-an-observation.md`, `docs/use/plan-work.md`, `docs/use/autopilot.md`, `docs/reference/skills.md` (U3; D11): only the sentences the rules made false.

## Worker notes folded in

- U1 added that a request naming a filed report goes straight to the edit route, skipping the inspection, routing and lookups. Background on an edit goes at the end of the body. A named closed report stops visibly. A judged this consistent with seed-writer decision 2 (the report the person names).
- U2 left SKILL.md `## Autopilot` "answers … every fork" unchanged. It stays true because a seed decision is an operator answer by definition (questions.md definition sentence).
- U3 put the docs qualifier in one sentence after all three mode sentences ("In every mode, a fork already taken from an operator decision section in an imported seed is not asked again, and A never answers it."), because the autopilot and full-autopilot sentences were also made false. This is within D11 and differs from the brief's placement only. U3's step 5 grep found the other hits still true: `docs/examples/quick-fix-story.md:26`, `docs/pictures/ways-to-run.svg:28`, `docs/reference/words.md:27`, `docs/use/a-working-day.md:9`, `docs/README.md:30`.
- `grep -rn "## Operator decision (" docs README.md skills/chart-issues/assets` has no hits. The literal has exactly two copies.

## Criteria and evidence

- **C1** (marker agreement), proven by test `tests/chart-shapes.test.ts` "seed-issue and chart-issues share the operator decision heading start":
  - After U1 only, red on chart-issues (`check lane-after-u1: 1 …/check-lane-after-u1-1795048136754-1294774.log`). After U2, green (`check lane-after-u2: 0 …/check-lane-after-u2-1795048136952-1294980.log`, 16 pass).
  - Deliberate break on `781b7204`: the seed-issue template line was edited to `## Operator Decision (<name>, <date>)`. Result: `check marker-deliberate-break: 1 /home/ivan/Work/infra/akrogon/issues/open/operator-decisions/seed-decisions/implementation/check-marker-deliberate-break-1795048207807-1300921.log`, output `"differing": ["## Operator Decision ("]`.
  - Reverted with `git checkout`. Result: `check marker-agreement: 0 /home/ivan/Work/infra/akrogon/issues/open/operator-decisions/seed-decisions/implementation/check-marker-agreement-1795048207962-1301493.log`.
  - The test also ran green inside the final `akrogon verify` `test` check.
- **C2** (seed-issue cases a, b, c): rule text, read by the reviewing seat against plan.md C2. A read the U1 diff against the three cases and found them true. No live run (no grant).
- **C3** (chart-issues cases d, e, and the unchanged lines): rule text, read by the reviewing seat against plan.md C3. A read the U2 diff. The "one exception" sentences in questions.md and autopilot.md, and shapes.md's "operator answer" lines, are byte-unchanged: U2 checked with `git diff -U0`, and A saw no removed text in those lines in the word diff.
- **C4** (docs): rule text, read by the reviewing seat. `git diff --stat 5efc625d...HEAD -- docs/` shows 4 modified files and no added file.
- **C5** (links): `check lane-after-u3: 0 …/check-lane-after-u3-1795048207673-1300696.log` (docs-links, 13 pass), plus the final verify `test` check.

## Checks

First `akrogon verify` on `781b7204` (1 m 3 s): red.
- Setup, format and typecheck green (`check-format-1795048220264-1304107.log`, `check-typecheck-1795048222803-1304107.log`).
- `test` red: `verify test: 1 /home/ivan/Work/infra/akrogon/issues/open/operator-decisions/seed-decisions/implementation/check-test-1795048280541-1304107.log`. 1226 pass, 1 fail: `(fail) dispatch never adopts another session terminal after the repo core changes` (`tests/hc-identity.test.ts:95`, `next` exited 1).
- No cause in the leaf's diff: `git diff 5efc625d...HEAD` touches only Markdown rule text and one added case in `tests/chart-shapes.test.ts`. Nothing reaches hc dispatch. `akrogon flaky` lists this test failing once before, on 2026-11-17T12:03:13Z.

Retry of the same `test` command on the same head through `akrogon run-check`: green, `check test: 0 /home/ivan/Work/infra/akrogon/issues/open/operator-decisions/seed-decisions/implementation/check-test-1795048356277-1563570.log` (1227 pass). The check is marked **inconsistent**, with both logs above.

Second `akrogon verify` on the unchanged head `781b7204` (1 m 2 s), run to write the receipt the `check.review` move requires: green.
- `verify setup: 0 …/check-setup-1795048382844-1827968.log`
- `verify format: 0 …/check-format-1795048385341-1827968.log`
- `verify typecheck: 0 …/check-typecheck-1795048387762-1827968.log`
- `verify test: 0 …/check-test-1795048444598-1827968.log` (1227 pass)
- `verify leaf 781b7204…: green`.

## Grants and count lines

None. The leaf made no covered operation and no GitHub call. The readiness grant expired at charting.

## Known limitations

- A live door that stops re-asking is unproven here. It will be observed when Tamdoma/tamdoma-framework#714 is charted after release.
- The permission read is proven only with an admin caller. A write-level caller and the Moderate role mapping are unobserved.
- A concurrent body edit between seed-issue's read and write is not detected (stated in the rule).
- The change reaches doors only at the next release link.

## Unverified criteria

C2, C3 and C4 are rule text that the reviewing seat reads against plan.md's cases. No test covers them, by design.

## check.fix 2026-11-19

Prior reviewed base `5efc625d`, prior reviewed head `781b7204`. B's repairs for F2, F3 and F4 (`382e2e76`, `7acba8f1`, `9b3e62e3`) brought the head to `9b3e62e3`. The refresh at the start of this pass and the one before verify found `origin/main` still at `5efc625d`, so the branch did not move. Handed-off base `5efc625d`, handed-off head `f0f853a5`.

Input: review-B.md `Handed to A` F1 only (C1). The marker test passed when only the seed-issue template heading was renamed, because the prose mention on seed-issue line 34 still matched (`implementation/check-review-b-marker-template-rename-1795048544623-2092576.log`).

Repair: `f0f853a5` corrects the planned test's expectation in `tests/chart-shapes.test.ts`, with a `Test-Change` trailer citing B's F1 log. The case also requires a `skills/seed-issue/SKILL.md` line that starts with `## Operator decision (`, which is the writer template heading. The existing expectations stay: at least one mention per file, and every mention exact.

Evidence, all runs of `bun test tests/chart-shapes.test.ts -t "operator decision heading"` on the uncommitted correction over `9b3e62e3`. The temporary product edits were reverted with `git checkout`.
- Corrected test on unchanged product, green: `check f1-corrected-green: 0 …/check-f1-corrected-green-1795048769495-2106933.log`
- Only the template line renamed to `## Settled decision (<name>, <date>)`, red: `check f1-template-rename-red: 1 …/check-f1-template-rename-red-1795048769635-2107071.log`, output `"templateHeadings": false`
- Case-only break of the template line, still red: `check f1-case-break-red: 1 …/check-f1-case-break-red-1795048769767-2107239.log`, output `"## Operator Decision ("`
- Restored, whole file green: `check f1-restored-green: 0 …/check-f1-restored-green-1795048769933-2107388.log` (3 pass). Prettier is clean: `check f1-format: 0 …/check-f1-format-1795048770138-2107495.log`.

`akrogon verify` on `f0f853a5` (1 m 3 s): green.
- `verify setup: 0 …/check-setup-1795048775974-2108046.log`
- `verify format: 0 …/check-format-1795048778539-2108046.log`
- `verify typecheck: 0 …/check-typecheck-1795048781111-2108046.log`
- `verify test: 0 …/check-test-1795048838543-2108046.log` (1227 pass, docs-links included, so C5 holds)

C2–C4 are rule text that B's repairs changed. B reread them in its check.repair entry, and this pass changed no rule or docs text. No grant was drawn and no covered operation ran.
