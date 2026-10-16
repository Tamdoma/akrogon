# Direct report: lesson-retire-paths

Base 4088a91ad3015c346dc56a9fd485827033e1c507, head d899fb8f31b6e67fa861e4c1ed6a96ce6f87edfd. Serial-solo, one unit, no workers.

## Changed files
- skills/lesson-rule.md: Retire names three exits on every reachable path (removal, loud refusal at the point of use before the harm, running guard), the `Applied <date> by <file:line or commit>: <what stops it>` record, learn-issues retiring stops already on main; new Transfer bullet (judgment only, root learn-issues only, same repo, operator approval of the diff, `Transferred <date> to <file:line>, approved by <who>`, never Applied, never by a leaf or for a checkable lesson). Taken 1a, 2a, 3a.
- skills/learn-issues/SKILL.md: Guarded -> Stopped with the three exits; Checkable = still reachable and not stopped; new Transfer outcome and Apply step (`<who>` from `git config user.name`, declined transfer reverted); description and footer counts.
- skills/implement-issue/SKILL.md: lesson application lands what stops the mechanism, new Applied form, leaves never transfer.
- skills/check-issue/SKILL.md:61: accepts any of the three exits with a matching Applied line; a `Transferred` line in a leaf diff is a Fix.
- skills/chart-issues/assets/shapes.md, skills/chart-issues/SKILL.md: audit says "complete stop" instead of "complete guard".
- learnings/LESSONS.md header, docs/guide/learn.md, skills/AREA.md, README.md, docs/guide/cheat.md: same rule in short.

## Proof
1. Done 1 (same rule everywhere): grep for "mechanical guard", "Guarded", "guarded lines", "guard leaf", "guard file:line" outside issues/ and learnings/history at d899fb8 returns only the new rule text (lesson-rule.md:8, check-issue:61, implement-issue:33). tests/, src/ and skill scripts hold none of the old phrases.
2. Done 2, 3: by reading the changed text against forks/retire-rule.md Taken; no executable surface changed. src/lessons.ts still keys on `+Applied`, which every stopped exit keeps; `Transferred` is only written by root learn-issues, outside any merge range.
3. Done 4: `akrogon verify --holder <chart>/direct` on d899fb8: test 993 pass 0 fail (148 s), typecheck 0, format 0, `verify merge d899fb8...: green`. Logs in this folder.

## Known limitations
- No new test: prose-only change; check-issue rejects exact-wording tests.
- learn-issues' "act without asking" still holds; a transfer is pending until the operator approves the diff.
