# Addendum: recovery without rebase, 2026-10-10

Observed in framework. After main was fixed (4584cf7cb), dist-capture-disk and spawn-deadlines were moved back to their phases (`akrogon phase`) but stayed on old main 5cb74c3c6. Their base reruns of test:motion-probe used the leaf's own old base and failed again "still red on base 5cb74c3c6". Akrogon only rebases a leaf in the merge turn (next.ts buildStack); no path moves a pre-merge leaf onto a newer main. The operator rebased both by hand and dropped each leaf's own C8 workaround commit, superseded on main by ffaa233f4.

Relevance to shape Taken 2a: "release invalidates red evidence and reruns checks". A rerun on the leaf's old base cannot see the fix. A release has to put the leaf on the fixed main, or compare against the current main, before it reruns.
