# Wave-shape rebuttal C

No disagreement with the merged direction. Two corrections to my own inputs:

1. Checkpoint commit (line 6, 16): conceded. A worktree cut from HEAD lacks the lane's uncommitted edits, so my patch route needs the same checkpoint. Given commits exist, cherry-pick is the simpler return; I withdraw the patch route.

2. satellite-build (line 7): B is right. `satellite-build/implementation/brief-4.md:20` reads "brief-2/3 renderer output + expectations (fixture dists to audit)", so unit 4 waits on units 2 and 3. My cap-2 figure of 172 minutes assumed unit 4 followed unit 1 only. With the chain 1-2-3-4 (20+82+70+83 minutes) the cap-2 floor is about 255 of 299 minutes, a 15% saving on that leaf. The content-batch and plan-script figures stand, since their plans state no execution ordering (`content-batch/plan.md:129`, `plan-script/plan.md:293`).

Q1: ownership recorded in brief section 4 (A, B) is one file fewer than my plan-level field. Conceded.
