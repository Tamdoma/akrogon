# Review B: door-reads-live-address

Date: 2026-11-16. Phase: check.review, initial blind review.
Base: `8532a1f786367d9e521e24567e7294d6660dd743`.
Reviewed head: `f774816753aa5fbe3e379444604ed345fb826247`.
Verdict: **ready**. No Fixes, Nits, unresolved questions or operator actions.

## Criteria and scope

- C1 passes: `skills/chart-issues/SKILL.md` Open defines the address as A's `$HC_TERMINAL_ID` read at each use, makes recorded addresses history rather than routing, and requires resolved literals in briefs and helper arguments. It explains the consultant-shell expansion problem.
- C2 passes: reviewed every address use in the three owned files. Open explicitly covers normal column calls, `--save`, `--restart`, report steps, A's transcript lookup, Mode/seat entries, the reset target and start prompt. Questions binds the report destination to the live literal. Handover binds the helper argument to A's live literal before the helper starts, and the receiving session checks its own live address. Record-write instructions do not select recorded addresses for routing.
- C3 passes: the not-in-a-tab rule retains recording once and continuing the round, conditional on calling the helper with the live address.

The entire diff is four line replacements across the three planned files. It implements plan D1–D6 without changing helper interfaces or excluded work. Read the affected Open, Blind peer exchange and Handover documentation at head, plus `docs/reference-index.md` and `skills/AREA.md`. No AREA.md changed and no index pointer needs updating. Followed the direct-route, autopilot and shapes references: their address placeholders and historical records introduce no competing routing source. The unchanged reset and transcript scripts accept explicit address arguments as the design states.

Concrete scenario: after the door moves from the report's old t1tm to t1xr, the new rule selects t1xr for column calls, newly written report commands, transcript lookup and reset arguments even if the summary or seats record still holds t1tm. Consultants receive the literal t1xr rather than their own environment variable. Existing briefs remain subject to the design's nudge-then-drop limit. Deployment remains the next release link.

## Verification evidence

Read the report, plan, readiness record, kept logs through `akrogon log`, leaf timing records and verify receipt. The criteria are text outcomes judged by reading, as brief and design require. The plan's greps are supplementary observations, not exact-word acceptance gates. No code tests were added.

The planned probes have completed green head runs after the commit at 15:52:43Z, matching the report and `issues/timings.jsonl`:

- `check c1-definition: 0 implementation/check-c1-definition-1794844365742-476379.log`
- `check c2-use-sites: 0 implementation/check-c2-use-sites-1794844372024-476621.log`
- `check c3-not-in-tab: 0 implementation/check-c3-not-in-tab-1794844372114-476686.log`
- `check c2-source-candidates: 0 implementation/check-c2-source-candidates-1794844372226-476752.log`

The candidate listing contains the definition and record writes, with no recorded routing source. Plan-time red probes establish the prior clauses' absence. No proof-command correction is recorded or needed, and no planned test or runner configuration was skipped, filtered, disabled or changed.

`issues/verify-runs.jsonl` receipt `7a811ec9-7a06-45fb-8ab8-f83bd97f2170` records the exact reviewed head and completed green setup, format, typecheck and test commands:

- `check format: 0 implementation/check-format-1794844379425-476971.log`
- `check typecheck: 0 implementation/check-typecheck-1794844381707-476971.log`
- `check test: 0 implementation/check-test-1794844438467-476971.log` — 1183 pass, 0 fail, 82 files.

The receipt's commands match the configured checks. No input changed after those runs. Existing evidence is sufficient, so no check was rerun. Grants are empty, no covered launch is claimed, and the local probe/check logs match completed timing entries. The readiness record's helper observation is chart-time evidence, not a live operation required or repeated by this review.

## Test-Change trailers

`8532a1f786367d9e521e24567e7294d6660dd743..HEAD` contains one documentation commit and no `Test-Change:` trailers. None of its paths matches `src/test-files.ts`. No existing test, assertion, fixture or recorded expectation changed.

## Findings

None. No reusable Nit requires a lesson entry. No peer review was read and no commit was made.
