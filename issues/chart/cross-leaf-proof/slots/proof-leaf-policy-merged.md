# proof-leaf-policy, merged round

Applies to any leaf whose criteria include a slow or live run. Chart states repair scope and final-proof rule; plan names restart boundaries; implement records fixes and reuse in its report; review judges under current rerun rules. (B; A,C agree)

### 1 · May the proof leaf fix a bug in another leaf's code?
- 1a (recommended) (A,B,C) Yes, when the fix meets an already-settled requirement: no locked decision changed, no new feature, no changed acceptance rule (A,B,C). Each fix gets a fail-first test at the cheapest level in the owning code's own tests (C; A,B agree) and normal review. A fix needing a design change ends the pass with `failed` naming the decision (A,C; B: record the conflict for review). Example: #15 missing CSS rule is fixed in-branch; #16 uniqueness calibration is a decision.
- 1b every bug opens a new leaf: what took days. 1c fix anything, design included: implementer decides design.

### 2 · May the next run start from the stage that failed?
- 2a (recommended) (A,B,C) Restart at the earliest stage whose code, inputs, config or upstream outputs changed; every stage after it reruns. The report names the saved run's commit, what changed and which stages it feeds. A shared file, lockfile or environment change counts as input to every stage that reads it. If validity cannot be shown, restart from the last trustworthy point or from scratch (B,C).
- 2b always from scratch: hours per fix.

### 3 · Should one run report every failure it can?
- 3a (recommended) (A,B,C) Run every check whose inputs are valid; stages fed by a failed stage are marked blocked, not passed; the run still ends failed. Real product gates keep stopping the product; only the proof run and its checker collect (C). Stand-ins may feed later stages only in a separate diagnostic run, are named, and never count as proof (A,B,C). Group follow-on failures so the fix list doesn't inflate (C).
- 3b stop at first failure: one bug per run.

### 4 · What counts as final proof?
- 4a (recommended) (A,B,C) One final result at the final commit where every stage either ran at that commit or passes the 2a reuse rule, listed with its source commit. A clean full run is required only when reuse can't be shown, or when fresh start, uninterrupted ordering or whole-run behavior is itself under test (B). The live-replay wording "no source edit after the run" becomes "every stage is valid at the final commit" (C).
- 4b always a clean run: repeats hours with no new proof. 4c resumed run with a list of waived checks: weaker, waivers replace proof (A,B,C).

Disagreement D6: B keeps diagnostic stand-ins as a separate question with a "no stand-ins" alternative; A,C fold it into 3a.
Practitioners: Mokhov, Mitchell, Peyton Jones, Build Systems à la Carte (ICFP 2018): a correct incremental build equals a clean one and reruns only what depends on a change (C). Bazel --keep_going: continue targets whose inputs built (C). Jenkins restart-from-stage keeps original inputs (B). Buildkite promise job failure: keep running tests while the build already failed (B). Farley: build once, promote the same artifact (C).
