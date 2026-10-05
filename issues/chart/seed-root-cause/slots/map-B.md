# Opening territory map B

Independent opening map. No other peer map read. Recommendations below are proposals, not operator decisions. Repository references are relative to `/home/ivan/Work/infra/akrogon`.

## Sources and present mechanism

- S1 [operator]: prompt-B.md, Intake: seed-issue should try to discover the root so consumer repos can fix it. Mirrored report `issues/seeds/56-seed-issue-files-symptoms-only-intake.md:9-26` describes four symptoms followed by a fifth systemic report. That is supplied evidence from one session, not independent proof that all four share one cause.
- S2 [better-than-training]: `skills/seed-issue/SKILL.md:10-28,59-61` promises standalone use with only authenticated gh, limits inspection to nearby context, explicitly forbids diagnosis, accepts thin intake and creates one report. Routing uses the consumer root's issues_repo, otherwise origin (`:14-22`). This is an explicit contract restriction, not merely a missing prompt to think harder.
- S3 [better-than-training]: `skills/chart-issues/SKILL.md:27-33,47-51,69` refreshes/imports reports, grounds decisions and confirms matching work with the operator. `skills/chart-issues/assets/shapes.md:41-62,244-246` separates source text from agent findings, deduplicates exact identities and assigns one completion owner. Exact identity dedupe does not discover shared causes.
- S4 [practitioner]: Simon Tatham, [How to Report Bugs Effectively](https://www.chiark.greenend.org.uk/~sgtatham/bugs.html), sections “Show me” and Summary: diagnosis may help, but preserve symptoms and distinguish factual observations from deductions.
- S5 [practitioner]: Chris Jones, Google SRE, [Effective Troubleshooting](https://sre.google/sre-book/effective-troubleshooting/), Theory/Common Pitfalls/Problem Report: test hypotheses against confirming and disconfirming evidence, beware coincidental correlation, and retain actionable reports. This supports investigation, not guaranteed diagnosis at intake.
- S6 [practitioner]: Google SRE, [Postmortem Culture](https://sre.google/workbook/postmortem-culture/), Data-driven conclusions/Depth/Repeating incidents: link conclusion evidence, investigate system flaws and bring collaborators from similar incidents together. Applied here as a design principle, not a requirement to turn every seed into an incident postmortem.
- S7 [better-than-training]: [gh issue list](https://cli.github.com/manual/gh_issue_list) supports explicit repository, search, state, limit and JSON fields. [GitHub duplicate documentation](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/marking-issues-or-pull-requests-as-a-duplicate) describes a separate duplicate-marking action. Tool support does not establish that two reports are duplicates.

## Material forks, questions and lifetime pitfalls

### F1: Where discovery belongs

**O1: filing only.** Captures the session's evidence while available, including the sibling symptoms in S1. It can delay thin intake and bake an early mistaken cause into every downstream report (S2, S4-S5).

**O2: chart import only.** Keeps the current low-floor contract and operator-grounded investigation (S2-S3). It leaves standalone consumers dependent on a later Akrogon door and does not satisfy the operator's stated filing-time intent (S1; chart needs installed akrogon, `skills/chart-issues/SKILL.md:10`).

**O3: both, with different responsibilities.** Seed makes a bounded attempt and records hypotheses/evidence. Chart rechecks them against live surfaces before fixing scope. Recommended: it preserves session context without granting a hypothesis authority (S1-S5). Repeating the same diagnosis uncritically at import would defeat that separation.

**Q1:** What concrete stopping condition ends the seed's investigation when evidence remains inconclusive? Nearby inspection only, a traced causal path, or a reproduction? Choose this before specifying report sections. S2 currently permits nearby context and missing details, while S5 distinguishes a report from tested diagnosis.

### F2: How the body carries uncertainty

**O4: always include “Suspected root cause.”** Makes the attempted investigation visible, allowing “undetermined” plus the evidence gap. Risk: pressure to fill the field with a plausible story (S2, S5).

**O5: include it only when supported.** Avoids invented content, but an absent section cannot distinguish no evidence from no attempt (inference from S2's current five-section contract).

Recommended shape: preserve the five observation sections and put reporter-supplied and agent-inferred causes in a separately labeled section, attributing each, citing inspected evidence, recording contrary evidence and the next distinguishing check. Permit no supported hypothesis. Do not mix a proposed remedy into Observation or promote suspected causes into binding chart decisions (S4-S5; S3's source/findings separation).

**Q2:** Is a cause merely suspected, directly demonstrated, or still unknown? What observation would disprove it? A single required “root” can hide several contributing failures, so do not force all symptoms into one explanation (S5-S6).

### F3: What related-work discovery searches

**O6: session only.** Lowest extra dependency and directly addresses S1, but misses earlier reports and cannot depend on another harness's history store (S2).

**O7: session plus the routed repository's open issues.** Recommended default candidate scope using gh (S2, S7). Link exact URLs/identities with the shared mechanism or surface and uncertainty. A search limit or keyword miss means coverage is incomplete, not that no related issue exists. Open-only search also misses closed precedent (S7 supports separate state/search choices).

**O8: cross-repo discovery.** Follow supplied companion references or a demonstrated shared dependency. Unbounded organization searches invite unrelated matches and inaccessible repositories. Do not infer duplicate status from similar titles or automatically post companion issues (S5; S2's one-report boundary).

**Q3:** Does “same repo” mean consumer origin or configured issues_repo when they differ? S2 routes reports to the latter. Search scope must name that distinction. What happens when reading issues fails but creation remains possible? Explicitly record incomplete discovery or stop according to a chosen policy, never silently claim no matches (S2:61).

Related reports are not automatically duplicates or completion-owned sources. Leave grouping, partial matches and closure to grounded chart decisions unless the operator explicitly changes that boundary (S3, S7).

### F4: Portability and downstream preservation

Do not restore the old cluster script as a requirement. At `507aff5^`, `skills/seed-issue/SKILL.md:65-75` depended on an initialized repo and a sibling cluster script, silently skipping failures. Its portability rule (`:44`) and optional Recommended Direction (`:103-113`) did not supply mandatory causal investigation. Current S2 requires no installation or sibling lifecycle machinery.

The existing mirror accepts the body as text and preserves it (`src/pull.ts:8-13,63-75`), so a labeled section need not imply a new pull schema. Editing mirrored seeds would be lost on refresh. Also, pull reads origin (`:43-57`), while seed may route elsewhere (S2): diagnose the selected destination's intake, not a potentially unrelated local mirror. Whether to change that routing is a separate scope decision, not an automatic addition here.

**Q4:** Is success a grounded investigation attempt available to every standalone consumer, or a proven systemic fix? S2 authorizes filing, not fixing. Use acceptance cases for a supported cause, no supported cause, unrelated symptoms and inaccessible related-work search. Check function rather than exact phrasing (`learnings/LESSONS.md:21`).

Keep downstream descriptions consistent if the seed contract changes: `docs/guide/create.md:84-103` currently defers investigation to chart, `docs/guide/learn.md:18-46` keeps lessons and new work separate, and `docs/guide/parts.md:18,77` defines seeds as unverified and commands as mechanical. `/learn-issues` emits mechanism/case seeds without a fix (`skills/learn-issues/SKILL.md:18-29`), so evidence already present there should survive intake. Historical lessons remain observations, not universal diagnoses (`learnings/LESSONS.md:3,15,18`).

Resolve F1 first. It determines the investigation stopping rule, the body contract and how much related-work search filing can reasonably own.
