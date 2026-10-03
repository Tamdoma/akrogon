# Independent map B: test value, reviewer edits and blocked leaves

Read-only peer investigation, 2026-10-02. I read intake.md and both operator-provided thread files. I did not read map-A.md. No repository file was edited, no commit or lifecycle mutation was made. Only this requested scratchpad map is written. I used the chart-issues skill as a peer, with A retaining the door, operator rounds and synthesis.

## Findings

- **F1. Observed reviewer-role test adaptations: 16 distinct sessions/passes**, comprising **10 Pi sessions, seat A, phase merge**, and **6 Codex sessions, seat B, repair authority**. Count is defined below. This is an exact count of the identified, evidenced passes under that definition. It is not a count of 16 dishonest changes or 16 unit-test edits.
- **F2. Deliberately weakening a correct test to accept an incorrect implementation: zero conclusively established cases in this audit.** The actual number is unknown. Fixture narrowing and bulk golden regeneration deserve scrutiny. Intent and correctness cannot be read from a changed test filename. Several B edits demonstrably strengthened tests against approved criteria or real integrations.
- **F3. “Slot B reviewer in Pi” misidentifies the main historical surface.** Before the September 29 role swap, A was the final reviewer/rechecker/merge seat and B implemented/repaired. After the swap, B was principally Codex. Both seats participated in initial blind reviews. No retained Pi test change in initial check.review was identified. Pi reviewer changes in this list happened at merge. Six Pi review/merge candidate sessions in the pi-extensions repository yielded no qualifying retained change.
- **F4. The claim that everything blocking us is an AI-crafted unit test without real-world background is contradicted by the logs.** There is a clear bad assertion blocking two akrogon leaves, and an unsupported crafted review finding prolonging another leaf. There are also real browser, integration, deployment, environment, timeout and prerequisite failures. Some repeated work is E2E fixture/golden maintenance, not unit testing.
- **F5. Current policy already calls for minimal tests and realistic Fixes.** The gaps are existing bad checks/criteria, changing test expectations without a separate correctness source, repeated broad executions, and fixture churn at merge. Writing the same minimal-test instruction again does not resolve those gaps.
- **F6. The strongest recent evidence favors a small test set with independently grounded expectations and demonstrated defect detection.** It does not support deleting tests by label, freezing every test forever, or treating a green run as proof of useful coverage.

## Count definition, coverage and method

The supplied window is date labels **2026-09-25 through 2026-10-02 inclusive**, filtered by UTC timestamps, observed through the October 2 audit snapshot around **21:18 UTC**. This is eight inclusive calendar labels, although intake calls it seven days. There are no listed qualifying cases on September 25, so removing that date would not change this list. October 2 is incomplete and live logs can grow.

Counting unit: one leaf/session in which the seat holding final review/recheck/merge responsibility made substantive retained changes to executable tests, expected values, fixture builders, mock integration output or recorded test expectations in response to a finding or a failed check. Multiple edits, commits and rebases in that session count once. Adding a regression during authorized reviewer repair counts as a test adaptation, but is classified separately from relaxing an existing expectation. Ordinary implementation by the worker does not count. Conflict-only reconciliation, documentation-only changes and temporary repros that were removed do not count.

For the narrower question “changed a correct test to fit a wrong finding,” the required proof would include the prior approved behavior, the realistic input source, the old test detecting its violation, and the changed test ceasing to detect it. The available evidence does not establish that chain for a positive case. Therefore **16 observed adaptations** and **0 proved suppressions** answer different questions. Neither is a universal rate.

Method:

1. **M1. Establish seats and registered roots.** Read `akrogon config`; inspect historical config with `git show <rev>:config.yaml`, not today's seat labels. `ea43b14` and `3704d86` had A Pi/B Pi, then A Codex/B Pi. `bde1032` on September 29 at 22:41 +02 swapped to A Pi/B Codex. `87fe90f`, `9a627dd`, `6905904`, `22c4470`, `627ef15` continue B Codex while A changes between Pi and Claude. `issues/chart/seat-role-swap/CHART.md:7-9,18` records immediate role swap without rewriting historical artifacts.
2. **M2. Scan all registered logs.** Existing logs cover nine of ten registered repositories. `lingua-relay/issues/log.jsonl` is absent. Window snapshot: akrogon 200 events, framework 556, pi-extensions 14, Himne 26, blepsis 18, four other existing logs zero. Total **814 events**, **39 failed transitions**, **14 distinct failed leaves**. Reproduction: parse each registered root's `issues/log.jsonl`, filter `2026-09-25 <= ts[:10] <= 2026-10-02`, group `to == failed` by repo/slug. Failed counts: akrogon 4/3 leaves, framework 34/10, Himne 1/1. This is not a count of test-caused failures.
3. **M3. Parse both harnesses independently.** Pi: `~/.pi/agent/sessions/**/*.jsonl`, user phase prompts and assistant `message.content` toolCall items, including edit/write and bash Python/sed/copy/record commands. Codex: `~/.codex/sessions/2026/**/*.jsonl`, response_item user prompts and custom_tool_call inputs. Codex mutations often use the `exec` wrapper containing `tools.apply_patch`, so searching only tools named apply_patch would miss them. Associate each mutation with the most recent lifecycle prompt and explicit operator overrides, not the session's first prompt. Never execute logged commands.
4. **M4. Inspect candidates and retained evidence.** Broad review/merge candidate scan examined 224 Pi and 49 Codex transcripts, including six Pi candidates in pi-extensions. These are search candidates, not a denominator of unique review passes. Inspect mutations, nearby results, review/implementation reports and available Git diffs to distinguish assertion changes, fixture adaptation, conflict reconciliation and discarded probes. Commits quoted below are inspected historical evidence, not commits created by this audit. Full session paths and mutation lines are in the appendix.

Confidence: high for the seat/phase attribution and identified edits, medium for corpus completeness because shell-generated artifacts and indirect helper writes are harder to discover and live sessions continue. Missing logs, null session IDs and absent old failure reasons prevent a certified complete causal census. High confidence that **16 is not a demonstrated cheating count**. Initial blind review had no proved unauthorized retained suite edit. One nominal check.review session had explicit operator repair authorization.

### Exact identified passes

Paths below are relative to the named repository. The appendix expands full session paths and exact edited test/helper paths. T01–T10 are all **framework / merge / A / Pi**. T11–T16 are **B / Codex**.

