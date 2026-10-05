# Territory map C: seed-issue root cause (Tamdoma/akrogon#56)

Slot C, blind. Paths are relative to `/home/ivan/Work/infra/akrogon`. No repo file edited.

## Sources

| Code | Source | Tier |
| --- | --- | --- |
| S1 | Operator note in the prompt: seed-issue "should also try to discover the root cause" so consumer repos "can actually fix the root" | operator |
| S2 | `issues/seeds/56-seed-issue-files-symptoms-only-intake.md` (mirrored report, unverified intake) | operator |
| S3 | Simon Tatham, "How to Report Bugs Effectively", https://www.chiark.greenend.org.uk/~sgtatham/bugs.html (fetched 2026-10-05) | practitioner |
| S4 | John Allspaw, "The Infinite Hows", https://www.kitchensoap.com/2014/11/14/the-infinite-hows-or-the-dangers-of-the-five-whys/ (fetched 2026-10-05) | practitioner |
| S5 | Google SRE book, "Postmortem Culture", https://sre.google/sre-book/postmortem-culture/ (fetched 2026-10-05) | practitioner |
| S6 | ITIL problem management as summarized by Wikipedia "Known error" and vendor guides (one web search, summaries only, no primary ITIL text read) | better-than-training |
| S7 | GitHub docs, "Marking issues or pull requests as a duplicate" (fetched 2026-10-05) | better-than-training |
| S8 | `gh issue create --help` and `gh search issues --help` run locally 2026-10-05 | better-than-training |
| S9 | GitHub autolinks `owner/repo#n` across repos and shows a back-reference on the target. Not fetched, no search run. | model-knowledge |

## Findings from inspected surfaces

- F1. The current skill bans diagnosis outright: "without diagnosis, recommended fixes or planning metadata" (`skills/seed-issue/SKILL.md:26`). The body has five fixed sections and no cause or related field (`:30-47`).
- F2. The ban was a deliberate decision, not an oversight. Closed plan D3 is "Preserve observations without diagnosing" and removes "diagnosis, recommended fixes, planning metadata, optional enrichment, overlap checks" (`issues/closed/akrogon-loop/github/seed-issue/plan.md:29,33`). Acceptance criterion 3 says "no diagnosis" (`issues/closed/akrogon-loop/github/seed-issue/brief.md:17`). This chart reverses D3 in part and should say so.
- F3. The prior version had three relevant pieces (`git show 507aff5 -- skills/seed-issue/SKILL.md`, removed lines): an Overlap Flag that ran `consolidate-issues/scripts/cluster-open-work.ts` after writing and appended a machine-written `## Detected Overlap` section, optional `## Recommended Direction`, and Portability Rules ("Describe the pattern that failed, not the one file that happened to expose it"). It also said "No grill, no grounding pass, and no systemic-vs-local classification runs here."
- F4. The old overlap check depended on an installed sibling script and local seed files. Both are gone: the skill now needs only `gh` and runs "without `akrogon install`" (`skills/seed-issue/SKILL.md:10`), and it forbids "persistent local staging, ... labels, templates, import comments" (`:59`).
- F5. The skill files one issue and stops (`:59`, `:63`). In #56 the fifth, root-cause issue needed a separate reporter request (S2 `:13`).
- F6. The skill reads "only nearby context needed to understand it" (`:26`). In #56 the reporter worked in Stopsol and filed to Tamdoma/tamdoma-framework (S2 `:11`). The filing agent often does not have the destination repo's source, so it cannot verify a cause there.
- F7. `akrogon pull` mirrors open issues only, title and body only, no comments, no labels (`src/pull.ts:57`, `:67`). It deletes the mirror of any issue that is no longer open (`:73-75`). Anything added later as a comment, a label, or a "Duplicate of" comment never reaches `issues/seeds/`.
- F8. chart-issues already owns verification and dedupe. It copies imported text "verbatim separately from agent findings and scope" (`skills/chart-issues/SKILL.md:31`), requires every claim to be grounded in a tiered source (`:47`), compares destination seeds against scoped work at two checkpoints and acts "only on operator confirmation" (`:69`).
- F9. One completion owner can carry many GitHub identities in `sources`, and completion closes each one (`skills/chart-issues/assets/shapes.md:244,246`, `src/pull.ts:180-202`). A partial match "stays open and is shown with its uncovered part" (`shapes.md:246`). So four symptom issues plus one root issue can already be delivered and closed by one owner if the chart groups them.
- F10. chart-issues imports seeds only when the door opens without a note or the note asks (`skills/chart-issues/SKILL.md:31`). Nothing tells the door to group imported seeds by shared cause. The grouping in F9 depends on the door noticing.
- F11. Docs promise the opposite of S1 today: "The skill records missing details instead of guessing the cause" (`docs/guide/create.md:88`), a seed is "unverified ... not ready to execute" (`docs/guide/parts.md:18`). learn-issues prints seed lines "naming the lesson and the reachable case, never the fix" (`skills/learn-issues/SKILL.md:29`).
- F12. The closed leaf capped the skill at "under 300 lines, 4k tokens and 20 rule sentences" (`issues/closed/akrogon-loop/github/seed-issue/implementation/brief.md:9`, criterion C1). The skill is 68 lines now. New rules must fit or the cap must be dropped on record.
- F13. LESSONS has two cases of an agent stating a wrong live fact with confidence: a "missing" webhook that a bad grep hid (`learnings/LESSONS.md:15`) and stale skill lines cited from an old checkout (`:18`). Both were at the chart door, which has more grounding rules than seed-issue has.

