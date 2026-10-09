# Review B

Date: 2026-10-09
Phase: check.review
Verdict: ready
Base: a2e9f9411d2639ec3841ef152c442b0bfe13778b (effective `akrogon config`)
Reviewed head: 5cda3546d65452569806192a64af65a0ea53f225

## Scope and findings

Reviewed the full four-file diff against brief.md, plan.md (including the changed:false implementation note), design.md, implementation/report.md, and the recorded live Herdr probe. Debate is disabled, so no positions or rebuttals are expected. No peer review was read.

No Fixes, Nits, operator actions, or reusable lessons found.

The production guard restricts the swap to non-bootstrap missing-A/surviving-B allocation. The split uses the existing placement flags, persists the new A ID before further Herdr calls, reads focus immediately before swapping, and makes one swap with B as source. Both success and failure paths restore a different previously focused tab. Swap failure preserves the new ID and reports the leaf and Herdr failure. A restoration error after swap failure warns without hiding the swap error. A restoration error after success is reported. Subsequent allocation sees the recorded A and does not split again. Existing allocation branches are unchanged.

New response schemas accept extra Herdr fields, and tab parsing retains focused/workspace fields. Production makes no pane-layout call. Fake geometry and focus behavior agree with the recorded horizontal-split and swap probe. The design explicitly carries the concurrent tab-switch and extra-pane focus costs and requires no new live run.

## Verification evidence

Inspected saved proof logs for this reviewed head rather than repeating completed checks. No code change, missing check evidence, or specific correctness concern required a rerun.

- C1: implementation/p2-c1.log, 1 pass / 0 fail. The CLI test asserts A's right edge is at or left of B's left edge and preserves B's ID, agent, and session.
- C2: implementation/p2-c2.log, 2 pass / 0 fail. Another-workspace focus is restored, and same-leaf focus stays on B without a tab-focus call.
- C3: implementation/p2-c3.log, 1 pass / 0 fail. Swap failure reports the leaf and fixture error, makes one swap and no close, restores focus, preserves A's ID, and the next pass creates no additional pane.
- C4: implementation/p2-c4.log, 4 pass / 0 fail. New tab, bootstrap, B-only replacement, present/reversed seats, and extra panes are covered, including repair with extra panes.
- Fail-before: implementation/red-before.log shows the missing swap failure and the extra-pane replacement's geometry failure (A right edge 120, B left edge 60). The corresponding tests pass after the fix.
- Required checks: implementation/p2-full-suite.log records 592 pass / 0 fail; implementation/p2-changed.log records 566 pass / 0 fail. implementation/p2-typecheck.log and implementation/p2-format.log support the report's successful typecheck and format runs. The report records reverting unrelated formatting drift. The worktree is clean.

The report's base field is stale after rebasing. This review uses the effective base above, whose diff contains only the four reported implementation files and three implementation commits. The saved full-suite proof covers the reviewed head independently of the older changed-test selection. This metadata discrepancy does not affect correctness or verification.

## Documentation

Read docs/reference-index.md, src/AREA.md, tests/AREA.md, and docs/guide/next.md. No documented behavior changed. The guide's dispatch and allocation claims remain accurate. No AREA.md changed in the reviewed diff.

## Test-Change trailers

- 566f7f4: `Test-Change: tests/fake-herdr.ts added fake geometry/swap/layout/tab-focus capability; no existing expectation changed`
- 5cda354: `Test-Change: tests/next.test.ts added seat-A replacement cases covering order, focus, swap failure and unchanged paths; no existing expectation changed`

Both paths match src/test-files.ts. The additions follow plan units U1/U3 and brief criteria 1-4. The fake schema replacement retains existing pane/tab fields and fixtures, and no existing assertion, fixture expectation, or recorded output was changed or deleted. These trailers accurately describe the diff.
