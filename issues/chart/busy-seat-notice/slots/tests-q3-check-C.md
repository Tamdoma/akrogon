# Q3 check, slot C

3c is right in effect and contradicts no Taken decision. Two corrections and one smaller shape.

1. "If it fails now, it is a real bug" drops the realistic-source clause and lowers the Fix bar. check-issue/SKILL.md:51: a Fix needs "its actual realistic source (which build, which user action or content, which integration, or which attacker-reachable entry point)", and "a handcrafted reproduction alone is a Nit with the missing evidence stated". A scratch probe with an invented input that fails on the leaf head is exactly that handcrafted reproduction. As written, 3c lets any invented input that happens to fail reopen repair, which is loop L3 by another door. Fix: the probe is how the reviewer shows the realistic source on the leaf head, not a substitute for it. Wording: blocks only when the reviewer names a realistic source and a quick local run of that source's input on the leaf head fails.

2. Keep the first clause of check-issue/SKILL.md:53 ("a done-criterion has no test that would catch its failure"). Under D1 every criterion has a frozen test, but a frozen test can be a weak oracle. Taken Q1 requires each test "shown red on the intended break" at plan time; :53 is where B checks that evidence. Remove :55 only, as 3c says, and do not touch :53.

3. Smaller shape. With item 1 applied, 3c adds nothing that :51 and :79 do not already say: an observed failure from a realistic source is a Fix repaired with a fail-first reproduction then the fix, in the same leaf; anything else is a Nit with the missing evidence stated; :22 "Verify with a concrete scenario" already asks the reviewer to try it. The whole change is one deletion, check-issue/SKILL.md:55, plus the line that a Nit creates no test and no issue. No new paragraph, no probe obligation on both blind seats (:37), nothing committed during review (:63 already forbids it). Same outcome, fewer words, and the Fix bar stays one definition.

Not a disagreement, for the record: "cannot be tried without a live run → Nit" is consistent with D4 and D5 and cuts the live-run handoff at check-issue/SKILL.md:75 for out-of-criteria cases, which is where formspark F3 came from.
