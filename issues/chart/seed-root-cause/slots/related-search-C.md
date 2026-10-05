# Related search: slot C round (blind)

This round settles how a new report finds and links older reports about the same problem. It comes now because the next two forks (root-report and chart-grouping) both use these links. All `gh` calls below were read-only, run on 2026-10-05 with gh 2.102.0 against Tamdoma/tamdoma-framework. Paths are relative to `/home/ivan/Work/infra/akrogon`.

Budget: about 5 rule sentences remain for the whole chart. This round's recommendations cost one rule sentence, one command block and one template line.

### 1 · Which older reports does filing look for?

Example: the agent is filing #127 (photo paths). It should notice #124, #125 and #126 from the same morning. Today it looks for nothing (`skills/seed-issue/SKILL.md:59`). I tried the searches an agent would run. A keyword search does not find the set: "advance-phase" returned #124, #125 and #128, and "motion coverage" returned only #126 and #128. One call by author and date found all five: `gh issue list -R Tamdoma/tamdoma-framework --state all --author @me --search "created:>=2026-10-05"`.

Research: operator · `INTAKE.md:36`, read 2026-10-05 · the report asks to "check for and link issues from the same session or the same repo" · both sources are in scope, cross-repo is not asked for. practitioner · Google SRE book, "Postmortem Culture", https://sre.google/sre-book/postmortem-culture/, read 2026-10-05 · one cause record covers many incidents · the links are what lets a later pass see the set. better-than-training · `gh issue list --help` (flags `-R`, `--state {open|closed|all}`, `--author`, `--search`, `--json`, `--limit`) and the four calls above · author plus date finds a session's reports, keywords find only reports that share words · it made the author query the main mechanism and the keyword search the extra. better-than-training · `gh search issues --search-type semantic` with a cause-level phrase returned nothing on this repo · meaning-based search is not usable here.

- **1a (recommended)** Two read-only calls on the routed repo before posting. First, the reporter's own recent reports (author and date). Second, one keyword search using the file or command the failure names, open and closed, small limit. The agent lists only the ones it can tie to this report in a few words. Other repos are left to the chart door, which already compares them (`skills/chart-issues/SKILL.md:69`). It wins because the first call finds the #124 to #128 set, which no keyword did. Cost: two calls, and closed reports add some noise.
- **1b** Same as 1a, open reports only. Less noise: the repo has 9 open and 117 closed. Cost: it misses "already fixed" matches. Those matter because consumer repos run installed copies that can be older than the fix, and the mirror never shows closed reports to the door (`src/pull.ts:57`).
- **1c** The reporter's own recent reports only, no keyword search. One call. Cost: it never finds an older report from someone else about the same file.
- **1d** Also search other repos named in the cause section. Cost: the skill has no list of repos, and `skills/seed-issue/SKILL.md:22` forbids consulting other targets.

Pitfalls avoided: A noisy list that readers skip is removed by listing only reports the agent can tie to this one, each with its reason, under a small limit. Unrelated same-day reports being linked is removed by the same reason requirement, with the cause-section lock's done-criterion for unrelated symptoms from one session. Marking duplicates or closing at filing is removed by the calls being read-only and the links being plain text in the body.

### 2 · What happens when the search fails?

Example: the token cannot read issues, or the network drops. A call on a repo I cannot see exited 1 with "Could not resolve to a Repository". The skill must not block thin intake (`skills/seed-issue/SKILL.md:28`), and the cause-section lock says a gap must be stated, never hidden.

Research: operator · `forks/cause-section.md` Taken, read 2026-10-05 · "Bare 'Not provided' never replaces the gap" · a failed search must be visible in the report. better-than-training · the failing call above, exit 1 with a clear error on stderr · the agent can tell "failed" from "found nothing", which exits 0 with `[]`. No practitioner source was searched for on this question.

- **2a (recommended)** File anyway. The related line says the search failed and gives the error, so nobody reads it as "nothing related exists". It wins because the report is worth more than the links. Cost: a report may go out without links.
- **2b** Stop and do not file. Cost: one failed read loses the whole observation, against `:28`.
- **2c** File anyway and say nothing. Cost: the door reads silence as "searched, found none".

