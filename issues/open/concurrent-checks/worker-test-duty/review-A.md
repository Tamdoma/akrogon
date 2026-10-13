# Review A: worker-test-duty

Base: a7c9115 — Reviewed head: 419f930
Verdict: fix

## Verification evidence

- `git status --porcelain` clean; `a7c9115..HEAD` = e5ee5b3, 419f930; diff stat: 4 files, 8/8 lines.
- Read the diff hunks against criteria 1–4: §7 of brief-template names targeted commands + none-named rule and drops `test_changed`/`AKROGON_BASE`; worker-protocol and implement-issue assign changed-tests and `checks` to A and bar workers from the full command; wait-on-exit names the mktemp/nohup/log/exit/pid form with never-`timeout`/never-second-start; check-issue checks-block paragraph carries the one outside-run sentence. All four hold.
- `test` check green on retry at 419f930 (889/0) per `implementation/compare-test-head.yaml`; check is green post-change — not blocking.
- Stale-term sweep `grep -rn "test_changed\|changed-tests\|changed-test" docs/ skills/ README.md`: see F1.
- AREA.md path check: all 14 paths named in `skills/AREA.md` exist.

## Findings

F1 — Fix: stale worker-duty terminology outside the owned skill files.

- `skills/AREA.md:24` — "Worker returns include changed-test evidence; ..." The leaf renames worker evidence to targeted tests; the area file still advertises the retired term.
- `skills/implement-issue/SKILL.md` Standalone paragraph — "derive changed-test commands from the checkout, ... check the report and changed-test evidence". Same retired term; under the new rule standalone workers run the targeted commands their task brief names.

Realistic source: this leaf's own diff retired the "changed-test" label for worker duty; these two spots were missed by the plan's `changed-tests` grep (singular `changed-test` didn't match). Consequence today: a doc/standalone reader learns worker returns/commands under the label the leaf abolished, weakening the criterion-2 duty split precisely where a reader looks up worker scope. Criterion hit: 2 (worker-protocol and implement-issue say workers never run the full changed-tests command — the docs must not contradict it).

Expected repair: `skills/AREA.md` "changed-test evidence" → "targeted-test evidence"; Standalone line "derive changed-test commands" → "derive the brief's targeted test commands" (and "changed-test evidence" → "targeted-test evidence"). Small reword, no rule change.

## Nits

None.

## Operator actions

None.
