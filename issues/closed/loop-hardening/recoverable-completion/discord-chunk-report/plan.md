# Plan: discord-chunk-report

## Basis and read-first paths

Direct slot B synthesis. Authoritative `state.yaml` sets `debate: "no"`, so positions and rebuttals are neither present nor required. The brief and locked design agree on behavior.

Read these paths before implementation, using the registered repository's authoritative leaf records and this worktree's code:

- `issues/open/loop-hardening/recoverable-completion/discord-chunk-report/brief.md`
- `issues/open/loop-hardening/recoverable-completion/discord-chunk-report/design.md`
- `REFERENCE.md`
- `learnings/LESSONS.md`
- `docs/merge.html`, broadcast description
- `skills/broadcast-issue/SKILL.md`, delivery and retry contract
- `skills/broadcast-issue/scripts/discord-send.ts`
- `skills/broadcast-issue/scripts/discord-send.test.ts`
- `bunfig.toml`, `package.json`, `tsconfig.json`
- `skills/broadcast-issue/package.json`, `skills/broadcast-issue/tsconfig.json`

The lessons support exercising the sender through an invocation and checking the final diff. No historical claim needs further investigation here.

## Decisions and needed interfaces

- **D1:** Count chunks, not HTTP attempts. For a target that exhausts its retry, `delivered` is the number of earlier chunks whose request or retry succeeded, `failed` is 1, and `unattempted` is `contents.length - delivered - 1`. A recovered retry contributes one delivered chunk. Counts restart for every target.
- **D2:** Preserve sequential delivery, one immediate retry with its existing warning, stopping that target after the retry fails, and continuing with other targets. Preserve the final attempt's target, status, redacted body and request content in the existing aggregate error. Successful targets are never resent.
- **D3:** Keep chunk-level errors separate from target-level progress in the types. Rename the current field-only `Failure` shape to `ChunkFailure`, and define `Failure extends ChunkFailure` with required readonly numeric `delivered`, `failed`, and `unattempted` fields. `DeliveryError` can continue accepting the common `ChunkFailure` shape and serializing the complete object it receives. At the target boundary pass a typed `Failure` object, retaining its extra fields in the serialized error without optional counters or invented chunk-level progress.
- **D4:** Enrich the error in `sendWithRetry`, where the chunk sequence is known. Track successful chunks locally and increment only after a chunk completes, including after a successful retry. An enclosing catch handles only `DeliveryError`, constructs a new `Failure` from the final failure and progress, and throws a `DeliveryError` containing it. Other errors propagate unchanged. The existing `main` aggregation then exposes the enriched error without changing the aggregate message or successful output.
- **D5:** Limit production edits to the sender's failure types and retry/failure path. Extend its existing subprocess scenario harness for tests. No ledger, resume behavior, chunking changes, skill prose edits, credential changes, completion-order changes, or new dependencies. No sibling leaf must complete first.

## Acceptance criteria

- **AC1:** A message with three chunks, with PRIMARY chunk 1 succeeding and chunk 2 failing twice, exits unsuccessfully with PRIMARY counts `delivered: 1`, `failed: 1`, `unattempted: 1`. PRIMARY requests are chunk 1, chunk 2, chunk 2. Its chunk 3 is never requested. SECONDARY still receives chunks 1, 2 and 3 exactly once, in order.
- **AC2:** The final failure retains the retry's status, redacted response body, target and failing request content. The retry warning still occurs. Tests inspect semantic fields without depending on stack-trace formatting, property order, or entire error wording.
- **AC3:** Exhaustion on the first chunk of three reports 0/1/2. Exhaustion on the last chunk reports 2/1/0. If an earlier chunk succeeds on retry before a later chunk exhausts its retry, that earlier chunk counts once. Two failing targets report their own independent counts in the aggregate.
- **AC4:** A single-chunk exhausted retry reports 0/1/0 while preserving its previous retry count, final context, redaction, nonzero exit and continuation to other targets. Existing network-error and response-body-error scenarios remain valid and exhausted cases also carry counts.
- **AC5:** Full success and recovered retries keep a zero exit, existing success output and unchanged content/chunk ordering. No outcome record is written. Existing validation and secret-redaction coverage remains passing.
- **AC6:** Explicit sender tests, skill-local typecheck and all configured repository checks pass. Save invocation output as a verification artifact and record its path in completion evidence.

## Ordered implementation checklist

1. **A1 — sender (`discord-send.ts`), AC1–AC5:** Add the target failure shape and enrich only the exhausted target error at the retry boundary. Verify that a recovered retry increments delivered exactly once and that non-delivery exceptions still propagate.
2. **A2 — sender tests (`discord-send.test.ts`), AC1–AC5:** Use the current `run` harness to invoke the real sender entry function in a subprocess with stdin and target arguments. Build exactly three chunks using three sections with 1500-character bullets. Add the middle-failure/two-target case and the first/last, recovered-retry, and independent-failures cases. Compare traced target URLs and request bodies to establish which chunks were sent. Assert the final serialized target failure's fields structurally. If exposing structured aggregate errors needs harness support, catch only `AggregateError` there, serialize its error messages for boundary parsing, and rethrow to preserve the failing exit. Do not introduce exports or flags into the sender solely for tests.
3. **A3 — verification evidence, AC6:** Run the commands below and inspect the saved log and diff. Record results and the artifact path in implementation completion evidence. Remove any temporary helpers. Commit only the authorized implementation and test changes, following the implementation workflow.

## Concrete verification

Baseline on 2026-09-11: `bun test ./skills/broadcast-issue/scripts/discord-send.test.ts` passed all 9 existing tests with 55 assertions.

From the worktree root, retain the complete subprocess scenario run as an artifact outside tracked source:

```bash
set -o pipefail
bun test ./skills/broadcast-issue/scripts/discord-send.test.ts 2>&1 | tee /tmp/discord-chunk-report-sender-verification.log
bun run --cwd skills/broadcast-issue typecheck
bun run format
bun run typecheck
bun test
git --no-pager diff --check
git --no-pager diff
```

The test command exercises the actual sender invocation through the existing controlled fetch boundary, including request ordering, stderr and exit status. The artifact is a verification log, not a production delivery ledger. Do not send an actual Discord message for verification.

The brief spells its focused test command without the leading `./`. That exact spelling currently exits 1 with no matching files because `bunfig.toml` sets `test.root = "tests"`. Use the explicit relative file path above to exercise the intended suite. Do not widen scope by changing repository test discovery. Likewise, root typecheck includes only `src` and `tests`, so the skill-local typecheck is necessary. Root formatting covers only `src` and `tests`. Preserve the sender files' existing style and exclude unrelated formatter changes from the implementation diff.

## Open limitations

- **R1:** Delivered means the sender observed a successful HTTP response. An ambiguous network failure can occur after Discord accepted a request, so counts cannot establish exactly-once receipt. This change preserves the existing retry policy and adds no delivery ledger or reconciliation.
- **R2:** The invocation suite controls fetch responses and does not prove live Discord availability or credentials. It verifies the requested retry, counting and continuation behavior without an external broadcast.
