# Red exit: slot B rebuttal

2026-11-21. Disagreements only. Code at akrogon `eb4d64e9`. Ledger counts are mine, framework `issues/verify-runs.jsonl` and `merge-attempts.jsonl`, 2026-11-14 to 11-21, read 2026-11-21.

## Q2 push

- R1. I hold a split of B and C. For a non-fast-forward refusal I take C's rule over mine: the command restacks as today, and a second refusal clears the batch and leaves the leaf in `merge`. My note said the receipt is reused, which is false here because a restack makes a new tree.
- R2. For any other push error I hold B (the holder keeps the turn, a notice goes out) against C (`failed`) and A (`check.repair`). `finishPush` returns `error` only when the fetch worked, the push failed and the candidate is not on main (`src/phase.ts` `finishPush`). That is a write refusal: auth, a branch rule or a hook. A network outage throws before that and already stays with the command. Auth and branch rules hit every leaf, so C's rule sends the whole queue to `failed`, one full suite each: 33 min at median depth 3, 100 min at depth 9, plus a hand recovery per leaf. A's rule adds a B prompt that cannot fix auth.
- R3. Missing: no ledger records push errors (`merge-attempts.jsonl` keys hold no refusal, and `wake` lives only in state). The only proxies are 4 merged attempts with two green runs and 1 red attempt whose runs were all green, in 248. Nobody can size this question from data today.

## Q3 flaky blindness

- R4. I hold it as real. `flips` keys on `${run.tree}\0${item.command}` (`src/flaky.ts:75`). The 43 same-tree green reruns in the window are its whole merge-scope input, and 5a removes all of them. The line needs a decision: re-key to one leaf's consecutive merge runs with no leaf commit between them (the leaf's head equals the red run's `sha`), or mark the list stale.

## Q3 leaf receipt

- R5. I hold C's skip. My "25.6 s median" receipt cost was framework only and is wrong for repos with the suite in `checks`. In akrogon the leaf command set equals the merge set (`verifyCommands`, `src/verify.ts`; akrogon `issues/config.yaml` has `checks.test`, `full: [test]`, no `merge_checks`), so the receipt is a full suite.
- R6. Missing from line 23: the skip needs no new field. The evicted top is the red run's `sha` in `verify-runs.jsonl`, and `applyTop` already moved the leaf branch to it (`src/batch.ts` `applyTop`).
- R7. Missing from line 23: the skip covers only the no-edit return. When B did edit, those repos pay two suites: the receipt run, which takes the line lock (`full`, `src/admission.ts` `awaitLineTurn`), then the merge run on the rebased top. `greenRun` reuses the first only if main did not move. Option: on a return from a merge exit, the receipt runs only the checks outside `full`. I did not count akrogon's own red attempts, so the size is open.

## Q4 return rule

- R8. I hold B: keep the stamp on the first return whatever the path, new stamp from the second. A and C both send a `check.fix` return to the back. Today every second entry is a `check.fix` or `failed` return (46 and 2 exits), and those go green on the first run 60% of the time (24 of 40) against 54% for a first entry (109 of 201). The data does not support treating them as the worse bet, and the back costs depth times 22 min.
- R9. C's `merge_returns` counter is new state. Moves into `merge` are already rows in `log.jsonl`.
- R10. A's bound, "second red in one merge entry", cannot be a command rule under Q1, because every red ends the entry. It can only be skill text.

## Q5 resolution

- R11. I now hold C's per-unit rule over mine. C's reason is half right: whole-command green landings are common (188 in the window, 15 to 51 a day outside the incident), but there were none for 66.9 h from 11-14 22:45Z, which is exactly when covers are open. Simulated on the 25 red base observations, a cover lives a median 920 min under C's rule against 1211 under mine, p90 2726 against 3771.
- R12. Correction to "B: no fully green run landed": the existing code already resolves per command, on a later landed run whose matching command exits 0 (`src/verify.ts` `newRedUnits`). C's real addition is the second clause, a landed run that fails the command without that unit.
- R13. I reject C's `flakyLines` exclusion. It is redundant under C's own rule, since the next landing that does not fail the title closes the cover. It also reads a list that goes blind under 5a (R4).

## Q5 first observation

- R14. I hold B: a cover opens only from a run of main. C's two-leaf rule, simulated on the window, would have accepted 9 first runs: 8 true main reds (a red base run shared the unit) and 1 flake, none leaf-caused. That is one incident and it saves about one base pass (11.7 min) per incident unit. The hard limit is no new red on main, and two sibling leaves breaking one test in back-to-back turns would land with no main run and no seat read.
- R15. Missing cost of my own rule against A's: a leaf-caused red that repeats triggers a base pass that finds main green. Worst case in the window is the 11 red-twice attempts, 2.2 h. A's request by B avoids most of that (20 of today's 21 seat-requested base runs were red) at the price of one state field. If the door prefers A's, I would not object, as long as the request is made in `check.repair` and the base pass runs in the line.
