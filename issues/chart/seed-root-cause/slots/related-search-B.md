This round settles where filing looks for related reports, what happens when that lookup fails, and how earlier links survive compaction. The locked cause section stays separate from observations. Search finds possible connections, while charting verifies causes and decides grouping.

### 1 · Should filing search only open reports, or include closed reports and known cross-repo links?

The consumer and filing repo can differ (`skills/seed-issue/SKILL.md:14-20`): Stopsol filed its failures to tamdoma-framework. A read-only search for `mockups` there returned #124–#128, other open reports and two closed reports. A matching word is not enough to link them as one problem.

Research: operator · `INTAKE.md`, #56 Expected behavior, and `forks/discovery-role.md`, Taken, read 2026-10-05 · Filing must look for related reports without treating them as verified causes · This favors session links plus a scoped repository search. Practitioner · Simon Tatham, software maintainer, [How to Report Bugs Effectively](https://www.chiark.greenend.org.uk/~sgtatham/bugs.html), known-bugs guidance, and Chris Jones, Google SRE, [Effective Troubleshooting](https://sre.google/sre-book/effective-troubleshooting/), Common Pitfalls, read 2026-10-05 · Check existing reports, but do not mistake correlation for causation · This requires reading candidate evidence before explaining a connection. Better-than-training · local `gh issue list --help` and `gh search issues --help`, read 2026-10-05 · List defaults to open and 30 results, supports explicit repo, all states, search and JSON · This makes the search boundary explicit.

- **1a (recommended)** Use available session links and one focused search of the routed repo, including open and closed issues. Follow explicitly supplied cross-repo issue links, but do not search other repos. Read candidate bodies and link only supported connections. This finds active work and older precedent without an organization-wide search. Cost: some closed matches add reading.
- **1b** Use session links and search only open issues in the routed repo. Follow the same supplied cross-repo links. This favors current work, but misses closed fixes and older evidence.
- **1c** Use available session links only. This is fastest, but misses earlier reports from other sessions.

For 1a and 1b, use one query based on the named surface or mechanism, with at most 30 returned candidates. Put full URLs, each connection and its uncertainty in the issue body, along with the repo, query, states and limit searched. A closed precedent is evidence, not unfinished work. Zero results means no matches for that query, not no related issues anywhere.

Pitfalls avoided: Scoped search prevents backlog-wide exploration, and explaining each connection prevents keyword matches from becoming duplicate decisions. Done-criteria cover an unrelated keyword match, a closed precedent and a supplied cross-repo link, without filing, commenting on or closing another issue.

Read-only proof, 2026-10-05: local authenticated gh 2.102.0 ran `gh issue list -R Tamdoma/tamdoma-framework --state all --search 'mockups' --limit 30 --json number,title,state,url` successfully. It returned nine reports, including #124–#128 and closed #27 and #33. `gh issue view 128 -R Tamdoma/tamdoma-framework --json number,body,url` confirmed its links to #124–#127 and its distinct contributing problems. No cleanup was needed. This proves command support and readable case evidence, not complete coverage or shared causation.

### 2 · If the related search still fails, should filing continue or stop?

Missing reproduction details already do not block filing (`skills/seed-issue/SKILL.md:28`). A failed search is different from a successful search with no matches. The report must preserve that difference instead of saying there are no related issues.

Research: operator · #56 in `INTAKE.md` and discovery-role Taken, read 2026-10-05 · The task is an investigation attempt followed by a hypothesis or evidence gap · This supports continuing with a visible lookup gap. Practitioner · Tatham, [How to Report Bugs Effectively](https://www.chiark.greenend.org.uk/~sgtatham/bugs.html), Introduction, read 2026-10-05 · Preserve facts without inventing missing information · This favors an explicit failure over invented coverage. Better-than-training · `skills/seed-issue/SKILL.md:59-61`, read 2026-10-05 · Creation errors must remain visible, and ambiguous creation must not be blindly retried · This keeps read-retry policy separate from posting.

- **2a (recommended)** Retry a failed read once with a visible warning, then file if routing and creation remain available. Include the failed command, repo, exit status and useful error context in the report and final outcome. Keep known session links. This preserves intake without pretending the lookup succeeded. Cost: related work may remain undiscovered.
- **2b** After the same bounded read retry, stop before posting and expose the last error with full context. This guarantees filing never proceeds with a failed required lookup, but a search outage blocks otherwise useful intake.

Pitfalls avoided: A failed read never becomes “no related issues,” and neither option changes targets or retries an ambiguous creation. Done-criteria distinguish empty results, failed lookup and failed creation. The failure case is a behavior criterion, not a claim proved by the successful read above.

### 3 · How should earlier issue links survive compaction without a local tracker?

The skill re-reads supplied context after compaction (`skills/seed-issue/SKILL.md:6`) and creates no persistent local staging (`:59`). #128 already stores its related links in the body, which `src/pull.ts:67` preserves. The body survives the filing session, but it does not prove which later report came from that session.

Research: operator · related-search Question 3 and the standalone locks, read 2026-10-05 · Earlier session links must remain usable without new installed machinery · This rules out a new local database. Better-than-training · `skills/seed-issue/SKILL.md:6,59-61`, `src/pull.ts:57,67`, and [#128](https://github.com/Tamdoma/tamdoma-framework/issues/128), read 2026-10-05 · Successful URLs are returned, linked bodies persist on GitHub, and pull mirrors only open issues · This supports context retention plus repository lookup, without promising perfect session recovery.

- **3a (recommended)** Keep actual created URLs in existing session context and its compaction summary when available, and put relevant earlier links in each new report body. After compaction, use retained links and the scoped search. If session history is missing, say so. This uses existing storage. Cost: exact session membership cannot always be recovered across harnesses.
- **3b** Make no special context-retention instruction. Use reporter-supplied links and repository search after compaction. This uses fewer rules, but can lose the session connection even when the harness could have retained it.

Pitfalls avoided: Both options avoid new files and invented session history. Done-criteria cover retained URLs and missing context, with no claim that all same-session reports were recovered. Closed reports remain reachable through gh even though pull omits them.

Reply `1a 2a 3a`, or a numbered free-text answer.

Challenge check

The 30-result bound is a product choice, not practitioner consensus. It limits cost and can miss relevant reports, so search scope stays visible. Closed reports can improve diagnosis without belonging to current completion ownership. Existing context summaries are harness-dependent, so 3a cannot guarantee session recovery. Implement these choices through compact search, failure and retention instructions, reusing the cause section for evidence limits. Count every instruction by function against C1, including template placeholders. No new tracker, script or dependency is proposed, leaving rule budget for the remaining forks. No other slot's round was read.
