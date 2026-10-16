# Fake side effect before the failure exit

Case: check.review of release-any-phase (slot A). `tests/fake-busctl.ts` gained an opt-in `FAKE_SYSTEMCTL_DB` seam that upserts the target slice as `active` when `StartTransientUnit` runs, but the upsert executes before the `busctl.fail` refusal check, so a refused start still loads the slice in the fake inventory — the real manager would not.

Evidence: `git diff 91a1557..HEAD tests/fake-busctl.ts` — upsert block precedes `busctl.fail` exit; no test combines the seam with a refused start.

Learning: when a fake mirrors a stateful manager, apply its side effect only on the success path — order fixture mutation after the failure exit, or a refused call leaves phantom state. Recorded as Nit N1 in review-A.md.
