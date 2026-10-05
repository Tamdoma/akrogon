# Related search

## Question
Q1. Which related reports does filing look for: same session, the routed repo's issues (open only or closed too), targeted cross-repo?
Q2. What happens when the related search fails?
Q3. How do earlier same-session issue URLs survive compaction?

### Carries
- Intake: ../INTAKE.md. Map: ../slots/map-merged.md.
- Closed decision D3 (issues/closed/akrogon-loop/github/seed-issue/plan.md:29-33) banned diagnosis and overlap checks; this chart partly reverses it.
- Skill cap C1 from the closed leaf: under 300 lines, 4k tokens, 20 rule sentences; skill must run with gh only on every harness.
- Depends on: forks/discovery-role.md. Links must live in the body to reach the mirror (src/pull.ts:57,67).

## Findings
Full rounds: ../slots/related-search-{A,B,C,merged,rebuttal-B,rebuttal-C}.md.
- Probes (read-only, gh 2.102.0, account ivanjuras scopes repo/read:org, Tamdoma/tamdoma-framework private, 2026-10-05): `gh issue list -R <repo> --state all --author @me --search "created:>=2026-10-05"` returned exactly #124-#128. Per-report keywords miss siblings ("advance-phase" -> #124,#125,#128; "motion coverage" -> #126,#128). Sentence queries return [] in lexical/hybrid/semantic. `gh search issues --state` has no "all"; `gh issue list --state all` does, default limit 30. Unreadable repo exits 1 "Could not resolve to a Repository"; empty exits 0 []. Limits: one repo, account, harness, day; no recall or rate-limit proof. (A,B,C)
- `owner/repo#n` mentions add a cross-referenced timeline event on the linked issue (gh api .../issues/124/timeline, three events). (C)
- practitioner · Tatham; Google SRE Effective Troubleshooting and Postmortem Culture, read 2026-10-05 · check known reports, correlation is not causation, one cause record covers many incidents. (B,C)
- No practitioner source on enrichment-lookup failure in intake. (A,C)
- Rebuttals: B fixed 1a reason and account wording, restored supplied cross-repo reads, scope on every outcome; holds 3b. C added backlink cost, retry limit, limit as product choice; holds 3a.

## Taken
Operator 2026-10-05: "1a | 2a | 3a | 4a"

- Q1 = 1a. Two read-only calls on the routed repo before posting: the filing account's reports from the last two days (`gh issue list -R <repo> --state all --author @me --search "created:>=<date>"`), and one 2-3 word keyword search on the file, command or component this failure names, open and closed, small limit. Read issue links the reporter supplies, including cross-repo, without searching other repos. Link only reports the agent can tie to this one, each with a short reason. Reason: each search catches what the other misses.
- Q2 = 2a. Retry a failed read once with a visible warning, then file anyway and state "search failed" with command and error in the report and the final outcome. Operator choice authorizes this continue-after-error path. Reason: the observation is never lost and failure is never read as "none found".
- Q3 = 3a. No memory rule. Rebuild session siblings from GitHub on every filing via the Q1 author call (two-day window); links still in context are used too. Reason: works on every harness with no stored state or extra rule.
- Q4 = 4a. Fifth placeholder line in `## Suspected cause`: related reports as `owner/repo#n` (open or closed, shared file or condition), or "none found", or "search failed" with the error, and always the repo, query, states and limit searched.

Binding (carry into leaves):
- Never mark duplicates, comment, label or change state on linked issues. Mentions create cross-referenced timeline events; that is the accepted cost.
- Done-criteria: unrelated keyword match not linked; closed precedent linked as evidence, not open work; failing search still posts and states the failure; fresh session still lists earlier same-day reports; links survive unchanged into issues/seeds/ after `akrogon pull`; empty, failed lookup and failed creation are distinguishable.
- Required proof before handoff: the two gh read calls with the leaf's identity (recorded in Findings as read-only probes; rerun at proof time).

## Proofs (2026-10-05)

Identity: gh 2.102.0, github.com account ivanjuras (keyring token, scopes gist, read:org, repo). All calls read-only, no cleanup needed.

- P1 author and date: `gh issue list -R Tamdoma/tamdoma-framework --state all --author @me --search "created:>=2026-10-04" --limit 20 --json number,title,state`. Exit 0. Returned #122-#128, all open. The two-day window also returns #122, #123 from another session, as expected under 3a. Limits: one repo, one account; no rate-limit or large-repo recall proof.
- P2 keyword: `gh issue list -R Tamdoma/tamdoma-framework --state all --search "mockup variant" --limit 10 --json number,state`. Exit 0. Returned open #123-#128 and closed #84, #38. Limits: lexical match only; recall depends on the chosen words.
- P3 supplied link: `gh issue view 128 -R Tamdoma/tamdoma-framework --json number,state,title`. Exit 0, #128 OPEN. Limits: same-org private repo only; no other-org link tested.
- P4 failure: `gh issue list -R Tamdoma/no-such-repo-xyz --state all --limit 5 --json number`. Exit 1, "GraphQL: Could not resolve to a Repository". Limits: no network-failure or rate-limit case.
- P5 empty: `gh issue list -R Tamdoma/tamdoma-framework --state all --search "zzqxnonexistentterm" --limit 5 --json number`. Exit 0, `[]`. Failed and empty are distinguishable by exit code.
- Creation: `gh issue create -R "$repo" --title "$title" --body-file -` is unchanged from the closed seed-issue leaf. Real evidence: Tamdoma/akrogon#56, author ivanjuras, created 2026-10-05T09:09:17Z through this skill. Not re-run by the door, to avoid a new public issue on a real repo. The leaf makes no live create call; it substitutes the gh process at the boundary as the closed leaf did (`issues/closed/akrogon-loop/github/seed-issue/verification/seed-issue.md`). Limits: no fresh create call; live grant none.
- P6 mirror: `akrogon pull` at /home/ivan/Work/infra/tamdoma/framework (registered `framework`). Exit 0, "9 open issues pulled". #127's GitHub body line "(related #124, #125)" appears unchanged in `issues/seeds/127-mockup-photo-path-rule-conflicts-with.md`. The seeds folder is gitignored there (`.gitignore:44`), so no tracked change. Limits: shows body text survives the mirror; does not exercise a body written by the new skill.
- P7 bodies (2026-10-05, leaf-writing review B R1 / C D2): both list calls with `--json number,title,state,body`. Keyword `mockup variant` limit 10: exit 0, 8 results, all with bodies (#124 body 2,333 chars). Author `created:>=2026-10-04` limit 20: exit 0, 7 results, all with bodies. Limits: as P1, P2.
- Creation audit (C D8): the Take rule asks for one real call with the leaf's identity before handoff. Tamdoma/akrogon#56 is that call: same command form, same identity (ivanjuras), gh 2.102.0 (released 2026-09-30), 2026-10-05, observed result a created issue. No new public issue is created for proof.

Leaf-writing correction 2026-10-05 (B R1, C D2): the two lookups return `body`, so candidates are judged by content, not titles. `gh issue view` stays for reporter-supplied links.
