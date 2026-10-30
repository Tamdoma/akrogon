# Independent territory map: known-red-intake, slot B

2026-10-27. Read the supplied brief, intake, live code and named process sections independently. No other slot's map was read. This is advice to the chart door, not an implementation or a bug submission.

## Findings that change the choice

- **F1: The missing artifact is actionable intake, not all durable evidence.** Verify already persists command results and notice delivery in `issues/verify-runs.jsonl`; the notice body tells the operator to chart a repair. The proposed change should connect evidence to a GitHub report rather than introduce another incident store. Evidence: `src/verify.ts:98`, `src/verify.ts:291`, `src/verify.ts:309`, `src/verify.ts:459`.
- **F2: Notification delivery cannot serve as filing deduplication.** A notice reason other than `error` or a dead `pending` covers the incident. Later reds remain covered until qualifying green evidence lands. No GitHub outcome participates. Evidence: `src/verify.ts:213`, `src/verify.ts:259`, `src/verify.ts:273`; the repeated-red behavior is exercised at `tests/verify.test.ts:685`. Filing only when a new notice is emitted would miss already-notified defects and couple intake to Herdr availability.
- **F3: Verify sees a narrower surface than the seat.** Its commands come from configured checks and merge checks. Parsing recognizes Bun-style `(fail)` lines and substitutes sentinel names when extraction fails. By contrast, the seat must judge runner completeness and causal fit. Evidence: `src/verify.ts:102`, `src/flaky.ts:10`, `skills/check-issue/SKILL.md:69`. A successful configured verify cannot clear an unrelated red proof.
- **F4: The example mixes evidence of different strength.** The actual framework report records 38 failures, a six-failure subset at base, a later killed base run, and a corrected per-file command with six failures common to head and base. These are not interchangeable proofs that all 38 failures were completely compared. Evidence: `/home/ivan/Work/infra/tamdoma/framework/issues/open/astro-config-site-loading/config-helper-require/implementation/report.md:59`, `:95`, `:97`, `:100`, `:101`. Its explicit `test:emdash-conversion` script is at `/home/ivan/Work/infra/tamdoma/framework/package.json:61`; cheap verification's command list is at `:177`. Treat the report as recorded observations, not an independently reproduced diagnosis.
- **F5: Continuation and proof are already separate contracts.** The earlier decision permits known reds inside verify while leaving done-criteria proofs blocking and accepting that main awaits an operator-charted repair. The present implement rule explicitly forbids handing off an unproved criterion as pre-existing. Evidence: `issues/chart/base-red/forks/red-base-policy.md:25`, `:31`, `:34`; `skills/implement-issue/SKILL.md:38`. Intake's statement that a seat continued after a base comparison does not authorize weakening this boundary.

## Material forks

### D1: Who files?

**Pick:** The existing seat files after it judges a base defect supported, using the existing seed-issue workflow as an in-pass operation. That seat already holds the diff, commands, logs and causal judgment. Cover implement/check.fix, review/check.repair, merge and the chart direct route. Existing delegation points are `skills/implement-issue/SKILL.md:40`, `skills/check-issue/SKILL.md:69`, `:91`, `skills/merge-issue/SKILL.md:79`, and `skills/chart-issues/SKILL.md:113`.

**Reason and cost:** This reaches configured and unconfigured commands without inventing a classifier API or a second routing implementation. It adds bounded inspection and GitHub calls at an existing event. It remains an agent obligation rather than mechanically guaranteed delivery.

**Reject:** Filing inside `sendMainRedNotice`: that code runs during the base pass, before verify's final receipt judgment and before the seat's causal judgment (`src/verify.ts:470`, `:736`, `:743`). It cannot cover manual proofs. Also reject a watcher, queue or automatic repair leaf. Earlier scope explicitly excluded automatic repair and seed filing, so this chart intentionally revisits filing only (`issues/chart/red-base-wait/CHART.md:27`).

**Lifetime pitfall:** Both blind review seats can encounter the same defect. A shared filing instruction must return to the parent pass rather than terminate it: seed-issue currently prints `Next: none` and stops (`skills/seed-issue/SKILL.md:94`). Make that composition explicit. Do not accidentally replace the lifecycle's final phase action or footer.

### D2: Which observations trigger intake?

