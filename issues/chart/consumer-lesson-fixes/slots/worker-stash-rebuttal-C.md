# Rebuttal C: worker-stash

W1. 1c is framed as a standalone stop ("What stops the swap?"). Alone it instructs no worker and stops nothing at the point of use. In map-C it was only an add-on to 1a, catching a prose breach before cherry-pick. The fork should present it as an add-on, not an alternative to 1a.

W2. I drop my own 2b. Different leaves' leaf worktrees share `refs/stash` too (D), so A stashing in a leaf worktree can swap with another leaf's A. Widening the prose costs nothing, since A already commits outstanding work instead of stashing at refresh. Pick 2a.

W3. The merged WIP wording is wrong twice: "made before the unit's returned commit" and "after the WIP is folded in". A WIP commit is not folded in. It is reset away, then the returned commit is made. As written, a worker could return a history carrying the WIP commit.

Pick now: 1a plus 1c, scope 2a. Prose states the rule and replacement at worker-read points, and A's full-list compare is the only check that catches a breach before the lane takes foreign edits.
