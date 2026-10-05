# related-search, merged round

Slots: A (door), B (codex), C (claude fable 5-1). Tags name the slots that independently reached each point.

This round settles how a new report finds and links earlier reports that may share its cause, what happens when that lookup fails, and where the links go. Root-report and chart-grouping both act on these links. (A,B,C)

Probes, read-only, gh 2.102.0, account ivanjuras, Tamdoma/tamdoma-framework (private), 2026-10-05:
- `gh issue list -R <repo> --state all --author @me --search "created:>=2026-10-05"` returned exactly #124-#128. (A,C)
- Keyword searches find only reports sharing words: "advance-phase" gave #124, #125, #128; "motion coverage" gave #126, #128 (C); "mockups" gave nine incl. closed #27, #33 (B); "mockup variant" gave #123-#128 plus #84 (A).
- Sentence-length queries returned `[]` in lexical, hybrid and semantic modes. Semantic adds nothing here. (A,C)
- `gh search issues --state` takes only open or closed; `gh issue list --state all` covers both, default limit 30. (A,B)
- An unreadable repo exits 1 with "Could not resolve to a Repository"; no matches exits 0 with `[]`. (C)
Limits: one repo, one account, one harness, one day. Not proof of recall on large repos or under rate limits. (A,B,C)

### 1 · Which earlier reports does filing look at?

Research: operator · INTAKE.md:36 · "check for and link issues from the same session or the same repo" · cross-repo not asked for. (C) practitioner · Tatham (check known bugs) and Google SRE Effective Troubleshooting (correlation is not causation), read 2026-10-05 · read candidates before linking. (B) practitioner · Google SRE Postmortem Culture · one cause record covers many incidents. (C)

- **1a (recommended, A,C; B agrees on keyword search open+closed and supplied links)** Two read-only calls on the routed repo before posting: the filing account's recent reports (author and date), and one short keyword search (2-3 words: the file, command or component this failure names), open and closed, small limit. Read any issue link the reporter supplies, including in another repo, without searching other repos. (supplied links per B) List only reports the agent can tie to this one, each with a short reason. Wins because the author call finds the session set even when each report's own words differ ("advance-phase" missed #126, #127; "motion coverage" missed #124, #125, #127), and the keyword call finds older reports by others. Cost: two calls, closed matches add reading. (reason and account wording per B rebuttal)
- **1b** Same, open only. Less noise (9 open vs 117 closed). Cost: misses "already fixed" reports, which matter because consumer repos run installed copies that can predate a fix, and the mirror never shows closed reports to the door (`src/pull.ts:57`). (B,C)
- **1c** Author call only. Cost: never finds someone else's older report on the same file. (A,B,C)
- **1d** Search other repos too. Cost: no bounded list of repos, and private titles can leak. Cross-repo search stays with the door. (A,B,C; :22 citation dropped per B rebuttal, it governs posting targets only)

Pitfalls avoided: a noisy list is removed by the reason requirement and the limit. (A,B,C) A shared word becoming a duplicate decision is removed by reading candidates and stating each tie; nothing is marked, commented or closed. (B,C) Done-criteria: an unrelated keyword match is not linked, a closed precedent is linked as evidence not open work. (B)

### 2 · What happens if the lookup fails?

Research: better-than-training · `skills/seed-issue/SKILL.md:28,59-61` · thin intake never blocks; creation errors stay visible, no blind retry of creation. (B,C) better-than-training · exit codes above · failed and empty are distinguishable. (C) No practitioner source found. (A,C)

- **2a (recommended; file-anyway A,B,C, retry B with A, C not opposed)** Retry the failed read once with a visible warning, then file anyway, writing "search failed" with the command and error in the report and in the final outcome. Wins because the observation is not lost and nobody reads the failure as "nothing related". Cost: links may be missing, and a retry cannot fix a permanent error such as a missing permission (C). This is a continue-after-error path, which the operator's coding rules allow only when requested. (retry per B)
- **2b** Stop and file nothing. Cost: one failed side read loses the whole observation, against `:28`. (A,B,C)
- **2c** File and say nothing. Cost: the door reads silence as "searched, none found". (C)

Pitfalls avoided: three distinct outcomes in the line (found, none found, failed with error), with a done-criterion that a filing whose search fails still posts and states the failure. (A,B,C) Creation is never retried blindly. (B)

### 3 · How do earlier session reports survive compaction?

After compaction the skill re-reads itself and the reporter's supplied context (`:6`) and keeps no local files (`:59`). Earlier URLs lived only in the conversation. (A,B,C)

- **3a (recommended, A,C)** Do not remember. Rebuild the list from GitHub on every filing with the author-and-date call from 1a, window the last two days to cover midnight. Links still in context are used too, needing no rule. Wins because it works after compaction on every harness with no stored state and costs nothing beyond 1a. Cost: also returns the same account's other sessions, and misses reports filed under another account.
- **3b (recommended, B)** Add an instruction to keep created URLs in session context and its compaction summary, plus the search; say so when history is missing. Cost: a rule sentence, and harness-dependent.
- **3c** A local list of filed URLs. Cost: breaks "without persistent local staging" (`:59`). (B,C)

Pitfalls avoided: done-criterion that a filing in a fresh session still lists the reporter's earlier same-day reports. (C) Other-session results are candidates judged by reason, not automatic links. (A,C)

### 4 · Where do the links go?

#125-#128 put "Related:" at the end of Expected behavior. The cause-section lock fixes six sections. Links must live in the body to reach the door (`src/pull.ts:67`), and the door matches identities as `owner/repo#n` (`skills/chart-issues/assets/shapes.md:62`). (A,C)

- **4a (recommended, A,C)** A fifth placeholder line in `## Suspected cause`: related reports as `owner/repo#n` (open or closed, shared file or condition), or "none found", or "search failed" with the error, and in every case the repo, query, states and limit searched. (scope on every outcome per B rebuttal) Wins because it keeps the six-section lock and sits next to the cause it supports. Cost: a report related for a non-cause reason sits under a cause heading, and every link adds a visible cross-referenced event on the linked issue (C read three on #124's timeline). A wrong link's backlink is removed only by editing the new body. (per C rebuttal)
- **4b** A seventh section `## Related reports`. Cost: reopens the six-section lock. (C)

Pitfalls avoided: done-criterion that a filed report's links appear unchanged in its `issues/seeds/` mirror after `akrogon pull`. (C) No comment, label or state change is written to linked issues. (A,C)

Reply `1a 2a 3a 4a`, or a numbered free-text answer.

Challenge check
- The author-and-date call rests on one probe with one account. (C)
- "Only reports the agent can tie" is a judgment; tests cover two cases. (C)
- Closed reports (1a) rest on the installed-copy argument, not a measured case. (C)
- The limit (gh default 30; C prefers smaller), the two-day window and keyword choice are product choices; if they need rule sentences, the door recounts C1. (B,C)
- B holds 3b: a two-day window and a limit can miss reports that context still holds. C holds 3a: the harness, not the skill, writes the compaction summary, and 3b spends a rule sentence. A sides with C, since context links are already used under 3a.
