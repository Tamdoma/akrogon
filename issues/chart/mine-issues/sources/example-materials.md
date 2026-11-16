# Hand-made post materials, 2026-11-16 (reference example)

Key finding: an AI learned to recognize hiring-intent keywords without a per-keyword intent API.
- Goal: per service and office, one main phrase a page targets: what someone types to hire, not to learn.
- Usual paid route: SERP or intent-classification API per keyword per location. We used neither.
- What we did: one cheap keyword-ideas call per office, an AI judging intent against four written tests, real Google checks only on chosen phrases, read for free in our own browser.
- Data cost: 3 seed phrases returned 1,636 ideas with search counts (162 null) for $0.09 in one call. DataForSEO bills per task, not per keyword.
- Re-test after the fix: $0 keyword data, 0 paid calls (3 saved keyword-ideas answers and 4 saved search-count answers reused). Model run $1.05, 199 s.
- Total keyword-data spend $2.61; $2.16 was search counts for 24 small towns, a feature then removed because the numbers could not change a decision. Core research about $0.27.

Problem found
- First rule: "mark terms a searcher types to hire a provider". Its own example marked "ant control", which taught marking almost everything: 55 of 82 bed bug terms, all 28 rodent terms.
- Heads picked for the main office: "pest control for rats" (50/mo), "mosquito mosquito control" (70), "carpenter ant control" (170), "wasp nest disposal", "exterminator and fleas", "pest control for ticks in house", "best backyard mosquito control".
- Live Google for "pest control for rats": county health department on top. Google reads it as information.
- Tie-break bug: small-town counts come in steps (10, 20, 30); ties went alphabetical, so "exterminators near me for rats" beat "rat exterminator" at 20 each.
- Every automated check passed. Only a person reading the output caught it.

Fix
- Four tests in the grouping instructions: T1 names who you hire, or says company, service or near me (a job name counts only with service or near me). T2 whole service, no subtype or wider trade. T3 no extra words (best, cheap, 24 hour, place in home or yard). T4 normal words and order, no repeats.
- Trade words come from the client's business records, so it works for any trade.
- Failing phrases stay in their group with volume, just never main phrase. AI lists hiring phrases best first; ties go to that order (also for the multi-city hub).
- No passing phrase: fallback "service + city".
- Instruction example switched to plumbing, one rejected phrase per test.

Rejected
- Fixed hiring-word list checked by a script: breaks for other trades, rejects real job names like "wasp removal". Proposed by one consultant model, rejected by two others plus the lead.
- Making the fallback pass the tests: would reopen the every-service-gets-a-page rule.
- Exact expected phrase list in tests: AI output varies; test checks heads came from marked terms, a reviewer judges each.

Results
- 36 office/service pairs, 15 distinct heads, all passed T1-T4 judged one by one by a separate reviewer AI; no fallback needed.
- "pest control for rats" (50) -> "rat exterminator" (20); "carpenter ant control" (170) -> "ant exterminator" (90); "mosquito mosquito control" (70) -> "mosquito control near me" (40); "bed bug control" -> "bed bug exterminator" (390); "pest and rodent control near me" -> "rodent exterminator" (260); "wasp nest disposal" -> "wasp exterminator" (30).
- Volume down, buying intent up. National and e-commerce routes untouched.

Live Google checks
- Own signed-in browser, 30 s between loads, 4 min between offices, $0 API, human solves CAPTCHAs. 22 loads per office, 66 for the client, cap 1,200.
- Google-reading AI once retyped 3 of 88 saved results, 2 looked normal. Page output now carries a checksum; save refuses a mismatch. Whole run discarded and re-read.

Method
- Operator spotted bad phrases, gave a two-line instruction; three models from three companies analysed against real code and data; lead picked with written reasons; disagreements kept.
- Own work package with an approved cap: 3 model runs and $1.00 keyword data. Used 1 run, $0. Planned to merged in under an hour.