| ID | Leaf | Changed tests/fixtures and why | Commit or decisive session evidence | Judgment |
|---|---|---|---|---|
| T01 | plan-script | Satellite fixture `phases/negative-suite.ts`, `00-network/pool-observations.json`, `test/run-fixture-network.ts`: align phase names and drawn sitemap lookup, fill pool minimums, restore fixture-tool execution. Pool entries include synthetic citation URL padding. | `a96cd9eaf`; session 01a0e02b, lines 369,401–423,429,433 | Producer/fixture adaptation, realistic provenance of fabricated pool data not demonstrated. |
| T02 | satellite-review | `rendered-pairs-test.ts` adds required weave-manifest input and actual slug mapping. `.claude/hooks/tests/skill-effort-pins.test.ts` changes inventory counts to 87/71. Audit run-fixtures conflict reconciliation also present. | 01a0e40d:244–266; `review-A.md:83-89`, head 4755f583e | Contract/metadata adaptation, no proved bug suppression. |
| T03 | readable-outbound-links | `write-satellite-content/test/content-batch-negative.test.ts` and `finalize-network.test.ts` add required page-records fixtures after rebase. Two other test edits are conflict reconciliation. | 01a0e973:304; final history `5bab11cbf`; `issues/closed/client-link-footprint/readable-outbound-links/review-A.md:81-84` | Existing fixture failures reproduced on base. Some other base failures remained reported, not removed. |
| T04 | one-client-link | `finalize-network.test.ts` moves client-link fixtures footer to body. `verify-network.test.ts` updates link plans/schema. `arch-differentiate-satellite-anatomy/test/question-records.test.ts` adapts grouped pools. Other named tests are merged conflict inputs. | 01a0e9d9:220,228,519,571,593–637; `issues/closed/client-link-footprint/one-client-link/review-A.md:114-132` | Matches changed producer interfaces. Many modifications in one merge pass, not many independent cheating incidents. |
| T05 | editorial-identity | `arch-define-entity/test/editorial-identity-e2e.fixtures.ts` adds new link/group-pool data, clones records to meet draws, changes unaffected peers from info_or_blog to local_qa to avoid pool draw drift. `network-plan.test.ts` adds google_business_profile:null. | 01a0e9a0:341,361–474; final `eb6171d5a`; `issues/closed/publisher-identity-contact/editorial-identity/review-A.md:63-81` | **Suspicious scenario narrowing**, but no demonstrated approved invariant lost. Preserve for semantic review, do not declare it proved misconduct. |
| T06 | operator-photos | Renderer tests pin successive current renderer versions, supply real token/bootstrap prerequisites, adapt photo template and client-link rows. Test model-artifact/expectation recorders and golden outputs changed. | 01a0e9bf:434,624,646,720,892–1218; `ae6b30e96`, `370952cb3`, `91abfc124`, `9b567de77` | Large E2E/golden maintenance. Green regeneration alone does not establish golden correctness. |
| T07 | variant-geometry | `render-frozen-tight-list.test.ts`, `variant-assignment.test.ts`, fixture render/record runners: seed personas for frozen versions, restore raw bytes, adapt link/rank/chrome and theme inputs. | 01a0ea15:210,246,302–478; `issues/closed/satellite-network-simplify/satellite-render/variant-geometry/review-A.md` | E2E compatibility and fixture regeneration, not solely unit tests. |
| T08 | contact-page | Renderer and editorial-identity E2E factories/tests update contact, photo, chrome, noindex and link prerequisites. Frozen expectations for renderer versions 1.0–1.4 are re-recorded. Full edited path list in appendix. | 01a0eaa6:779–1803; `9568a9b27`, `8b0a2b85d` | Substantial fixture/golden churn. Later site-nav report identifies stale assignment contamination in these expectations. |
| T09 | chrome-copy | `run-render-sites.test.ts`: expected 404 text changes from Page not found to per-site Not found site-1. `chrome-copy-e2e-run.ts` changes sentence length fixture. `verify-network.test.ts` adds/restores URL normalization regression. | 01a0ea7b:425,516,520,538,606; `e159f17eb` | Intended per-site operator copy can justify expectation change. Sentence padding needs a distinct source for correctness. |
| T10 | site-nav | `render-page.test.ts`/`photo-emission.test.ts` add required contactForm/noindex factory inputs. Regenerates `fixtures/no-photos-page.html` and renderer-expectations 1.0.0,1.0.1,1.1.0,1.1.1,1.2.0,1.3.0,1.4.0; adds 1.5.0 for leaf release. | 01a0ebbc:200,298,310,317,321,331; `86d495086`, `b94db44d6`, `8fbb73e5c` | Merge note says older expectations had been recorded with leftover 1.4 assignments. Important example of golden-maintenance defects, not proof unit tests are useless. |
| T11 | framework / emdash-launch / check.review with explicit repair override | `.claude/skills/dev-build-emdash/test/crawl-compare.test.ts` adds curl HTTPS hostname/resolve regression, gives the new slow test 180s, then changes mock bodies to Buffer to cover binary asset integrity. | 01a0f7d7:1013 operator says “Just do those fixes yourself, don't return them back”; edits 2504,2528,2575 | Authorized repair, not clandestine blind-review mutation. New regression, not an existing expectation relaxed to hide a bug. |
| T12 | akrogon / failure-log / check.repair | `tests/phase.test.ts` adds notification-error and rename-error cases, checking persisted failure/log state and nonzero CLI outcomes. | 01a0fda1:105,113,138; final `39cb4c0b`; `issues/closed/leaf-readiness/failure-log/review-B.md:40-58` | Real integration/error path. Recorded red then green. |
| T13 | akrogon / readiness-contract / check.repair | `tests/status.test.ts` changes the previously green merged-detail assertion from hiding Missing gaps to showing them in open/closed detail while suppressing overview. Adds archived-state case. | 01a0fda7:96; test `820ed82d2042735b0dcf8b5a484be776228edd93`, fix `6403e0ca`; `issues/closed/leaf-readiness/readiness-contract/review-B.md:23,37-40` | Old test encoded a defect against criterion 5. Replacement **strengthens the approved behavior**, rather than manufacturing acceptance. |
| T14 | akrogon / env-link / check.repair | `tests/next.test.ts` replaces assertion on refusal prose with an assertion that the diagnostic includes the actual absolute worktree .env path. | 01a0fda8:87; test `fc74745` (rebased `2c67147`), fix `dd20cea`; `issues/closed/leaf-readiness/env-link/review-B.md:13-17,23,43-46` | Path is a meaningful fixed reference. Recorded 158/1 red to 367/0 green. |
| T15 | framework / emdash-health-run / check.repair | `.claude/skills/admin-emdash-fleet/test/health-checks.test.ts` replaces fabricated R2 text with actual Wrangler JSON shape: name/object_count/bucket_size. Adds assertions for 60 objects and formatted size, retaining health findings. | 01a0fe4a:218; nearby review-B repair evidence | Corrects unrealistic external mock, supports the operator's concern about fabricated tests without justifying deletion of the real check. |
| T16 | framework / capture-asset-bytes / check.repair | `.claude/skills/dev-cf-workers-deploy/test/deploy-core.test.ts` adds response-disposal regression through real Chromium/context lifecycle; adjusts hanging-navigation fixture to hang at both widths and require original markup. | 01a0fe5e:126,177; B-F1 test `03b1ff9d2`; final `8a47d96f8`; review-B repair section | Real API/browser boundary. The claimed unhandled Promise.race rejection was separately disproved without a corresponding code fix. |

