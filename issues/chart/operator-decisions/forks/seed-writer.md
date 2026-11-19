# Seed writer

## Question

Q1. When may seed-issue write the `## Operator decision` section, and what may it hold?
Q2. May seed-issue add the section to a report that is already filed (how #714 got it), and how?
Q3. May the evidence behind the decision (as #714's `## Proposed solution` and `## Second review`) sit beside it, and what standing does it have?

### Carries

- Signposts (forks/signposts.md `## Taken`): 1a binds in every mode; 2a locks exactly what it states, with the operator's correction (chart around the decision; a finding that it is not good is fine to raise; the starting point is always the recorded decision); 4a one entry, the marked section as pulled at door open; 5a rule text in existing skill files, free proofs.
- Marker (forks/marker.md `## Taken`): the heading literal, lock to the next `## `, `### ` inside, counts when author and every editor have write or admin on the issue's repo.
- Live surface: skills/seed-issue/SKILL.md `## Report` ("adding no recommended fixes or planning metadata"), body template, lookups paragraph (a covering report means post nothing; never change a linked issue), `## Submit and finish` (`gh issue create` only, "without … labels, templates, import comments or lifecycle operations").
- Related forks: door-record, leaf-carry.

## Findings

Notes: slots/seed-writer-A.md, slots/seed-writer-B.md, merged slots/seed-writer-merged.md. B rebuttal slots/seed-writer-rebuttal-B.md accepted: R1 the body-edit time is GraphQL `lastEditedAt`, not `updatedAt` (which moves on comments); B read #144 null and #714 22:32:08Z; a window between check and write remains, stated as a limit. R2 the proof cycle runs on a private repo where the door identity is admin (tamdoma-framework), recorded as a late needs row; a declined proof cuts only seed-issue's sanction for the edit, the door still takes a section that reached the body by any edit. R3 an author without write keeps a colleague's edited-in decision "marked, not taken". R4 evidence sections hold no research tier of their own; each claim takes the tier of the source that confirms it. R5 #714's proposal was written before the decision for review; the pick leaves that step unsanctioned, now asked as Q3's option.
Restatement for marker decision 2: "a body edit later than the pull" is read from GraphQL `lastEditedAt` (no new mechanism).

Operator reply to round 2, 2026-11-19, verbatim: "1 - It has to infer it from my own text that I say when I tell it to seed the issue. No formal ways, and no displaying the entire thing. | 2a | 3a | 4a"

Grant (operator answer "4a", 2026-11-19): principal ivanjuras (gh keyring login, admin on Tamdoma/tamdoma-framework); target Tamdoma/tamdoma-framework; fixture one issue titled "[akrogon probe] delete me", count 1, cleanup `gh issue delete <n> --yes` by the creating identity, absence check `gh issue view <n>` fails to resolve; operations create, view, edit body, view, GraphQL edit read, delete, view; effects one issue created and deleted, possible watcher notification; bounds at most 2 create/edit/delete cycles, counting every cycle that creates an issue; stop line: never edit or delete any other issue.

Proof (A, 2026-11-19, gh 2.104.0, identity ivanjuras, 1 cycle used): created Tamdoma/tamdoma-framework#717 with `gh issue create -R Tamdoma/tamdoma-framework --title "[akrogon probe] delete me" --body-file -`; read body with `gh issue view 717 --json body --jq .body`; inserted `## Operator decision (Probe, 2026-11-19): settled` after `Unverified intake.`; wrote with `gh issue edit 717 -R Tamdoma/tamdoma-framework --body-file -`; read back. Result: the section landed after `Unverified intake.` with the rest unchanged, but the read-back differed from the written file by one trailing newline (the stored body kept the file's final newline, which the create had not), so a byte-exact compare fails on trailing whitespace. GraphQL after the edit: `lastEditedAt` 2026-11-18T23:24:25Z, 2 edits, both ivanjuras. Cleanup: `gh issue delete 717 --yes`, then `gh issue view 717` "Could not resolve to an issue" (absent). Limits: proves the read, insert, whole-body write, read-back and `lastEditedAt` route on a private repo as admin; does not prove a write-level caller, a concurrent edit, or a public repo. Consequence for the contract: the read-back compares the body ignoring trailing whitespace.

Final shape: slots/seed-writer-final-shape.md; B check slots/seed-writer-final-check-B.md: follows the reply, no lock conflict, five implementer gaps (G1-G5) closed below as restatements of the reply and the 2a/3a picks, no new mechanism.

## Taken

Operator, 2026-11-19: Q1 free text (verbatim above), Q2 2a, Q3 3a, Q4 4a.

Binding decisions:
1. Writing the decision (Q1, operator correction): seed-issue writes the `## Operator decision (<name>, <date>)` section when the person's own words in the request to seed, or to add to a filed report, state a settled decision; the agent infers the decided points from those words, including words that point at a fix settled earlier in the same session ("record the fix we agreed"), and writes them with no confirmation step and no display of the section. Unclear words ("I think we should do X") write no section. The final printed lines say in one clause that a decision section was written, without its text. It holds only what the person's words decided, never the agent's own advice. The heading names that person (git `user.name`) and the day, never an agent or model. It never holds a grant, live or paid approval, secret or handoff authorization. Colleagues write under their own name.
2. Edit route (Q2 2a): seed-issue may add or replace the section on an open report: the report the person names, else the covering report the lookups found. Read the body, put the section after `Unverified intake.` (top of the body when that line is absent), change nothing else, write with `gh issue edit <n> -R <repo> --body-file -`, read back and confirm that the text outside the section is unchanged and the section equals what was written, ignoring trailing whitespace; a mismatch is a failure printed with the URL. One section per report; a changed decision replaces it with a new date. Comments, labels, state and closed reports are untouched. The concurrent-edit window is a stated limit; GraphQL `lastEditedAt` is the body-edit time.
3. Background (Q3 3a): sections the person's words ask for, before or after a decision, each headed with wording to the effect "proposed, not decided" plus author and date (not a literal; the door gives it no meaning), lock nothing, hold no research tier of their own (each claim takes the tier of the source that confirms it), and lose to the decision where they differ.
4. One exception sentence beside "adding no recommended fixes or planning metadata" covers both the decision section and requested background; `## Lifecycle filing` callers, lesson-triggered reports and sessions with no person's request write neither.
5. Proof (Q4 4a): grant and proof recorded above; one of two cycles used, fixture deleted and absent.
Reasons: the operator's words are the decision ("It has to infer it from my own text … No formal ways, and no displaying the entire thing"); #714's real path was an edit after filing; the consult's write-ups save door research.
Foreclosed: show-then-confirm, agent-judged decisions, filing-time only, second reports, comments, background only after a decision.
