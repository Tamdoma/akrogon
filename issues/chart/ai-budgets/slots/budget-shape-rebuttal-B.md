# Rebuttal: budget-shape, slot B

## My own evidence was wrong (I withdraw these)

- Q2 record. I picked the timing row. Take the host ledger (A,C) instead. Evidence:
  - `issues/timings.jsonl` is git-tracked (`git ls-files` lists it, `git check-ignore` does not). A checkout, stash or reset on the registered root drops unsaved rows, the sum undercounts, and the ceiling is passed.
  - `appendTiming` in src/timing.ts catches a failed write and only warns. `readTimings` catches any failure, one malformed row included, and returns `[]`, which sums to zero. A reservation needs its own strict reader and writer either way, so the row saves nothing.
  - Refinement: the ledger row carries `repo`, `slug` and the `run` id, and no `sessions` field goes on the timing row. The reviewer joins on `run`. One record for one fact.
- Q2 lock. I picked `withAdmissionLock`. Take C's separate flock. Evidence:
  - `withAdmissionLock` in src/admission.ts takes `admission.lock` shared and then a lock per slice, so two runs in different slices do not exclude each other.
  - `withAdmission` returns `kind: 'nested'` for a nested run without taking any lock.
  - The reservation must also run for a nested run-check, so it cannot sit inside the admission path.

## Where the merged notes misstate me

- Q7 lists me under both options. My recommendation was the self-clearing wait, on the condition that a seat can enter it without new machinery. That condition fails: the `capacity` wait is recorded only by `akrogon next` in src/next.ts when no slot is free, and `park` is an operator verb. I now pick `failed` with one notice, which closes Q7 as a difference.
- Q6 minutes. I now take C's export over my "the live test enforces it". N2 puts the minutes number in config, and tests/e2e/watch-consults.e2e.ts states its own 15 in a comment, so the test needs the config value handed to it or the number has two sources. I still hold that run-check never kills the run.

## Points I hold against the others

- Q4, against A (no grant) and C (discriminated schema). Keep the entry with `approved.answer` quoting N1.
  - Against A: check-issue `## Shared context` reads cleanup identities from `grants[].fixtures[].cleanup` and absence from `absence_check`. The abandoned-capture recovery text ("the leaf grant's own discovery, cleanup and authenticated absence read") sits in check-issue, implement-issue, docs/reference/checks.md and the refusal string in `refuseAbandonedCaptures` in src/phase.ts. With no grant, a paid-only leaf has nowhere to state its fixtures and all of those lines point at nothing.
  - Against C: no code reads a grant (`gaps` in src/readiness.ts iterates `inputs` only), so a second entry shape changes nothing a program checks. It costs a `grantSchema` change, tests/readiness.test.ts and the shapes example.
  - Condition: if the classifier refuses a grant write that quotes N1 (my X3), C's shape becomes the right pick, because an entry without `approved` claims no operator words.
- Q5, against C's fallback. S6 took "replace". A per-leaf fallback needs the door to keep writing counts, so the repeat-bound and renewal sentences in chart-issues `## Take` and the count-line sentences in `skills/lifecycle-rules.md` all have to stay. That is the "add" option S6 rejected.
- Q1, against C's scope fields in config. The scope is S2's hard limit and is the same on every host. In config it becomes text each host can edit that no code reads, and the account list repeats `harnesses`. The operator's N1 words already sit in the key as the answer text.
- Q8, against lifecycle-rules (A,C). I hold standing-design, with low stakes. check-issue `## check.repair` already cites "standing-design's recorded-output rule" and its "fresh-call rule", and that sentence already defines "a model-facing input changed". The floor ("green once on the current model-facing inputs") uses the same term to decide the same thing: whether a fresh call is needed. Two files would each define half of one decision. If A keeps lifecycle-rules, the fresh-call trigger should move there too, so one file holds both halves.
- Q7, against C's per-day notice dedupe. It needs stored state to remember that a notice was sent. Each failed leaf already shows in `akrogon status`, and one notice per stopped leaf is the existing rule.
