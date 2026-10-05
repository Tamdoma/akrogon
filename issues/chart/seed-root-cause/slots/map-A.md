# Map A: seed-issue root-cause intake (Tamdoma/akrogon#56)

## Destination
Registered repo `akrogon`. Owned surface: `skills/seed-issue/SKILL.md` (symlinked into ~/.claude/skills, so every consumer repo gets the change on next run). Possible second surface: chart-issues import. Docs: `docs/guide/create.md:84-96`.

## Evidence
- `skills/seed-issue/SKILL.md` Report section: "without diagnosis, recommended fixes or planning metadata"; Submit: "Create one report ... no ... import comments or lifecycle operations". Nothing asks about shared cause or related issues.
- Real case (better-than-training, gh issue view, 2026-10-05): Tamdoma/tamdoma-framework #124-#127 filed 08:13-08:59, #128 "Root cause" at 09:09 with `Related: #124, #125, #126, #127`. #128 itself classifies #124 as a symptom of the root, but #125 as a separate gate-design problem, and #126/#127 as "contributing problems" (rule conflicts). So the true shape was one root + independent contributors, not one cause for all four.
- The bodies of #124-#127 already carry file:line diagnosis despite the "without diagnosis" rule. The rule is not holding today, and the evidence is mixed into Observation unlabeled.
- History (`git show 507aff5`): the previous seed-issue had an Overlap Flag (ran `cluster-open-work.ts` to append `## Detected Overlap`), optional `## Recommended Direction`, and a portability rule "Describe the pattern that failed, not the one file that happened to expose it". All removed in the 2026-09-11 standalone rewrite. Overlap detection existed and depended on a sibling script that no longer exists.
- chart-issues dedupe is exact GitHub identity only (`shapes.md:62`, `SKILL.md:31`); no shared-cause grouping at import beyond the territory map.

## Research
- practitioner · Simon Tatham, "How to Report Bugs Effectively" (chiark.greenend.org.uk/~sgtatham/bugs.html, read 2026-10-05): "The diagnosis is an optional extra, and not an alternative to giving the symptoms." Supports: keep symptoms mandatory, add a separately labeled suspected-cause section.
- practitioner · John Allspaw, "The Infinite Hows" (kitchensoap.com 2014-11-14): 5-whys presupposes one silver-bullet cause; ask "how" to describe conditions. Supports: record conditions and contributors, never force a single root. Matches #128's root+contributors shape.
- better-than-training · ITIL problem management (Wikipedia "Known error"; vendor guides): many incidents link to one problem record; the problem becomes a known error once its cause is documented. Supports a parent root-cause issue that symptom issues link to, rather than merging them.
- better-than-training · GitHub: `#n` / `owner/repo#n` mentions in an issue body create timeline backlinks on the referenced issue automatically, so linking needs no extra write. (model-knowledge for exact behavior; no probe run yet.)

## Forks
1. Where root-cause discovery happens. (a) filing time in seed-issue, (b) import time in chart-issues, (c) both with split roles: filing captures session evidence and a labeled suspicion, charting verifies. Filing is where the evidence lives (the session that saw all four failures); charting has the repo but not the session. Recommend (c), with seed-issue the main change. Risk of (a) alone: unverified causes treated as settled. Risk of (b) alone: same as today, reporter must ask.
2. Body shape. (a) new optional sixth section `## Suspected cause` with Reporter's statement (verbatim) and Agent's reading (evidence + confidence + what would disprove it), "Not provided" allowed; (b) fold into Observation; (c) keep banned. Recommend (a). Tatham supports it. Later risk: chart-issues and learn-issues read seeds; a new heading must not be treated as a settled finding at import (shapes already separates source text from agent findings, so it stays source text).
3. Related-issue discovery scope. (a) same session only (issues this agent filed or saw); (b) plus a read-only search of the destination repo's open issues (`gh issue list -R <repo> --state open --search ...`); (c) plus other repos. Recommend (b). (c) has no bounded target set. (b) adds an external read call that needs a proof probe with the reporter's gh identity.
4. What happens when a shared cause appears. (a) link only: `Related: #n` line naming the suspected shared cause; (b) the skill also files the root-cause issue itself; (c) the skill prints a ready `/seed-issue` line for the root cause and the reporter chooses, keeping one issue per invocation (same pattern learn-issues uses, `skills/learn-issues/SKILL.md:29`); (d) edit/comment on earlier issues. Recommend (a)+(c). (d) writes to other people's issues and breaks "no import comments"; backlinks come free from mentions.
5. Investigation depth at filing. (a) nearby context only (today); (b) bounded "how did this happen" pass: ask how the conditions arose, read the code paths the failure names, stop at the first condition that would also explain other observed failures; (c) open-ended RCA. Recommend (b). (c) turns intake into a slow planning pass and invites confident fiction.
6. Should the skill ask the reporter a question? Currently non-interactive. (a) no question; record the reporter's stated cause if any and the agent's reading; (b) one optional question "do you suspect a shared cause?" when the session filed earlier seeds. Leaning (a): operator asked the skill to "try to discover", not to interrogate. Open.
7. Chart-side companion (smaller). When the door drains several seeds from one destination, group them by `Suspected cause` / `Related` links in the territory map and ask whether one fork owns the root. Could be a done-criterion of the chart-issues leaf or off route. Open whether it is in scope.

## Pitfalls over lifetime
- Confident wrong cause becomes the plan: removed by labeling, evidence + "what would disprove it", and chart import treating it as source text.
- Forced single cause hides real separate bugs (#126 parser bug is real on its own): Allspaw framing; the section allows "contributing" separately from "root".
- Duplicate root-cause issues across sessions: (b) search on destination open issues before filing.
- Related search leaks private repo titles into another repo's issue: only search the destination repo itself.
- Skill bloat: the rewrite cut 134 lines for a reason; changes stay a few sentences, no scripts (the old cluster script dependency broke).
- Search call fails or gh lacks scope: the issue must still be filed; failure is stated in the body ("Related search failed: <reason>"), never silently skipped. Needs operator call on whether that counts as a forbidden fallback.
- Harness portability: everything must work with only `gh` and file reads on every harness.

## Practitioner questions
- How do we know it worked? Measurable: on a replay of the Stopsol session, the first or second seed names the variant-choice suspicion and later seeds link to it.
- Who closes symptom issues when the root is fixed? chart-issues owns this via `sources`; the root-cause chart can list symptom identities as sources of the same completion owner.
