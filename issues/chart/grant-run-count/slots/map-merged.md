# Merged map: grant-run-count (#126)

Sources: slots/map-A.md, map-B.md, map-C.md. Tags name the slots holding a line.

## Evidence

- A's bound read "at most 1 known-good recorder run and 1 rerun" (framework `issues/closed/about-titles/fixture-weave-recorder/readiness.yaml` grants[2]); "known-good" let A count only runs it judged good; its report excluded a run whose batch session was the paid part (`implementation/report.md` "Initial paid run"). (A,B,C)
- B's later bound named the unit ("every invocation that reaches a paid session whatever its outcome"), and B counted right and stopped (grants[3], [4]; `review-B.md` "Renewed invocation 1/2"). (A,B,C)
- Framework `issues/timings.jsonl`: 9 `record` runs in implement, six of 78-100 s (a paid batch session each) against 2 + 2 allowed, so about 6 against 4. Low confidence: inferred from durations; logs are now in `issues/closed/about-titles/evidence.tar.zst`. (C; B on the archive)
- `src/run-check.ts` keeps `check-<name>-*.log` per run and `appendTiming` writes `check_start`/`check_end` to `issues/timings.jsonl`; neither records the grant or nested paid sessions, so they are an audit floor, not the count. (A,B,C; B,C on the limit)
- The reuse sentence ("compares operation, target, identity and bounds ... treats anything outside it as an operator blocker") has four copies: plan-issue, implement-issue, check-issue, merge-issue "Shared context"; standing-design's recorded-output rule also says a fresh call runs only under a covering grant, else stop. (B,C)
- #107 chart `issues/chart/paid-proof-bounds`: `forks/limit-mechanism.md` named a running count in pass artifacts and "prior use unknown"; the shrunk answer dropped both; `forks/bound-unit.md` Taken: no unit, free-text bounds (operator 2026-10-19: "I don't want to overcomplicate the system"). (C)
- Renewals append grant entries that copy old wording; no rule says which add and which replace. (B,C)

## Forks and positions

1. What counts.
   - a: the door writes bounds in a fixed form naming the unit, what counts and the source. (C)
   - b: one counting definition in the seat rule: every covered launch that reaches a paid session counts, whatever its outcome; a bound's nested units (sessions per run) are counted the same way; bound prose stays free (keeps the 2026-10-19 "no unit" answer). (A leans; B's K1b is the same definition)
   - c: schema field. Rejected (1c, 5a). (A,B,C)
2. At the bound (signpost 2b, operator words: "Allow it with a warning. The task keeps moving, but costs can go over.").
   - a: stop stays; the warning is only a disclosure of a wrong past count. (C, flags low confidence on the reading)
   - b: warn and run: before a launch past the bound the seat writes a warning line and continues. (A; B accepts as the lock)
   - c: warn and run once. (C rejects)
   - Scope of the exception: only repeat-count bounds of a paid operation; operation, target, identity, effects, expiry, spend caps and human stops keep their stops. (B K4a)
3. Where the count lives: one line per covered launch in the seat's existing pass artifact, written before the launch and completed after; a seat reads earlier artifacts' lines before its first launch; unknown prior use counts as used. (A,B,C; B,C on unknown)
   - Two seats in one phase (check.review) can race on the same allowance. B: disjoint allowances or one launch owner. A: accept the race as a stated limit; 2b already allows an overrun with a warning.
4. Who reads the warning: the check seat audits the count lines against `check-<name>-*.log` and `issues/timings.jsonl` and reports an overrun or mismatch in its review. (A,C; B K3b also wants it in the seat's visible reply)
5. Family: all four copies of the reuse sentence plus the recorded-output rule's "covering grant" stop; every covered operation (paid launches and live changes), by A, B, the merge seat and the door's charting probe; workers launch none (A counts in a delegated run). (B,C; A had three skills)
6. Renewal: a new entry states its new total or "N more after <date or commit>"; the next count line names the entry it draws on. (C; B R3)
7. The door's charting probe counts against the leaf grant it runs under, stated in the "Take" grant paragraph (not in coverage-audit's proof paragraph). (C; B S2)

## Pitfalls

- A summary line overwrites failed attempts ("1 run + 1 rerun"): one line per attempt before the total. (B,C)
- The tally gets filled in at the end: the line is written before the launch. (C)
- A launch outside run-check leaves no audit trail: covered operations run through `run-check` (current practice, stated). (A,C)
- The overrun becomes a waiver at review. (C)
- Merge overlap with coverage-audit in `chart-issues/SKILL.md` "Take": different paragraphs; file overlap is no dependency. (C)
- Provider-side cap (#107's revisit trigger) is an operator account step: Off route. (C)

## Split

One akrogon text leaf: plan-issue, implement-issue, check-issue, merge-issue "Shared context" sentence; check-issue review audit; chart-issues "Take" grant paragraph; `assets/shapes.md` `grants:` placeholder if the form changes; `assets/standing-design.md` recorded-output sentence. No `src/`, no new file. (A,B,C)

## A's proposed picks (for the rebuttal)

- 1b: one counting definition in the seat rule, bound prose free. Signposts 4a (family) and the operator's 2026-10-19 "no unit" answer both hold; the definition removes "known-good" readings without a form.
- 2b with B's scope: warn and run, only for repeat-count bounds; every other bound keeps its stop. Signpost 2b, operator wording "costs can go over". C's 2a contradicts that wording.
- 3: count lines before each launch, unknown counts as used; the check.review race is a stated limit (2b tolerates it).
- 4: the check seat audits and reports an overrun as information, not a Fix; the proof stands (2b).
- 5: all four copies plus the recorded-output sentence.
- 6 and 7 as above.
