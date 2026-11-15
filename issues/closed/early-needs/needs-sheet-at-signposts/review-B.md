# Review B: needs-sheet-at-signposts

Date: 2026-11-09. Phase: check.review.
Base: `632f9139d197214350540cf17410135e5e34ca83`.
Reviewed head: `8647fc24247a6841c9fa85dcc1b05be484a0afb6`.
Verdict: `ready`.

## Findings

No Fixes, Nits or operator actions. Reviewed the complete initial diff independently, without reading the peer's review or contacting the peer. The diff changes only the six planned skill and human documentation files. No AREA.md, code, test, runner configuration or lesson change is present. The worktree is clean.

## Criterion review

The following outcomes apply in manual, autopilot and full autopilot. Open and Take bind all three modes. Questions explicitly separates needs rows from signposts questions, so full autopilot's delegated signposts answers cannot supply a needs answer. Product forks and handoff answers retain their mode rules.

| Case | Outcome in each of the three modes | Changed rule |
|---|---|---|
| S1: No needs | Record `none` and proceed to the map. | Open, shapes signposts template |
| S2: Missing key | Ask its row by signposts. Continue charting while pending. Hold its proof and handoff, check readiness presence and preserve supply steps. | Open, Take |
| S3: Paid/live grant including helpers | Ask authorization with the sheet. The grant records identity, targets, operations including transitive helpers and bounds only within approved fields. Unapproved fields confer no authority. | Open, Take grants paragraph |
| S4: Fixture retention and secret-save | Include operator-only approval rows. Neither A's fork picks nor silence approve them. | Open, Autopilot |
| S5: Delivered-identity close | The door performs its existing Open close step. No needs row. | Open |
| S6: Close needing an operator decision | Include a needs row answered only by the operator. | Open |
| S7: Early row still pending | Preserve the pending row without another question. Continue useful charting and wait on the affected proof/handoff. Copies follow the original's row status. | Open, Take, questions, shapes |
| S8: Expanded operation after signposts | Treat wider authority as a late find, without inventing approval. Continue only a useful route within recorded authority, otherwise park. | Take |
| S9: Useful alternative within authority | Continue that outcome under the existing cut rule and record the cut's destination. | Take |
| S10: No useful alternative | Park, move on, print one terminal statement and send one attention notice naming chart, blocker and record path. Add the late row with notice result, once per park rather than per pass or resume. | Take, Drain, Autopilot |
| S11: Notice fails or is unavailable | Record the failed result. Outside hc or in an unregistered repo, retain the statement and record without the notice. | Take |
| S12: Chart added by changed-list yes | Ask its rows with the proposal before its charting. The proposal's park sends the same single notice. | Open, Autopilot |

Criterion 2: the reported Cloudflare token/account/domain needs map to key/account/resource rows. Fixture re-record and recording-run grants map to paid-launch authorization rows. A close requiring an operator decision maps to its own operator-only row. All are asked by signposts, with delivered-identity closes explicitly excluded from rows.

Criterion 3: semantically reviewed every saved stale-rule sweep hit, including the unchanged files hit by the sweep. `during charting` now describes writing a grant record within prior approval, not asking for approval. `missing need` describes pending needs/readiness display. First-reply mentions describe mode/consultants or include the sheet's approvals. No remaining hit moves the first ask after signposts, apart from the authorized new-chart proposal exception.

Read the human pages describing the changed behavior and their adjacent retained instructions, the reference index and skills area. The canonical Needs section follows Taken and is copied verbatim with row updates. Existing status Taken counting and notice CLI implementation remain compatible. The cited lesson histories support semantic review and the cross-document sweep rather than exact-prose tests. No reusable Nit remains to record.

## Tests and evidence

`Test-Change:` trailers in `632f9139d197214350540cf17410135e5e34ca83..HEAD`: none. No changed path matches `src/test-files.ts`, and no existing expectation or fixture was changed.

The planned stale-rule and walkthrough commands were run with the planned arguments. Their logs match the final text. No proof-command correction, skipped/filtered test or changed runner configuration is present. The locked design calls for scenario reading rather than new prose assertions. The greps locate evidence, while the semantic review above judges the outcomes.

Read back these kept logs with `akrogon log`:

- `check stale-needs-rule: 0 implementation/check-stale-needs-rule-1794217120447-1382385.log`
- `check needs-sheet-walkthrough: 0 implementation/check-needs-sheet-walkthrough-1794217122837-1384452.log`
- `check format: 0 implementation/check-format-1794217129685-1388447.log`
- `check typecheck: 0 implementation/check-typecheck-1794217132048-1388447.log`
- `check test: 0 implementation/check-test-1794217189664-1388447.log` — 1,144 pass, zero fail, 79 files.
- `check review-b-diff: 0 implementation/check-review-b-diff-1794217227405-1708514.log`
- `check review-b-evidence-index: 0 implementation/check-review-b-evidence-index-1794217283305-1757353.log`
- `check review-b-lesson-evidence: 0 implementation/check-review-b-lesson-evidence-1794217304154-1775404.log`

Paths above are relative to this leaf. The evidence-index log includes verify receipt `1393561c-85bc-404d-ad92-3f8f749c1e7b` from `issues/verify-runs.jsonl`, completed green on the exact reviewed head with setup, format, typecheck and the configured full test command. No code change, missing evidence or specific failing concern requires repeating that suite.

`grants` and `retained` are empty. No paid or live proof was launched during this review. The prior notice observation is recorded in readiness with its publication/consumption limitation. The text takes effect for running doors at the next release link, as the design states.
