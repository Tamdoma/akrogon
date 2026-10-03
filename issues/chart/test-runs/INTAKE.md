# Intake: test-runs

## Scope
Destination akrogon: heavy test runs on one host take turns through one machine-wide slot (D3), and a "red on base" stop requires comparable, completed runs (D4). The framework half (affected-test selection, full suite before release) is chart framework-test-scope, split from this intake by the operator on 2026-10-02.

## Provenance
- GitHub: Tamdoma/akrogon#53
- Operator: 2026-10-02 chart-issues pass
- Completion owner: chart framework-test-scope (operator 2026-10-02, handoff Q1 1a). Leaf base-red-complete has empty `sources`, so #53 stays open until the framework half delivers.

## Source: Tamdoma/akrogon#53
# Whole-repo merge_checks run per leaf time out under concurrent seat load and stop leaves as red on base

Source: Tamdoma/akrogon#53
URL: https://github.com/Tamdoma/akrogon/issues/53

Unverified intake.

## Observation

On framework leaf `emdash-fleet-backup` (consumer `Tamdoma/tamdoma-framework`, epic `emdash-cms`), the leaf's own checks were green:
- `hooks:selftest` 2059 pass
- parity, contracts and typecheck pass
- fleet suite 165 pass

It still stopped as `failed` because `merge_checks.verify` (`bun run framework:verify`) timed out in browser-capture tests of a skill the leaf barely touched. In that skill folder the leaf changed only two lines of `data/emdash-env.template`.

### Timeline (UTC, 2026-10-02, from `issues/log.jsonl`)

- 12:25 `check.review -> merge` (B). B runs `framework:verify`, which includes `bun run test:cf-workers-deploy`, about 320 tests that launch headless Chromium through Playwright.
- 12:44 `merge -> check.fix` (B, review-B F9). `gate wiring: 04-renamed-asset-same-bytes …` hit its 300 s timeout.
- check.fix: A reran the suite on the leaf head. Result: 319 pass, 1 fail in 475 s, a different test this time (`gate wiring: URL capture equals dist capture`, 300 s timeout).
- A ran the base-run rule (`12ae124`): same command on `AKROGON_BASE` in a detached worktree. Five tests had timed out or failed before the background limit killed it after about 25 min:
  - `join prep reads the branch head as live commit when none is recorded`
  - `gate wiring: 03-…`
  - `gate wiring: 04-…`
  - `gate wiring: 10-…`
  - `gate wiring: 14-…`
  
  All end in `setViewportSize: Target page, context or browser has been closed` after `this test timed out after 300000ms`.
- 13:18 `check.fix -> failed` with reason `bun run test:cf-workers-deploy red on base ab700d4cc… (Playwright capture timeouts, dev-cf-workers-deploy, outside leaf)`.
- The leaf sat failed for 56 min. `emdash-health-run` and `emdash-upgrade-route` stayed blocked on it.

### Follow-up by the operator's session (about 14:10 UTC, machine otherwise idle)

- Single failing test alone: pass in 6 s.
- Full `bun run test:cf-workers-deploy` on main `ab700d4cc`: 320 pass, 0 fail, 183 s.
- Same suite on the leaf head `1b95a0cfc`: 320 pass, 0 fail, 181 s.
- No stuck browser processes. Load average 0.8, 78 GB RAM available.
- The leaf was resumed with `akrogon phase emdash-fleet-backup check.fix`.

The failing test set differed on every run: B, A on the leaf head, and A on base. The overlapping heavy runs at the time:
- fleet-backup B's merge verify.
- offer-join A's full checks (`implement -> check.review` 12:01, then check.fix from 12:06).
- fleet-backup A's leaf rerun and base rerun.
- offer-join's live-hub run, later.

The machine-wide overload cause was not proven by catching a hang live.

### Related recent akrogon changes, for context

