# Plan: blind-initial-review

## Read first

- This leaf's `brief.md` and `design.md` in the authoritative `issues/open/loop-hardening/review-protocol/blind-initial-review/` directory.
- `REFERENCE.md` and `docs/phases.html`, especially initial review and review after repair.
- `skills/check-issue/SKILL.md` and its linked `ponytail.md` for existing review contracts.
- `package.json` for verification commands.
- `learnings/LESSONS.md` and `learnings/history/2026-09-11-lock-vs-criterion.md` as planning resources. These are not added to the review skill's inputs.

## Decisions

- **D1:** Synthesize directly from the brief and locked design. This leaf has `debate: no`, so positions and rebuttals are neither required nor missing resources.
- **D2:** Initial `check.review` is blind for both A and B. Neither reviewer asks the peer a question, reads the peer's current review, or waits for peer input before submitting its own findings and verdict. Each records unresolved questions in `review-<slot>.md` and accounts for them in its verdict under the existing Fix/Nit rules. Uncertainty alone does not create a new blocking-verdict rule.
- **D3:** Move the currently unconditional peer-question paragraph beside the existing re-check paragraph and scope it explicitly to slot A's re-check after `check.fix`. Preserve its existing Question/Option, response-file and wait procedure there. The re-check is dispatched as `check.review`, so distinguish initial review from review after repair rather than requiring the literal prompt phase to be `check.fix`.
- **D4:** Edit only the peer-question instructions and the `check.review` section of `skills/check-issue/SKILL.md`. Keep verdict definitions, review evidence, repair-diff scope, phase commands and printed footer behavior unchanged. No code, documentation expansion, new tests, timeout or ordered question turn.

## Acceptance criteria

- **AC1:** Given simultaneous initial reviewers A and B, each can complete and submit a review without contacting or waiting for the other. Both are explicitly instructed to review blind.
- **AC2:** Given an unresolved initial-review question, the reviewer records it as a finding in its own review and applies the existing verdict rules. A concrete defect can still yield Fix, while an unsupported concern does not gain automatic blocking status.
- **AC3:** Given A reviewing B's repair after `check.fix`, A may still use the existing peer-question procedure and reviews only the repair diff. This remains clear even though the dispatched phase is `check.review`.
- **AC4:** Existing footer, verdict and phase-transition rules remain unchanged. Only the owned skill prose changes, with no word-matching tests.
- **AC5:** `bun run format`, `bun test` and `bun run typecheck` pass. The formatter targets `src` and `tests`, so its success is not evidence of prose correctness.

## Interfaces and execution order

No interface or runtime changes. Preserve `review-<slot>.md`, `<leaf>/questions/<id>.md`, verdict values and existing `akrogon phase` invocations. No dependency on another leaf is required.

1. **A1 — Skill edit:** In `skills/check-issue/SKILL.md`, remove the unconditional shared-context peer-question permission, place the permission with A's re-check instructions, and add the blind initial-review and unresolved-question instructions. Satisfies AC1–AC3.
2. **A2 — Semantic verification:** Read the complete edited skill against three scenarios: both initial reviewers have questions at once, one initial question remains unresolved, and A needs clarification during a repair re-check. Record the scenario outcomes and any remaining limitation in `implementation/brief.md`. Verify AC1–AC4 by meaning rather than exact wording. Inspect `git --no-pager diff -- skills/check-issue/SKILL.md` to confirm the scope and preserved verdict/footer contracts.
3. **A3 — Existing checks:** Run `bun run format`, `bun test` and `bun run typecheck`; record their exit results in `implementation/brief.md`. Inspect `git status --short` and the final diff for unintended formatter changes. Satisfies AC5. Add no tests or verification helpers for this prose-only change.

## Limitation and design interpretation

This change removes the mutual-wait instruction from initial review. It does not enforce reviewer isolation at runtime or bound an unanswered peer question during A's repair re-check. Those mechanisms are outside the locked scope.

The standing negative/edge-case verification requirement is covered by the semantic scenarios and existing checks. The leaf architecture explicitly forbids new tests beyond the existing suite, and no executable user-visible flow changes here. No browser or new end-to-end harness is needed.
