# Test writer 2 report: direct-seats + direct-active

## Files written

- tests/direct-seats.test.ts — 3 tests (Criterion 3)
- tests/direct-active.test.ts — 2 tests (Criterion 4)

No other files created or modified. No commits. Scratch validation files were deleted after use.

## Red output summary (planning-time run, bun test tests/direct-seats.test.ts tests/direct-active.test.ts --timeout=120000)

0 pass / 5 fail. One line each, why red:

1. `phase moves, stop and passes never touch the direct seats of a cross-session direct leaf` — fails at the first `cli next lc` (exit 1): leaf selection reports fix-alpha unreadable, `Unrecognized key: "direct"` in `Invalid state …/chart-x/fix-alpha/state.yaml`. Pure strictObject schema rejection.
2. `busy_since records required direct slots across sessions and clears non-required slots` — fails at the first `cli next` pass (exit 1): same schema rejection of the direct leaf; busy observation never runs.
3. `a mislabeled direct seat is ended by stop, proving the teardown detection wiring` — fails the terminal-end assertion: `cli stop` throws on the unreadable leaf before endSeats runs, so the mislabeled door terminal survives. On schema-fixed code this test passes even without further direct machinery, which is its purpose: it proves the label-based detection wiring the negative assertions rely on.
4. `an unfinished direct leaf in the same live repo never counts toward max_active` — fails at `cli next lc` exit 1: the direct leaf's unreadable state is reported as a skip before capacity is even consulted.
5. `an unfinished direct leaf in a repo whose session is unreadable never counts toward max_active` — same, plus the repo2 leaf g-direct reported unreadable (two skip lines in stderr).

Every failure is the strictObject schema rejection surfacing through a different verb; no test fails for helper misuse, and none passes vacuously (the negative busy/notice assertions are sequenced after positive ones in the same test).

## Typecheck

`bun run typecheck` reports zero errors in either owned file (grep-verified). The run currently shows errors in tests/direct-runs.test.ts and tests/direct-timing.test.ts — sibling files owned by other test writers working concurrently in this worktree; not mine.

## Validation beyond the schema wall

Because the schema rejection masks everything downstream, I validated choreography with a throwaway copy of the seats file (`direct: true` stripped, slots adapted to base routing where the direct mapping diverges), deleted after use:

- Round-0 move sequence implement → check.review → check.repair → check.fix → check.review executed green end to end with real worktree, citations and green receipt — proving the receipt/citation/worktree guards, the verdict-move mechanics and the seats-untouched assertions fire correctly. Round 1 diverges only in slots (base requires B-only at rounds > 0, direct requires B at every round), which is exactly the behavior the branch adds.
- The busy test ran green end to end at base once the two positive busy_since assertions (which only the direct observe branch can satisfy) were stripped: hold-hook working/idle choreography, cross-session send, state rewrites, passes, notices all work.
- The mislabel test passes green at base without `direct`, confirming detection wiring.
- A standalone probe confirmed the lifecycle implement leaf seats exactly as asserted: seat label `a`, task text `implement-issue lc slot=A phase=implement leaf=<path>`, exit 0.
- One real choreography bug was found and fixed by this validation: the reviewer HOLD send originally went through core1's control channel instead of core2's (addresses collide across cores); now `core2.hc(['send', …])`.

## Deviations from plan.md / task brief (with reasons)

1. tests/charting.test.ts does not exist in this worktree (nor in git history). The second-core/cross-session construction was taken from tests/next.test.ts (otherRepo, core.link) and tests/hc-identity.test.ts instead — same mechanics the plan cites.
2. settings.yaml/renderSettings do not exist anywhere in the repo. max_active is the global config knob in <home>/config.yaml; the tests use the configure() pattern of tests/next.test.ts line 1107, per research-tests.md section 1.
3. issues/blocked/ and issues/stalls/ are not paths the product writes; blocked/stall evidence is notice files under <appHome>/akrogon-notices/. The busy test asserts noticeFiles() empty for both cores AND the literal folders absent, so the plan's intent is covered either way.
4. Fake systemctl vs real systemd: real `systemctl --user stop` exits 0 for a slice that was never loaded (verified on the host), while tests/fake-systemctl.ts exits 5. Since production stop behavior is defined by real systemd, test 1 seeds both leaf slices as loaded in the fake db before the stop sequence (commented in the test). stop --all needs no further seeding.
5. adopt(f.core) is kept per the plan even though with a closed-window default it is mostly inert; test 1 uses window: 'open' so the tab-rename assertions exercise the real rename path rather than being vacuous.
6. The mislabel test deliberately does not assert the cli stop exit code: at planning the stop fails on schema rejection before reaching endSeats; the meaningful assertion is the terminal end itself (plus the reviewer surviving), which is exactly the detection-wiring proof the plan asks for.
7. check.repair → check.fix moves use --slot A per the plan's corrected sequence; note this is stricter than base routing (base check.repair requires B), so the move sequence cannot pass on lifecycle routing alone — it requires the D6 direct mapping, which is the point of the criterion.
8. The second registered repo in the fallback variant uses fabricated seat refs (no-session/no-terminal) since no core exists for it — nothing probes them in the capacity path; repo1's leaf uses real terminals.

## Notes for implementers

- Test 1 asserts stop --all exit 0 with the direct leaf present and lc stopped; the stopped-record assertions are presence-only for lc (the plan fixes no --all semantics for direct leaves).
- The busy test seeds busy_since on both slots before the non-required-clearing pass, so the clearing assertion cannot pass vacuously.
- In the fallback capacity variant, red at planning comes from schema rejection today; once the schema accepts direct it flips to the fallback count hitting the cap (repo2's direct leaf counted as seated+unfinished) until activeCount gains the direct exclusion — both stages are the intended red progression.
