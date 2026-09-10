# Review by reading missed reproducible defects

Case: bootstrap/command check.review, 2026-09-10, first hand-driven leaf.

Evidence: review-A.md verdict nits with five nits, none a defect. review-B.md verdict fix with three defects (merge recovery racing a live merge pass, a queued working event consuming an attempt, herdr agent names colliding across repos), each reproduced in a temp repo with printed output. Same leaf, same diff, same time.

Learning: a review that only reads the diff and the passing suite does not find behavior defects in dispatch and recovery code. Reproducing one path the suite does not cover did. Watch the next two leaves before making this a rule in check-issue.
