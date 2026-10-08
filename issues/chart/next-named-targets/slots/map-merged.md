# Merged opening map
## #59 named targets and blocked report
- Name namespace: collect all bare-name matches (epic, issue incl. nested, leaf) and refuse ambiguity before allocation; paths keep current meaning (A,B). Open-only vs open+closed owners is a fork (B).
- Report scope: errors for operator-selected targets only, hooks/dependents stay quiet (A,B). Whether inputs-blocked leaves are reported too (A); B says do not widen to capacity/inputs/merge waits.
- Failed-and-blocked leaf listing (B). Missing deps already error in sweep (B, next.ts:629).
- Correction: park/unpark resolve only top-level issues, not nested (B, park.ts:13,52).
- Split into two parallel leaves possible: name selection, blocked diagnostics (B). A: one leaf, since both edit selectLeaves/dispatchLeaf flow for one operator outcome.
## #60 seat A order
- Split-then-swap after replacing A (A,B). Fake herdr needs order + swap (A,B). B raises relative vs global layout invariant; A: global normalization would move operator-arranged panes, local repair matches the report.
- Proof: one real split+swap on a disposable tab before handoff (B).
## #61 per-repo pause
- Storage: machine-local vs shared repo config (A,B). Gated paths: events, startup --resume, mergePass/mergeWake (A,B). Unpause permit-only vs immediate pass (B; A agrees permit-only). Status visibility (A). Pause checked inside the dispatch lock, not in eligibility (B).
## Split
- Three standalone issues in akrogon, lifecycle route, no dependency (A,B).
