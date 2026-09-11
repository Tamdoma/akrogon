## 1. Goal

Repair review-B F1 and F2 at reviewed head e58c2445cb38c74a5d5abe253dae555b5754035c. This is repair round 1 of 3. Prevent duplicate merged comments after partial gh success and remove warning-field-order/prose test dependencies. Retain plan D1–D7/A1–A7 except D6's corrected retry detail below.

## 2. Numbered acceptance criteria

1. F1: first commented close posts its comment then fails while issue stays OPEN. Retry checks state and all existing comments, closes without another comment when the exact merged comment exists, and finishes with one comment, CLOSED state, one retry and moved local owner. Prove red before code with actual CLI plus stateful substituted gh.
2. F1: on retry, OPEN with no matching comment still uses the required commented close. CLOSED skips mutation. Match on a later comments page must work. Failed or malformed comment listing authorizes no second close, reports failure, and continues later sources. Keep full-response context and avoid extra retry loops.
3. F2: warning assertions parse JSON fields independently of key order/whitespace, retain semantic source/status/count assertions, and invalid-origin tests assert structured repo/origin rather than prose. Repeat the isolated source-first warning reproduction and show green. Do not weaken existing behavioral cases.
4. Existing pull/phase/next targeted tests pass, with no real GitHub/herdr requests or global environment mutation.

## 3. Read-first list

../review-B.md and ../review-B-evidence.txt, ../review-A.md (N1–N3 require no scope expansion), ../plan.md, src/pull.ts, src/shell.ts, tests/fake-gh.ts, tests/helpers.ts, tests/phase.test.ts, tests/pull.test.ts, tests/next.test.ts, /home/ivan/.codex/skills/implement-issue/ponytail.md and worker-protocol.md. Copy existing real CLI/temp-repo/process-boundary conventions.

## 4. Change list and needed interfaces

Own src/pull.ts source retry and narrowly needed tests/fake-gh.ts, tests/phase.test.ts, tests/pull.test.ts, tests/helpers.ts fixture changes. Existing exported interfaces stay unchanged. On retry when state is OPEN, use explicit github.com gh API pagination for repos/<owner>/<repo>/issues/<n>/comments?per_page=100 with --paginate --slurp, validate complete response bodies, and detect exact `merged <commit>` body. Omit --comment only when that body is confirmed already present. The initial call retains required --comment. Query failures must fail visibly, never imply absence. Reuse shell execution and existing zod. Keep total check-and-close attempts at two. Authoritative plan/report/lesson changes belong to B.

## 5. Do-not, reasons and exceptions

Do not implement review A nits, redesign shell env passing, change mirror behavior, introduce durable state, change locks, or touch unrelated features because only F1/F2 require repair. Never contact real GitHub or herdr. Do not commit, run full suite, or advance phase because B owns final integration. Return mismatch evidence rather than silently widening scope. A revised brief from B is the sole exception. These limits preserve locked scope, isolated verification and one integration owner.

## 6. Ordered steps

Write F1 partial-success regression first and record red. Extend scripted gh only enough for realistic comment side effects and required responses. Implement source retry fix, update existing retry fixtures for the added query, and remove F2 formatting/prose dependencies. Run targeted checks green and the isolated warning-order variant. Save outputs under this implementation folder. Advisory scope roughly five files and 15 turns, return evidence for necessary changes beyond this.

## 7. Commands

No configured test_changed. Run `AKROGON_BASE=ab36dd0e424b5b5041dd251c189639498c72b4a8 bun test tests/pull.test.ts tests/phase.test.ts tests/next.test.ts`. Additionally reproduce F2 with this same targeted command in an isolated copy whose warning keys are reordered, preserving actual field values. B runs full checks separately.

## 8. Done-when, evidence and report

Fill exact changed files, red/green commands/results and artifact paths. Report remaining limitations and unverified criteria. Temp fixture processes are the end-to-end evidence and must clean up.

Changed files and reasons:
- `src/pull.ts`: the sole retry rechecks OPEN/CLOSED, lists all comment pages on OPEN, validates the complete response and omits the comment only for an exact existing merged body. Listing errors preserve command/cwd/response context and propagate through existing per-source failure handling.
- `tests/fake-gh.ts`: optional stateful issue simulation persists comment effects before a failed close and serves paginated comments from persisted state.
- `tests/phase.test.ts`: partial-close fail-first regression, later-page match, exact-match absence, three listing failures with later-source continuation, existing retry fixture updates, and JSON warning assertions independent of field order and whitespace.
- `tests/pull.test.ts`: invalid-origin assertion reads structured repo/origin context instead of prose.
No helpers or other production interfaces changed.
Tests run:
- Red: `AKROGON_BASE=ab36dd0e424b5b5041dd251c189639498c72b4a8 bun test tests/phase.test.ts -t 'partial commented'`, exit 1, one failed test. The actual CLI exited 0, gh state became CLOSED after two attempts, but persisted two identical merged comments. Evidence: `implementation/repair-1-red.txt`.
- Green: `AKROGON_BASE=ab36dd0e424b5b5041dd251c189639498c72b4a8 bun test tests/pull.test.ts tests/phase.test.ts tests/next.test.ts`, exit 0, 27 tests / 266 assertions. Evidence: `implementation/repair-1-green.txt`.
- F2 isolated copy: same targeted command with source before warning and extra JSON colon/line-edge whitespace, exit 0, 27 tests / 266 assertions. Evidence: `implementation/repair-1-warning-order.txt`. Initial copy setup lacked ancestor node_modules, corrected before this run. All temporary copies and CLI fixture repos were removed.
- `bunx --no-install prettier --write src/pull.ts tests/fake-gh.ts tests/phase.test.ts tests/pull.test.ts` completed. `git diff --check` passed.
No real GitHub/herdr calls, global environment mutation, full-suite run, commit, or phase movement.
Known limitations: plan R1–R3 remain, including external races and no durable replay after local movement.
Unverified criteria: none within this brief. B owns full-suite/typecheck integration and final phase advancement. Live GitHub closure remains unverified by design.
