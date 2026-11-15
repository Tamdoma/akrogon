# Identity rule: focused final check B

F1. Q1 item 5 [corr] promises that a signaled script without a failing ancestor makes the log keep `(no test name)`. That contradicts items 1 and 6 in a mixed log:

```text
script-A | (fail) alpha
script-A | Exited with code 1
script-B | Signaled: SIGINT
```

Items 1, 3 and 6 yield only `alpha`: A already has a named failure, B's signal is excluded, and the whole log yielded a name. Item 5 instead promises the nameless fallback for B. This is also the healthy-sibling cancellation shape described by A's probe, so adding a placeholder per signal would incorrectly imply another failure.

Correct item 5 to say: ignore `Signaled:` lines. An accepted ancestor exit may provide a coarse identity; otherwise the signal contributes no identity. The log gets `(no test name)` only when no accepted failure names remain anywhere in it.

This preserves the selected mechanism and fixes its contradictory description. No other defect in the marked corrections. Recorded dissents are not repeated.