**Pick:** File a supported persistent base defect whether found in configured checks, a criterion proof or an ad-hoc suite. Use the existing same-command retry, head/base evidence and seat judgment. Filing does not change the command's verification status. A red criterion remains blocking. A green retry remains `inconsistent`, not confirmed persistent base red. Evidence: `skills/implement-issue/SKILL.md:38`, `:40`; `skills/check-issue/SKILL.md:63`, `:69`.

**Reason and cost:** This closes the reported gap without broadening verify's command set. Ad-hoc evidence may require the seat's existing narrow reproduction and comparison, but no new full-suite rerun solely for filing.

**Reject:** Configured checks only, which leaves the reported command uncovered. Reject automatic filing on every nonzero exit or just a matching test name, which confuses setup failures, incomplete runs and differing causes. Reject passing a proof because its failure also exists on base. A failed/timed-out attempt can be described as incomplete evidence in an appropriate intake, but cannot be presented as a completed base comparison (`src/verify.ts:193`, `:197`; `tests/verify.test.ts:883`).

**Lifetime pitfall:** The compared revision is currently the merge-base with the tracked default branch, not necessarily its latest tip (`src/verify.ts:185`, `:736`). Record the exact observed revision and avoid claiming that present main is still red without that evidence. Old policy's fresh-base wording is historical, not a reason to change present receipt reuse (`issues/chart/base-red/forks/red-base-policy.md:27`; current behavior `src/verify.ts:414`).

### D3: What gets filed and where?

**Pick:** Reuse seed-issue's evidence-led report and routing. File one observed defect or supported common mechanism, with affected commands/tests listed together when evidence connects them. Separate unrelated defects. Include the consumer identity, exact command and scope, head/base SHAs, brief failing output, available log references, retry result and evidence limits. Keep suspected cause distinct from observation.

**Reason and cost:** Seed-issue already requires nearby file inspection, unverified intake, missing-detail disclosure, and a supported hypothesis or explicit gap (`skills/seed-issue/SKILL.md:32`, `:34`, `:66`). It routes consumer defects through root `issues_repo` or origin, and missing consumer paths owned by akrogon through its ownership rule (`:14`, `:20`, `:24`). The actual framework declares `Tamdoma/tamdoma-framework` at `/home/ivan/Work/infra/tamdoma/framework/akrogon.yaml:1`. Local log paths help the current operator but need short excerpts so the issue can stand alone.

**Reject:** One issue per extracted test name, which could turn the reported 38 symptoms into 38 reports. Reject routing every lifecycle-discovered defect to akrogon. Reject treating a lifecycle skill path cited as context as the failure location. The owner test uses the path named as the failure's location, not every mentioned path (`skills/seed-issue/SKILL.md:24`).

**Lifetime pitfall:** The seed workflow permits one-hop inspection without project commands, installs or edits (`skills/seed-issue/SKILL.md:32`). Filing must reuse the gathered execution evidence and must not start a second implementation or verification pass.

### D4: What counts as an existing report?

**Pick:** Keep semantic deduplication through seed-issue's recent-author and keyword searches, including inspection of supplied report links. An open report covering the same current defect satisfies intake and its URL goes in the pass artifact. Distinguish a closed historical report from coverage of a present recurrence before suppressing filing.

**Reason and cost:** Existing searches already use all states, compare report bodies by mechanism, and can resolve reporter-supplied cross-repo links (`skills/seed-issue/SKILL.md:73`). Reuse that judgment instead of a test-name fingerprint or a new model service. Closed-report handling needs a deliberate clarification: the present unconditional covering-report rule could hide a recurrence after repair (`:82`). My pick is a new linked report for an observed recurrence after a fix, without reopening or commenting on the old issue. A closed duplicate whose linked active report owns this observation can still resolve to that active report.

**Reject:** Reusing notice suppression as GitHub coverage, per F2. Reject permanent suppression by command/test identity, since the same test can fail later for a different reason. Reject claiming exactly-once creation: search followed by create is not atomic (`skills/seed-issue/SKILL.md:73`, `:85`).

**Lifetime pitfall and accepted cost:** Simultaneous seats, bounded search results and failed lookups can produce duplicates. Seed-issue explicitly posts after failed searches with that limitation disclosed (`:73`). Accept best-effort deduplication for this scope. If zero concurrent duplicates is required, this becomes a larger coordination decision and cannot be promised by skill prose alone.