## Practitioner position

- P1. Symptoms are mandatory, diagnosis is optional and separate. "The diagnosis is an optional extra, and not an alternative to giving the symptoms." "Make very clear what are actual facts ... and what are speculations." "Leave out speculations if you want to, but don't leave out facts." (S3)
- P2. A single root cause is a constructed story. "Cause is something we construct, not find." Five Whys "locks you into a causal chain." Ask how, to get "the conditions that allowed an event to take place." (S4)
- P3. Root-cause work is a separate, later record than the incident, and one cause maps to many incidents. Postmortems are written "after" the event and hold "the root cause(s)" plural (S5). ITIL keeps incident and problem as separate records, with a problem being the cause of one or more incidents and becoming a "known error" once the cause is identified (S6).
- P4. These sources fit S1 only in part. S1 asks filing time to try for the cause. P1 allows that as a labeled extra. P2 and P3 say the confirmed cause belongs to a later pass. The map below treats S1 as binding on intent and uses P1 to P3 to shape how.

## Forks

### K1. Where root-cause discovery belongs

- O1. Filing time only (seed-issue). Cheapest capture, the session context exists only then. Breaks on F6: the agent often cannot see the destination source. Invites F13-style confident errors in a skill with no grounding rules.
- O2. Import time only (chart-issues). Has grounding, operator, and the destination source (F8). Does not satisfy S1, and loses the session context that linked the four Stopsol failures (S2 `:13`). It also only helps repos that run the chart door, and S1 says "every repo that consumes Akrogon".
- O3. Both, with different jobs. seed-issue records a suspected cause and related issues as unverified context. chart-issues confirms or rejects it, groups seeds by cause, and uses F9 to deliver them under one owner. Matches P1 and P3. Costs two skill changes and a docs change (F11).
- Recommendation: O3. Question for the operator: does "discover" in S1 mean a labeled hypothesis at filing, or a verified cause before posting? The second conflicts with F6 and with "never blocking thin intake" (`skills/seed-issue/SKILL.md:28`).

### K2. Seed body shape

- O4. Add one labeled section after the five, for example `## Suspected cause (unverified)`, stating who suspects it (reporter or agent), the evidence seen, and "Not provided" when there is none. Observation stays symptom-only. Follows P1. It rides in the issue body, so F7 mirrors it with no `pull.ts` change.
- O5. Let cause prose into Observation. Rejected: it removes the separation chart-issues relies on when it copies text verbatim (F8).
- O6. Bring back `## Recommended Direction` (F3). Rejected for this chart: S1 asks for cause, not fix, and F11 keeps "never the fix" elsewhere.
- Open questions. Q1: is "Not provided" allowed for the cause, or must the agent always attempt one? P1 and `:28` say allowed. A forced field invites invented causes. Q2: should the section ask "what condition allowed this" (P2) and allow several conditions, instead of one "root cause"? Q3: does the old Portability rule (F3) return? It pushed reports toward the pattern without any diagnosis and costs one sentence.

### K3. Finding and linking related issues

