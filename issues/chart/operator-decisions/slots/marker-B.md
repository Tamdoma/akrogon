# Fork notes: marker, slot B, 2026-11-19

Read: INTAKE.md, forks/marker.md `## Question` and `### Carries`, questions.md `## Blind peer exchange`, my own signposts-B.md and map-B.md. Read-only `gh` reads and web reads only.

## Q1. What marks an operator decision in a seed, and how far does its lock reach?

Pick: a real heading line in the seed body that starts `## Operator decision (<name>, <date>)`. Words after it on the line are free, as in #714's ": settled, not open for redesign". The lock is the text under that heading up to the next `## ` heading, and nothing else.
- Reason: one literal start is the only part with one right answer. Everything inside is read by the door, so a decision needs no fixed fields. `Not in scope:` and `Done when:` are locked when present and never required.
- The door takes the heading wherever it sits in the body. seed-issue writes it after `Unverified intake.` so a reader meets it first. Position is the writer's rule, not the reader's test.
- Text the section points to is not locked. #714 says "Details and evidence are in Proposed solution below". That section stays evidence.
- The heading must be a heading line, not a mention. #144's own body names the heading inside a sentence and must not be taken. It is the free negative case.
- Cost: a decision under a different heading is not taken and is asked in a round as today. The door names a near miss in the opening map ("marked differently, not taken") so the miss is never silent.
Rejected:
- Any text saying the operator decided, judged by the door. #714's `## Proposed solution (operator-requested…)` would qualify, and agent advice would bind.
- A GitHub label. Only triage and above can set one, which helps Q2, but the mirror holds no labels (`pullRepo` in src/pull.ts writes title, Source, URL and body) and seed-issue creates reports "without … labels" (`## Submit and finish`). It needs code, which signpost 5a excludes.
- Required fields inside the section (Design, Not in scope, Done when). Refuses a valid decision written in another shape.
- Lock the sections the decision cites, or the whole seed. Breaks signpost 2a and locks agent-written text.
Evidence:
- operator · #714 body, read 2026-11-18 · the heading, five numbered points, `Not in scope:` and `Done when:` lines, and a pointer to an agent-written section · it set the heading form and the "pointer locks nothing" rule.
- better-than-training · issues/seeds/144-…md, read 2026-11-19 · the body mentions the heading in prose under `## Observation` · it added the heading-line test.
- better-than-training · standing-design.md, the script line · a fixed reference may match literally, and what a model is asked to judge takes no text match · literal start, free inside.
- practitioner · Michael Nygard, "Documenting Architecture Decisions", 2011-11-15, https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions, read 2026-11-19 · a decision record states its own status, and "If a decision is reversed, we will keep the old one around, but mark it as superseded" · a change is a dated correction beside the kept text, which shapes.md's fork paragraph already does.
Pitfalls:
- Two marked sections in one seed that disagree. Each is its own taken fork. The door shows the clash to the operator and picks neither.
- A `## ` heading inside the decision cuts the lock short. Removed by the seed-writer rule: sub-headings in the section use `### `.
- Two copies of the literal, in seed-issue and chart-issues, drift. Removed by one binding decision holding it. An agreement test on that one literal is allowed by standing-design's writer and checker line.
Questions the fork does not ask:
- When the section's words can be read two ways and the leaf differs, who settles it under autopilot? My pick: the operator. A's reading never becomes the lock.

## Q2. Whose marked section counts as the operator's?

