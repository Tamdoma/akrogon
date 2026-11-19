# Merged notes: trailer-message (#142)

Reproduces (A,B,C,D): framework 106ac8ce's reason wraps onto lines with no leading whitespace, so git reads no trailer block and `%(trailers:key=Test-Change,valueonly,unfold)` is empty; indented continuation lines parse and unfold (A,B,C,D). Wider causes (C,D): one bad line hides every trailer in the block; a trailer paragraph followed by another paragraph reads nothing; a bare path with no reason is read by git but dropped by `trailerValues`. Both refusals (`requireTestChangeCitations`, `requireFrozenCitations` in src/phase.ts) print the same text, which names no cause (B,C,D). The guard agrees with git; the failure is the message (B,C,D).

Q1 What changes in the refusal?
- 1a The refusal states git's reading rule: the citation sits in the commit message's last paragraph, each `Test-Change: <path> <source and reason>` on one line (or continuation lines starting with a space), no other paragraph after it (B,C). It does not claim a wrap happened, since a truly absent trailer gives the same output (B). No new reader.
- 1b On the failure path only, scan raw commit bodies for a `Test-Change: <missing path>` line git did not parse and name that commit and the rule (A,D). Never accepted (D: a done-criterion that a wrapped trailer still blocks). Cost: a second reader beside git's that can misfire on quoted body text, and per-path range plumbing in the frozen guard (B,C).
- 1c akrogon parses wrapped trailers itself. Out under the signposts hard limit (A,B,C,D).

Q2 One message or two? One shared builder for both refusals (B,C,D).

Q3 Writer side: the skill lines that tell seats to write the trailer (implement-issue SKILL.md and brief-template.md, check-issue SKILL.md, merge-issue SKILL.md, plan-issue SKILL.md) state the same one-line rule, per standing-design "Writer and checker of a mechanical rule share one rule definition" (C). Strictness: "one line each" (C), simpler and immune to editor auto-wrap; the checker still accepts folded input.

Pitfalls: the two refusal texts drifting (C,D) — removed by Q2; a test locking the whole sentence (B,D) — removed by the test reading the shared rule text from the module rather than a copied sentence; the completion claiming the lesson's second half (added-path citations) changed (C,D) — removed by the done record.

Proof (A,B,C,D): one red-first case in tests/phase.test.ts on the existing citation fixture: an edited test cited only by a flush-left wrapped trailer is refused and the refusal carries the rule; the same reason on one line on a later empty commit lets the move pass. Retire (C,D): the reader already refuses loudly; with the cause named, the wrap half of the framework lesson can leave; the framework pass decides (signposts 4a).

Off route (A,C,D): `requireFrozenCitations` requiring citations for added paths (history file's second point).

Differences: A and D diagnose per commit (1b); B and C state the rule (1a) and avoid a second reader.
