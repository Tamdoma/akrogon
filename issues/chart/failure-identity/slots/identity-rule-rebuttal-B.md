# Identity rule: disagreement-only rebuttal B

## D1. Bare real titles still discard available failure identity

I still disagree with unamended 1a. These two admitted Bun streams produce the same key under it:

```text
script-X | (fail) shared title
script-Y | (fail) shared title
```

`knownRedReceipt` then covers X with Y, and Q2's new whole-log causal branch does not apply because both are classified as real titles. This is a local counterexample to signpost 2a's script distinction, not an observed bad merge. Preserving existing display/history is a real cost argument, but it does not remove this collision. The merged notes also leave the source-kind collision unresolved: a real title `(script) foo` and a coarse failure of script `foo` render the same string.

Evidence: merged Q1 explicitly retains bare real titles and string markers; merged Q2 retains the subset comparison and reserves the stronger read for coarse names. Both collisions follow directly from those contracts.

Keep display text unchanged if that avoids unnecessary churn, but retain script owner and source kind in comparison identity. I would change my mind if the admitted input contract demonstrably guarantees globally unique real titles already containing their script owner, and excludes marker-shaped titles. Neither guarantee appears in the merged evidence. Alternatively, explicitly accepting these collisions would narrow the promised fix, rather than establish that 1a distinguishes them.

## D2. Name-reader-only file access leaves the required log reader broken

I still prefer 4b over intended 4a. C's readLog-first order resolves my stale-owner objection. It does not resolve the remaining failure: the command accepts an existing outside-grammar log, while `akrogon log <path>` refuses it. The merged notes acknowledge that cost. My prior inspected `skills/lifecycle-rules.md / Kept command output` requires cited logs to be read with that command. Adding an exception in only the identity reader leaves the proof workflow internally inconsistent.

Keep canonical issue-owner resolution and add literal-file support once at the cross-repo boundary, with a local CLI test proving the same path works for identity extraction and `akrogon log`, while genuine multiple-repo ambiguity still raises.

I would change my mind if evidence shows `akrogon log` already reads these exact files through another path, or the chosen contract explicitly permits seats to read these logs directly and accounts for other `akrogon log` users. The intended pick currently does neither. The small line count of 4a does not remove the second inaccessible-reader path.