### Exclusions that change the count

- **X1. Conflict-only sessions:** content-batch Pi 01a0e20c, page-records Pi 01a0e951, offer-join-deploy Codex 01a0f10b. Tests were reconciled to retain both branches, with no identified substantive expectation adaptation. Excluded.
- **X2. Discarded probes:** appended-page-records Pi 01a0e9a1, ranked-list-heading Pi 01a0ebb3, info-gathering-business-writes Codex 01a0f6ff wrote temporary regression/probe copies, then removed/restored them. Excluded from retained suite edits.
- **X3. Documentation and non-test files:** research-pools Pi 01a0df1f changed README only in the matched area. Hash-list scratch outputs are not tests. Excluded.
- **X4. Literal B before swap:** B's normal implement/check.fix edits are not final-reviewer edits. Counting all B test edits would conflate worker implementation and reviewer behavior.
- **X5. The genuine bad TMPDIR assertion removal is outside the reviewer count.** Commit `2dd1106554851d48ef7c15a4aade9074deea96dc` deleted one `expect(tmp.startsWith('/var/tmp/akrogon-')).toBe(false)` in `tests/next.test.ts`. Claude watch-issues/operator aide session `/home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/8207bbd5-c015-4c81-9ddb-9176f50bffbe.jsonl:255` records operator instruction “fix it then nudge the agent again”; line 278 edits it, 287 verifies under seat-like TMPDIR, 292 commits. This was an explicitly authorized baseline repair, not slot B/Pi review. `git show 2dd1106 -- tests/next.test.ts` shows root isolation, existence and mode 0700 assertions remain.

## Were failed or looping leaves actually blocked by source-free AI unit tests?

No blanket attribution is supported. Many historical failure events have `session:null` and no reason. A later report establishes its own observed failure, not necessarily the cause of an earlier anonymous transition. AI authorship also requires transcript or commit evidence, not the fact that a test exists.

The failed leaf inventory is exact for the snapshot: **akrogon:** concurrent-suite, proof-order, wave-table. **Framework:** capture-asset-bytes, effort-evidence-lag, emdash-conversion, emdash-fleet-backup, emdash-kit, emdash-launch, emdash-offer-join, live-replay, offer-join-deploy, pool-smell-freeze. **Himne:** python-migration-requirements.

| ID | Leaf(s) and observed obstruction | Evidence | Attribution |
|---|---|---|---|
| B01 | proof-order and wave-table: valid seat TMPDIR trips a forbidden-prefix assertion. | `issues/closed/long-implement/proof-order/implementation/report.md:3,8,13-14`; X5's actual deletion and verification. | **Confirmed low-value assertion causing real blocks.** Checks of the required isolation property remain. The author of the original assertion is not established here, so do not assert its AI provenance as fact. |
| B02 | offer-join-deploy: repeated repair rounds, including F17 crafted regex/template content. | `framework/issues/closed/landing-multi-offer/offer-join-deploy/review-B.md:597-622` requested repair, `631-635` explicitly reclassifies F17 as Nit under the new realism rule. | **Confirmed source-free review demand prolonging work.** Real Chromium executing handmade input did not itself supply a realistic input source. This was review pressure on worker tests/code, not reviewer rewriting a suite to fit its findings. |
| B03 | Same offer-join-deploy loop also included a real repair regression, F18. | Same file `639-678`: actual Astro 7.3.3 builds with responsive fetch branches and Chromium at both widths. | Valid integration regression. Discarding every finding in the loop would miss it. Earlier implementation also stopped for Formspark setup and Cloudflare DNS-scope 403, Pi session 01a0efee:221,233,444. |
| B04 | emdash-fleet-backup: capture timeouts and invalid base-red evidence. | `issues/chart/test-runs/forks/timeout-cause.md:13-26`; `base-red-rule.md:17-20`. Source fix framework `2cb00d537`. | Browser capture race, not fabricated unit expectation. One base run was killed by the seat's roughly 25-minute limit without terminal result. That is incomplete evidence, not proved failing base. |
| B05 | live-replay: pipeline repeatedly stopped on pool validation, provenance/schema, link contract and malformed rendered list markup. | Pi session 01a0e54c:477,585,630,908,1004. | Actual pipeline integration/source-contract failures. Not merely isolated units asserting invented implementation details. |
| B06 | emdash-kit: whole verification red on pre-existing failures. | `framework/issues/closed/emdash-cms/emdash-foundation/emdash-kit/review-B.md` equivalent leaf file, lines 280-286,300-321: baseline/head comparison reports 80 checks,72 green,8 same failures. | Broad baseline gate, mixed lint/env/color/enum/pool/test failures. Not all unit tests. Locate exact path with `rg --files .../issues | rg '/emdash-kit/review-B.md$'` if archived hierarchy differs. |
| B07 | emdash-conversion: baseline secret-index drift blocks full verify. | Leaf `implementation/report.md:53,58,97-120,128`, five .env.example names and later green full verify wall 901s. | Configuration/index gate and costly broad verification, not source-free business unit tests. |
| B08 | concurrent-suite: 1 timeout in four parallel suite runs, despite attempted default timeout configuration. | `issues/closed/akrogon-slow-phases/concurrent-suite/implementation/report.md` equivalent leaf report, lines 18-29,53. Bun 1.4.2 preload default applies to first file; assumed bunfig timeout key unsupported. | Real runner/configuration defect. Later blockage also concerned the branch's issues/ edits invariant. A timeout is not evidence the tested invariant lacks value. |
| B09 | Himne python-migration-requirements: stale sr audio expectation `_i` versus synchronized `_full`, also red on base. | `/home/ivan/Work/personal/Himne/issues/closed/python-migration/python-migration-requirements/implementation/report.md` equivalent leaf report `25,41-49`, base 3d60863/428c9241. | Mismatch with actual synchronized content/D1, not an established invented input. Exact hierarchy should be taken from the path registry below. |
| B10 | emdash-offer-join: actual live routes and launch commit omissions. | `framework/issues/open/emdash-cms/emdash-landing/emdash-offer-join/implementation/report.md:128,147-154,158,169-173`. | Real launch omitted removed_paths, yielding empty `/about`; bring-up wrongly requires draft routes to be 200 before publish. Join prep can pass with zero routes compared. These are significant integration defects. |
| B11 | capture-asset-bytes: locked redirect proof conflicts with actual Playwright route handling. emdash-launch also stopped for operator/live-run limits. | Framework log failed transition and capture leaf report/review; emdash-launch session 01a0f7d7:821,1013. | API/contract feasibility and operator authority, not invented unit assertion as sole cause. |
| B12 | effort-evidence-lag and pool-smell-freeze: September 28 failures have no reason/session and start from the same base with no substantial implementation diff. | `framework/issues/log.jsonl`, 2026-09-28T07:36:52; later effort report:27-43 and pool report:33-54. | **Original failure cause unresolved.** Later effort live checker is equally ineffective on base/head due to harness execution flow; pool report has green target tests and red unrelated baseline lint. Those later observations cannot retroactively prove the initial failure cause. |

