# Review B: watch-session

Date: 2026-10-24
Phase: check.review, initial blind review
Base: e0a57bd7323b1bfe71a5f1f0a5488df8d185d8c1
Reviewed head: edb1028a8679059034f4e87dc414e532b5bee908
Reviewed tree: b7b5ae7b29ba99795e0bdf701b4d141ccf04c432
Verdict: ready

## Findings

No Fixes, Nits or operator actions. Reviewed the whole six-file diff against the brief, locked design and plan. Debate is off, so positions-B.md and rebuttal-B.md are not expected. No peer review was read.

The observer resolves the registered repo through the shared resolver before printing, passes OBSERVE_HERDR to discovery and the session-scoped agent-list argv, and maps stored pane ids only against that response. Resolution refusals reach stderr with nonzero exit and no stdout. Empty inventories retain the session line. Agent-list errors still exit nonzero without leaf status lines. The log-resolution and log-tail wiring remain intact.

Opened skills/watch-issues/SKILL.md, skills/AREA.md, docs/reference-index.md and docs/reference/skills.md. The changed output contract is documented and all acting herdr examples carry the reported session. No AREA.md is changed. No lesson removal or retirement claim is present. The PATH shim implements the cited child-environment technique directly.

## Evidence

All cited implementation logs were read through akrogon log. Existing proofs are current for the reviewed tree, so no redundant rerun was needed.

| Proof | Result | Kept log under implementation/ |
| --- | --- | --- |
| C1: resolved-session status and log, other-session pane excluded | 1 pass, 0 fail | check-observe-c1-1792868765596-694506.log |
| C2: missing, duplicate, unreadable and failed discovery refusals | 1 pass, four scenarios, 0 fail | check-observe-c2-1792868765933-694709.log |
| C3: every discovery and agent call uses OBSERVE_HERDR | 1 pass, 0 fail | check-observe-c3-1792868769054-695362.log |
| C4: session output and acting command contract | 1 pass, 0 fail | check-observe-c4-1792868769179-695536.log |
| Whole skill suite, including log-tail consumer | 54 pass, 0 fail | check-observe-skill-suite-1792868771682-695696.log |

Read the corresponding red-first logs named in plan.md: check-observe-c1-1792868536528-485949.log, check-observe-c2-1792868541387-492061.log, check-observe-c3-1792868541867-492898.log and check-observe-c4-1792868555837-507928.log. They fail on the old behavior. Later edits to the test files only supply required grounding configuration, and precede the green runs. No planned case or runner was skipped, disabled or replaced. C4 checks literal output references and executable command flags, not arbitrary prose wording.

The report's green verify receipt is run 76e5d8a3-ecdb-44f0-a00d-e03045fa9eb0, scope leaf, recorded for a9f84cdafac1f26d5e53bae0ceea42549dfb8be9 with the exact reviewed tree. Setup and every configured command exit 0:

- format: 0, implementation/check-format-1792872269141-2076049.log.
- test: 0, implementation/check-test-1792872506998-2076049.log, 1135 pass and 0 fail, including the wrapper that runs the skill suite and its typecheck.
- typecheck: 0, implementation/check-typecheck-1792872510254-2076049.log.

The earlier test result is inconsistent: implementation/check-test-1792871646520-3569357.log records 11 timeout failures in batch/merge scenarios, while the later identical configured command passes all 1135 tests on the same tree. The diff changes only skills/watch-issues and supplies no plausible cause for those unrelated failures. This review relies on the fully green receipt, not a known-red waiver. The report's blanket claim of no inconsistent checks is not used.

Review inspection receipts, also read back through akrogon log:

- check review-b-inspect: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/watch-session/implementation/check-review-b-inspect-1792872589143-2730985.log
- check review-b-proof-history: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/watch-session/implementation/check-review-b-proof-history-1792872617622-2746056.log
- check review-b-receipt: 0 /home/ivan/Work/infra/akrogon/issues/open/herdr-session/watch-session/implementation/check-review-b-receipt-1792872623715-2747430.log

No real herdr call was made during review, consistent with the design's stub-only proof boundary.

## Test-Change trailers

c12cdbbff3b2b5e184979cb6a03e16ea2f90b080:

```text
Test-Change: skills/watch-issues/scripts/observe.test.ts gains session-dispatching herdr stub, issues/config.yaml in test roots, session= first-line expectations and new criterion tests (resolved-session reads, refusal shapes, OBSERVE_HERDR coverage, SKILL.md contract, recorded session/workspace fixtures)
Test-Change: skills/watch-issues/scripts/observe-log-tail.test.ts gains the same herdr stub, issues/config.yaml and the session= first line; log-tail wiring assertion unchanged
```

edb1028a8679059034f4e87dc414e532b5bee908:

```text
Test-Change: skills/watch-issues/scripts/observe.test.ts issues/config.yaml fixture gains required grounding: none
Test-Change: skills/watch-issues/scripts/observe-log-tail.test.ts issues/config.yaml fixture gains required grounding: none
```

Both existing test paths match src/test-files.ts. The first batch is grounded in brief criteria 1–4 and plan D4/D7/D10: the session header and discovery calls change the observed contract, including empty-inventory and discovery-failure paths. The second batch is grounded in readRepo's required repoSchema grounding field. Existing leaf status and log-tail assertions remain. The new recorded fixtures need no trailer because they are new files. No unsupported expectation correction was found.
