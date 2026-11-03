# repair-verify, seat A (before reading B, C, D)

## Q1
- Pick: B runs `akrogon verify` only when its move is `merge`. When it hands items to A, A's check.fix commits change the tree and A's own move to check.review must pass its own verify gate, so B's receipt is dead on arrival. Reason: the gate that justified fb236ec0 is the check.repair to merge gate, and it stays in code; if B forgets, `akrogon phase ... merge` refuses loudly and B runs verify, one extra turn worst case. The done-criterion proof reruns stay as they are (they are targeted proofs, not the full suite, and A's check.fix reads B's evidence). Cost: none observed; a red that B's verify would have shown before handing to A is found by A's verify instead.
- Rejected: drop B's verify entirely (merge path then needs another turn every time); merge check.repair into check.fix (routing change, D3 lock).
## Q2
- No code changes, so no new test. Proof: the edited sentence reads "only when moving to merge" and the existing gate test for check.repair to merge without a receipt refuses (already in the suite). After landing, B verify runs in check.repair followed by check.fix go to zero in `issues/timings.jsonl`.
