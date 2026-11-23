# Slot D review

Verdict `fix`

Base `1fe13c883719723292ea3b5b56e28194a6b9354d`  
Head `6396e3a69059724e476abbf2f2d9ca18fe1e66a6`

- **F1 · `src/reconcile.ts:1237`.** A live named `run-check --holder` can lose its evidence under a flat `run_root`. I paused a real check after it wrote and closed an evidence file, then ran repo reconcile. With the default layout, the live `.owner` below the checkout temp protected the evidence and the check passed. With a flat root, reconcile removed the entire checkout temp while the command was still running. The file disappeared and the same check exited `1` after resuming.
- **F2 · `src/reconcile.ts:1421`.** The host sweep follows a configured root that the allocator rejects. I pointed `run_root` at a symlink to a directory holding an unrelated `run-build` folder. `ensureRunParent` refused the symlink at `src/config.ts:448`, but the host sweep followed it and deleted `run-build` after the ownerless age threshold. An invalid config can therefore delete files before any check has used the root.
- **F3 · `src/reconcile.ts:378`.** A normal check finish can abort host reconcile. In an isolated flat root, a dead run appeared before a live run in the directory listing. While the sweep awaited pane inventory for the dead run, I let the live CLI finish and remove its own root. The sweep then called `statSync` on the vanished entry and threw `ENOENT`, skipping the rest of the host pass.
- **F4 · `src/config.ts:54`.** A symlinked ancestor bypasses the retired-root exclusion. With `run_root` set to `<symlink>/flat` and the symlink pointing to the retired temp root, config and allocation both accepted the path. The retired sweep at `src/reconcile.ts:1385` deleted an older ownerless publish-refusal root and its `out.log` under that path before the flat sweep could honor `refusal.json`.
- **F5 · `src/reconcile.ts:1420`.** Disabling or moving `run_root` strands abandoned roots at the old location. I left a dead-owner run root, removed the key, and ran both repo and host reconcile. The root remained. Restoring the old key made the host pass remove it immediately. Turning the setting off to recover from a full scratch mount leaves that space occupied until the old path is swept or cleared manually.

## Verification

- `bun test --timeout=45000 --max-concurrency=4 tests/config.test.ts tests/reconcile.test.ts tests/run-check.test.ts tests/verify.test.ts` passed all 203 tests.
- In isolated copies, each of the six first-commit feature cases failed against base source, and both flat-root feature cases failed against first-commit source. The changes to existing assertions agree with the `Test-Change` trailers. `git diff --check` passed.
- The schema-only release accepted the configured key, still allocated under leaf temp, and preserved the published log and exit `7` after deleting red TMPDIR. The writer reserves `AKROGON_EVIDENCE` in both repo env lists and supplies it directly to the check. The normal log is published outside TMPDIR before cleanup.
