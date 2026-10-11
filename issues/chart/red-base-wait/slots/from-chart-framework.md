# From chart-framework (worktree-isolation), 2026-10-10

Changed:
- main-health-from-framework/CHART.md: appended `Held 2026-10-10` and "Superseded by akrogon issues/chart/red-base-wait." No other file touched.
- worktree-isolation/CHART.md: new Ownership and destinations section. Sole owner of store, guard, migration, reconciler, base-run and both repos' `worktree_root` lines. akrogon-code leaves hand off to akrogon issues/open/, framework-only leaves to framework issues/open/.
- forks/base-rerun.md: your interface recorded.

base-run contract vs yours: it matches. Taken 1a has the caller supply the base sha, exact command, args and relative cwd. It runs fresh in a new store checkout every time with no reuse, logs to the leaf's implementation folder, records start, exit and removal in issues/base-runs.jsonl, and returns log path and exit status. The verb never picks or judges the baseline.

One point to settle when writing leaves, not a disagreement: a merge-time run belongs to a merge attempt and may span several leaves. We plan to log it under the attempt's issue folder with the parent attempt id in the record. Tell me if your merge skill needs a different place.

No disagreements.

## Update 2026-10-10, after handoff
- Handed off. akrogon issues/open/worktree-isolation: check-env, then worktree-store and leaf-env-file, then base-run, then worktree-reconciler.
- base-run now also owns the skill text swap: every hand-made base checkout instruction in check-issue, implement-issue and merge-issue becomes one `akrogon base-run` command line. Your skill rewrites build on top of that line, so they should be blocked-by base-run, or rebase onto it.
- Merge-time base-run logs go under the merge attempt's issue folder, with the parent attempt id in the record.

## Note from framework chart merge-flow, 2026-10-11 (operator approved)
Context: framework issues/chart/merge-flow found why no framework merge ran overnight. Four lines for akrogon, yours to take or drop:
1. Test prerequisites prepared at charting. Operator: "we always have to prepare everything so the tests are correct. We need to prepare these things during the charting session. I think that should be a part of Acrogon, but its already a part of it. We just maybe need to strengthen it." Today the needs sheet and readiness.yaml inputs cover keys and approvals. Framework checks also need a browser binary, committed recordings and symlink permission, and some tests used to pass silently when those were missing. Suggestion: the needs sheet covers check tools too, and `akrogon next` refuses dispatch when a declared check tool is absent.
2. Browser binary as a declared check input. issues/config.yaml `env:` passes only DISPLAY, WAYLAND_DISPLAY, XDG_RUNTIME_DIR, and the browser is found by PATH probe (page-measure.mjs:241-249). Attempt 7d0af76f lost two 101 s runs to BROWSER_UNAVAILABLE.
3. Fresh-checkout run. The overnight base red was a real main defect (a test wrote root .spec/) hidden in every leaf worktree because seat hooks had already created .spec/ there. Only a run in a checkout without .spec/ sees an idempotent create. Fixed on framework main (d78282a71). base-run already runs fresh, which is what caught it.
4. Attempt records could carry each check's wall time and pass/skip/fail counts, so speed and skip trends need no log grep.

## Note from framework chart, 2026-10-11: merge ejections from a moving main

The operator calls this systemic and asked for it to go to the akrogon chart now. Evidence is from framework, 2026-10-11.

- F1: A leaf's checks run on the base it started from. It is rebased onto current main only inside the merge attempt (src/batch.ts:106).
- F2: So conflicts with newly landed code first show up in a 10-minute merge run. root-influence merged at 07:25 (attempt 0fd25f81). check-scratch (56737d2e, F9: root-influence's new repo-root guard rejects its scratch git roots, 18 selftest fails) and formspark-build-wiring (662d9a76, F15: TS2741, the `dispose` method main added is missing) were both built on ee8255d and both ejected by 07:44.
- F3: An ejection to check.fix uses the same fix_rounds counter as review fixes. At the cap the leaf goes to failed (src/phase.ts:308-313). Both leaves went to failed this way and were recovered by hand.
- F4: Load makes it worse. 4 of the last 9 framework attempts were ejected.
- O1: Before joining a merge, rebase the leaf onto current main and re-run its check in its own lane.
- O2: Don't count ejections caused by main moving against fix_rounds.
- Recommendation: O3, both. O1 does most of the work, and O2 stops a leaf from dying for a conflict it did not cause.
- Unknown: whether formspark's lint errors F16/F17 (runner :1735, :1804) also come from F1 or are misses in the leaf's own check.

## Note from framework chart, 2026-10-11: cheap checks run only at merge

The operator, verbatim in substance: the testing for these should come first, not wait till the end. Send to chart-akrogon slot A now.

- F5: A framework leaf's own check runs only parity, contracts and selftest (framework issues/config.yaml `checks`). typecheck and lint run only at merge, inside framework:verify:cheap (framework package.json:163).
- F6: formspark-build-wiring passed all 3540 selftest tests in its own check. It was then ejected at merge for one typecheck error (F15) and two lint errors in its own code (F16 runner :1735, F17 runner :1804, review-B.md:481-483). These took seconds to find, but only after review and a merge run.
- F7: night-flow's sibling-breaks fork covers main moving under a leaf. It does not cover a leaf whose own check never runs the cheap merge checks. F16/F17 would have failed even on an unchanged main.
- Ask: the leaf's own check should run every cheap merge check before review, so only slow or integration failures can reach merge. The framework fix may just be a `checks` entry for framework:verify:cheap. If akrogon should enforce "every merge check either runs in the leaf check or is declared slow", that belongs to your chart.

## Operator decision, 2026-10-11: cheap checks in the leaf check as an akrogon rule

Operator, verbatim: "that should be akrogon rule too". Framework adds framework:verify:cheap to its `checks` as leaf L9. The operator also wants akrogon to require this for every repo: a merge check cheap enough to run in the leaf's own check must run there, before review.
