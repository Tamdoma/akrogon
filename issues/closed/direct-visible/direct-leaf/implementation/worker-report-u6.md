# Worker report — U6: skills and prose docs rewrite

Commit: 4ba5b46e docs: direct route becomes the leaf lifecycle (single commit on top of creation commit 5c5337df, verified at start). This report file is intentionally untracked; the deliverable commit carries only the work.

## Changed files and reasons

- skills/chart-issues/SKILL.md — `## Direct route` rewritten to the leaf-lifecycle flow: door writes ISSUE.md/brief.md/design.md/readiness.yaml under issues/open/<chart-slug>/<slug>/, runs `akrogon direct`, implements as slot A with the implement-issue leaf form, phase moves, merge wait per design item 11, chart tail (pack/landed SHA/Closed), direct-drop for abandon/growth stop. Eligibility list kept as-is plus one bullet "the door is not inside hc" (design binding decision 2 names this eligibility change). The push-authority sentence and the direct-route.md pointer deleted. L99 chart-tail sentence updated ("no leaf files" claim removed).
- skills/chart-issues/assets/shapes.md — slots comment no longer names direct review returns; the direct/ tree line now describes probe captures and the drop destination; the `## Direct attempt` shape shrunk to slug/landed SHA/trigger (the command's state.yaml now tracks everything else); the state.yaml note now says a direct-route chart writes real leaf files and state.yaml comes from `akrogon direct`.
- skills/chart-issues/assets/direct-route.md — deleted.
- skills/chart-issues/scripts/direct-guards.ts — deleted.
- tests/direct-guards.test.ts — deleted.
- tests/receipt-gates.test.ts — exactly the assigned deletions: the dedicated direct-guards test and the direct-guards invocations/helper inside the two merge-gate tests; all other merge-gate assertions kept.
- tests/docs-links.test.ts — the "chart-issues direct landing names the known-red command" test deleted (the door-level known-red judgment is gone per design item 8); direct-route.md removed from the red-names file list and the pack-literal concat list. SKILL.md alone still satisfies the >=3 `akrogon pack <chart>` count (L99 general rule plus the direct landing and abandon steps).
- skills/implement-issue/SKILL.md — the direct form removed everywhere: description, prompts paragraph, standalone exceptions, and the `### Direct form` section replaced by one short note that chart-door direct work uses the leaf form with the folder `akrogon direct` created.
- skills/check-issue/SKILL.md — direct-review clause dropped from description and the prompts paragraph; the `## Standalone review` section (exclusively the direct form) deleted.
- skills/broadcast-issue/SKILL.md — "chart door after a direct landing" sender mentions removed (4 spots); direct leaves broadcast through the same leaf-B path.
- skills/plan-issue/SKILL.md — ", on the direct route in `<chart>/direct/plan.md`" removed; corrections now live in implementation/report.md for every leaf.
- skills/watch-issues/SKILL.md — required-seats line extended with the D6 direct mapping (implement/check.repair/check.fix/merge/failed A, check.review B) and the fact that direct seats carry no akrogon labels so they read unknown and are left alone.
- skills/init-akrogon/SKILL.md — fix_rounds comment corrected: it bounds leaf repair rounds (lifecycle machinery), not the deleted door-round bound.
- skills/AREA.md, tests/AREA.md — direct-route.md/direct-guards.ts mentions removed.
- src/AREA.md — one word-range edit removing "and direct-guards" from the requireGreenReceipt caller list. Judgment call: this file sits under src/ which the brief says not to touch, but criteria 2-3 grep src/ and step 7 orders "fix anything found", and no other unit can fix this dangling reference. Minimal doc-line edit only, no source file touched.
- docs/use/quick-fix.md — rewritten to the new flow end to end.
- docs/README.md, README.md — one-line/alt-text corrections.
- docs/reference/skills.md — chart-issues Result line and broadcast-issue When/Who lines corrected to the new flow. L32/L39 kept verbatim: they correctly describe the new flow (the door does run implement-issue as seat A and does start check-issue with seat B for a direct-route chart), which criterion 3 permits.
- docs/reference/config.md, docs/reference/files.md, docs/reference/words.md, docs/use/plan-work.md, docs/use/a-working-day.md, docs/start/what-it-is.md — small stale corrections (door no longer lands, direct/ contents, fix_rounds row). These are outside the named path list but are user-facing prose docs of exactly the deleted machinery; judged inside the brief's goal. Each edit is one or two lines.

## Tests run

- `bun test tests/receipt-gates.test.ts tests/docs-links.test.ts tests/command-reference.test.ts --timeout=120000` — 22 pass, 0 fail, 1517 expect() calls.
- `bun run typecheck` — exit 0.
- Criterion 2 grep `grep -rn "direct-guards" skills docs src tests README.md` — no matches (exit 1).
- Criterion 3 grep `grep -rn "direct-route" skills docs src tests README.md` — only the accurate new-flow mentions listed above plus the two stale assertions inside tests/run-units.test.ts (see mismatch).
- Sanity: tests/chart-shapes.test.ts and tests/lessons.test.ts + tests/hold-retired.test.ts green (other files reading the edited skills).
- `bun test tests/run-units.test.ts` — 29 pass, 1 fail: the mismatch below.

## Mismatch returned to A

`tests/run-units.test.ts` L1019/L1022 ("skills name the run-check keeping rule") asserts `check-issue` matches `<chart>/direct` and `implement-issue` contains `--holder <chart>/direct`. Both strings lived only in the deleted door-direct sections; in the new flow direct leaves are real leaves whose runs attribute to the leaf implementation folder, so no honest text can restore them. The file is outside the test edits the brief assigns ("a worker writes and edits no test — EXCEPT the deletions/retargets this brief explicitly assigns"), and the plan, design item 15 and research-skills.md never mention it — a plan gap. The test is now red: 29 pass, 1 fail in that file. Everything else in the file passes.

## Known limitations

- docs/examples/quick-fix-story.md narrates the old door-landing flow end to end (branch/worktree by hand, direct/plan.md, door verify-and-push). A faithful rewrite would be a fabricated story, so it was left untouched; docs/README.md still links it.
- docs/pictures/factory-overview.svg, working-day.svg, ways-to-run.svg embed old-flow text in the drawings ("door lands it itself", "door builds, B reviews, door lands"). Pictures are not prose docs; editing SVG artwork was judged outside the brief's prose scope.
- seed-issue/SKILL.md L90's parenthetical "or the chart-issues direct door" was left: the door, as implement-issue slot A, can still file base reds, so the phrase remains true.

## Unverified criteria

None. Criteria 1-9 verified as listed above. Criterion 9's "no other test file broken" holds for every file except tests/run-units.test.ts, which is the declared mismatch.
