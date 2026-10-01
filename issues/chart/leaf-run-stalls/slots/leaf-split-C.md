# leaf-split round, slot C (blind)

This round settles whether charting asks a split question, how a split leaf fits the spine lock, and what to do with the emdash dependents now. `AK` = /home/ivan/Work/infra/akrogon, `EP` = /home/ivan/Work/infra/tamdoma/framework/issues/open/emdash-cms.

## Evidence (read 2026-10-01)

- E1. Correction to my own map and to fork Findings line 19: `emdash-launch` has 10 done-criteria, not 16 (`EP/emdash-build/emdash-launch/brief.md:22-84`). I had counted the numbered walk steps at brief.md:5-10. Launch is not larger than conversion (11).
- E2. The six dependents form a chain, read from each `state.yaml` `blocked-by`: conversion -> content-fixes -> launch -> fleet-backup -> health-run, with offer-join behind launch and upgrade-route behind launch and fleet-backup. Only content-fixes waits on conversion alone.
- E3. Four dependents need a whole live launch, not a part. fleet-backup brief.md:36, health-run brief.md:43 and upgrade-route brief.md:31 each use "a throwaway EmDash site launched through L8's extension" as their fixture. offer-join brief.md:58 provisions its hub "through `emdash-launch`'s launch contract". No split of conversion or launch frees them.
- E4. content-fixes consumes part of conversion: the filled local fixture (`EP/emdash-build/emdash-content-fixes/brief.md:10,24`). But its spine criterion runs "on the site stage 2 imported" (brief.md:26), and stage 2 is conversion's local import, the last part of conversion (framework `issues/chart/emdash-cms/CHART.md:50-57`). So even this one leaf could not have merged before all of conversion.
- E5. offer-join uses `mapSectionsToSchema`, `capturePage`, `comparePages` from conversion (brief.md:27,53). Those landed in unit U2 in the first hours. It still waits on launch (E3), so that part does not free it either.
- E6. The existing rule already allows a split: "independently checkable outcomes sharing a destination can be parallel leaves ... only an actual dependency orders work" (`AK/skills/chart-issues/SKILL.md:41`). Nothing makes the door ask it per dependent. The audit reads each leaf alone (`AK/skills/chart-issues/assets/shapes.md:170`).
- E7. The spine lock says "each stage has an owning leaf whose done-criterion puts that stage in the spine" and "make the spine part of the earliest relevant leaf" (cross-leaf-proof `forks/spine-growth.md` Taken Q1 1a, `shapes.md:172`). Its reason: "keep-green alone let two stage leaves skip the spine."
- E8. Conversion is `failed` now, on a third base-red item: `validators:verify-secret-env-index` fails on pristine origin/main (`EP/emdash-build/emdash-conversion/state.yaml:34-38`).

### 1 · Should the handoff audit ask, per leaf, what each dependent consumes, and split when a part can merge on its own?

Today the door splits by destination and independence (E6). It never looks from the dependent's side. Example: a leaf builds libraries, a fixture and six scripts, and a dependent needs only the libraries.

Research: practitioner · Google eng-practices, "Small CLs" (google.github.io/eng-practices/review/developer/small-cls.html, read 2026-10-01) · a change should address "just one thing", and splitting vertically lets "some tracks ... move forward while other tracks are awaiting review" · supports asking the question by what unblocks other tracks, not by size.
Research: better-than-training · E2-E5, the live epic · applying the question to the case that raised #45 frees zero leaves · the question is worth one sentence, not a mechanism. It lowered my estimate of the gain.

- **1a (recommended)** One clause on the existing audit: for every `blocked-by` entry, the dependent's brief names the output it consumes. When that output is a part the producer could merge with its own proof, the part becomes a prerequisite leaf. The door shows only the splits it proposes. No count, no size trigger, no recorded "no". It wins because it uses a fact the briefs already hold (E3-E5 are all written in the dependents' briefs).
- **1b** No change. SKILL.md:41 already permits the split. Cost: the door keeps not asking, and the chart Destination already commits to the split rule.
- **1c** Record an answer for every leaf, split or not. Cost: a line per leaf that nobody reads, and a format to police.

