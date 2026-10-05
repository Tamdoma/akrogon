# Merged territory map: seed-root-cause

Slots: A (door), B (codex), C (claude fable 5-1). Tags name the slots that independently reached each point.

## Mechanism today
- seed-issue bans diagnosis: "without diagnosis, recommended fixes or planning metadata" (`skills/seed-issue/SKILL.md:26`), five fixed sections (`:30-47`), one report then stop (`:59-63`), nearby context only (`:26`). (A,B,C)
- The ban was a deliberate decision: closed plan D3 "Preserve observations without diagnosing" removed diagnosis, enrichment and overlap checks (`issues/closed/akrogon-loop/github/seed-issue/plan.md:29-33`), criterion C3 "without diagnosis", criterion C1 caps the skill at 300 lines / 4k tokens / 20 rule sentences (`.../implementation/brief.md`). This chart partly reverses D3 and must say so. (C)
- The prior skill had an Overlap Flag (sibling `cluster-open-work.ts`, silently skipped on failure), optional Recommended Direction and a portability rule ("Describe the pattern that failed, not the one file"). Removed in `507aff5`. Do not restore the script dependency. (A,B,C)
- `akrogon pull` mirrors open issues' title and body only, no comments or labels, and deletes mirrors of closed issues (`src/pull.ts:57-75`). Anything that must reach the chart door has to live in the issue body. (B,C)
- chart-issues dedupes exact identities only (`shapes.md:62`), separates source text from agent findings (`SKILL.md:31`), and one completion owner can carry many identities and close them all (`shapes.md:244-246`). Nothing groups seeds by shared cause. (A,B,C)
- Docs assign investigation to the chart door (`docs/guide/create.md:88,103`). "Instead of guessing" stays compatible with a bounded investigation that reports no supported cause; the change is who investigates and when. (B,C; wording per B rebuttal)
- Real case: tamdoma-framework #124-#127 then #128 "Root cause". #128 itself splits root (#124's missing variant-choice state) from a separate gate problem (#125) and contributing rule conflicts (#126, #127). One cause did not explain all four. (A)
- The #124-#127 bodies already carry unlabeled file:line diagnosis inside Observation, so the ban is not holding and the mix is unlabeled. (A)

## Practitioner research
- Simon Tatham, "How to Report Bugs Effectively" (practitioner): "The diagnosis is an optional extra, and not an alternative to giving the symptoms." Keep facts and speculation clearly apart. (A,B,C)
- John Allspaw, "The Infinite Hows" (practitioner): a single root cause is constructed. Ask how, to get the conditions. Do not force one causal chain. (A,C)
- Google SRE, Effective Troubleshooting (practitioner): test hypotheses against disconfirming evidence, beware coincidental correlation. (B)
- Google SRE, Postmortem Culture (practitioner): the cause record is written after the event, holds root causes plural, links evidence. (B,C)
- ITIL problem management (better-than-training, secondary summaries): one problem record links many incidents, becomes a known error once its cause is documented. (A,C)
- `gh issue list` / `gh search issues` support `-R`, state, search and JSON (better-than-training, local help and manual). GitHub duplicate marking is a separate same-repo comment action. Cross-repo mention back-references: model-knowledge, unprobed. (B,C)

Synthesis: practitioners agree symptoms stay mandatory and a cause is an optional, clearly labeled hypothesis; they disagree with any framing that one root explains everything. The confirmed cause belongs to a later, grounded pass. That supports a split: filing captures the session's evidence as a hypothesis, charting confirms.

## Forks (order of taking)
1. discovery-role: where root-cause work happens (filing, charting, both) and how far filing investigates before posting. Recommended both, filing bounded. (A,B,C) Reshapes every later fork.
2. cause-section: body shape for the cause. Separate labeled section, symptoms untouched, attribution (reporter vs agent), evidence, what would disprove it, several conditions allowed, "Not provided" legal. (A,B,C) Open: always present vs only when supported (B leans always present with "undetermined"; A,C optional). Open: return the one-sentence portability rule "describe the pattern that failed" (C).
3. related-search: session issues (main mechanism for the #56 case, since the four symptoms share no keywords) plus a read-only search of the routed repo, links written in the body. (A,B,C) Open: open-only vs include closed (B); targeted cross-repo via supplied companion references or a demonstrated shared dependency (B); search-failure policy, file and record incomplete coverage vs stop (A leans file; B holds open); compaction loses earlier session URLs because the skill re-reads only itself (`SKILL.md:6`) (C).
4. root-report: what the skill does when it suspects a cause shared with earlier reports. Print a ready `/seed-issue` line for the root report, never auto-file it (A,B,C). Never mark duplicates, comment or close at filing. (A,B,C)
5. chart-grouping: chart-issues groups imported seeds by suspected cause and links, verifies the cause against live surfaces, and asks before putting them under one completion owner. (A,C; B agrees on verification) Open: a door opened with a note about one symptom never imports sibling seeds (`chart-issues/SKILL.md:31`); should a seed's related links pull linked seeds into intake? (C)

## Lifetime pitfalls
- Confident wrong cause becomes the plan (anchoring). Removed by labeling, evidence, disproof line, and the door treating it as a claim to verify. (A,B,C)
- False merge: a wrong shared cause puts unrelated seeds under one owner and completion closes them all. Removed by operator confirmation before grouping. (C)
- Symptom loss once a cause exists. Removed by "symptoms always, cause extra". (C)
- Noisy related lists get ignored, and keyword search misses issues that share a cause but no symptom words. Session links carry the main signal; repo search is a supplement. (B,C)
- Stale hypothesis: pull re-copies the body each run and never sees comments (`src/pull.ts:57,67`). Corrections edit the body, and the door treats the section as dated. (C)
- Cross-repo cause the agent cannot read (reporter in Stopsol, files to framework). Section states what was and was not inspected. (C)
- Skill bloat versus the C1 cap. Each addition a sentence or two, no scripts. (A,C)
- Docs and closed D3 contradict the new skill unless updated in the same work. (B,C)

## Off route candidates
- Mirroring issue comments or labels into seeds (`pull.ts` change). (C)
- `pull` reading origin while seed routes to `issues_repo` (B). Separate intake if real.
- Cross-org related-issue search. (A,B,C)
