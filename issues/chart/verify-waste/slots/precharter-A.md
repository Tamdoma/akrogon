# CPU ideas, A (blind, written before reading D)

Data (framework issues/verify-runs.jsonl, 2026-10-17..24): 182 leaves reached merge, 400 full `framework:verify` runs, 214 red (54%). 2.2 full suites per landed leaf. Only 35 reds went green on the same tree (flake-like); the rest needed a new tree (fix or rebase). Leaf scope runs only cheap (28 s).
Claim: over half of full-suite CPU is spent on runs whose answer is "no". Removing red merge runs beats all 7 cost leaves (~35% est.).
I1 Front-load the leaf's own risk: before entering merge verify, run the full core tests in the area the diff touches, as a gate to enter the expensive run, not instead of it (full verify still blocks every merge, so verify-speed 1a stands).
I2 A decided red run stops spending: when the first core member goes red, the merge answer is known; stop the other members and report the failure. Conflicts with verify-aliases "a green cheap stage plus one red core lane runs every core lane" (earlier choice to show every failure at once). Trade: more repair rounds when there are several failures.
I3 Find why reds happen before choosing: 179 of 214 red logs are gone from their recorded paths (leaf folders moved). Classify the 35 that remain, and look for logs under issues/closed.
