# Rebuttal, slot C: limit-boundary

Two merged bullets present incompatible mechanisms as one agreed 1a. Both change what the operator is actually approving.

1. Permit release rule conflict. The lock-fd bullet joins (C) hold the flock inside the run-check process and (B) permit held until the owned workload retires. These are different release rules, not complementary halves. Under (C) a SIGKILLed run-check frees the permit while its browsers still load the host, and the next run is admitted on top of them. Under (B) one leaked idle browser holds the host's only permit indefinitely until a stop reaps it. 1a needs one rule picked, with the other failure mode named as its cost. It is not in "Where slots differ".

2. Adoption target conflict. (B) adopts the pane shell before `herdr agent start`; (C) adopts the seat process after it is running. Merged lists my "one scope per seat launch" correction alongside B's timing as if both hold. They cannot: shell adoption makes the scope per-pane, surviving seat restarts, puts every later interactive command typed in that pane inside the slice ceiling, and stopping the scope kills the pane shell itself. Seat adoption makes the scope per-seat and leaves the shell alive on stop. The unit tree and the stop contract differ, so the probe the door runs is a different probe for each. The merged notes should name one as the 1a being voted on, or carry both as an explicit sub-choice.

Nothing else in the merged notes misstates my position.
