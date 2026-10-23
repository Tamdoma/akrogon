# Merged notes — fact-ownership

Q1
- (a) docs say what the reader sees, does and why; exact agent procedure stays in the owning skill, linked (A,B). "Never copy" means no second copy of agent procedure; literal commands and short meaning needed for a task or reference stay (B; A agrees). A task page must work without opening a skill for any basic action (B).
- (b) rejected: every skill change needs a matching paraphrase; LESSONS.md lines 14, 18, 29, 33 and the stale merge.md/cleanup claims show it fails (A,B).
Q2
- (a) functional direction (A,B). Keep and retarget: docs-links (widen to docs/**/*.md plus the image/SVG reference forms actually used, including HTML img/picture if chosen) (A,B); command-reference table check moved from README "## Command" to the reference commands page, still reading src/akrogon.ts (A,B); rollback runtime recovery proof kept, docs path moved (A,B).
- Correction (B, A confirmed tests/rollback.test.ts lines ~129-140): the rollback test only checks two words in README and runs its own TS sequence; it does not execute the documented shell block. Moved steps are compared by review; no literal-execution claim (B).
- Drop wording-only checks with reasons: door-reset "handover" in chart.md, log-reader "akrogon log" in README, command-reference substring checks on docs/guide/files.md and next.md (A,B; repo policy commit 7efe3d67 "akrogon tests reject prose assertions").
- Retired-word bans in hold-retired and run-permit: A said keep as regression guards; B says judge each — keep runtime refusal tests, keep a docs ban only where it blocks stale executable instructions, so an accurate "this was removed" note is possible. DIFFERENCE (A keep all docs bans, B judge each).
- (b) rejected: keeps prose assertions repo policy rejects (A,B). (c) rejected: old pages kept alive for tests = two homes per fact (A,B).
- Pitfall: a retargeted check silently stops checking → one deliberate break (e.g. a missing command row, a dead link) turns it red (A).
Q3
- (b) one short "where things go" page (folder purposes, one-home rule), linked from docs/reference-index.md and the docs home (A,B). No new standing-design line (A,B): A's reason — standing-design applies to every consumer repo; B's reason — skills/implement-issue/SKILL.md Shared context already requires updating every doc the diff makes stale before review (A confirmed line 31), so a new rule adds no guarantee.
- (c) rejected: contributors would guess where facts go in the new structure (A,B).
- Pitfall: the page becomes a second table of contents → only ownership rules, links to real navigation (B).