### D5: What happens when filing fails?

**Pick:** Persist the actual created/found URL or the filing error and missing action in the existing implementation report, review or direct report. A filing failure does not convert a passing known-red verification into failed, parked or waiting work. Later encounters may attempt filing again through the ordinary lookup path. No timer, polling or background retry.

**Reason and cost:** The leaf already needs those pass artifacts (`skills/implement-issue/SKILL.md:40`, `skills/check-issue/SKILL.md:51`, `skills/chart-issues/SKILL.md:113`). Seed-issue already stops visibly on routing errors and reports creation failures without blind ambiguous-create retries (`skills/seed-issue/SKILL.md:18`, `:94`). This requires distinguishing an intake-side failure from a permission failure that actually prevents the leaf's work, because implement's operator-blocker rule otherwise stops the leaf (`skills/implement-issue/SKILL.md:35`).

**Reject:** Failing the leaf until GitHub recovers, which reintroduces the forbidden base-red stop through an external dependency. Reject swallowing the failure or claiming a report exists. Reject a persistent retry queue.

**Lifetime limitation:** There is no eventual-delivery guarantee if the only encounter fails and no later pass revisits it. Guaranteed filing despite GitHub outages conflicts with the no-wait/no-new-polling scope unless a separate durable retry mechanism is authorized. State this limit rather than implying automatic repair or guaranteed delivery.

### D6: What happens to the existing notice and repair ownership?

**Pick:** Leave the existing notice behavior and verify receipt logic intact. Add filing independently at the seat judgment. The issue is unverified intake for the existing chart workflow, not an assigned repair, a new leaf or a promise that later leaves skip their own evidence gathering.

**Reason and cost:** Known-red continuation currently ends with receipt evaluation, independent of notice delivery (`src/verify.ts:295`, `:743`). Earlier decisions explicitly accepted repeated comparison cost and operator-led repair (`issues/chart/base-red/forks/red-base-policy.md:34`). This change reduces lost repair candidates, but does not itself eliminate the next leaf's base run or repair the broken test.

**Reject:** Promoting every optional suite into configured checks, reusing issue existence as proof that a leaf can pass, automatic issue closure on a green run, or auto-charting repair work. These each change another contract. Retiring Herdr notices may be a separate operator choice, but is unnecessary to deliver lasting intake.

## Questions the brief does not settle

- **Q1:** Is best-effort semantic deduplication sufficient, including possible simultaneous-seat duplicates? My pick is yes for this scope, per D4.
- **Q2:** Should a recurrence after a closed fix create fresh linked intake? My pick is yes, otherwise historical closure can suppress a currently broken test, per D4.
- **Q3:** Does automatic filing mean an attempted filing with a durable error when GitHub is unavailable, or guaranteed eventual delivery? My pick is the former under the present locks, per D5.
- **Q4:** Is the desired result lasting repair intake, or also eliminating repeated comparison time? The latter is not delivered by filing and would reopen evidence reuse or repair scheduling, per D6.

## Concrete checks for the chosen route

- **A1:** A completed configured known-red comparison yields a judged filing or covering URL even if its Herdr notice was previously dismissed or delivery failed. Leaf verification retains its original outcome. Exercise actual commands and state, not exact skill wording. Existing notice failure and suppression coverage is at `tests/verify.test.ts:685`, `:752`.
- **A2:** An unconfigured proof with supported base-red evidence files in the consumer destination and still cannot clear an unmet done-criterion. A killed comparison is reported as incomplete, not as proof. Use the framework record in F4 as the scenario, without rerunning that consumer suite during this chart.
- **A3:** A covering open report creates nothing, a genuinely repaired-then-recurring defect receives linked fresh intake, invalid routing produces no post, and an ambiguous create failure is recorded without blind retry. Validate outcomes and evidence against seed-issue's Destination and Submit and finish contracts, not report headings or exact prose (`skills/seed-issue/SKILL.md:18`, `:73`, `:94`).

Recommendation: one bounded change to seat filing instructions and their shared seed contract. Keep verify's passing rules, notice state, proof requirements and repair scheduling outside the implementation diff.
