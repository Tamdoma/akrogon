This round sets the rules for a proof leaf: the leaf that runs the whole pipeline for real once, at the end. It comes after spine-growth because a grown spine already catches most "leaves don't fit" defects early. What is left for the proof leaf is what recorded stages cannot show. live-replay shows the cost of the current rules. It is at 20 defects, 18 labelled runs and 10 rehearsals, and still blocked (framework `live-replay/implementation/report.md:3`, run table at `:783-788`). Each answer below becomes one standing-design line for any leaf whose criteria include a slow or live run.

### 1 · When the proof run finds a bug in another leaf's code, may the proof leaf fix it itself?

Today the chart can forbid it. live-replay's design said "Fixing any defect the run finds. The run fails, and the owning leaf reopens." (`live-replay/design.md:48`). So each bug became a new leaf with its own plan, build, review and merge. Seven such leaves were opened, for example `subject-allowlist` and `ranked-list-heading`. akrogon already has a limit for this kind of case. Implement may add notes to a plan, but "a locked decision is never changed there" and a clash goes to review (`skills/implement-issue/SKILL.md:37`). A seat that is blocked stops with `akrogon phase ... failed` and names the operator action (`implement-issue/SKILL.md:31`). Review reads the whole diff against the plan (`skills/check-issue/SKILL.md:33`), so in-branch fixes are still reviewed.

Example: #15, the two-column layout that never stacks at 360px, is one missing CSS rule. The proof leaf adds the rule plus a 360px test in the renderer's own tests. Review sees both. By contrast, #16 needed someone to decide whether the uniqueness check was too strict (`report.md` "#16-calibration"). That is a design choice, so the proof leaf stops and asks.

Research: better-than-training · the skill lines above, read 2026-09-29 · the "no locked decision changed" limit already exists for implement · the bound reuses it instead of inventing a size limit. Operator override 2026-09-29 (`live-replay/design.md:41`): "Small cross-leaf defects the run finds are fixed in this branch with a test" · this is what finally moved the leaf.

