# Direct review B, round 1

Verdict: **fix**

Destination: `herdr-setup`  
Base: `b1d904d645a45c991d0682e0571aa07761a060b0`  
Reviewed head: `c0660fdefb242dbade2f6965b3fbd0c4db9639c8`  
Worktree: `/home/ivan/.akrogon/worktrees/herdr-setup/right-panel`

## F1: Files filter misses the rest of the repo from a subfolder

**Fix.** The real user path is opening Files after a pane has changed into a repository subfolder. `location()` takes that pane's cwd. `mods/files-view/main.js:101–113` discovers the repository root but runs `git ls-files` in the original cwd. Git restricts that listing to the subtree. The filter therefore cannot find files elsewhere in the repo, contrary to files-panel criterion 3 and the design's repo-wide filter decision.

Confirmed with real output from this worktree: from `right-panel/mods`, filtering `README.md` produces no matches. The repo-root listing finds `README.md` and `tests/fixtures/needs-you/README.md`. Keep listing paths and preview resolution consistent when fixing the root. The existing test runs Git only at the repo root and misses this wiring defect.

`check review-B-filter-source: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B-filter-source-1793737152561-591521.log`

## F2: Recent does not switch the displayed list after filtering

**Fix.** User action: type a nonempty filter, then click Recent. The actual button at `mods/files-view/main.js:275` invokes `openRecent()`, which selects Recent and loads its files but leaves `query` unchanged (`167–182`). `body()` returns the repo-wide filter list first (`249`), so it never renders the loaded Recent list (`250`). The button looks selected while showing the previous results, including files outside Recent or an empty filter result despite available recent files.

This breaks files-panel criterion 4's Recent behavior. Make the selected mode and displayed source agree, and cover the filter-to-Recent transition. This finding traces the real input and click handlers through the render branch, rather than relying on a handcrafted helper input.

## F3: An unavailable view still leaves a startup error

**Fix.** Real scenario recorded in `direct/report.md`: restart with an unavailable mod's view saved open. The view renders and records an error before `mods/panel-bar/main.js:207` closes it. The report confirms that the error survives until another reload. Closing afterward does not satisfy panel-top-bar criterion 4, which explicitly requires no error for an unavailable mod.

The retained `pt4-repair.png` and closed-panel status check cover the closed case. They do not clear the reported failure of the saved-open case. Repair that case or return the locked requirement mismatch with evidence. Verify startup with that saved state and `herdr-app status`, not only a launch with the panel already closed.

## F4: Required live outcomes remain unverified

**Fix, verification gap.** The report explicitly lists these interactions as unverified: PT 3 keyboard/reply-box close and focus return, PT 9 narrow buttons, the shipped-store migration in PT 5, FP 2 Markdown/Raw and FP 7 file reload, CP 2–4 view selection/diffs, and NY 3/5/6 option drafting and sending, stale refusal, draft retention and history loading. These are required outcomes in the contracts and plan L1/L4/L5, not optional checks.

The pure tests cover decisions and parsing. They do not exercise those host event handlers, input state, preview rendering or actual no-send behavior on a stale row. Complete the missing live observations through an authorized method, or record an equivalent proof-command correction under the plan rule. Preserve the same observable outcomes. Existing screenshots of rows and helper assertions do not establish them. Also record the grant's cleanup absence read-back, which is missing from the report's “all killed or removed” claim. No additional paid launches were made during this review.

## Verification

Read the direct plan/report, worker briefs 2–6 and 8, all five right-panel contracts, affected source/tests, README, `mods/AREA.md` and the documentation index. Reviewed all changed code, including seeding, layout/prefix wiring and Agents nesting. HEAD matches the supplied SHA and the worktree is clean.

Read these retained logs back with `akrogon log`:

- `direct/check-a-tests-after-u6-1793736981068-273539.log`: 50 tests pass, 0 fail, 98 expectation calls, and checks pass for every mod at the reviewed head. No skips, disabled cases or runner changes found. Green checks were reused.
- `direct/check-tests-red-before-code-1793734607073-152598.log`: initial planned tests fail before the modules exist.
- `direct/check-l3-seed-1793734831365-157673.log`: all temporary homes receive the four panel IDs.

Own retained evidence, also read back:

`check review-B-inspect: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B-inspect-1793737010156-275088.log`

`check review-B-area-paths: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B-area-paths-1793737152711-591615.log`

`check review-B-final: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B-final-1793737335300-596383.log`

The changed AREA's concrete named paths exist. `mods/<name>/mod.json` is a template. No dead documentation pointer found.

Inspected `live/pt4-repair.png`, `u6-files-after-side.png`, `u6-changes-after-side.png`, `u6-needs-after-full.png`, `u6-needs-after-replies-full.png` and `u8-after.png`. They show the rendered controls, count/dot, rows and nesting, with readable side layouts. The proof-command change of starting run-check in akrogon and changing cwd inside it preserves the test command and scope. The report records no equivalent replacement for F4's missing interaction proofs.

## Test-Change trailer

The only trailer in the reviewed range is commit `59a6314aced0992e753bf431e4615a760960db09`:

> Test-Change: tests/panel-bar.test.js added cases for tabOwner (operator 2026-11-03: the tab must show its main agent, "not only focus on akrogon, but in general"); no existing expectation changed

Accepted against the operator request recorded in the report. It adds cases without altering existing expectations. All other test files in this diff are new.

No additional Nits. No phase move, commit or deployment performed.
