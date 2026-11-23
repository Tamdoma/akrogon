# Implementer notes (subagent of A)

- F1. The evidence folder name uses encodeURIComponent(name) (src/run-check.ts:350), the same as the capture names.
- F2. Host step drops dead-owner or old ownerless roots under run_root through dropPath (src/reconcile.ts:1427). This is stricter than the per-leaf loop because it adds the pane and process vetoes.
- F3. reconcileHost reads the machine config itself (src/reconcile.ts:1420).
- F4. docs/reference/config.md already failed prettier at base. It was left unformatted.
- F5. Commit 1 adds a short run_root row ("accepted, not read yet"). Commit 2 replaces it.
- F6. ensureRunParent (src/config.ts:439) reuses the private-folder helper, whose error text says "leaf temp path".
- F7. The ownerless-older-than-60s case is not tested, because birthtime cannot be set.
- F8. Not done: init-akrogon skill prose, and removing the existing kept roots by hand before release (A does this at release).