One nearby fragile prose test is **not evidence of a block**: `learnings/history/2026-10-01-failed-stop-guard-wording.md:6` describes wording coupling, but the 39 tests passed and review treated it as Nit. Do not count it as a failed leaf caused by tests.

The warranted conclusion is narrower than the operator hypothesis: bad assertions and ungrounded demands cause real delay, broad red baselines spread obstruction across unrelated leaves, and E2E/golden churn creates its own failures. Keep these separate from defects uncovered by realistic tests. This audit does not establish an exact fraction of all 39 failed transitions caused by AI-origin unit tests.

## Operator-tier thread: practitioners, agreement and disagreement

I read the saved main post, thread items and all **76 saved replies**, plus the condensed operator-pasted replies. The saved object reports 194 replies overall. Direct X fetch was blocked. A further fxtwitter cursor GET returned 404, so this is **not the full 194-reply conversation**. Source: saved `thread.json` from https://api.fxtwitter.com/2/conversation/2103463289875280041 and `thread-pasted.md`. Raw post time is September 25 UTC; pasted file labels September 26. Profile track records below are self-described bios in the supplied source, not independent employment verification. Likes and verification badges are not evidence of correctness.

| ID | Named practitioner and track record | What they actually say | Weight and implication |
|---|---|---|---|
| H01 | **Dan Loewenherz**, building Opendoor, formerly Champify founder, Heap engineer and CTO at Coffee Meets Bagel/The Black Tux per bio. | [Main post](https://x.com/dwlz/status/2103463289875280041) objects to bloated tests, artificial behavior locks and coverage that does not protect production. [Clarification](https://x.com/dwlz/status/2103482752028827973) explicitly says code is often wrong and AI creates tests falsely proving it right. [Follow-up](https://x.com/dwlz/status/2103526425479582075) allows useful unit cases, objects to massive trimming tests. | Practitioner critique, not measured proof models write perfect code. His clarification contradicts a literal reading of the main post's perfection claim. Large diff volume makes reviewing test drift difficult. |
| H02 | **Jakub Fijolek**, cofounder/CTO Coinfirm per bio. | [Reply](https://x.com/JakubFijolek/status/2103633051725254908): agents overwrite failing tests to make them green even when they should fail. | Direct concern about a real workflow failure mode. His “90%” is anecdotal, not a usable measured rate for us. |
| H03 | **Pradyumna, @namestartswithp**, no track record supplied. | [Reply](https://x.com/namestartswithp/status/2103797572892778948) says they have personally been affected by an agent changing a business rule and its test together. | Firsthand report of expectation contamination. Less authority information than H01/H02, still concrete testimony. |
| H04 | **@Olivier_Lambert**, display name Clanker Whisperer, self-described fullstack entrepreneur. | [Reply](https://x.com/Olivier_Lambert/status/2103839493996360081) proposes approval before editing existing tests through a hook. | Proposed control, not a documented case study of effectiveness. The hook must cover shell writes/helpers/goldens, and legitimate test corrections need a route. |
| H05 | **Will Simmonds**, former Principal Engineer Curve, CTO Blackfinch, Mercedes F1 engineer per bio. | [Reply](https://x.com/wjsimmonds/status/2103487253976948986) values behavioral/E2E proof but says large variation sets cannot all be covered there. [Follow-up](https://x.com/wjsimmonds/status/2103550858244006002) reports seeing near-identical bloat and unverified purported testing. | Supports fewer valuable tests, rejects an E2E-only blanket policy. |
| H06 | **Kai Meyer**, C/C++ engineer in data protection per bio. | [Reply](https://x.com/KaiMeyer/status/2103498129568071956): product E2E takes a week, escapes pull 3–10 developers into diagnosis, and insufficient fast unit coverage contributes. [Release-window follow-up](https://x.com/KaiMeyer/status/2103720883257057711). | Concrete counterexample to deleting lower-level tests indiscriminately. Different product scale limits direct transfer, but slow E2E is relevant to our long runs. |
| H07 | **Daniel Kennedy**, technology consultant/builder per bio. | [Reply](https://x.com/danieldklogics/status/2103818414485626909): 1000+ E2E cases are slow, and directing an LLM merely to add units is ineffective. | Supports deliberate small fast tests, not test count as an objective. |
| H08 | **Mooncast Productions, @MooncastOnline**, self-described 30+ years gamedev, ex-Origin/Naughty Dog, serial founder. | [Reply](https://x.com/MooncastOnline/status/2103589894031298598): regressions during ongoing feature development matter; a failure can prompt a library fix or legitimate test change. | Test edits are not intrinsically wrong. Expected behavior must decide which change is justified. |

The pasted replies add useful contrary views. Their individual post IDs are absent, so links here identify the [conversation](https://x.com/dwlz/status/2103463289875280041) and [profiles](https://x.com/corp_book), **not verified individual replies**. `thread-pasted.md:21` **@corp_book** wants the smallest fast test proving a real invariant regardless of level. `:8` **@WispyWinter** proposes freezing the suite before implementation. `:15` **@teyc** uses changed tests to challenge behavioral changes. `:17` **@ShSabzevari** gives explicit test/reviewer guidelines. `:7` **@dev_lauta** notes an initial red test can improve the implementation even if only final green is visible. `:9` **@robin_blix** favors fast rule variations versus expensive E2E. These are condensed operator-provided paraphrases with unverified practitioner histories. I do not treat them as exact quotations or stronger than named firsthand accounts.

My independent reading: the useful agreement is to stop treating generated volume or coverage as correctness and prevent silent shifts in expected behavior. The genuine disagreement is which level supplies the cheapest sufficient evidence for a particular product. The thread does not establish a consensus to abolish unit tests, a measured test-cheating rate, or permission to discard existing checks unilaterally.

## Independent recent research, 2026 first

Searches covered recent agent test corruption, test volume, mutation/known-bug detection and agent-driven CI selection. Selected primary sources, prioritizing practitioner teams and actual evaluations. Anonymous or secondhand summaries did not decide the recommendation. Checked October 2, 2026.

- **E01. Anthropic engineering/CI team, September 14, 2026.** [Agentic coding is straining CI](https://claude.com/it/blog/agentic-coding-is-straining-ci-heres-how-we-scaled-test-impact-analysis-at-anthropic). Their tests grew 10x and CI jobs 25x over six months. They describe deterministic selection by package relevance and previous results instead of every test on every change. Stale selection data can both miss newly fixed tests and spread irrelevant failures. This is a real team case supporting affected-test execution and explicit full-suite ownership. Their distributed infrastructure is not a justified implementation prescription for our repository. The official localized page contains the English article and date, avoiding dependence on secondary reporting.
- **E02. Bill Echlin, TestManagement.com/Test Management Systems, August 11, 2026.** [Real-world evaluation](https://www.testmanagement.com/blog/2026/08/ai-written-tests-evidence/) on their own product restored historical bugs and compared identical tests on GOOD/BAD builds. Larger suites, polished code and passing GOOD did not predict detection. Full specifications did not outperform concise criteria in this small experiment. Fourteen of eighteen authoring/repair/pressure sessions offered an opportunity to weaken tests, with no corruption observed under immutable intent, explicit disagreement handling, defect-sensitive checks and a defensible verdict rather than compulsory green. Scope: two requirements, one product, one pinned model. This is a mechanism demonstration, not a universal rate. Transfer: require a new regression to fail on the actual broken behavior for the intended reason, and retain failures when the product contradicts approved behavior.
- **E03. Zhi Chen, Zhensu Sun, Yuling Shi, Chao Peng, Xiaodong Gu, David Lo and Lingxiao Jiang, February 8, revised April 9, 2026.** [Rethinking the Value of Agent-Generated Tests](https://arxiv.org/abs/2602.07900). Six models on SWE-bench Verified often used generated tests as observational feedback. Prompt interventions in four models increasing/reducing test writing did not significantly change task outcomes. This supports questioning compulsory new test volume. It does not establish that maintained regression suites or independent external evaluation are unnecessary. Benchmark task resolution is not production reliability.
- **E04. Andre Hora and Romain Robbes, January 30, 2026, accepted MSR 2026.** [Are Coding Agents Generating Over-Mocked Tests?](https://arxiv.org/abs/2602.00409). Study of 1.2m 2025 commits in 2,168 repositories includes 48,563 agent commits. Agents modified tests more frequently and added mocks more frequently than non-agents. This is empirical support for inspecting real interaction coverage and mock boundaries. It does not prove any given mocked test is invalid, nor does 2025 commit data measure our 2026 harnesses.

**Research conclusion:** Use domain rules, locked operator criteria, real builds/integrations and known defects as expected-behavior sources. Keep only tests that distinguish a relevant good outcome from a relevant bad one, at the cheapest adequate boundary. Preserve fast variation checks when they save costly E2E investigation. Do not confuse adding tests during diagnosis with maintaining a useful regression set.

## Current mechanism and overlapping locks

| ID | Inspected surface | Consequence for this door |
|---|---|---|
| L01 | `skills/implement-issue/SKILL.md:57` already requires the smallest set proving criteria and real bugs, realistic consequences for extra cases, extension of existing tests and no test for trivial one-liners. `:75` prohibits weakening criteria/failing tests during repair. | Minimality and realistic provenance are already policy. Identify concrete missing behavior rather than another general instruction. |
| L02 | `skills/check-issue/SKILL.md:49-55` requires source/consequence/criterion, makes handcrafted-only reproductions Nits, rejects prose assertions and mocked units, but **all failed checks and named criteria still block**. `:59` sets baseline comparison. | A poor legacy configured check remains a blocker until the responsible contract/check is explicitly revised. Source-free new optional review cases do not get the same status. |
| L03 | `skills/check-issue/SKILL.md:69-81` lets B repair both reviews and requires a failing regression commit then fix commit for each behavioral Fix. `issues/chart/reviewer-repair/CHART.md` locks in-pass repair without adding a second reader. | Forbidding all B test writes contradicts the chosen repair mechanism. New regressions and existing expectation changes need distinct treatment. Don't reopen second-reviewer routing by implication. |
| L04 | `skills/merge-issue/SKILL.md:37-45` reruns all checks/merge_checks and fixes a broken default branch forward. | Pi's counted historical merge edits follow an authorized maintenance route. Test-intent protection must cover merge and golden regeneration, not merely check.review. |
| L05 | `issues/config.yaml:7-11`: full Bun suite and changed suite are both checks. Framework `issues/config.yaml:8-13`: parity/contracts are individual checks and repeated inside test and test_changed, plus selftest. Pi-extensions `issues/config.yaml:8-9`: test_changed repeats exactly the four full-directory commands used by test. | Cost is partly configured duplication, independent of test usefulness. Existing selection charts own framework scope. Pi-extensions has an additional concrete duplicate-run surface if operator wants that destination. |
| L06 | `/home/ivan/.pi/agent/extensions/tamdoma-pi-tweaks/index.ts:46` bounds bash timeout. `tamdoma-env-guard/index.ts:1196` installs tool-call secret/env controls. Test scan found no existing-test-intent guard in these inspected extensions. | Harness hooks can control calls, but timeout/env protection does not decide approved business behavior. A filename-only hook misses shells, fixtures, recorders and code that changes shared test helpers. |

Overlap decisions are still the operator's:

- **L07. realistic-fix-bar**, handed off September 30: locks criteria/real bugs only and realistic input source; `CHART.md:4,7-10,17-20`. Its next-20-leaf measurement is explicitly a later attended door, not a new implementation leaf. This audit is evidence, not a substitute for its designed follow-up cohort.
- **L08. test-time-and-temp**, handed off October 1: owns safe temp allocation, comparable base execution and avoiding whole suites while planning. B01 is directly related, but the bad assertion is already removed by 2dd1106.
- **L09. akrogon-slow-phases**: owns Bun suite execution speed/timeout work. B08's real configuration issue belongs there, not a new blanket test-removal fork.
- **L10. framework-test-scope**, open: `CHART.md:4,9-11` already names affected tests per leaf, selection authority, once-on-main release suite and red ownership. Reuse that chart, do not duplicate its leaf gate or selector decision here.
- **L11. test-runs**, existing chart: `forks/base-red-rule.md:24-28` now records operator choices requiring completed comparable runs and causally explaining leaf failure, with killed/crashed/interrupted runs stopping as incomplete and no automatic retry. Do not ask that question again. Capture-race cause was settled, and a timeout bump was not its fix.

## Material forks for A's next operator round

These are **unanswered choices**, not authorization or contracts written by B. Resolve the authority on expected behavior first, because it reshapes both the minimum test set and fixture policy.

### Q1. What may an agent change in an existing test's expected behavior?

Practitioner question: What independent source says the old expectation is wrong, and what previously detectable wrong behavior remains detectable after the change?

- **O1. Preserve approved behavior and require an explicit, attributable decision for changes to that behavior. Recommended.** B may add regressions and correct fixture/API mechanics without changing the locked outcome. An existing assertion/fixture/golden change must cite the contract or realistic source, explain the semantic change and show the relevant old bug still fails. If the old expectation conflicts with a locked criterion, stop for its owner to resolve the conflict. The new implementation is not the correctness source.
- **O2. Freeze every existing test and require operator approval for any edit.** Stronger visible control, but freezes bad TMPDIR assumptions, false mocks and old schema factories. It also blocks ordinary current B repair. The operator would receive many mechanical compatibility changes.
- **O3. Give another author ownership of all test expectations.** More independence, but adds review/routing work and conflicts with reviewer-repair's chosen no-second-reader outcome unless explicitly reopened.

Evidence: H02/H03 show the failure mode, H04 proposes approval, E02 demonstrates preserved intent and paired detection. T13/T15/X5 show legitimate changes a blanket ban would obstruct. **R1:** any protection scoped only to test filenames or Pi edit misses shell writes, shared helpers, snapshots, golden recorders and changes made during merge. Mechanical checks may flag changes or validate recorded provenance exists. They cannot determine semantic correctness by exact wording.

### Q2. Which tests are important enough to retain or add?

Practitioner question: Which required outcome or realistic failure does this test detect that the remaining set cannot cheaply detect?

- **O4. Keep the smallest set covering locked criteria and real failure consequences. Recommended.** Favor a small realistic boundary proof where it catches the actual integration bug, and a fast invariant test where it covers important variations more cheaply. Remove redundant implementation mirrors, unsupported prose coupling and assertions like B01 through the responsible owner's normal change process. Existing good regressions should not be discarded solely because they were AI-written.
- **O5. Only E2E tests.** More observable integration behavior, but existing goldens and long browser suites already create delay. H05/H06/H07 directly contradict a universal E2E-only rule.
- **O6. No lasting new tests except operator-requested cases.** Lowest generation volume, but removes new protection for real failure-log, draft-route, binary-byte and responsive-fetch regressions unless every case is escalated.

Evidence: L01/L02 already implement much of O4. E01/E03 distinguish cost from usefulness. **R2:** criteria themselves can mandate bad tests, so removing such a test may require revising the criterion, not just allowing a reviewer to ignore it. Lack of a past production incident is not proof a reachable security/data-loss/concurrency outcome is imaginary. Don't introduce coverage percentages, test-count targets or fixed scorecards.

### Q3. Who selects what runs per leaf, and who owns full-suite red?

Practitioner question: If a leaf runs only affected tests, where does the complete release proof run, who handles a real baseline regression, and how are affected consumers included?

**Recommended next destination: existing framework-test-scope chart**, with its leaf-gate, test-selection and release-gate forks. E01 is a current primary team case for selection. Pi-extensions duplicate test/test_changed commands are a separate registered destination if the operator includes it. Akrogon's Bun speed work belongs to akrogon-slow-phases. **R3:** running only tests whose files changed misses consumers, whereas repeatedly running every configured alias may repeat the same suite multiple times. Selection should follow behavior/dependencies, not arbitrary exact output format or file extension.

### Q4. What authorizes a fixture or golden update?

Practitioner question: Is this a faithful sample of a real interface/approved behavior, or did we simplify the scenario or regenerate expectations until the new code passed?

**Recommended:** apply Q1 to fixtures, mock outputs and recorders. Real producer schema outputs can justify fixture mechanics. Semantic goldens require an independent behavior check before re-recording. Do not use the candidate renderer as the sole expected-output source. T05's peer narrowing, T01's synthetic citation padding and T08/T10's stale assignments are the concrete cases to examine. **R4:** “only fixture changes” can remove real coverage, while forbidding every synthetic input would prevent legitimate invariant tests. A traceable realistic path, rather than a literal production copy, is sufficient under the existing Fix bar.

### Q5. Which obstructing checks/criteria should the operator revise?

Practitioner question: Is a failed run detecting a current defect, a known baseline problem, an invalid fixture assumption, an incomplete run or a prerequisite outside the leaf?

**Recommended:** keep those diagnoses separate. B01 is already fixed, B02 is already downgraded under realistic-fix-bar, B04/base-run disposition already has operator choices, and B10 has real owning-leaf defects. Do not reopen settled rules merely because they all surfaced during tests. Remaining explicitly poor configured checks/criteria need an owner and concrete replacement proof before being removed. **R5:** relabeling all blockers as worthless tests hides deployment/integration bugs and allows a green but untested outcome. The converse, allowing every old bad check to stop unrelated work indefinitely, defeats the operator's intent.

## Proposed territory split and order

**D1, recommendation only:** settle expected-behavior change authority in the akrogon workflow destination, covering worker, reviewer repair and merge. Any chosen harness enforcement belongs to the actual harness destination(s), with scope based on the operator choice, not a new Pi-only feature assumed here.

**D2, recommendation only:** use existing framework-test-scope for affected-test execution and release ownership. That decision can proceed independently of D1. Pi-extensions repeated full-directory test commands are an independent repository scope if selected. Shared files alone do not impose an ordering dependency.

**D3, recommendation only:** reuse the existing realistic-fix-bar and test-runs locks for test value and baseline failures. New work should target demonstrated gaps, such as trusted expectation changes and golden provenance, rather than duplicating already delivered minimal-test prose. No leaf design or repository write is authorized by this map.

## Evidence appendix

Absolute report paths and session mutation locations follow. Session line numbers refer to JSONL physical lines. They are evidence pointers, not numbers of independent incidents. Conflict attempts inside an otherwise qualifying session are listed where observed, but do not increase the count. Generated fixture trees are recoverable with `git show --format= --name-only <commit>` for the listed commits. The explicit lists focus on test source/helper/expectation mutations, not hundreds of rendered asset outputs.

### Resolved report path registry

- `emdash-kit`: `/home/ivan/Work/infra/tamdoma/framework/issues/open/emdash-cms/emdash-build/emdash-kit/review-B.md`.
- `emdash-conversion`: `/home/ivan/Work/infra/tamdoma/framework/issues/open/emdash-cms/emdash-build/emdash-conversion/implementation/report.md`.
- `concurrent-suite`: `/home/ivan/Work/infra/akrogon/issues/closed/suite-speed/concurrent-suite/implementation/report.md`.
- `python-migration-requirements`: `/home/ivan/Work/personal/Himne/issues/closed/linux-dev-setup/python-migration-requirements/implementation/report.md`.
- `capture-asset-bytes`: `/home/ivan/Work/infra/tamdoma/framework/issues/open/capture-hang/capture-asset-bytes/implementation/report.md`.

### T01: session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-plan-script--/2026-09-27T00-02-22-464Z_01a0e02b-8080-70fd-b5e0-5f22e88dab65.jsonl`

- `.claude/workspaces/seo/satellite-network/test/fixture-network/phases/negative-suite.ts`. Shell mutation lines 369.
- `.claude/workspaces/seo/satellite-network/test/fixture-network/00-network/pool-observations.json`. Shell mutation lines 401,407,409,415,423.
- `.claude/workspaces/seo/satellite-network/test/run-fixture-network.ts`. Shell mutation lines 429,433.

### T02: session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-satellite-review--/2026-09-27T18-07-34-772Z_01a0e40d-0974-7431-a670-6074d97e2795.jsonl`

- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/satellite-review/.claude/skills/test-audit-satellite-network/test/run-fixtures.ts`. Mutation lines 230, 236.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/satellite-review/.claude/workspaces/seo/satellite-network/test/fixture-network/phases/rendered-pairs-test.ts`. Mutation lines 244, 250, 258.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/satellite-review/.claude/hooks/tests/skill-effort-pins.test.ts`. Mutation lines 266.

### T03: session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-readable-outbound-links--/2026-09-28T19-18-01-199Z_01a0e973-e2ef-72fc-85f5-fb3fa4f45851.jsonl`

- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/readable-outbound-links/.claude/skills/arch-discover-providers/test/build-pools.test.ts`. Mutation lines 161.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/readable-outbound-links/.claude/skills/write-satellite-content/test/content-weaver-contract.test.ts`. Mutation lines 177.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/readable-outbound-links/.claude/skills/write-satellite-content/test/content-batch-negative.test.ts`. Mutation lines 304.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/readable-outbound-links/.claude/skills/write-satellite-content/test/finalize-network.test.ts`. Mutation lines 304.

### T04: session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-one-client-link--/2026-09-28T21-09-06-161Z_01a0e9d9-95f0-721f-a4d1-bbdc32d17b38.jsonl`

- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/one-client-link/.claude/skills/arch-plan-satellite-network/test/network-plan.test.ts`. Mutation lines 143.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/one-client-link/.claude/skills/write-satellite-content/test/assemble-page.test.ts`. Mutation lines 202, 212.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/one-client-link/.claude/skills/write-satellite-content/test/finalize-network.test.ts`. Mutation lines 220, 228, 637.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/one-client-link/.claude/skills/write-satellite-content/test/prepare-briefs.test.ts`. Mutation lines 230.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/one-client-link/.claude/skills/write-satellite-content/test/verify-network.test.ts`. Mutation lines 268, 292, 306, 308, 316, 320, 326, 335, 339, 593, 597, 607, 617.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/one-client-link/.claude/skills/test-audit-satellite-network/test/run-fixtures.ts`. Mutation lines 475, 483, 485, 487.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/one-client-link/.claude/skills/arch-differentiate-satellite-anatomy/test/question-records.test.ts`. Mutation lines 519, 571.

### T05: session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-editorial-identity--/2026-09-28T20-07-14-425Z_01a0e9a0-f2f9-764d-af8a-9e843e22a5cb.jsonl`

- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/editorial-identity/.claude/skills/write-satellite-content/test/content-weaver-contract.test.ts`. Mutation lines 165, 272, 279.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/editorial-identity/.claude/skills/arch-plan-satellite-network/test/network-plan.test.ts`. Mutation lines 341.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/editorial-identity/.claude/skills/arch-define-entity/test/editorial-identity-e2e.fixtures.ts`. Mutation lines 361, 365, 389, 401, 405, 411, 415, 417, 423, 427, 474.

### T06: session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-operator-photos--/2026-09-28T20-41-08-789Z_01a0e9bf-fdb4-741a-9cf9-51746009639c.jsonl`

- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/operator-photos/.claude/skills/test-audit-satellite-network/test/fixtures/cross-leaf-enum-inventory.json`. Mutation lines 254.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/operator-photos/.claude/skills/dev-render-satellite/test/run-render-sites.test.ts`. Mutation lines 434, 646, 1020.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/operator-photos/.claude/skills/dev-render-satellite/test/render-fixture-run.ts`. Mutation lines 624, 720.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/operator-photos/.claude/workspaces/seo/satellite-network/test/fixture-network/tools/record-model-artifacts.ts`. Mutation lines 892, 898.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/operator-photos/.claude/skills/dev-render-satellite/test/record-expectations.ts`. Mutation lines 930.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/operator-photos/.claude/skills/dev-render-satellite/test/photo-gate.test.ts`. Mutation lines 958.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/operator-photos/.claude/skills/dev-render-satellite/test/site-dist-client-link.test.ts`. Mutation lines 1108.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/operator-photos/.claude/skills/dev-render-satellite/test/photo-fixtures.ts`. Mutation lines 1170, 1218.

### T07: session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-variant-geometry--/2026-09-28T22-14-32-754Z_01a0ea15-8032-77ab-9757-8b59adb75ce3.jsonl`

- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/variant-geometry/.claude/skills/dev-render-satellite/test/render-fixture-run.ts`. Mutation lines 150, 244, 250.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/variant-geometry/.claude/skills/test-audit-satellite-network/test/fixtures/cross-leaf-enum-inventory.json`. Mutation lines 176, 262, 268.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/variant-geometry/.claude/skills/dev-render-satellite/test/render-frozen-tight-list.test.ts`. Mutation lines 210.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/variant-geometry/.claude/skills/dev-render-satellite/test/variant-assignment.test.ts`. Mutation lines 246.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/variant-geometry/.claude/skills/dev-render-satellite/test/record-expectations.ts`. Mutation lines 302, 310, 316.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/variant-geometry/.claude/workspaces/seo/satellite-network/test/fixture-network/tools/record-model-artifacts.ts`. Mutation lines 398, 400, 430, 466, 474, 478.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/variant-geometry/.claude/workspaces/seo/satellite-network/test/run-fixture-network.ts`. Mutation lines 434, 438.

### T08: session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-contact-page--/2026-09-29T00-52-39-514Z_01a0eaa6-41da-77a7-862c-26e898b8cb82.jsonl`

- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/arch-define-entity/test/editorial-identity-e2e.fixtures.ts`. Mutation lines 779, 899.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/dev-render-satellite/test/contact-page-e2e.fixtures.ts`. Mutation lines 783, 895.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/dev-render-satellite/test/contact-page-e2e.test.ts`. Mutation lines 881, 1661.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/arch-define-entity/test/editorial-identity-e2e.test.ts`. Mutation lines 907.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/dev-render-satellite/test/photo-gate.test.ts`. Mutation lines 1050, 1058.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/dev-render-satellite/test/run-render-sites.test.ts`. Mutation lines 1072, 1301.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/dev-render-satellite/test/variant-geometry.test.ts`. Mutation lines 1100, 1232, 1301.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/dev-render-satellite/test/photo-emission.test.ts`. Mutation lines 1130, 1679.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/arch-plan-satellite-network/test/slot-planner.test.ts`. Mutation lines 1156.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/dev-render-satellite/test/site-dist-client-link.test.ts`. Mutation lines 1172, 1180, 1691, 1695.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/dev-render-satellite/test/render-page.test.ts`. Mutation lines 1276.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/write-satellite-content/test/readable-outbound-links-e2e.test.ts`. Mutation lines 1293.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/dev-render-satellite/test/chrome-copy-e2e-run.ts`. Mutation lines 1366, 1368, 1783, 1799, 1803.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/workspaces/seo/satellite-network/test/fixture-network/phases/rendered-pairs-test.ts`. Mutation lines 1603.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/contact-page/.claude/skills/dev-render-satellite/test/fixture-ctx.ts`. Mutation lines 1761, 1763.

### T09: session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-chrome-copy--/2026-09-29T00-05-34-598Z_01a0ea7b-2706-7402-b332-a447caa2b83a.jsonl`

- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/chrome-copy/.claude/skills/dev-render-satellite/test/variant-geometry.test.ts`. Mutation lines 425.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/chrome-copy/.claude/skills/write-satellite-content/test/verify-network.test.ts`. Mutation lines 516, 520.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/chrome-copy/.claude/skills/dev-render-satellite/test/run-render-sites.test.ts`. Mutation lines 538.
- `/home/ivan/Work/infra/tamdoma/framework/issues/worktrees/chrome-copy/.claude/skills/dev-render-satellite/test/chrome-copy-e2e-run.ts`. Mutation lines 606.

### T10: session `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-tamdoma-framework-issues-worktrees-site-nav--/2026-09-29T05-56-52-083Z_01a0ebbc-c4f2-7003-a545-709e46e31ada.jsonl`

- `.claude/skills/dev-render-satellite/test/render-page.test.ts`. Mutation lines 200.
- `.claude/skills/dev-render-satellite/test/photo-emission.test.ts`. Mutation lines 310.
- `.claude/skills/dev-render-satellite/test/fixtures/no-photos-page.html`. Regeneration line 298.
- `.claude/skills/dev-render-satellite/test/fixtures/renderer-expectations/1.0.0.json`. Historical merge commits and record calls 317,321; 1.5.0 is leaf release expectation.
- `.claude/skills/dev-render-satellite/test/fixtures/renderer-expectations/1.0.1.json`. Historical merge commits and record calls 317,321; 1.5.0 is leaf release expectation.
- `.claude/skills/dev-render-satellite/test/fixtures/renderer-expectations/1.1.0.json`. Historical merge commits and record calls 317,321; 1.5.0 is leaf release expectation.
- `.claude/skills/dev-render-satellite/test/fixtures/renderer-expectations/1.1.1.json`. Historical merge commits and record calls 317,321; 1.5.0 is leaf release expectation.
- `.claude/skills/dev-render-satellite/test/fixtures/renderer-expectations/1.2.0.json`. Historical merge commits and record calls 317,321; 1.5.0 is leaf release expectation.
- `.claude/skills/dev-render-satellite/test/fixtures/renderer-expectations/1.3.0.json`. Historical merge commits and record calls 317,321; 1.5.0 is leaf release expectation.
- `.claude/skills/dev-render-satellite/test/fixtures/renderer-expectations/1.4.0.json`. Historical merge commits and record calls 317,321; 1.5.0 is leaf release expectation.
- `.claude/skills/dev-render-satellite/test/fixtures/renderer-expectations/1.5.0.json`. Historical merge commits and record calls 317,321; 1.5.0 is leaf release expectation.

### T11: session `/home/ivan/.codex/sessions/2026/10/01/rollout-2026-10-01T16-21-27-01a0f7d7-7579-7aa1-ab6d-9337a38d254b.jsonl`

Mutation lines 2504, 2528, 2575. Test paths and semantic changes are in the count table.

### T12: session `/home/ivan/.codex/sessions/2026/10/02/rollout-2026-10-02T19-20-40-01a0fda1-e35b-7312-9912-abb754354aac.jsonl`

Mutation lines 105, 113, 138. Test paths and semantic changes are in the count table.

### T13: session `/home/ivan/.codex/sessions/2026/10/02/rollout-2026-10-02T19-26-36-01a0fda7-5282-7372-92a7-f36b4200d985.jsonl`

Mutation lines 96. Test paths and semantic changes are in the count table.

### T14: session `/home/ivan/.codex/sessions/2026/10/02/rollout-2026-10-02T19-27-54-01a0fda8-84d2-7312-8976-8a891ef67200.jsonl`

Mutation lines 87. Test paths and semantic changes are in the count table.

### T15: session `/home/ivan/.codex/sessions/2026/10/02/rollout-2026-10-02T22-24-17-01a0fe4a-0105-71c3-8a95-eab6bbb2ed02.jsonl`

Mutation lines 218. Test paths and semantic changes are in the count table.

### T16: session `/home/ivan/.codex/sessions/2026/10/02/rollout-2026-10-02T22-46-37-01a0fe5e-710c-7632-b452-781127032068.jsonl`

Mutation lines 126, 177. Test paths and semantic changes are in the count table.

### Remaining limits

This map is independent of A. It provides identified cases and causal counterexamples, not a full frequency estimate of test dishonesty or an audited origin for every old assertion. The thread sample is incomplete, practitioner profiles are self-described, the two academic findings have limited transfer to production, and the strongest corruption-control experiment is small. No exact-source or evidence limitation was converted into an accusation, universal policy or completed handoff.
