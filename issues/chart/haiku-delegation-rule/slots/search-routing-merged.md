# Merged notes: search-routing

Sources: `slots/search-routing-A.md`, `slots/search-routing-B.md`.

## Stocks and flows
- Main context: every inline read stays and is re-sent each later turn; only compaction drains it. (A,B)
- Spend the main model never sees; the only costs it feels are latency and effort. (B; A as "invisible cost")
- Rule salience: fixed text whose share of attention shrinks as context grows. (A)
- Trust in Haiku inside a session: falls on visible misses, never rises, resets each session. (A)
- Operator correction: count, rewrite, once per day or week. (B)
- Model chosen for a hand-off: today the main model per call; after an Explore override, the agent file. (B)

## Loops
- R1 "already here" lock-in (reinforcing): inline read, then the next question is answerable from context, then inline again. (A,B)
- R2 "cheap to me" / invisible cost, visible failure (reinforcing toward self). (A,B)
- R3 silent overspend (reinforcing): if Explore stays on the main model, each forgotten `model: haiku` is an expensive run that looks like success, so nothing corrects it. (B) Mirror case under a blanket Haiku Explore with no escape: hard search returns weak facts, is redone, Explore gets avoided. (A)
- B1 harness damping, wrong setpoint (balancing); fixed by the taken override clause. (A,B)
- B2 double-work fear (balancing); fixed by the taken spot-check line. (A,B)
- B3 slow operator correction (balancing); kept cheap by the taken 7-day recount. (A,B)
- B4 latency in interactive sessions (balancing); weakened by spawning and continuing in parallel. (A,B)

## Design principle
Put the default on the side whose mistake is visible. A thin Haiku return fails the spot-check and gets escalated; an expensive run on an easy search never fails anything. (B; A agrees) Route by job type the model knows before it starts, not by difficulty it cannot know. (A,B)

## Options
1. Explore override `~/.claude/agents/Explore.md`, `model: haiku`, tools Read, Grep, Glob, Bash (matching the built-in), body holding the output contract because Explore skips CLAUDE.md. (A,B)
2. Hard-search route:
   - 2a same Explore agent with a per-call `model` naming the main model ("opus" or "fable"); per-call model outranks frontmatter; already used 3 times in framework. No extra file. (B)
   - 2b a separate agent with `model: inherit` (built-in general-purpose, or a named read-only `investigate`). Explicit split in the Agent listing. Cost: a second file for the named variant. (A)
   - A moves to 2a: fewer parts, and forgetting the field fails visibly. (A)
3. Two tests, two decisions:
   - Delegate or read inline: will you need the raw text in your own context (code you edit or argue line by line), or only the answer? (A)
   - If delegated, Haiku or main model: can the brief's output be facts you can check by opening cited lines? Yes, Haiku; no, it is judgment. (B)
4. Escalation trigger: spot-check fails (B), plus Haiku's return flags not found / low confidence / needs judgment (A). (A,B)
5. Rejected: two Haiku/Opus agents picked by name (B), thoroughness flavours (B), difficulty or keyword classifier (A,B), Explore on main model plus a Haiku scout (A,B), hook (A,B).

## Challenge to "most searches go to Haiku"
- Right for locate, list, summarize, extract; wrong when the search means understand (why, equivalence, which call site is the bug). (A,B)
- By count, 46% of the 686 main-model searches were single lookups under 2K chars (8% of text); calls of 8K and over were 13% of calls and 51% of text. Single targeted lookups stay inline; sweeps and big reads go to Haiku. (A)

## Where slots differ
- Small unopened-file lookups: A keeps single targeted lookups inline (data above); B sends "questions the model thinks it could answer from a quick cat" to Haiku, keeping only edit-next, already-in-context, one known line, single page.
- "Already in context" exit: A narrows it to the exact text present, to cut R1; B keeps it as written.
