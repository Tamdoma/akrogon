# Union rollout

## Question
Q1. How should `learnings/LESSONS.md` stop conflicting on rebase?
Q2. Does `akrogon init` also write the local `.git/info/attributes` rule?
Q3. Should `issues/log.jsonl` get the same merge rule?
Q4. How do the 8 registered repos without the rule get it?
Q5. How do pruning and corrections work once union is on?

### Carries
- Seed workaround: `learnings/LESSONS.md merge=union` in `.gitattributes` and `.git/info/attributes`. Framework has both.
- `akrogon init` owns ignore entries and LESSONS.md scaffolding (skills/init-akrogon/SKILL.md:76).
- A leaf branch carries code only and cannot touch `issues/` (src/phase.ts:257-263).

## Findings
See INTAKE.md Agent findings F1-F8. Single slot, no peers.
- Q1: F3 measured union working through a tracked `.gitattributes` on git 2.55.0. F8 (GitLab) removes the shared file instead, which here means one file per active lesson and changes to 4 skills, init, docs and every repo's layout.
- Q2: F6 shows one writer, so no conflict path exists today.
- Q3: a leaf in akrogon cannot commit to other repos. `.git/info/attributes` is needed only when the rebase that carries the new `.gitattributes` line itself conflicts, so a lone commit pushed first needs no info/attributes.

Peer exchange 2026-09-29: slots/union-rollout-A.md, slots/union-rollout-B.md, slots/union-rollout-merged.md, slots/union-rollout-rebuttal-B.md.
- Agreed (A,B): path-specific union for LESSONS.md via init. Log left out. Init rerun rejected (rewrites config, and pi-extensions would register as `extensions`). One akrogon leaf plus an operator backfill that commits only `.gitattributes`.
- Split: Q2 tracked-only (A) vs tracked plus local (B). Q5 accept and re-prune (A) vs coordinated maintenance with temporary `merge=text` (B).
- Rebuttal accepted by A: R2 explicit removal of any bootstrap local rule, including framework's. R3 the log reason is reader order dependence (src/status.ts:123, 293), not proven single writer. R4 verify the published tracked rule from a fresh clone, since `git check-attr` also reports the local override. R1 union is silent (exit 0) on conflicting edits, so a corrected lesson can keep its wrong version without any signal. B's 1a support is conditional on settling Q5.

## Taken
Operator 2026-09-29, verbatim: "1a | 2a | 3a | 4a - but you will do it for all repos. No time for me to do anything manually | 5a |"

- Q1 1a: path-specific `learnings/LESSONS.md merge=union` in tracked `.gitattributes`, and `akrogon init` appends it idempotently, preserving other entries. Reason: small, measured twice. Foreclosed: one file per lesson (1b), manual resolution (1c), gacp resolving conflicts.
- Q2 2a: tracked rule only, init writes no `.git/info/attributes`. Reason: no hidden per-clone override. Consequence: any local rule used for bootstrap is removed, including framework's. Foreclosed: init writing tracked plus local (2b).
- Q3 3a: `issues/log.jsonl` keeps normal merging. Reason: status reads the log by line order (src/status.ts:123, 293). Foreclosed: log union with or without an ordering fix.
- Q4 4a, operator correction: the door runs the backfill for all 8 repos, the operator does nothing manually. One akrogon code leaf changes init, its tests, skills/init-akrogon/SKILL.md:76 and docs/guide/setup.md:31. Foreclosed: rerunning init (4b), a leaf per repo (4c).
  Backfill shape after B's final check (slots/union-rollout-final-check-B.md): per repo, fetch, pin `origin/main` to one commit ID, build the commit with plumbing from that ID (temporary index, blob = that ID's `.gitattributes` plus the line), verify the parent-to-commit diff changes only `.gitattributes`, push `<commit>:refs/heads/main`, rebuild from a new pinned ID on one retry. No checkout, index or local branch change except `git merge --ff-only` when local main has no unpushed commits. Remove framework's local rule. Verify `origin/main:.gitattributes` has the line, local info/attributes lacks it, and `git check-attr --source=origin/main` reports union.
- Q5 5a: accept union's silent retention on overlapping edits and deletes. Reason: rare, and the next prune removes leftovers. Foreclosed: coordinated maintenance with temporary `merge=text` (5b), immutable lessons (5c). B's objection stands in Findings (R1).

Backfill run 2026-09-29 by the door (operator authorization above), git 2.55.0, operator's GitHub identity via each repo's `origin`:
- Pushed one commit touching only `.gitattributes` onto a pinned `origin/main`: akrogon 53508e8, pi-extensions 6c51f4c, mdcny-ghl-data-pulls 51d918f, boulevard-automation 814764e, clinique-la-roya b4f6fae, lens 84f6433, Himne 272cbfb, lingua-relay 50079b2. Framework already had it.
- Local main fast-forwarded where it was level with the base: all except clinique-la-roya (7 behind, left for the next gacp/sync). Dirty files in every checkout unchanged.
- Framework's `.git/info/attributes` line removed (file deleted, it held only that line).
- Verified in all 9: `origin/main:.gitattributes` has the line, no local rule, `git check-attr --source=origin/main` reports union. A fresh `git clone -b main` of lens reports union.
- Limit: lens's GitHub default branch is `lens-main`. Akrogon uses `main`, so the rule applies to the akrogon flow only. A plain clone of lens gets `lens-main` without the rule.
