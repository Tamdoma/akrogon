# Coverage rule, merged notes (A, B)

Sources: slots/coverage-rule-A.md, slots/coverage-rule-B.md.

## Q1 What the command accepts

- 1a (A) Drop only `(no test name)` from the refusal in `knownRedReceipt`; the marker then compares like a name through the existing subset line. Reason: removes a special case, leaves the named path untouched, matches signposts 1a ("narrowly") and 5a ("nothing else moves"). Cost: two different nameless failures of one command are machine-eligible; only the seat refuses them.
- 1b (B) Uniform function-only gate: no test-name comparison in acceptance for any red; logs read through `readLog`. Reason: signpost 3a gives the command facts only, and a bun-specific parser in acceptance keeps two mechanical policies. Cost: a named `alpha` head against a named `beta` base becomes machine-eligible; tests holding that as a machine veto change; all four seat paths must carry the refusal.
- 1c (none) 1a plus equal exit codes. Rejected by both: different failures share exits, equal failures can differ through wrappers, and it adds a condition the signposts did not select (A,B).

Where the slots differ: 1a against 1b. A's reply to 1b: the name subset is a state check the command already makes for free on the most common path (bun test), and removing it hands a working machine refusal to a probabilistic judgment; 3a named what the command checks for the reopened nameless case, and 5a keeps everything else. B's reply to 1a is in its notes: a named/nameless boundary does not establish that causes match.

Evidence:
- operator, forks/signposts.md `## Taken`, 2026-11-09 (A,B).
- better-than-training, src/verify.ts `knownRedReceipt`, src/flaky.ts `failedTests`, src/evidence.ts `readLog`, read 2026-11-09: under 1a every outcome follows from the existing subset line with `(log gone)` still refused (A); `readLog` already resolves moved and packed logs and `failedTests` reads through it (A,B).
- better-than-training, slots/evidence/herdr-setup-pair-2026-11-09.log: the reported pair holds every fact either option needs (A).
- better-than-training, tests/verify.test.ts `a linked pair fails to satisfy requireGreenReceipt with unnamed or unlinked failing work`: under 1a its unnamed case (nameless head, named base) and gone case stay machine negatives (A); under 1b the named-mismatch cases move to the seat and must be classified before changing (B).

Pitfalls:
- A `pass` read as approval: every seat path states receipt eligibility plus recorded causal agreement (A,B).
- Absent evidence accepted: a gone log on either side never covers (A,B).
- Reporting identities changing: `failedTests`, `flips`, `newRedUnits` untouched (A,B).

## Q2 What the seat judges for a nameless cover

- 2a (A,B) One rule in all four seat paths: both logs read whole; the head log shows no failure the base log lacks, judged in substance, never as exact text (B's wording, A agrees); the command ended by its own verdict, never a killed, timed-out or crashed run; no cause in the leaf's diff; the leaf's own done-criteria proofs pass on their own.
- 2b (none) A blanket test-runner exclusion. Rejected by both: a second classification without a config marker; 2a's clauses already stop a runner that crashed or could not load.
- Added from B's open question (A agrees): when both logs exist but show too little to establish a cause, the seat withholds agreement and the existing blocking path applies. No minimum-output rule or parser.

Evidence: operator signposts 1 to 5 (A,B); the four seat paragraphs, two of which define the judgment as a real test name failing on the base (A); `runOnce` and `verifyRunSchema` record exits, blocked entries and completion, not a per-command runner-completeness fact (B); B's V1 short-circuit run (B); Chromium CQ, carried from red-base-wait Findings (A).

## Q3 A check recorded `blocked` behind the covered red (raised by B's R6, sharpened by A)

Facts (A, read 2026-11-09): `runOnce` records every `full` check `blocked` after a red non-`full` check and every `merge_checks` member `blocked` after a red `checks` entry; `knownRedReceipt` skips blocked head entries, so the command already passes such a head; the seat texts add "A check recorded `blocked` in a verify receipt did not run, so the check named as its blocker is fixed first". akrogon configures `full: [test]`, framework configures `merge_checks`; herdr-setup, the reported repo, configures neither.

- 3a (A) The blocked rule stays word for word. A nameless cover lets a leaf through only where no check is blocked behind the red, exactly as for a named base red today. The limit is stated in the leaf and recorded for the operator as its own possible destination.
- 3b The seat runs each blocked `checks` command itself through `akrogon run-check` once the blocker is an agreed known-red. `run-check` refuses `merge_checks` commands, so merge scope stays stopped.
- 3c `--known-red` runs the blocked commands itself. A scheduling change B's map rejects.

A's reason for 3a: the blocked rule applies to named and nameless base reds alike and predates this report; the reported case has no blocked check; changing it is a separate outcome with its own proof (signpost 5a, "nothing else moves"). Signpost 2a answered work hidden inside the red command (the chain that stops at its second file); a separate configured check that never ran keeps its own rule. Cost: in a repo with `full` checks or `merge_checks`, a base-red non-`full` check still stops leaves after this leaf lands.

## Open questions

None beyond Q3.
