# Rebuttal C: review-rules-merged.md

1. Partial concession on D7. #16 was not only a pool-size problem. In R9 the spread fix made every site pair distinct, yet the P2 *judgment* check still failed pairs that shared one slot (`report.md` "Blocker #16", R9 confirmation). A narrow code-level size test would not have caught that. B's clause for judgment checks (test a known acceptable and unacceptable case with the real instructions at the intended size, and state what stays unproven) fills a real gap. B's clause for code checks ("accepts a real valid producer result, rejects a focused invalid example") is still covered by spine 3a, proof-selection 1a and `standing-design.md:8`, so adding it would create a second copy of the rule.

D7: narrow rule (A,C) for code checks, plus B's judgment-check clause. No new general real-pass/focused-fail line.

D8: Fix when a leaf adds or changes a copy of a rule without a stated reason and an agreement test (C), or when writer and checker reproducibly disagree (B). Both meet `check-issue/SKILL.md:41`'s "reproducible defect or failed check" bar. A's trigger also flags justified copies that have an agreement test.
