# Merged map: Tamdoma/akrogon#53

## Facts
- F1 (A,B) framework `merge_checks.verify` = `framework:verify`, a chain of 72 stages (B count; intake said ~50), run at every leaf merge after rebase and again after a competing push (skills/merge-issue/SKILL.md:35,45).
- F2 (A,B) Base-run rule runs the same command once on base and stops on any red; it does not compare failing tests or conditions (implement-issue:38, check-issue:57). B: introduced by 6c29639 (2026-10-01), not 12ae124.
- F3 (A,B) Nothing limits heavy commands across leaves on one host; max_active (default 3) counts leaves only (src/next.ts:276-307).
- F4 (B) Leaf failed again at 14:23 after the 14:14 resume (framework log.jsonl:1294-1298); intake ends at the resume.
- F5 (B) The idle 320/320 passes are operator observations; overload is likely but unproven.
- F6 (B) The two-line template change is tested directly by deploy-core.test.ts:5359-5373, so "unrelated" is too coarse; some deploy tests are affected, not all browser fixtures.
- F7 (A,B) Framework has no CI running tests on main; release-branch.yml publishes main without tests (B: lines 3-39).
- F8 (B) Overlap rule (8e5e31b) is narrower than intake says and has no host reservation.

## Forks, most reshaping first
D1 (A,B) What must pass before a leaf lands, and where does the full suite run?
 - a keep full suite per leaf (today), maybe with a limit.
 - b (rec A,B) per leaf: affected tests plus cheap global checks; full suite runs on a main revision with a named owner before release. Main can briefly carry a regression the selection missed.
 - c full run on a serialized batch before main changes (merge queue). Keeps main always verified; adds a queue.
D2 (B) Who decides "affected"? rec: the consumer owns an executable selection command over changed files incl. templates, fixtures, config, lockfile; akrogon just runs declared commands. Not agent judgement per diff, not a build-graph platform.
D3 (A,B) Host-wide heavy-run limit: one shared host slot (start at 1) for merge suites, base runs and slow proofs; waiting is visible and costs no repair round; slot released when the process and its children exit (kernel lock). Not lower max_active, not load-average adaptive.
D4 (A,B) "Red on base" only counts with comparable execution: same command/scope, real assertion failures, same conditions (under the slot); a timeout, kill or different failing set is an unresolved execution failure, not base-red. No retry-until-green (A had one rerun of failing tests; B allows one chosen diagnostic rerun after fixing a known condition).
D5 (B) If the full suite leaves the leaf, who owns it? rec: one framework job proves the exact revision before release publishes; the old per-leaf gate is removed only after D2 selection and this gate both work.

## Split (B, A agrees)
- akrogon: heavy-run slot (D3), base-result policy (D4).
- framework: affected selection (D2), full-suite gate before release (D5).
- Real dependencies only: removing the per-leaf full gate waits for both framework pieces; D4 depends on D3 only if it needs the slot's outcome fields.
- Sibling leaf-readiness: no shared mechanism; it owns inputs and the failure log line.

## Research
- practitioner · John Micco, Google, "Flaky Tests at Google" (testing.googleblog.com, 2016-05-27) · presubmit vs postsubmit split; retries/quarantine can hide real bugs.
- practitioner · Machalica et al., Meta, "Predictive test selection" (engineering.fb.com, 2018-11-21) · select dependent tests before trunk, exhaustive testing before deploy.
- practitioner · Tan, Balabanov, Lin, Uber, "Flaky Tests Overhaul" (uber.com/blog, 2024-06-04) · periodic full main runs, resource-constrained results separated, owners for failures.
- better-than-training · Playwright CI docs (playwright.dev/docs/ci) · one worker for stable CI; this suite runs under Bun so Playwright worker flags do not apply.
- better-than-training · Nx affected docs · selection = git diff + dependency graph; lockfile changes select everything.
