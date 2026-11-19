# Marker

## Question

Q1. What marks an operator decision in a seed, and how far does its lock reach?
Q2. Whose marked section counts as the operator's?

### Carries

- Signposts (forks/signposts.md `## Taken`): 1a a marked decision binds in every mode without being asked again, shown as taken in the opening map where the operator can object; 2a it locks exactly what it states, the rest stays chartable; 3a it reaches every step through taken forks copied into leaf designs; 4a one entry, the marked section in the seed body as pulled at door open; 5a rule text in existing skill files, free proofs; 6a #144 only.
- Operator correction on 2a, verbatim: "We can still chart, but around it. And if we find out that the actual original solution is not good during the charting, when we're doing the charting around it, that's still fine. But the initial idea has to be the one that we are charting around. Simply because I already did a quasi-charting process inside of the consumer repo."
- Related forks: door-record, seed-writer.

## Findings

Map notes (A slots/map-A.md, B slots/map-B.md):
- Heading in #714: `## Operator decision (Ivan Juras, 2026-11-18): settled, not open for redesign`, placed after `Unverified intake.` and before `## Observation`, holding five numbered points, `Not in scope:` and `Done when:`; later agent sections `## Proposed solution (operator-requested, …)` and `## Second review (…)` (A, B).
- Fixed heading, free body (A, B); B adds: lock = text up to the next `## ` heading, optional `Not in scope:` and `Done when:`, marker counts only in GitHub seeds, not legacy `issues/open` reports or operator notes (B Q4); the rule fixes the form, not the person's name (B Q2).
- Trust: Tamdoma/akrogon is PUBLIC, tamdoma-framework PRIVATE (`gh repo view --json visibility`, 2026-11-19). Mirrors carry no author (src/pull.ts `pullRepo`). B proposes the door take the marker only when the issue author is the door's own gh account (B F6a).

Proof (free, A, 2026-11-19): `gh api graphql -f query='{repository(owner:"Tamdoma",name:"tamdoma-framework"){issue(number:714){author{login} userContentEdits(first:50){totalCount nodes{editor{login} editedAt}}}}}'`, identity: door's gh login (`gh api user --jq .login` = ivanjuras), gh 2.104.0. Result: author ivanjuras, 5 body edits, every editor ivanjuras. `gh issue view 144 -R Tamdoma/akrogon --json author` = ivanjuras. Cleanup: none (read only). Limits: proves author and body-editor logins are readable in one call for a private and public repo; does not prove the person at the account is the operator, nor cover comment authors.

Merged notes: slots/marker-merged.md (A,B agree on 1a and 2a). B rebuttal (slots/marker-rebuttal-B.md) accepted: R1 second cost of 2a, a team whose operator files under another account gets "not taken" until the operator says yes; R2 "marked, not taken" under autopilot moves to door-record; R3 the literal sits in seed-issue and chart-issues files, split not assumed, and an agreement test on the literal is allowed (standing-design writer and checker line); R4 the flip condition, a private repo with one account makes the marker alone enough, and gh-aw's integrity reference does not class edited content, so the editor check rests on GitHub's roles table.

Operator reply to round 1, 2026-11-19, verbatim: "1a | 2 - This doesn't matter because only me and my colleagues have access to these repos internally. If it's only me, then the problem is how are my colleagues going to make any decisions? But if there's a better solution for this, I'm willing to consider it. |"
- Q1 taken: 1a (held here until Q2 is taken).
- Q2 open: the operator rejects 2a's single-account rule because colleagues must also be able to decide, and asks for a better solution. Reshaped Q2: whose accounts count.

Probes after the reply (free, A, 2026-11-19, gh 2.104.0, identity ivanjuras):
- `gh repo view <r> --json visibility`: Tamdoma/akrogon PUBLIC; Tamdoma/tamdoma-framework PRIVATE; Tamdoma/buffalo-exterminators PRIVATE.
- `gh api graphql` on akrogon: hasIssuesEnabled true; `gh api repos/Tamdoma/akrogon/interaction-limits` = {} (no limit), so any GitHub account can open an issue in akrogon.
- `gh api repos/Tamdoma/akrogon/collaborators --jq '[.[]|{login,role_name}]'`: ivanjuras admin; 4 write-level logins.
- `gh api repos/Tamdoma/akrogon/collaborators/<login>/permission`: ivanjuras admin, one write-level colleague write, octocat (outsider) read; tamdoma-framework ivanjuras admin.
- #144 `authorAssociation` = MEMBER.
Cleanup: none (reads). Limits: proves the per-login permission read separates write collaborators from outsiders on a public and a private repo; does not prove an org team grant reads the same (not tried), nor anything about comment authors.

Reshaped Q2 notes: slots/marker-q2-A.md, slots/marker-q2-B.md, merged slots/marker-q2-merged.md (A,B agree). Round 1 rebuttal already taken for this fork; no second rebuttal.

## Taken

Operator, 2026-11-19: Q1 "1a"; Q2 after the reshape "2a".

Binding decisions:
1. Marker (Q1 1a): a heading line starting `## Operator decision (<name>, <date>)`, rest of the line free. The lock is the text under it up to the next `## ` heading. The body is free; `Not in scope:` and `Done when:` are locked when present and never required. A mention in prose is not a marker. Text the section points to is not locked. Counts only in mirrored GitHub seeds. A near miss (a decision-like heading not matching) is named in the opening map as "marked differently, not taken". Sub-headings inside the section use `### `. The literal lives once as this binding decision, copied into each affected leaf; an agreement test on that one literal is allowed.
2. Who counts (Q2 2a): the section counts when the issue author and every body editor have `permission` write or admin (maintain maps to write) on the issue's own repo, read per distinct login with `gh api repos/<r>/collaborators/<login>/permission` after the pull at door open; `permission`, never `role_name`. Anything else, a failed read, or a body edit later than the pull is "marked, not taken" with the reason, and the operator may take it in words in the door. The opening map names the deciding login.
Reasons: one literal the door finds without judging (Q1); colleagues with write decide, strangers on the public akrogon repo do not, with no list to keep (Q2, operator: "how are my colleagues going to make any decisions?").
Foreclosed: required parts, door-judged decision text, labels; marker alone, door account only, org membership, config account list, last editor only.
Limits recorded: the permission read is proven only as admin (ivanjuras); a write-level caller and the Moderate role mapping are unobserved. Operator did not ask for the colleague run.
