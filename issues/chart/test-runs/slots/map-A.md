# Map A: Tamdoma/akrogon#53

## Verification
- Confirmed: framework `merge_checks.verify: bun run framework:verify` (framework issues/config.yaml:13-14), a chain of ~50 commands incl. every skill test folder. Merge runs every `checks` then every `merge_checks` in the worktree after rebase (skills/merge-issue/SKILL.md:35).
- Confirmed: base-run rule runs the same command once on AKROGON_BASE and does not compare failing test names (skills/implement-issue/SKILL.md:38, check-issue:57).
- Confirmed: the slow capture tests carry 300 s per-test timeouts (deploy-core.test.ts:6191,6218,6234,6251).
- Framework has no CI that runs tests on main (.github/workflows has only release-branch.yml). "Run it on main" has no runner today.
- Host: 32 cores; nothing in akrogon limits how many heavy commands run at once across leaves (src/next.ts dispatch counts tabs via max_active only).

## Forks, most reshaping first
D1. Where does the whole-repo suite run?
 - a Per leaf at merge (today). Cost: every leaf pays the full suite under shared load.
 - b (rec) Per leaf runs only what its diff can affect (consumer's `test_changed`-style command with AKROGON_BASE); the full suite runs once on main after merges, serialized, and a red main becomes new intake naming the merge range. Google TAP pattern.
 - c Full suite only in a nightly/CI job. Cost: needs CI the framework does not have.
D2. How many heavy runs may overlap on one host?
 - a (rec) Host-wide heavy-run gate owned by akrogon: commands marked heavy (merge_checks, base runs, slow runs) take a slot from a small host-wide limit, waiting rather than competing. Removes the load-induced timeout class.
 - b No limit (today).
 - c Lower max_active. Cost: throttles all work, not just heavy runs.
D3. When is "red on base" a valid stop?
 - a (rec) Only when base fails the same test(s) as the leaf with a real assertion failure; a timeout or a different failing set is inconclusive, so the seat reruns the failing tests alone once (under the gate) before any verdict.
 - b Today: any red base run stops the leaf.

## Pitfalls
- Running affected-only per leaf lets cross-area breakage reach main; the main run must find it fast and name the range.
- A concurrency gate can deadlock if a seat holds a slot while waiting for another seat; slots must be per-command, released on exit.
- Retrying only on timeout can hide real slowness regressions; record every retry.

## Overlap with leaf-readiness
None in mechanism. Both touch skills/implement-issue and check-issue prose; file overlap is not a dependency.

## Research
- practitioner · John Micco (Google TAP lead), "Flaky Tests at Google and How We Mitigate Them", Google Testing Blog, 2016-05-27 · ~1.5% of runs flaky, often from resource contention; Google reruns failures and tracks flakiness rather than trusting single results · supports D3a.
- practitioner · Atif Memon, John Micco et al., "Taming Google-Scale Continuous Testing", ICSE-SEIP 2017 · presubmit runs affected tests; full continuous runs happen post-submit with culprit finding · supports D1b.
- better-than-training · GNU flock(1) / POSIX advisory locks · kernel releases a lock when the holder exits · D2a slots cannot leak on crash.