Pick: the section counts only when GitHub shows that the issue's author is the account the door runs `gh` as, and that every body edit was made by that same account. One GraphQL read returns both (`author`, `userContentEdits`). Otherwise the section is plain intake, shown in the opening map as "marked, not taken" with the reason. The operator can take it there in words, which is an ordinary operator answer.
- Reason: the name in the heading is text anyone can type. Identity has to come from the platform, never from what the text says about itself.
- Do body edits by others matter? Yes. GitHub's roles table gives "Edit anyone's issue titles and bodies" to Moderate, Write, Maintain and Admin. Tamdoma/akrogon has 1 admin and 4 write collaborators. Any of the four can add the marker to an issue the operator authored, and an author-only check passes it.
- Cost: this proves "this account, untouched by others", not "the operator's own words". Agents file under the same account, which signpost 1a accepted. The seed-writer rule covers that half. A team where the operator files under one account and the door runs under another gets "not taken" until the operator says yes.
Rejected:
- Marker alone. Tamdoma/akrogon is PUBLIC, so anyone can open an issue with the heading, and under 1a it binds unattended.
- Author only. Misses the edit by another collaborator, at no saving, since the same read returns the editors.
- `authorAssociation` of OWNER, MEMBER or COLLABORATOR, which is GitHub's own bar. It answers "trusted contributor". Here it would let five accounts bind the door, and it says nothing about edits.
- Operator confirms each section (signpost 1a ruled it out), or private repos only (leaves akrogon's own issues repo, where #144 lives, outside the feature).
Evidence (all web pages read 2026-11-19):
- practitioner · Simon Willison, "The lethal trifecta", 2025-06-16, https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/ · "LLMs are unable to reliably distinguish the importance of instructions based on where they came from", and the GitHub MCP "can read issues in public issues that could have been filed by an attacker" · a heading that claims authority is the exact shape of that attack, so the claim cannot be the proof.
- practitioner · Invariant Labs, 2025-05-26, https://invariantlabs.ai/blog/mcp-github-vulnerability · "an attacker can now create a malicious issue on the public repository", and it is "a fundamental architectural issue that must be addressed at the agent system level" · the fix belongs in the door's rule, not in a hope that the text is clean.
- practitioner · Snyk on Adnan Khan's Clinejection disclosure of 2026-02-09, https://snyk.io/blog/cline-supply-chain-attack-prompt-injection-github-actions · `allowed_non_write_users: "*"` "meant any GitHub user could trigger the workflow by opening an issue" · an agent acting on any user's issue text was the opening of a real compromise.
- better-than-training · GitHub Agentic Workflows integrity reference, https://github.github.com/gh-aw/reference/integrity/ · "approved" means authored by OWNER, MEMBER or COLLABORATOR, and public repos get `min-integrity: approved` by default. The page does not say how edited content is classed · the platform filters by author identity, and leaves the edit gap this pick closes.
- better-than-training · GitHub docs, repository roles for an organization, https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization · the "Edit anyone's issue titles and bodies" row · edits by others are possible without authorship.
- better-than-training · local reads 2026-11-19 · `gh repo view`: akrogon PUBLIC, tamdoma-framework PRIVATE. Collaborators: akrogon admin=1 write=4. GraphQL on #144: author `ivanjuras`, 0 edits. On #714: author `ivanjuras`, 5 edits, every editor `ivanjuras`. `gh api user`: `ivanjuras` · the read works today and both live seeds pass.
- Where the sources agree: issue text in a public repo is attacker-controlled data, and trust comes from who wrote it and from limits on the agent. Where they differ: Invariant and Snyk lean on cutting the agent's tools, GitHub on filtering by author. The door runs with the operator's full token, so only the author route is open here. What flips the advice: a private repo with one account makes the marker alone enough.
Pitfalls:
- A body edit lands between the pull and the identity read. Removed by reading identity after the pull and comparing the last edit time with the pull time. A later edit means "not taken, pull again". A failed identity read is also not taken, with the error shown, never a pass.
- The failed check is silent and the operator thinks the decision bound. Removed by the opening map line and, under autopilot, the pass-end line.
- An agent running under the operator's token writes the marker unasked. Not removed here. The seed-writer rule and the map line make it visible.
Questions the fork does not ask:
- Under autopilot, is a "marked, not taken" section charted as ordinary forks A answers, or does it wait? My pick: ordinary forks, with the reason in the pass-end line. A wait recreates the stall.