Pitfalls: every split adds a full plan, review and merge cycle (emdash-kit took 8 hours with 2 fix rounds for 8 criteria). A part that merges without its consumer has its interface guessed. A split only pays when the dependent can finish on the part, which E4 shows is rarer than it looks.

### 2 · May chained leaves build one spine stage, with only the last owning the spine criterion?

The lock ties one stage to one owning leaf (E7). If a leaf splits under 1a, its stage has two builders.

Research: better-than-training · spine-growth Taken Q1 1a and its reason (E7), read 2026-10-01 · the lock exists because leaves that merged outside the spine skipped it · a first part that merges with no spine criterion recreates that exact gap.
Research: model-knowledge · no practitioner source searched for stage-per-leaf rules · none claimed.

- **2a (recommended)** No. When a leaf splits, its stage row splits with it. Each part owns a stage and its spine criterion, and the first part creates the spine, as the lock already says. The lock stays word for word and no new rule is written. Example: stage 1 "fill" (write-profile, build-seed, fill-local) and stage 2 "compare and export".
- **2b** Yes, chained leaves build one stage and the last one owns the criterion. Cost: the earlier parts merge unproven by the spine, which is the gap the lock closed. This was my map Q3 recommendation. I withdraw it.
- **2c** Add an exception sentence to shapes.md:172. Cost: a new rule for a case 2a already covers.

Pitfalls: under 2a a part that cannot run as a stage (for example, pure libraries with no runnable output) is not a stage and not a chain producer by itself. It is then an ordinary leaf with unit tests, and standing-design.md:11 does not apply until a consumer leaf exists.

### 3 · What happens now to emdash-launch and the six dependents?

All six sit in plan.synthesis behind conversion, which is `failed` on base red (E8).

Research: better-than-training · E1-E5 and E8 · no split frees a dependent, launch is not oversized, and the blocker is the red base · re-charting for size would cost handoffs and gain nothing.
Research: operator · red-criterion Taken Q1 1a and Q3 (this chart) · criteria may cite only blocking `checks`, and `framework_verify` joins `checks` once main is green · once that lands, launch brief.md:84 and content-fixes brief.md:27 comply without a brief edit.

- **3a (recommended)** No re-chart and no split. The operator action already recorded in red-criterion Q3 clears E8, adds `framework_verify` to `checks`, and resumes conversion. The chain then runs in order. This fork adds no live action.
- **3b** Re-chart launch into parts. Rejected by E1 and E3: dependents consume the whole launch.
- **3c** Re-point content-fixes' spine criterion at the filled source site so it can run beside conversion's second half. It would save at most the length of content-fixes on the path to launch. Cost: a contract change to three emitted leaves, which is new intake (`shapes.md:36`), and conversion is already past that point.

Pitfalls: E8 is the third different red item on framework main in two days. If the Q3 action greens only the items seen so far, launch criterion 10 fails next. The action must end with one full green `framework:verify` on main before `checks` gains it. offer-join brief.md:68 cites `hooks:typecheck` and `hooks:verify`. I did not check whether `framework:verify` covers both.

Reply `1a 2a 3a`, or a numbered free-text answer.

Challenge check
- "If the question frees nothing here, why add it?" Fair. #45's harm (six idle dependents) is an inherent chain plus a red base, not a missed split. 1a is one clause and matches the chart Destination. 1b is a defensible answer.
- "2a multiplies stages." Yes, one row per part. That is the price of keeping every merged producer in the spine.
- "Seed #45 says the leaf was too big." The evidence disagrees: implement time did not track size (fork Findings M0), and launch, which I called larger, is not (E1).
- Not verified: whether upgrade-route's `blocked-by` on fleet-backup is a real dependency or file overlap on `extension.yaml` (SKILL.md:41 forbids ordering by overlap), and the coverage of `framework:verify` named above.
