# Fork notes: marker Q2 reshaped, slot B, 2026-11-19

Read: forks/marker.md `## Question`, `### Carries`, and `## Findings` from "Operator reply to round 1" on. My own earlier returns. Read-only commands and one docs page.

## Q2. Whose accounts make a marked section count?

Pick: the section counts when the issue's author and every body editor hold write or higher on the issue's repo. The door reads `repos/<repo>/collaborators/<login>/permission` once per distinct login at import and passes only `permission` of `write` or `admin`. Anything else, including a failed read, is "marked, not taken" with the reason. The opening map names the account ("decision by <login>").
- Reason: whoever can write to the repo can already change its code and its rules. Letting the same people bind the door hands out no new power, and nobody keeps a list.
- It fits the operator's reply. In a private repo holding only the operator and colleagues, every author passes, so nothing changes for them. In public akrogon an outsider reads `read` and fails.
- Cost 1: one read per distinct login, usually one or two.
- Cost 2: an outsider's report that a colleague later edits a decision into is not taken, because the author lacks write. The colleague records the decision in a report they author, or the operator says yes in the door.
- Cost 3: permission is read at door open, not at the time of writing. A removed colleague's decision stops counting for new charts. Forks already taken stay.

Rejected:
- Org membership (`authorAssociation` MEMBER or OWNER, or the org members list). It admits org members who hold only read on this repo, drops an outside collaborator with write, and means nothing on a user-owned repo. `authorAssociation` covers the author only, so editors need a second read anyway.
- Listed accounts in repo config. Config schemas are `z.strictObject` in src/config.ts, so a new key needs code, which signpost 5a excludes. The file is editable by writers, so its trust still rests on write access. A forgotten entry silently drops a colleague's decision. It wins only when deciders must be fewer than writers.
- Marker alone. The reply's premise, "only me and my colleagues have access", holds for the private repos. It is false for Tamdoma/akrogon: public, issues on, no interaction limit (A's probe), so any GitHub account can file the heading and under 1a it binds unattended.
- Last editor only. A colleague fixing a typo in an outsider's issue would make a forged marker count.
- Finding who added the section from edit diffs. The door would compare body revisions, which is fragile as rule text.
- The door's own account only. The operator rejected it.

Evidence:
- operator · reply 2026-11-19, in forks/marker.md `## Findings` · colleagues must be able to decide · it removed the single-account rule.
- better-than-training · A's probes 2026-11-19, same place · akrogon PUBLIC with open issues, 1 admin and 4 write, per-login read gave admin, write and `read` for an outsider · the read separates the three groups today.
- better-than-training · GitHub REST docs, "Get repository permissions for a user", https://docs.github.com/en/rest/collaborators/collaborators, read 2026-11-19 · `permission` gives "the legacy base roles of admin, write, read, and none", "the maintain role is mapped to write and the triage role is mapped to read", computed "after considering all sources of grants, including: repo, teams, organization, and enterprise" · use `permission`, never `role_name`. Team and org grants count by the docs, not yet seen live.
- better-than-training · GitHub roles table, read 2026-11-19 · "Edit anyone's issue titles and bodies" goes to Moderate, Write, Maintain, Admin · Moderate edits bodies with no code access, so editors are checked too.
- practitioner · same sources as round 1 (Willison 2025-06-16, Invariant Labs 2025-05-26, GitHub's gh-aw integrity reference) · trust comes from platform identity, never from what the text says of itself. gh-aw's own bar also admits invited read-only accounts, so write is the stricter line.

Pitfalls:
- A colleague's door cannot read the permission. Every probe ran as admin. The docs do not state what the caller needs, and the neighbouring endpoint needs push access. Removed by one free run of the read by a write-level colleague before handoff. Until then this key part is unproven.
- How Moderate maps is unknown. The docs name only maintain and triage. If it maps to `write`, an account with no code access passes. Not removable without a Moderate account. State it as a limit.
- Bot or app authors return none or an error. That is not taken, which is right.
- A body edit lands between the pull and the read. Removed as in round 1: a later edit time than the pull means not taken.

Questions the fork does not ask:
- The check is on the issue's repo. seed-issue routes akrogon-owned failures from a consumer repo into akrogon's issues repo, and a leaf can land elsewhere. Should the destination repo matter? My pick: no, the issue's repo only.
- Would the operator rather close akrogon's issues to outsiders? That removes outsider text for every reader, not only this marker. Outside this chart.