- `5375dbe` "Add merge_checks: commands that block only at merge". Slow suites run once at merge.
- `67b8ccf`, `a9b0cb4`, `af8d363` check-scheduling (#48). On `emdash-conversion`, a 15-minute `framework:verify` had run at least 6 times. Now it runs only at merge.
- `8e5e31b` proof-order: overlap rule. Up to 3 workers may run while a slow run is in flight.
- `12ae124` and base-red-exit (#50). One base run of the same command. Red on base ends the pass with `failed --reason "<command> red on base <sha>"`. The rule does not compare failing test names between the two runs, and it runs once regardless of current machine load.
- Framework `issues/config.yaml`: `merge_checks.verify: bun run framework:verify`. That chains about 50 commands, including every skill's test folder, so every leaf runs every browser suite at merge.

Even after those changes, one timeout at merge produced three heavy runs: B's merge, A's rerun and A's base run. Several leaves and seats do this at once on one machine, with nothing limiting how many heavy runs overlap.

## Location

- akrogon:
  - `merge_checks` handling (`skills/merge-issue/SKILL.md`, `src/config.ts`).
  - Base-run rule (`skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, commit `12ae124`).
  - Overlap rule (`8e5e31b`).
  - Parallel dispatch of leaves and seats on one host.
- Consumer: `Tamdoma/tamdoma-framework`.
  - `issues/config.yaml` `merge_checks.verify`.
  - `package.json` `framework:verify:core`.
  - `.claude/skills/dev-cf-workers-deploy/test/deploy-core.test.ts` (300 s Playwright capture tests).
  - Evidence: `issues/open/emdash-cms/emdash-operations/emdash-fleet-backup/implementation/report.md` ("check.fix round 4: F9 red on base") and `implementation/evidence/f9/`.

## Reproduction

Seen once in full on 2026-10-02 (fleet-backup F9). The operator reports heavy repo-wide runs as a recurring cost across the epic (#48, #50).
1. Have two or more leaves active on one host, with seats running `checks`, `merge_checks` or a base run at the same time.
2. Reach merge on a leaf whose `merge_checks` is the whole-repo `framework:verify`.
3. Browser-capture tests time out, and which test fails varies per run. The seat's single base run, also under load, times out too. The leaf ends `failed … red on base`.
4. Rerunning the same suites with the machine idle passes 320/320 on both base and leaf head.

## Expected behavior

- A leaf should not stop because an unrelated whole-repo suite timed out while other seats were running heavy work.
- Heavy tests should not run for every leaf over areas the leaf did not change. The operator questions running the whole-repo suite in every leaf at all, as opposed to running it on main.
- A failure should not multiply into further heavy runs on the same loaded machine.
- A "red on base" verdict should reflect a real base failure, not a timeout from load.

## Urgency

Medium-high.
- Impact: 56 min failed plus about 1.5 h of review, repair and base-run time on one leaf, with two dependent leaves blocked behind it. The same exposure exists for every leaf on this host.
- Workaround: the operator reruns the suite with the machine idle, confirms it passes on base and leaf head, and resumes with `akrogon phase <slug> check.fix`.

## Source: operator 2026-10-02
I pulled another issue, let's chart it as well right now. It's about timing the tests, and the problems I'm having with that.

## Agent findings
Full maps in slots/ (map-A.md, map-B.md, map-merged.md, map-rebuttal-B.md). Summary:
- F1 (A,B) framework `merge_checks.verify` = `framework:verify`, 72 stages, run at every leaf merge after rebase and again after a competing push (skills/merge-issue/SKILL.md:35,45).
- F2 (A,B) The base-run rule runs the same command once on base and stops on any red, comparing neither failing tests nor conditions (skills/implement-issue/SKILL.md:38, skills/check-issue/SKILL.md:57); introduced 6c29639 (2026-10-01).
- F3 (A,B) Nothing limits heavy commands across leaves on one host; max_active counts leaves only (src/next.ts:276-307).
- F4 (B) The leaf failed again at 14:23 after the 14:14 resume (framework issues/log.jsonl:1294-1298).
- F5 (B) Overload is likely but unproven; idle passes are operator observations.
- F6 (B) The changed template is tested directly by deploy-core.test.ts:5359-5373; "unrelated" is too coarse.
- F7 (A,B) Framework has no CI testing main; release-branch.yml publishes main untested.
- B rebuttal: a timeout can expose a real defect, so D4 needs causal judgment on completed comparable runs, not an assertion-only rule; reuse leaf-readiness mechanisms rather than duplicate them.