Pitfalls avoided: "Search failed" being read as "none found" is removed by the three distinct outcomes in the line (found, none found, failed with error), with a done-criterion that a filing with a failing search still posts and states the failure.

### 3 · How do the earlier reports from this session survive compaction?

Example: a long session files four reports, then the conversation is compacted. The four URLs were only in the conversation. After compaction the skill re-reads only itself and the reporter's context (`skills/seed-issue/SKILL.md:6`), and it keeps no local files (`:59`). So the agent forgets them just when they matter most.

Research: better-than-training · the author-and-date call in question 1, which returned #124 to #128 with no session memory at all · the list can be rebuilt from GitHub every time. better-than-training · `skills/seed-issue/SKILL.md:6,59`, read 2026-10-05 · no memory and no local file survive · any fix inside the conversation fails. No practitioner source was searched for on this question.

- **3a (recommended)** Do not remember them. Ask GitHub every time, with the author-and-date call from 1a. It wins because it works after compaction, on every harness, with no stored state, and it costs nothing beyond 1a. Cost: it also returns the same person's recent reports from other sessions, and it misses reports filed under a different account.
- **3b** Keep a local list of filed URLs. Cost: breaks "without persistent local staging" (`:59`) and differs per harness.
- **3c** Add the earlier URLs to the re-read rule in `:6`. Cost: there is nothing to re-read them from, and it spends a rule sentence.

Pitfalls avoided: Lost links after compaction are removed by rebuilding the list from GitHub on every filing, with a done-criterion that a filing in a fresh session still lists the reporter's earlier same-day reports. A session that runs past midnight is covered by a date window of the last two days, not "today".

### 4 · Where do the links go in the report?

Example: #125 to #128 each put "Related: #124" at the end of Expected behavior, a different place than the cause. The cause-section lock fixes six sections. Links must be in the body to reach the chart door (`src/pull.ts:57,67`), and the door matches reports by the form `owner/repo#n` (`skills/chart-issues/assets/shapes.md:62`).

Research: operator · `forks/cause-section.md` Taken · six sections, placeholder lines in the template · a seventh section would reopen that lock. better-than-training · #125 to #128 bodies, read 2026-10-05 · without a fixed place the line lands in Expected behavior · a fixed line is needed. better-than-training · `shapes.md:62` · the door's identity form is `owner/repo#n` · links use that full form, not bare `#n`.

- **4a (recommended)** A fifth placeholder line inside `## Suspected cause`: related reports as `owner/repo#n`, each with open or closed and the shared file or condition, or "none found", or "search failed" with the error. It wins because it keeps the six-section lock and puts the links next to the cause they support. Cost: a report related for a reason other than cause sits under a cause heading.
- **4b** A seventh section, `## Related reports`. Cleaner split. Cost: reopens the six-section lock and adds a heading to every thin report.

Pitfalls avoided: Links landing in Expected behavior are removed by the fixed line. Links the door cannot match are removed by the full `owner/repo#n` form, with a done-criterion that a filed report's links appear unchanged in its `issues/seeds/` mirror after `akrogon pull`.

Reply `1a 2a 3a 4a`, or a numbered free-text answer.

Challenge check
- The author-and-date call is the whole basis for 1a and 3a. I proved it once, on one repo, with my own account. It was not tried with a different reporter account or on a harness other than this one.
- Listing "only reports the agent can tie to this one" is a judgment. A weak agent may list all five or none. The done-criteria test two cases and do not prove the general behavior.
- Closed reports (1a over 1b) are my call from one fact: installed copies can be older than a fix. I have no measured case of a closed match helping. A practitioner who has run large trackers could prefer 1b for the lower noise.
- The exact date window, the limit and the keyword choice are left to the leaf. If they need rule sentences and not just the command block, the cost is more than one sentence, and the door should recount against C1.
- Search calls can be rate-limited by GitHub. I did not measure a limit. Under 2a a rate-limit error is one more "search failed" case.
- Cross-repo links stay with the door. A consumer that never charts gets no cross-repo links at all.
