# Signposts: failure-identity

Original for the door session opened 2026-11-11T21:14:48Z in door t126 (chart failure-identity). Autopilot: the operator answers this round once, A answers every fork after it. Angles merged from slots/signposts-A.md, slots/signposts-B.md and slots/signposts-C.md. From the latest earlier record (issues/chart/factory-wins/forks/signposts.md) three answers carry over as proposed: its 1a (fewer parts first, here inside 1a), its 6a (akrogon only, here 5a) and its 7a (earlier decisions stay binding unless the operator names one, which is why question 2 is asked). Its 5b (one paid run) is not needed here.

Settled by the operator's words, not asked: autopilot, lifecycle route, consultants B (codex) and C (agy), one handed report (#134), nudge the watcher in the w-akrogon tab after handoff.

## Question

1. When the goals pull apart, what ranks first?
   - 1a (recommended, A,B,C) Keep today's landing rules intact first, then a true name over a guessed one (a coarse but certain name such as the failed script beats a detailed name scraped from text that may be wrong), then readable names for the merge owner, then old receipts. Fewer parts breaks ties.
   - 1b Readable names first, because that is the cost seen so far (framework: 13 flips with no name, no fix opened).
   - 1c Block on any doubt: two reds whose exact failure cannot be proven equal never count as the same, even if more leaves stop while main is red.
   - Steers: how deep the name reader goes, what is cut if proof is short, every tie in later forks.

2. On 2026-11-09 (chart known-red-nameless, answer 3a) the operator decided that the command only checks facts and the reviewing agent judges whether head and base failed for the same reason. Does that reopen?
   - 2a (recommended, A,B,C) Narrowly. The command also compares the failure identity it can read as a fact, so a head red in script X is not covered by a base red in script Y. The reviewing agent still reads both logs and judges the cause, and a coarse identity (a script name, a bare hook timeout) never counts as proof by itself (C). No comparing of whole output or exit codes.
   - 2b Keep 3a whole: only reporting gets better names, the known-red compare stays as it is.
   - 2c Reverse #133: a red with no test name is never covered again.
   - Steers: whether `knownRedReceipt` and `newRedUnits` change, the four seat texts, which existing tests change.

3. Where may a failure name come from?
   - 3a (recommended, A,B,C) Only from tool output akrogon can trust in any repo with no setting: Bun's `(fail)` line, Bun's `<script> | Exited with code <n>` line for a failed script, and the check's own name. Never from a repo's free text such as `[FAIL] ...`, because framework prints such a line on purpose in green runs. This keeps the earlier "no new configuration" answer.
   - 3b Also read common free-text patterns (`[FAIL]`, tsc and lint codes), accepting wrong names on planted output.
   - 3c Add an opt-in setting or output marker so a repo can declare its own failure names.
   - Steers: parser size and upkeep across 12 repos, whether config changes, how detailed a `test:remote-image` entry is.

4. What happens to failure names when a repo retires old logs?
   - 4a (recommended, A,C) From now on the run record keeps the names when the run is written, so `akrogon flaky` and notices stay readable after logs are retired. `verify --known-red` still needs both real logs (B). Entries already retired stay `(log gone)`.
   - 4b 4a plus a one-time recovery of framework's 36 old entries from its Git history (B recommends this).
   - 4c Change nothing: names go when the logs go.
   - Steers: the run record's fields, whether any leaf reads or writes another repo's records.

5. Reach.
   - 5a (recommended, A,B,C) akrogon only, one rule for every user of the name: `akrogon flaky`, `verify --known-red` with its four seat texts, red-main notices, and logs written outside `issues/` that still exist on disk (C found these read as `(log gone)` today). Framework's own flaky scripts are recorded for framework, not fixed here.
   - 5b Reporting only: `akrogon flaky`, notices and the stored names; the known-red compare untouched.
   - 5c Also change framework: its scripts, its ledger, or a fix for `test:remote-image`.
   - Steers: destinations, owned files, leaf count.

6. Proof spending.
   - 6a (recommended, A,B,C) No paid calls and no live changes. Local tests on isolated fixtures; framework's real logs and Git history are read only.
   - 6b One live replay in framework, named by the operator first.
   - Steers: needs sheet, proofs, grants.

Reply key: `1a 2a 3a 4a 5a 6a`, or numbered free text.

Challenge check: B stresses that no bad merge was observed; the wrong pass in question 2 is read from the code and a reviewing agent still stands between the command and a landing, so 2b is defensible and cheaper. B's dissent on 4: recover the 36 retired framework entries from local Git history (4b), read-only for framework, so the report is fully answered; A and C keep 4a because those entries are before 2026-10-27 and a recovery path is a part that runs once. C's point on 2: today a bare hook timeout `(unnamed)` already compares equal across different files and the seat text treats it as a real test name, so any new coarse name needs the two-log read or the same gap reopens.

## Taken

A's picks under full autopilot (2026-11-11T21:29:20Z, door t126), not operator words: `1a 2a 3a 4a 5a 6a`. The operator's words that handed the round to A, verbatim: "answer signposts on autopilot as well" and "full autopilot".

Reasons: 1a and 3a follow the operator's values (fewer parts, function over form) and the report's own planted-control trap; 2a is the narrowest change that closes the gap the report reads from the code while keeping the operator's 2026-11-09 division of labor (the seat still judges the cause), and all three slots recommend it; 4a over 4b because a one-time recovery path stays as a part after its single use (B's dissent stands, recorded); 5a keeps factory-wins 6a; 6a needs no grant.

Account: the session keeps today's landing rules, prefers a certain coarse name to a guessed detailed one, lets the command compare identities it can read as facts while the seat still judges the cause, reads names only from tool structure with no new setting, stores names in the run record from now on, and lands in akrogon only with local proofs. It gives up free-text name scraping, a consumer setting, recovery of the 36 retired framework entries, any change in framework, and paid or live proofs.

For the operator: 2a narrows the operator's own 2026-11-09 answer 3a (known-red-nameless). It was A's to pick only because the round was handed to A.

## Needs

none foreseen under the recommended answers (asked with this round, 2026-11-11). No key, login, file, grant, paid approval or operator-decided close. A row appears only with 5c (permission to change framework) or 6b (a named replay).