- O7. Same session. The agent lists issues it filed earlier in this session, from URLs it already holds (`:61` returns each URL). Zero new dependency. Fails after compaction unless the re-read rule (`:6`) is extended, because the URLs are not in the skill or the reporter's context.
- O8. Same destination repo. One `gh issue list` or `gh search issues` call against `$repo` before posting (S8). Fits the gh-only rule (F4). Risks: keyword search misses shared causes with different symptoms (the four #56 symptoms share no keywords), search needs read permission the token may lack, and a failed search must not block filing (`:28`).
- O9. Cross-repo. Leave to chart-issues, which already pulls and compares each destination (F8). seed-issue has no list of other repos, and `:22` forbids consulting other targets.
- O10. A root issue plus links. When several same-session reports share a suspected cause, file or offer one cause issue and reference the symptom issues in it. Conflicts with "Create one report" (F5), so it needs an explicit rule: offer and wait, or print a ready `/seed-issue` line the way learn-issues does (`skills/learn-issues/SKILL.md:29`).
- Link form matters because of F7. A plain `owner/repo#n` list in the body is mirrored and reaches chart-issues. A "Duplicate of #n" comment (S7) or a label is not mirrored, and S7 covers the same repo only. Back-references on the target are created by GitHub (S9, unverified) but also do not reach the mirror.
- Recommendation: O7 plus O8 as a best-effort body section `## Possibly related`, O9 stays at the door, O10 as a printed offer. Never mark duplicates or close at filing. Closing belongs to `akrogon close` and completion (`skills/chart-issues/SKILL.md:33`).

### K4. Standalone constraint

- Everything added must run with `gh` and the agent's own file tools, on any harness (F4). That rules out the old cluster script (F3), local staging, labels and templates (`:59`).
- Investigation depth needs a stated bound. `:26` allows "only nearby context". "Try to discover the root cause" with no bound turns a one-minute filing into an open investigation in the reporter's session. Question: is the bound "what this session already saw", or a fixed small inspection of the consumer repo?
- Size cap F12 applies. Destination repos may also have their own issue templates. The skill bypasses them today (`:59`), and a new section should keep doing so.

### K5. Confident wrong causes

- R1. Anchoring. A cause in the issue body becomes the plan's starting point. P2 says the story is constructed, and F13 shows this repo's agents have stated wrong facts at a better-guarded door. Guard: chart-issues treats the section as a claim to verify with file:line, the same as LESSONS are "observations rather than rules" (`skills/chart-issues/SKILL.md:29`).
- R2. False merge. A wrong shared cause groups unrelated symptoms under one owner, and completion then closes all of them (F9). Guard: grouping needs operator confirmation, as matches already do (F8), and partial matches stay open (`shapes.md:246`).
- R3. Symptom loss. Agents shorten Observation once a cause exists. Guard: P1's rule in the skill text, symptoms always, cause extra.
- R4. Cross-repo guess. The cause sits in a repo the agent cannot read (F6). Guard: the section states what was inspected and what was not.
- R5. Invented filler. A mandatory cause field gets filled. Guard: "Not provided" stays legal (Q1).
- R6. Drift over time. The body hypothesis goes stale while the issue stays open, and the mirror keeps re-copying it (F7). A later correction in a comment is invisible to the door. Guard: corrections edit the body, or the door reads comments, which is a `pull.ts` change and a separate fork.

## Lifetime pitfalls by option

- O1 alone: backlog fills with plausible causes nobody checked. O2 alone: the #56 failure repeats in every consumer repo that does not chart.
- O4: every downstream reader of the five-section shape must tolerate a sixth section. In this repo that is prose only (F8), and no code parses sections (`src/pull.ts:67` copies the body whole).
- O8: search quality decides whether "Possibly related" is signal or noise. A noisy list trains readers to skip it.
- O10: without a rule, agents either file a fifth issue unasked (breaks F5) or never do (the #56 failure).
- Any option: F2 and F11 must be updated in the same work, or the docs and the closed decision contradict the skill.

## What I did not verify

- S9 (cross-repo autolink back-references) was not fetched.
- S6 rests on search summaries, not ITIL primary text.
- The Stopsol session and tamdoma-framework issues #124 to #127 were not read. Their content is taken from S2 as reported.
- No search was run for practitioner guidance on LLM agents writing root causes in bug reports. R1 to R5 rest on S3, S4 and this repo's F13.

Checked: `git log main..origin/main` was empty after a fetch on 2026-10-05, so cited lines match origin (the check named in `learnings/LESSONS.md:18`).