- **1a (recommended)** Fix it in the proof leaf's branch when the fix changes no locked decision in any leaf's design. Each fix gets a fail-first test at the cheapest level, in the owning code's own tests (per the taken proof-selection rule), so the same kind of bug is caught there next time. The report lists each fix. A fix that needs a locked decision changed stops the pass with `failed` and names the decision for the operator. This wins because small bugs cost one commit instead of one leaf, and design changes still go to the operator.
- **1b** Every bug opens a new leaf (today's live-replay rule). Cost: a full plan, build, review and merge per bug. This is what took days.
- **1c** Fix anything in-branch, design changes included. Cost: design choices get made by the implementer without the operator.

Pitfalls: in-branch fixes make the proof leaf's diff bigger, so review takes longer. That cost is small next to a leaf per bug. The fix's test must live with the owning code, not only in the proof run. Otherwise the slow run stays the only thing that catches that bug.

### 2 · After fixing a bug, may the next run start from the stage that failed instead of from scratch?

A pipeline run saves each stage's output. If a fix only touches a late stage, the early stages' saved outputs are still valid. live-replay's design required "The run happens once at that revision with no source edit after" (`live-replay/design.md:119`), so every fix meant a multi-hour restart from research. Rehearsals that restarted from a saved tree found several bugs per pass (`report.md:783-788`). The framework spine already lists what each stage reads and writes (`run-fixture-network.ts:654-655`, `reads` and `writes`), which is exactly what a reuse check needs.

Example: the #17 fix changes only the renderer. Research, plan and content read nothing the renderer writes, so their saved outputs stand. Build, audit and rendered review run again.

Research: practitioner · Andrey Mokhov, Neil Mitchell and Simon Peyton Jones, "Build Systems à la Carte" (ICFP 2018), https://www.microsoft.com/en-us/research/wp-content/uploads/2018/03/build-systems-final.pdf, read 2026-09-29 · a build is correct when its result equals a from-scratch build, and it is minimal when it reruns a step only if something the step depends on changed · reuse is safe exactly when the rerun list covers everything downstream of a change. This set what the reuse argument must name.

- **2a (recommended)** Yes. The run restarts at the earliest stage whose code, inputs, config or upstream outputs changed since the saved run, and every stage after it reruns. The report names the saved run's commit, the files changed since, and which stages those files feed. This wins because it follows the one rule build tools use to make reuse match a clean run.
- **2b** Always restart from scratch. Cost: hours per fix. live-replay did this for 18 runs.
- **2c** Resume wherever the implementer judges best. Cost: a stage fed by changed code can be skipped silently, and the proof then says nothing true about it.

Pitfalls: a shared file (a library every stage imports, a lockfile, the environment) counts as an input to every stage that reads it. Changing it means restarting from the first such stage. Model sessions are not repeatable, so a reused model output is the output of an earlier session. That is fine only if nothing that session read has changed.

### 3 · Should one run report every failure it can, instead of stopping at the first?

Today live-replay stops at the first failure ("HALT NETWORK_BUILD_FAILED", `report.md`). Its checker is also built that way: "First failure wins" (`live-replay/plan.md:29`, D7). So one run finds one bug. When rehearsals kept going, one pass found two kinds of bugs at once (R8: #15 and #16, `report.md:786`).

Example: the review gate fails on 26 overflow findings. It still runs the anchor and uniqueness checks on the same pages, because those pages are real. It does not start deploy-prep, because deploy-prep needs a passed gate. The checker lists every broken invariant, not only the first.

Research: better-than-training · Bazel `--keep_going`, https://bazel.build/docs/user-manual, read 2026-09-29 · Bazel fails at the first error by default, but with `--keep_going` it continues with every target whose inputs built successfully and skips the rest · this is the exact line between "keep going" and "don't feed broken input forward".

- **3a (recommended)** Yes. Each stage reports every failing check. Later stages still run when their own inputs came from passing stages, and stages fed by a failed stage are marked "blocked", not passed. The checker reports every broken invariant. In debug runs a stand-in (a hand fix just to see further) may feed later stages, but the report marks it, and it never counts as proof. This wins because one run then shows all independent bugs, while nothing fake passes as proof.
- **3b** Stop at the first failure (today). Cost: one bug per multi-hour run.
- **3c** Keep going with anything, stand-ins counting as proof. Cost: a pass that rests on a hand fix proves nothing about the real code.

Pitfalls: one root bug can cause many follow-on failures. The report should group failures that come from a blocked or stand-in input so the fix list does not inflate. Real gates in the product (the content gate) keep stopping the pipeline. Only the proof run and its checker collect.

### 4 · What counts as the final proof: one clean run from scratch, or a run that reused saved stages?

live-replay first required one clean run at the final commit, then the operator dropped it for speed and listed the checks it weakened (`live-replay/design.md:42`). With the spine now proving that the stages fit (taken spine-growth), the final live run only has to prove what recorded stages cannot, namely that real sessions drive the route end to end (taken proof-selection: "a slow or live run names what no smaller test proves").

Example: the final run reuses research, plan and content from run 18 because no code they read changed after it (checked with 2a). It reruns build, audit, review and the E2E at the final commit. The report lists the reused stages and the commit each came from.

Research: practitioner · Mokhov, Mitchell and Peyton Jones (above) · a correct incremental result equals a clean one · so a reused stage that passes 2a's rule is as good as a rerun, and a clean run adds proof only where that rule cannot be shown. Dave Farley, *Continuous Delivery Pipelines* (https://leanpub.com/cd-pipelines) · build once and promote the same artifact through later stages instead of rebuilding · supports trusting saved outputs whose inputs have not changed.

- **4a (recommended)** The final proof is one run at the final commit in which every reused stage passes 2a's reuse rule and is listed with its source commit. A clean full run is required only when reuse cannot be shown, for example after a change to a shared file every stage reads, or to the environment. This wins because it gives clean-run strength without clean-run cost whenever the reuse argument holds.
- **4b** Always one clean run from scratch at the final commit. Cost: one more multi-hour run after every fix that lands late, even when nothing early changed.
- **4c** A resumed run with named waived checks (today's override). Cost: it accepts weaker proof by listing the weakness, when 4a could keep full strength.

Pitfalls: "no source edit after the run" and "receipt revision equals HEAD" (`live-replay/brief.md:36`, `design.md:113`) need rewording to "every stage that ran or was reused is valid at the final commit", or the checker fails a correct reused run. Model outputs are never byte-reproducible, so a clean run's model stages are also just one sample. A clean run is not stronger there.

Reply `1a 2a 3a 4a`, or a numbered free-text answer.

Challenge check
- A practitioner could say in-branch fixes (1a) hide cross-leaf bugs from the owning leaf's history. The fix and its test land in the owning code's tests, and the report names each one, so the history stays visible without a leaf per bug.
- The reuse rule (2a, 4a) relies on knowing every stage's inputs. If a stage reads something undeclared (an env value, a global cache), reuse can be wrong. The spine's `reads` lists must be complete. Where they are not, 4a falls back to a clean run.
- Someone could argue collecting failures (3a) wastes time on follow-on noise. Bazel's rule avoids that by only running stages whose inputs passed, so nothing runs on broken input.
- Open: the proof leaf's size and cost limits are not set here. Proof-selection took "no numeric budget, record wall time", so each run's stage durations should be in the report to support a later budget.
