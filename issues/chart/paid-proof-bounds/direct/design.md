# Design: paid-proof-bounds

## Binding decisions, verbatim

From issues/chart/paid-proof-bounds/forks/limit-mechanism.md, Taken:
- Operator 2026-10-19: "1a | 2a |", then shrunk: "Honestly, I don't even think we should be doing this chart when it comes to the usage. ... I don't want to overcomplicate the system." / "Okay, yeah, we can fix that, definitely."
- Shrunk 1a, wording only. Delete "reruns" and "without asking again" from the reuse sentence in plan-issue, implement-issue, check-issue and merge-issue. Delete "live-change" and "before mutating" / "before the first mutating proof", so a paid model launch is a billing effect under the existing grant contract, including the door's own charting probes. The grant's `bounds` stays the free text the door writes today. Dropped: session counting, a lifetime total across seats, launch owners, refunds, consumption records and the handoff worst-case line.
- 2a: no provider-side hard stop now. Revisit trigger: one proven paid launch past a written bound reopens a provider-side cap or a separate capped key, with that launch as evidence (B). Nothing implements a cap.

From issues/chart/paid-proof-bounds/forks/fresh-run-need.md, Taken:
- 1a: one recorded-output rule for every proof. Model and outside stages replay output saved from one real run, kept durably with provenance and never hand-patched. Deterministic stages, consumers and checks run real on the current head. A fresh paid call happens only when a model-facing input changed (prompt, instructions or templates, model pin, settings, input data, tool or provider contract, output contract), the recording is missing or unreliable, or the criterion's named property is fresh-start, order, live interaction or whole-run behavior. In those cases it is the smallest fresh affected interaction, not automatically a whole run. An unknown input is investigated, never silently reused, and then gets a grant-covered fresh call or the blocker stop. A missing recording never falls back to a paid call on its own. Committing recorded output is test input, while building replay support is machinery and goes to a prerequisite leaf. It applies to future contracts only.
- 2a: open framework leaves are not swept, and a locked criterion stands until the operator amends it. Such a leaf has no covering grant, so its next paid launch stops as an operator blocker, and the operator then grants runs or amends the criterion (B).

Foreclosed: an akrogon counter, `--max-budget-usd` guards, schema fields, session accounting, framework stage resume (operator 4a) and edits to framework leaves.

Standing design: /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md. This leaf edits it. Its new recorded-output bullet is the one definition, and the other skills point to it instead of restating it (A,B,C).

## Leaf architecture

Owned surfaces: the sentences below. Each edit replaces the quoted text with the given text.

1. Reuse sentence, Shared context of skills/implement-issue/SKILL.md, skills/check-issue/SKILL.md and skills/merge-issue/SKILL.md:
   - Old: "reuses `grants[]` for probes, implementation, repairs, reruns, merge checks and cleanup without asking again; before mutating it compares operation, target and identity with the grant"
   - New: "reuses `grants[]` for the operations they cover, within their bounds; before each covered operation, paid model launches included, it compares operation, target, identity and bounds with the grant"
   - skills/plan-issue/SKILL.md uses the same text with "without asking again: before mutating, it compares", and gets the same replacement.
2. skills/chart-issues/SKILL.md:
   - Take, grant paragraph: "one scoped live-change grant during charting, before the first mutating proof" becomes "one scoped grant during charting, covering live changes and paid model launches (read-only and nested ones included), before the first covered proof". Also "a new or different mutation" becomes "a new or different covered operation".
   - Handoff: "each leaf's recorded live-change grant confirmed" becomes "each leaf's recorded grant, paid model launches included, confirmed" (C).
   - Autopilot wait list: "a mutating proof call, which waits for the operator's grant approval while read-only proofs proceed" becomes "a mutating or paid proof call, which waits for the operator's grant approval while other read-only proofs proceed" (C).
3. standing-design, new bullet placed directly before the chain-trigger bullet (B,C):
   "A proof with a model or outside stage runs its own scripts, consumers and checks real on the current head, while each model or outside stage replays output recorded from one real run with source, revision or date and the capture command, kept as a committed fixture or a preserved path named in the report and re-recorded never hand-patched; committing a recording is test input, while building replay support is machinery. A fresh call is made only when a model-facing input changed (prompt, instructions or templates, model pin, settings, input data, tool or provider contract, output contract), the recording is missing or unreliable, or the criterion names fresh-start, order, live-interaction or whole-run behavior, and it is the smallest fresh interaction through the real consumers that proves the property and re-records; an input whose effect on a model stage is unknown is investigated, never silently reused. A fresh call runs only under a covering grant, never as a silent fallback, and otherwise the seat takes the operator-blocker stop."
4. standing-design chain-trigger bullet: "own scripts, consumers and checks run real, while model and outside stages replay output recorded from one real run with source, revision or date and the capture command, re-recorded never hand-patched. A leaf changing a prompt, model, settings, output shape or outside call runs one real call through its consumer and checks, names the property proved and re-records, and an outside change making a recording unreliable also triggers re-recording." becomes "its stages follow the recorded-output rule above." The spine sentences stay chain-only, as written (C F7).
5. standing-design slow/live bullet (B,C):
   - "(shared files, lockfile and env count as inputs, and when unsure it restarts from a trustworthy point)" becomes "under the recorded-output rule above (shared files, lockfile and env count as inputs)".
   - "the final proof must be valid at the final commit, and a clean full run is required only when reuse cannot be shown or fresh start, order or whole-run behavior is under test" becomes "the final proof runs its deterministic stages and consumers at the final commit over recordings still valid under that rule, and a clean full run is required only when the criterion names whole-run behavior".
6. skills/plan-issue/SKILL.md plan synthesis: "and a rerun trigger" becomes "and a rerun trigger, which for a model or outside stage names its model-facing inputs, its recording and the real consumers that replay it under standing-design's recorded-output rule" (C).
7. skills/implement-issue/SKILL.md and skills/check-issue/SKILL.md:
   - implement-issue implement-end rerun sentence and check-issue check.repair rerun sentence: after "keeping earlier green proof for the rest unless a retry marks it inconsistent", add ", with model and outside stages following standing-design's recorded-output rule".
   - implement-issue check.fix: "supply passing proof for every done-criterion" becomes "supply passing proof for every done-criterion under the implement-end rerun rule".
   - check-issue check.repair: "replaying the exact command, target, identity and cleanup that `plan.md` and `grants[]` name under the grant reuse rule" gains ", with model and outside stages following standing-design's recorded-output rule". This keeps B's real consumer proof and qualifies only fresh model and outside calls (B F4).
8. skills/chart-issues/assets/shapes.md, Preflight and validation: after "refuses a live-run done-criterion that names a session count, which belongs in the handoff review line,", add "refuses a live-run done-criterion requiring a fresh or full replay unless it names the fresh-start, order, live-interaction or whole-run property that recorded output with real consumers cannot prove,".

Exclusions: no `src/` change and no test. The framework repo and its open leaves are excluded (2a). Release copies under ~/.akrogon/releases update through the existing release flow.

Proof: `rg -n "without asking again|live-change grant|before mutating|first mutating proof|a mutating proof call|restarts from a trustworthy point" skills/` prints nothing. B then reads each edited sentence against the decisions above.
